import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';

const PrivateRoute = ({ component: Component, requiredUserType, ...rest }) => {
  const { currentUser, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Updated routes to exclude company
  const userHasRequiredRole = !requiredUserType || 
    (currentUser && requiredUserType.includes(currentUser.userType));

  if (!currentUser || !userHasRequiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
