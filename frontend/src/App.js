import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Library from "@/pages/Library";
import Workspace from "@/pages/Workspace";
import AdminPanel from "@/pages/AdminPanel";
import ManageListings from "@/pages/ManageListings";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/workspace" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/workspace" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
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
      <Route path="/workspace" element={
        <ProtectedRoute>
          <Workspace />
        </ProtectedRoute>
      } />
      <Route path="/library" element={
        <ProtectedRoute>
          <Library />
        </ProtectedRoute>
      } />
      <Route path="/listings" element={
        <ProtectedRoute>
          <ManageListings />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminPanel />
        </ProtectedRoute>
      } />
      {/* Redirect old dashboard route to library */}
      <Route path="/dashboard" element={<Navigate to="/library" replace />} />
      {/* Placeholder routes for account pages */}
      <Route path="/account" element={
        <ProtectedRoute>
          <Navigate to="/workspace" replace />
        </ProtectedRoute>
      } />
      <Route path="/account/billing" element={
        <ProtectedRoute>
          <Navigate to="/workspace" replace />
        </ProtectedRoute>
      } />
      <Route path="/account/settings" element={
        <ProtectedRoute>
          <Navigate to="/workspace" replace />
        </ProtectedRoute>
      } />
      {/* Placeholder routes for footer pages */}
      <Route path="/help" element={<Navigate to="/" replace />} />
      <Route path="/terms" element={<Navigate to="/" replace />} />
      <Route path="/contact" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
