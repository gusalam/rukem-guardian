import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from './HomePage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  
  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <HomePage />;
};

export default Index;
