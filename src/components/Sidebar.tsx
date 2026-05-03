import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import toast from 'react-hot-toast';
import { logout, api, type UserProfile } from '../services/api';

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
  // { id: 'users', label: 'Users', icon: 'users' },
  { id: 'login-activities', label: 'Login Activities', icon: 'chart' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  {
    id: 'products',
    label: 'Products',
    icon: 'package',
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: 'users',
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: 'users',
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
    whatsapp: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [withdrawDepositCount, setWithdrawDepositCount] = useState(0);
  const prevCountRef = useRef(0);
  const initializedRef = useRef(false);
  const fetchCountRef = useRef<() => void>(() => {});

  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound-2.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (withdrawDepositCount > prevCountRef.current) {
      playNotificationSound();
    }
    prevCountRef.current = withdrawDepositCount;
  }, [withdrawDepositCount]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await api.getUserProfile();
        setUserProfile(profile);
      } catch {
      }
    };

    const fetchUserRole = async () => {
      try {
        const roleData = await api.checkRole();
        setIsAdmin(roleData.is_admin || roleData.role === 'ADMIN');
        setIsAgent(roleData.is_agent || roleData.role === 'AGENT');
      } catch {
        setIsAdmin(false);
        setIsAgent(false);
      }
    };

    const fetchWithdrawDepositCount = async () => {
      try {
        const res = await api.getNewWithdrawDepositCount();
        const count = res.count ?? 0;
        if (!initializedRef.current) {
          initializedRef.current = true;
          prevCountRef.current = count;
        }
        setWithdrawDepositCount(count);
      } catch {
        setWithdrawDepositCount(0);
      }
    };
    fetchCountRef.current = fetchWithdrawDepositCount;

    fetchUserProfile();
    fetchUserRole();
    fetchWithdrawDepositCount();

    const POLL_INTERVAL_MS = 1_000;
    const pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchWithdrawDepositCount();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollTimer);
  }, []);

  useEffect(() => {
    const onRefetch = () => fetchCountRef.current();
    window.addEventListener('refetch-withdraw-deposit-count', onRefetch);
    return () => window.removeEventListener('refetch-withdraw-deposit-count', onRefetch);
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
      whatsapp: '/dashboard/whatsapp',
      agents: '/dashboard/agents',
      'user-management': '/dashboard/user-management',
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

  const handleCopyInvitationCode = async () => {
    if (userProfile?.invitation_code) {
      try {
        await navigator.clipboard.writeText(userProfile.invitation_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Refer code copied!');
      } catch (err) {
        console.error('Failed to copy invitation code:', err);
        toast.error('Failed to copy');
      }
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
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-cyan-400 font-medium">
                    {userProfile.invitation_code}
                  </span>
                  <button
                    onClick={handleCopyInvitationCode}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title={copied ? 'Copied!' : 'Copy invitation code'}
                  >
                    {copied ? (
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {userProfile?.role || 'User'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-gray-800">
        <button
          type="button"
          onClick={() => setNotificationsOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-gray-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm font-medium text-white">Withdraw / Deposit</span>
          </div>
          <span className="text-xs font-semibold bg-red-600 text-white px-1.5 py-0.5 rounded">
            {withdrawDepositCount}
          </span>
        </button>
        {notificationsOpen && (
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto" />
        )}
      </div>

      <nav className="flex-1 p-2">
        {menuItems.filter((item) => {
          if (item.id === 'agents') return isAdmin;
          if (item.id === 'user-management') return isAdmin || isAgent;
          return true;
        }).map((item) => (
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
                  <span className={item.id === 'whatsapp' ? 'text-green-400' : 'text-gray-400'}>
                    {getIcon(item.icon)}
                  </span>
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

