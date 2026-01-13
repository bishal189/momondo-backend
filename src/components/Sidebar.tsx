import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { logout, api, authStorage, type UserProfile } from '../services/api';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'grid',
  },
  { id: 'levels', label: 'Levels', icon: 'layers' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'login-activities', label: 'Login Activities', icon: 'chart' },
  {
    id: 'products',
    label: 'Products',
    icon: 'package',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: 'transaction',
  },
];

const getIcon = (iconName: string) => {
  const icons: Record<string, ReactElement> = {
    grid: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    'arrow-right': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ),
    'arrow-left': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    ),
    'arrow-down': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    layers: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    list: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    comments: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    handshake: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    'arrow-up': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    circle: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
    package: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    transaction: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  };
  return icons[iconName] || null;
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = authStorage.getToken();
      if (token) {
        try {
          const profile = await api.getUserProfile(token);
          setUserProfile(profile);
        } catch {
        }
      }
    };

    fetchUserProfile();
  }, []);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);
  
  const getRoute = (itemId: string) => {
    const routes: Record<string, string> = {
      dashboard: '/dashboard',
      users: '/dashboard/users',
      'login-activities': '/dashboard/login-activities',
      levels: '/dashboard/levels',
      products: '/dashboard/products',
      transactions: '/dashboard/transactions',
    };
    return routes[itemId] || '#';
  };

  const isActive = (itemId: string) => {
    const route = getRoute(itemId);
    return location.pathname === route;
  };

  const handleNavigation = (itemId: string) => {
    const route = getRoute(itemId);
    if (route !== '#') {
      navigate(route);
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col border-l-2 border-cyan-400 overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-white font-semibold text-lg">Monodo</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white truncate">
                {userProfile?.username || 'Loading...'}
              </span>
              {userProfile?.invitation_code && (
                <span className="text-xs text-cyan-400 font-medium">
                  {userProfile.invitation_code}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {userProfile?.role || 'User'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <div
              onClick={() => {
                if (item.children) {
                  toggleExpand(item.id);
                } else {
                  handleNavigation(item.id);
                }
              }}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-colors
                ${isActive(item.id) && !item.children ? 'bg-gray-700' : ''}
                ${isExpanded(item.id) && item.children ? 'bg-gray-800' : ''}
                ${!isActive(item.id) && !isExpanded(item.id) ? 'hover:bg-gray-800' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {item.children ? (
                  <span className="text-gray-400">
                    {getIcon('arrow-right')}
                  </span>
                ) : (
                  <span className="text-gray-400">{getIcon(item.icon)}</span>
                )}
                <span className="text-sm">{item.label}</span>
              </div>
              {item.children && (
                <span className="text-gray-400">
                  {isExpanded(item.id) ? getIcon('arrow-down') : getIcon('arrow-left')}
                </span>
              )}
            </div>

            {item.children && isExpanded(item.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => handleNavigation(child.id)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                      ${isActive(child.id) ? 'bg-gray-700' : 'hover:bg-gray-800'}
                    `}
                  >
                    <span className="text-gray-400">{getIcon(child.icon)}</span>
                    <span className="text-sm">{child.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

