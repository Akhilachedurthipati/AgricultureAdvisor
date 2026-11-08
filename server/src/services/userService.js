import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// In-memory fallback store when external MongoDB daemon is not running in dev
const memoryUsers = new Map();

export const findUserByEmail = async (identifier) => {
  if (!identifier) return null;
  const clean = identifier.toString().toLowerCase().trim();
  const phoneClean = identifier.toString().replace(/\D/g, '');

  if (mongoose.connection.readyState === 1) {
    const conditions = [{ email: clean }];
    if (phoneClean && phoneClean.length >= 7) {
      conditions.push({ phone: phoneClean });
      conditions.push({ phone: identifier.toString().trim() });
    }
    return await User.findOne({ $or: conditions });
  }

  // Memory fallback
  for (const user of memoryUsers.values()) {
    const userPhoneClean = user.phone ? user.phone.replace(/\D/g, '') : '';
    const matchEmail = user.email && user.email.toLowerCase() === clean;
    const matchPhone = phoneClean && phoneClean.length >= 7 && userPhoneClean && userPhoneClean === phoneClean;

    if (matchEmail || matchPhone) {
      return {
        ...user,
        comparePassword: async (pwd) => await bcrypt.compare(pwd, user.password),
        toJSON: () => {
          const copy = { ...user };
          delete copy.password;
          return copy;
        }
      };
    }
  }
  return null;
};

export const findUserById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return await User.findById(id).select('-password');
  }

  // Memory fallback
  const user = memoryUsers.get(id.toString());
  if (user) {
    const copy = { ...user };
    delete copy.password;
    return copy;
  }
  return null;
};

export const createUser = async ({ name, email, password, phone, preferredLanguage, location }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (mongoose.connection.readyState === 1) {
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || '',
      preferredLanguage: preferredLanguage || 'en',
      location: location || {}
    });
    return newUser;
  }

  // Memory fallback with real bcrypt hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const memoryId = new mongoose.Types.ObjectId().toString();

  const memoryUser = {
    _id: memoryId,
    id: memoryId,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone?.trim() || '',
    preferredLanguage: preferredLanguage || 'en',
    location: location || { state: '', district: '', city: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryUsers.set(memoryId, memoryUser);

  return {
    ...memoryUser,
    comparePassword: async (pwd) => await bcrypt.compare(pwd, memoryUser.password),
    toJSON: () => {
      const copy = { ...memoryUser };
      delete copy.password;
      return copy;
    }
  };
};

export const updateUserProfile = async (id, updateData) => {
  const allowedFields = ['name', 'phone', 'preferredLanguage', 'location'];
  const sanitizedUpdate = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      sanitizedUpdate[field] = updateData[field];
    }
  }

  if (mongoose.connection.readyState === 1) {
    return await User.findByIdAndUpdate(id, sanitizedUpdate, {
      new: true,
      runValidators: true
    }).select('-password');
  }

  // Memory fallback
  const existing = memoryUsers.get(id.toString());
  if (!existing) return null;

  const updated = {
    ...existing,
    ...sanitizedUpdate,
    location: {
      ...existing.location,
      ...(sanitizedUpdate.location || {})
    },
    updatedAt: new Date().toISOString()
  };

  memoryUsers.set(id.toString(), updated);
  const copy = { ...updated };
  delete copy.password;
  return copy;
};

