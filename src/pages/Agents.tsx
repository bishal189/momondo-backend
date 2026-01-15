import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  invitationCode: string;
  totalUsers: number;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
}

function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    login_password: '',
    confirm_login_password: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const itemsPerPage = 10;

  const transformApiAgentToLocal = (apiAgent: {
    id: number;
    name: string;
    email: string;
    phone: string;
    invitation_code: string;
    total_users: number;
    status: string;
    created_by: string;
    created_by_email: string;
    created_at: string;
  }): Agent => {
    return {
      id: apiAgent.id,
      name: apiAgent.name,
      email: apiAgent.email,
      phone: apiAgent.phone,
      invitationCode: apiAgent.invitation_code,
      totalUsers: apiAgent.total_users,
      status: apiAgent.status === 'Active' ? 'Active' : 'Inactive',
      createdBy: apiAgent.created_by,
      createdAt: apiAgent.created_at
        ? new Date(apiAgent.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6')
        : '',
    };
  };

  const fetchAgents = async () => {
    setLoading(true);
    setListError('');

    try {
      const response = await api.getAgentUsers();
      const convertedAgents = response.agents.map(transformApiAgentToLocal);
      setAgents(convertedAgents);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.invitationCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: 'Active' | 'Inactive') => {
    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
          status === 'Active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        {status}
      </span>
    );
  };

  const handleAddNew = () => {
    setAddFormData({
      username: '',
      email: '',
      phone_number: '',
      login_password: '',
      confirm_login_password: '',
    });
    setIsAddModalOpen(true);
    setAddError('');
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddError('');
    setFieldErrors({});
    setAddFormData({
      username: '',
      email: '',
      phone_number: '',
      login_password: '',
      confirm_login_password: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleSaveNew = async () => {
    setAddError('');
    setFieldErrors({});

    const errors: Record<string, string[]> = {};

    if (!addFormData.username || addFormData.username.trim() === '') {
      errors.username = ['Username is required'];
    } else if (addFormData.username.trim().length < 3) {
      errors.username = ['Username must be at least 3 characters long'];
    } else if (!/^[a-zA-Z0-9_]+$/.test(addFormData.username.trim())) {
      errors.username = ['Username can only contain letters, numbers, and underscores'];
    }

    if (!addFormData.email || addFormData.email.trim() === '') {
      errors.email = ['Email is required'];
    } else if (!validateEmail(addFormData.email.trim())) {
      errors.email = ['Please enter a valid email address'];
    }

    if (!addFormData.phone_number || addFormData.phone_number.trim() === '') {
      errors.phone_number = ['Phone number is required'];
    } else if (!validatePhoneNumber(addFormData.phone_number.trim())) {
      errors.phone_number = ['Please enter a valid phone number (at least 10 digits)'];
    }

    if (!addFormData.login_password || addFormData.login_password === '') {
      errors.login_password = ['Login password is required'];
    } else if (addFormData.login_password.length < 6) {
      errors.login_password = ['Login password must be at least 6 characters long'];
    }

    if (!addFormData.confirm_login_password || addFormData.confirm_login_password === '') {
      errors.confirm_login_password = ['Please confirm your login password'];
    } else if (addFormData.login_password !== addFormData.confirm_login_password) {
      errors.confirm_login_password = ['Passwords do not match'];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setAddLoading(true);

    try {
      const agentData = {
        username: addFormData.username,
        email: addFormData.email,
        phone_number: addFormData.phone_number,
        login_password: addFormData.login_password,
        confirm_login_password: addFormData.confirm_login_password,
      };

      await api.createAgent(agentData);
      handleCloseAddModal();
      fetchAgents();
    } catch (err: any) {
      setFieldErrors({});
      setAddError('');

      if (err.errors) {
        const normalizedErrors: Record<string, string[]> = {};

        Object.keys(err.errors).forEach((key) => {
          if (Array.isArray(err.errors[key])) {
            normalizedErrors[key] = err.errors[key];
          } else if (typeof err.errors[key] === 'string') {
            normalizedErrors[key] = [err.errors[key]];
          }
        });

        setFieldErrors(normalizedErrors);
      } else {
        setAddError(err instanceof Error ? err.message : 'Failed to create agent');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleActivate = async (agentId: number) => {
    setActionLoading(agentId);
    try {
      await api.activateUser(agentId);
      setAgents(agents.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'Active' } : agent
      ));
      fetchAgents();
    } catch (err: any) {
      console.error('Failed to activate agent:', err);
      alert(err instanceof Error ? err.message : 'Failed to activate agent');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (agentId: number) => {
    setActionLoading(agentId);
    try {
      await api.deactivateUser(agentId);
      setAgents(agents.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'Inactive' } : agent
      ));
      fetchAgents();
    } catch (err: any) {
      console.error('Failed to deactivate agent:', err);
      alert(err instanceof Error ? err.message : 'Failed to deactivate agent');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddInputChange = (field: keyof typeof addFormData, value: string) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (addError) {
      setAddError('');
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Add New Agent
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or invitation code..."
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
                {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
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
              Loading agents...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invitation Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Users</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedAgents.length > 0 ? (
                      paginatedAgents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{agent.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{agent.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agent.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agent.phone}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{agent.invitationCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{agent.totalUsers}</td>
                          <td className="px-4 py-3 text-sm">{getStatusBadge(agent.status)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agent.createdBy}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{agent.createdAt}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {agent.status === 'Active' ? (
                                <button
                                  onClick={() => handleDeactivate(agent.id)}
                                  disabled={actionLoading === agent.id}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Deactivate"
                                >
                                  {actionLoading === agent.id ? '...' : 'Deactivate'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(agent.id)}
                                  disabled={actionLoading === agent.id}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Activate"
                                >
                                  {actionLoading === agent.id ? '...' : 'Activate'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No agents found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAgents.length)} of {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
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

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add New Agent
                </h2>
                <button
                  onClick={handleCloseAddModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveNew();
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={addFormData.username}
                    onChange={(e) => handleAddInputChange('username', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      fieldErrors.username ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    placeholder="Enter agent username..."
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
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => handleAddInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      fieldErrors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    placeholder="Enter agent email..."
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
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={addFormData.phone_number}
                    onChange={(e) => handleAddInputChange('phone_number', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      fieldErrors.phone_number ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    placeholder="Enter agent phone number..."
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
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={addFormData.login_password}
                      onChange={(e) => handleAddInputChange('login_password', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 ${
                        fieldErrors.login_password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                      placeholder="Enter login password..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.login_password && Array.isArray(fieldErrors.login_password) && fieldErrors.login_password.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.login_password.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Confirm Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={addFormData.confirm_login_password}
                      onChange={(e) => handleAddInputChange('confirm_login_password', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 ${
                        fieldErrors.confirm_login_password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                      placeholder="Confirm login password..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirm_login_password && Array.isArray(fieldErrors.confirm_login_password) && fieldErrors.confirm_login_password.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.confirm_login_password.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-6 py-2.5 bg-gray-900 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addLoading ? 'Creating...' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agents;

