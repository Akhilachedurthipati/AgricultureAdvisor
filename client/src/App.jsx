import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import CropRecommendation from './pages/CropRecommendation';
import FertilizerRecommendation from './pages/FertilizerRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import WeatherMonitoring from './pages/WeatherMonitoring';
import AIFarmingAssistant from './pages/AIFarmingAssistant';
import RecommendationHistory from './pages/RecommendationHistory';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-b from-agri-50/60 via-white to-slate-50 flex flex-col font-sans text-slate-800">
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes (Farmer Authentication Required) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/crop-recommendation" 
                element={
                  <ProtectedRoute>
                    <CropRecommendation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/fertilizer-recommendation" 
                element={
                  <ProtectedRoute>
                    <FertilizerRecommendation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/disease-detection" 
                element={
                  <ProtectedRoute>
                    <DiseaseDetection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/weather" 
                element={
                  <ProtectedRoute>
                    <WeatherMonitoring />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-assistant" 
                element={
                  <ProtectedRoute>
                    <AIFarmingAssistant />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <RecommendationHistory />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
