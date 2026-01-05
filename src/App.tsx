import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import LoginActivities from './pages/LoginActivities';
import Levels from './pages/Levels';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import SetupOrders from './pages/SetupOrders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId/setup-orders" element={<SetupOrders />} />
          <Route path="login-activities" element={<LoginActivities />} />
          <Route path="levels" element={<Levels />} />
          <Route path="products" element={<Products />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
