import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import AuthContext from '../../contexts/AuthContext';
import AuthService from '../../services/auth.service';

const PrivateRoute = ({ component: Component, requiredUserType, ...rest }) => {
  const { currentUser, isLoading } = useContext(AuthContext);
  
  // Extra check to handle cases where context might not be updated
  useEffect(() => {
    // Force a re-validation of token when component mounts
    if (!currentUser && AuthService.isAuthenticated()) {
      window.location.reload();
    }
  }, [currentUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const userHasRequiredRole = !requiredUserType || 
    (currentUser && requiredUserType.includes(currentUser.userType));

  if (!currentUser || !userHasRequiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
