import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const farmerName = user?.name || 'Farmer';

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-6 text-center select-none animate-in fade-in duration-300">
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#123D2A] tracking-tight leading-tight">
        Welcome back, <span className="text-[#246B45]">{farmerName}</span>!
      </h1>
      <p className="text-lg sm:text-2xl text-slate-700 mt-4 font-semibold tracking-wide">
        How can we help you today?
      </p>
    </div>
  );
}
