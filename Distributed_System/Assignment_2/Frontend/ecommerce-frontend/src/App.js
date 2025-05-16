import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthContext from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import DishList from './pages/customer/DishList';
import CustomerOrders from './pages/customer/Orders';
import Cart from './pages/customer/Cart';

// Seller Pages
import SellerDishes from './pages/seller/SellerDishes';
import SellerDashboard from './pages/seller/Dashboard';
import SellerOrderManagement from './pages/seller/OrderManagement';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import SellerCreation from './pages/admin/SellerCreation';
import CompanyView from './pages/admin/CompanyView';

// Common Pages
import UserProfile from './pages/common/UserProfile';

// Common CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Customer Routes */}            <Route 
              path="/customer/dishes" 
              element={
                <PrivateRoute 
                  component={DishList} 
                  requiredUserType={['customer']} 
                />
              } 
            />
            <Route 
              path="/customer/cart" 
              element={
                <PrivateRoute 
                  component={Cart} 
                  requiredUserType={['customer']} 
                />
              } 
            />
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
              path="/admin/sellers/create" 
              element={
                <PrivateRoute 
                  component={SellerCreation} 
                  requiredUserType={['admin']} 
                />
              } 
            />
            <Route 
              path="/admin/companies/view" 
              element={
                <PrivateRoute 
                  component={CompanyView} 
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
          </Routes>        </Router>
      </CartProvider>
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
