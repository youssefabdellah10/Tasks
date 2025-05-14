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
import CompanyManagement from './pages/admin/CompanyManagement';
import UserManagement from './pages/admin/UserManagement';

// Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import SellerManagement from './pages/company/SellerManagement';

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
              path="/admin/companies" 
              element={
                <PrivateRoute 
                  component={CompanyManagement} 
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
            
            {/* Company Routes */}
            <Route 
              path="/company/dashboard" 
              element={
                <PrivateRoute 
                  component={CompanyDashboard} 
                  requiredUserType={['company']} 
                />
              } 
            />
            <Route 
              path="/company/sellers" 
              element={
                <PrivateRoute 
                  component={SellerManagement} 
                  requiredUserType={['company']} 
                />
              } 
            />
            
            {/* Profile Route - accessible by all user types */}
            {/* Commented out due to missing UserProfile component
            <Route 
              path="/profile" 
              element={
                <PrivateRoute 
                  component={UserProfile} 
                  requiredUserType={['admin', 'company', 'seller', 'customer']} 
                />
              } 
            />
            */}
            
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
    case 'company':
      return <Navigate to="/company/dashboard" replace />;
    case 'seller':
      return <Navigate to="/seller/dashboard" replace />;
    case 'customer':
      return <Navigate to="/customer/dishes" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;
