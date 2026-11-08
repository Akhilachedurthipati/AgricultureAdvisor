import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import FloatingChatbot from './components/common/FloatingChatbot';
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
import { Menu, Sprout } from 'lucide-react';

function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const appPaths = [
    '/dashboard',
    '/profile',
    '/crop-recommendation',
    '/fertilizer-recommendation',
    '/disease-detection',
    '/weather',
    '/ai-assistant',
    '/history'
  ];

  const isAppRoute = isAuthenticated && appPaths.includes(location.pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F7F7F0] flex flex-col font-sans text-[#202923]">
      {isAppRoute ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
          {/* Left Navigation Sidebar */}
          <Sidebar 
            isOpen={mobileSidebarOpen} 
            onClose={() => setMobileSidebarOpen(false)} 
          />

          {/* Mobile Topbar */}
          <div className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 text-[#123D2A]" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#123D2A] text-white flex items-center justify-center">
                <Sprout className="w-4 h-4 text-[#B6D957]" />
              </div>
              <span className="font-bold text-sm text-[#123D2A]">Agriculture Advisor</span>
            </div>

            <div className="w-8" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
              <Routes>
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
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes (for unauthenticated redirection) */}
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

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}

      {/* Floating Robot Chatbot at Bottom-Right */}
      <FloatingChatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
