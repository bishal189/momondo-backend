import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, authStorage } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      
      if (response.user) {
        const userRole = response.user.role?.toUpperCase();
        
        if (userRole === 'USER' || response.user.is_normal_user || (userRole !== 'AGENT' && userRole !== 'ADMIN')) {
          authStorage.clearAuth();
          throw new Error('Access denied. Only agents and administrators can login.');
        }
      }
      
      if (response.access) {
        authStorage.setToken(response.access);
      }
      
      if (response.refresh) {
        authStorage.setRefreshToken(response.refresh);
      }
      
      if (!response.access) {
        throw new Error('Login successful but no authentication token received. Please contact support.');
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Sign in to your account to continue
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label 
                htmlFor="email" 
                className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-cyan-400 border-gray-300 rounded focus:ring-cyan-400"
                  disabled={loading}
                />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-xl font-semibold text-base shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

