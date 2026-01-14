import { useState, useEffect } from 'react';
import { api, type Level } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  invitation_code: string;
  role: string;
  created_by: string | null;
  status: 'Active' | 'Inactive';
  date_joined: string;
  last_login: string | null;
  level_id?: number | null;
  level_name?: string | null;
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone_number: '',
    email: '',
    login_password: '',
    confirm_login_password: '',
    withdraw_password: '',
    confirm_withdraw_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [levelAssignLoading, setLevelAssignLoading] = useState(false);
  const [levelError, setLevelError] = useState('');
  const itemsPerPage = 10;

  const convertApiUserToLocal = (apiUser: {
    id: number;
    email: string;
    username: string;
    phone_number: string;
    invitation_code: string;
    role: string;
    level?: {
      id: number;
      level: number;
      level_name: string;
      required_points: number;
      commission_rate: string;
      min_orders: number;
      benefits: string;
      status: string;
      created_at: string;
    } | null;
    created_by: number;
    created_by_email: string;
    created_by_username: string;
    date_joined: string;
    last_login: string | null;
    is_active: boolean;
  }): User => {
    return {
      id: apiUser.id,
      username: apiUser.username,
      email: apiUser.email,
      phone_number: apiUser.phone_number,
      invitation_code: apiUser.invitation_code,
      role: apiUser.role,
      created_by: apiUser.created_by_username || null,
      status: apiUser.is_active ? 'Active' : 'Inactive',
      date_joined: apiUser.date_joined,
      last_login: apiUser.last_login,
      level_id: apiUser.level?.id || null,
      level_name: apiUser.level?.level_name || null,
    };
  };

  const convertAdminApiUserToLocal = (apiUser: {
    id: number;
    username: string;
    email: string;
    phone_number: string;
    invitation_code: string;
    role: string;
    level?: {
      id: number;
      level: number;
      level_name: string;
      required_points: number;
      commission_rate: string;
      min_orders: number;
      benefits: string;
      status: string;
      created_at: string;
    } | null;
    created_by: string;
    created_by_id: number;
    created_by_email: string;
    status: string;
    date_joined: string;
    last_login: string | null;
  }): User => {
    return {
      id: apiUser.id,
      username: apiUser.username,
      email: apiUser.email,
      phone_number: apiUser.phone_number,
      invitation_code: apiUser.invitation_code,
      role: apiUser.role,
      created_by: apiUser.created_by || null,
      status: apiUser.status === 'Active' ? 'Active' : 'Inactive',
      date_joined: apiUser.date_joined,
      last_login: apiUser.last_login,
      level_id: apiUser.level?.id || null,
      level_name: apiUser.level?.level_name || null,
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setListError('');

    try {
      let response;
      if (isAdmin) {
        response = await api.getAdminAgentUsers();
        const convertedUsers = response.users.map(convertAdminApiUserToLocal);
        setUsers(convertedUsers);
      } else {
        response = await api.getMyUsers();
        const convertedUsers = response.users.map(convertApiUserToLocal);
        setUsers(convertedUsers);
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRoleAndUsers = async () => {
      try {
        const roleData = await api.checkRole();
        const adminStatus = roleData.is_admin || roleData.role === 'ADMIN';
        setIsAdmin(adminStatus);

        setLoading(true);
        setListError('');

        let response;
        if (adminStatus) {
          response = await api.getAdminAgentUsers();
          const convertedUsers = response.users.map(convertAdminApiUserToLocal);
          setUsers(convertedUsers);
        } else {
          response = await api.getMyUsers();
          const convertedUsers = response.users.map(convertApiUserToLocal);
          setUsers(convertedUsers);
        }
      } catch (err) {
        setListError(err instanceof Error ? err.message : 'Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number.includes(searchTerm) ||
      user.invitation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.created_by && user.created_by.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleActivate = async (userId: number) => {
    setActionLoading(userId);

    try {
      await api.activateUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Error activating user:', err);
      alert(err instanceof Error ? err.message : 'Failed to activate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (userId: number) => {
    setActionLoading(userId);

    try {
      await api.deactivateUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert(err instanceof Error ? err.message : 'Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenLevelModal = async (user: User) => {
    setSelectedUser(user);
    setLevelError('');
    setIsLevelModalOpen(true);

    try {
      const response = await api.getLevels({ status: 'ACTIVE' });
      setLevels(response.results);
      if (user.level_id) {
        setSelectedLevelId(user.level_id.toString());
      } else {
        setSelectedLevelId('');
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      setLevelError('Failed to load levels');
    }
  };

  const handleCloseLevelModal = () => {
    setIsLevelModalOpen(false);
    setSelectedUser(null);
    setSelectedLevelId('');
    setLevelError('');
  };

  const handleAssignLevel = async () => {
    if (!selectedUser) return;

    setLevelAssignLoading(true);
    setLevelError('');

    try {
      const levelId = selectedLevelId ? parseInt(selectedLevelId) : null;
      
      if (!levelId) {
        setLevelError('Please select a level');
        setLevelAssignLoading(false);
        return;
      }

      await api.assignLevelToUser(selectedUser.id, levelId);
      handleCloseLevelModal();
      await fetchUsers();
    } catch (err: any) {
      if (err.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          })
          .join('\n');
        setLevelError(errorMessages);
      } else {
        setLevelError(err instanceof Error ? err.message : 'Failed to assign level');
      }
    } finally {
      setLevelAssignLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSuccess('');
    setFieldErrors({});
    setFormData({
      username: '',
      phone_number: '',
      email: '',
      login_password: '',
      confirm_login_password: '',
      withdraw_password: '',
      confirm_withdraw_password: '',
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSuccess('');
    setFieldErrors({});
    setFormData({
      username: '',
      phone_number: '',
      email: '',
      login_password: '',
      confirm_login_password: '',
      withdraw_password: '',
      confirm_withdraw_password: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setFieldErrors({});

    if (formData.login_password !== formData.confirm_login_password) {
      setFieldErrors({
        confirm_login_password: ['Passwords do not match'],
      });
      return;
    }

    if (formData.withdraw_password !== formData.confirm_withdraw_password) {
      setFieldErrors({
        confirm_withdraw_password: ['Withdraw passwords do not match'],
      });
      return;
    }

    setFormLoading(true);

    try {
      const userData: {
        username: string;
        email: string;
        phone_number: string;
        login_password: string;
        confirm_login_password: string;
        withdraw_password: string;
        confirm_withdraw_password: string;
      } = {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        login_password: formData.login_password,
        confirm_login_password: formData.confirm_login_password,
        withdraw_password: formData.withdraw_password,
        confirm_withdraw_password: formData.confirm_withdraw_password,
      };

      await api.createUserByAgent(userData);
      setSuccess('User created successfully!');
      setFieldErrors({});

      setTimeout(() => {
        handleCloseModal();
        fetchUsers();
      }, 1500);
    } catch (err) {
      if (err instanceof Error && (err as any).errors) {
        const errors = (err as any).errors;
        const normalizedErrors: Record<string, string[]> = {};

        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key])) {
            normalizedErrors[key] = errors[key];
          } else if (typeof errors[key] === 'string') {
            normalizedErrors[key] = [errors[key]];
          }
        });

        setFieldErrors(normalizedErrors);
      } else {
        setFieldErrors({
          _general: [err instanceof Error ? err.message : 'Failed to create user'],
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Create User
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {listError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {listError}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading users...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invitation Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.phone_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{user.invitation_code}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {user.level_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {user.created_by || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(user.date_joined)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(user.last_login)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenLevelModal(user)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Assign Level"
                          >
                            Level
                          </button>
                          {user.status === 'Active' ? (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              disabled={actionLoading === user.id}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Deactivate"
                            >
                              {actionLoading === user.id ? '...' : 'Deactivate'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              disabled={actionLoading === user.id}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Activate"
                            >
                              {actionLoading === user.id ? '...' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create User</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {success && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {fieldErrors._general && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {fieldErrors._general.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.username ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter username"
                  />
                  {fieldErrors.username && Array.isArray(fieldErrors.username) && fieldErrors.username.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.username.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter email"
                  />
                  {fieldErrors.email && Array.isArray(fieldErrors.email) && fieldErrors.email.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.email.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.phone_number ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {fieldErrors.phone_number && Array.isArray(fieldErrors.phone_number) && fieldErrors.phone_number.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.phone_number.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Login Password *
                  </label>
                  <input
                    type="password"
                    name="login_password"
                    value={formData.login_password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.login_password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter login password"
                  />
                  {fieldErrors.login_password && Array.isArray(fieldErrors.login_password) && fieldErrors.login_password.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.login_password.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Login Password *
                  </label>
                  <input
                    type="password"
                    name="confirm_login_password"
                    value={formData.confirm_login_password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.confirm_login_password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm login password"
                  />
                  {fieldErrors.confirm_login_password && Array.isArray(fieldErrors.confirm_login_password) && fieldErrors.confirm_login_password.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.confirm_login_password.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Withdraw Password *
                  </label>
                  <input
                    type="password"
                    name="withdraw_password"
                    value={formData.withdraw_password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.withdraw_password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter withdraw password"
                  />
                  {fieldErrors.withdraw_password && Array.isArray(fieldErrors.withdraw_password) && fieldErrors.withdraw_password.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.withdraw_password.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Withdraw Password *
                  </label>
                  <input
                    type="password"
                    name="confirm_withdraw_password"
                    value={formData.confirm_withdraw_password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.confirm_withdraw_password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm withdraw password"
                  />
                  {fieldErrors.confirm_withdraw_password && Array.isArray(fieldErrors.confirm_withdraw_password) && fieldErrors.confirm_withdraw_password.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.confirm_withdraw_password.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isLevelModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Assign Level
                </h2>
                <button
                  onClick={handleCloseLevelModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  User: <span className="font-medium text-gray-900 dark:text-white">{selectedUser.username}</span>
                </p>
              </div>

              {levelError && (
                <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-xs">
                  {levelError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Select Level
                </label>
                <select
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">No Level</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.level_name} (Level {level.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseLevelModal}
                  className="px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignLevel}
                  disabled={levelAssignLoading}
                  className="px-4 py-1.5 text-sm bg-gray-900 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {levelAssignLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;

