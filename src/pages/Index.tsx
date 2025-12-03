import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from './HomePage';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <HomePage />;
};

export default Index;
