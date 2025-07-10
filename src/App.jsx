import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DataProvider } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Gardens from '@/pages/Gardens';
import GardenDetail from '@/pages/GardenDetail';
import Devices from '@/pages/Devices';
import DeviceDetail from '@/pages/DeviceDetail';
import Settings from '@/pages/Settings';
import DataManagement from '@/pages/DataManagement';
import Analytics from '@/pages/Analytics';
import Documentation from '@/pages/Documentation';

/**
 * @function ProtectedRoute
 * @description A route component that redirects to the login page if the user is not authenticated.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if the user is authenticated.
 * @returns {React.ReactElement} The protected route element.
 */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

/**
 * @function PublicRoute
 * @description A route component that redirects to the dashboard if the user is already authenticated.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if the user is not authenticated.
 * @returns {React.ReactElement} The public route element.
 */
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
}

/**
 * @function App
 * @description The main application component that sets up routing and providers.
 * @returns {React.ReactElement} The rendered App component.
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="min-h-screen leaf-pattern">
              <Helmet>
                <title>C_Gardens - Smart Plant Care System</title>
                <meta name="description" content="Comprehensive smart plant care system for managing gardens, sensors, and plant health monitoring" />
              </Helmet>
              
              <Routes>
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <div className="flex flex-col min-h-screen">
                      <Navbar />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/gardens" element={<Gardens />} />
                          <Route path="/gardens/:id" element={<GardenDetail />} />
                          <Route path="/devices" element={<Devices />} />
                          <Route path="/devices/:id" element={<DeviceDetail />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/data" element={<DataManagement />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/documentation" element={<Documentation />} />
                          <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
              </Routes>
              
              <Toaster />
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;