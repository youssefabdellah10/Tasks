import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthContext from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import DishList from './pages/customer/DishList';
import CustomerOrders from './pages/customer/Orders';

// Seller Pages
import SellerDishes from './pages/seller/SellerDishes';
import SellerDashboard from './pages/seller/Dashboard';
import SellerOrderManagement from './pages/seller/OrderManagement';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import SystemSettings from './pages/admin/SystemSettings';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';

// Common Pages
import UserProfile from './pages/common/UserProfile';

// Common CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Customer Routes */}
            <Route 
              path="/customer/dishes" 
              element={
                <PrivateRoute 
                  component={DishList} 
                  requiredUserType={['customer']} 
                />
              } 
            />
            {/* Commented out due to missing Cart component
            <Route 
              path="/customer/cart" 
              element={
                <PrivateRoute 
                  component={Cart} 
                  requiredUserType={['customer']} 
                />
              } 
            />
            */}
            <Route 
              path="/customer/orders" 
              element={
                <PrivateRoute 
                  component={CustomerOrders} 
                  requiredUserType={['customer']} 
                />
              } 
            />
            
            {/* Seller Routes */}
            <Route 
              path="/seller/dashboard" 
              element={
                <PrivateRoute 
                  component={SellerDashboard} 
                  requiredUserType={['seller']} 
                />
              } 
            />
            <Route 
              path="/seller/dishes" 
              element={
                <PrivateRoute 
                  component={SellerDishes} 
                  requiredUserType={['seller']} 
                />
              } 
            />
            <Route 
              path="/seller/orders" 
              element={
                <PrivateRoute 
                  component={SellerOrderManagement} 
                  requiredUserType={['seller']} 
                />
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute 
                  component={AdminDashboard} 
                  requiredUserType={['admin']} 
                />
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <PrivateRoute 
                  component={UserManagement} 
                  requiredUserType={['admin']} 
                />
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <PrivateRoute 
                  component={Reports} 
                  requiredUserType={['admin']} 
                />
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <PrivateRoute 
                  component={SystemSettings} 
                  requiredUserType={['admin']} 
                />
              } 
            />
            <Route 
              path="/admin/activity-logs" 
              element={
                <PrivateRoute 
                  component={AdminActivityLogs} 
                  requiredUserType={['admin']} 
                />
              } 
            />
            
            {/* No Company Routes - Removed */}
            
            {/* Profile Route - accessible by all user types */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute 
                  component={UserProfile} 
                  requiredUserType={['admin', 'seller', 'customer']} 
                />
              } 
            />
            
            {/* Default Routes */}
            <Route path="/" element={<DefaultRedirect />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
    </AuthProvider>
  );
}

// Helper component to redirect to the appropriate dashboard based on user type
const DefaultRedirect = () => {
  const { currentUser } = React.useContext(AuthContext);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  switch (currentUser.userType) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'seller':
      return <Navigate to="/seller/dashboard" replace />;
    case 'customer':
      return <Navigate to="/customer/dishes" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;
