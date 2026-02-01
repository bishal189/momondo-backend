import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import LoginActivities from './pages/LoginActivities';
import Levels from './pages/Levels';
import Products from './pages/Products';
import Agents from './pages/Agents';
import UserManagement from './pages/UserManagement';
import Transactions from './pages/Transactions';
import SetupOrders from './pages/SetupOrders';
import UserOrders from './pages/UserOrders';

function App() {
  return (
    <>
    <Toaster position="top-right" />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId/setup-orders" element={<SetupOrders />} />
          <Route path="login-activities" element={<LoginActivities />} />
          <Route path="levels" element={<Levels />} />
          <Route path="products" element={<Products />} />
          <Route path="agents" element={<Agents />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="user-management/:userId/orders" element={<UserOrders />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
