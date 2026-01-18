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
  is_training_account?: boolean;
  original_account_id?: number | null;
  original_account_email?: string | null;
  original_account_username?: string | null;
  balance?: number | null;
  account_type?: string;
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
    original_account_refer_code: '',
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
  const [isDebitModalOpen, setIsDebitModalOpen] = useState(false);
  const [selectedUserForDebit, setSelectedUserForDebit] = useState<User | null>(null);
  const [debitFormData, setDebitFormData] = useState({
    memberAccount: '',
    type: '',
    amount: '',
    remarkType: 'DEPOSIT',
    remark: '',
  });
  const [debitLoading, setDebitLoading] = useState(false);
  const [debitError, setDebitError] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const itemsPerPage = 10;

  const convertTableDataToLocal = (tableData: {
    id: number;
    account_type: string;
    username: string;
    email: string;
    phone_number: string;
    invitation_code: string;
    original_account: {
      id: number;
      username: string;
      email: string;
    } | null;
    balance: number;
    role: string;
    level: {
      id: number;
      name: string;
    } | null;
    created_by: {
      id: number;
      username: string;
      email: string;
    } | null;
    status: string;
    date_joined: string;
    last_login: string | null;
    is_training_account: boolean;
  }): User => {
    return {
      id: tableData.id,
      username: tableData.username,
      email: tableData.email,
      phone_number: tableData.phone_number,
      invitation_code: tableData.invitation_code,
      role: tableData.role,
      created_by: tableData.created_by?.username || null,
      status: tableData.status === 'Active' ? 'Active' : 'Inactive',
      date_joined: tableData.date_joined,
      last_login: tableData.last_login || null,
      level_id: tableData.level?.id || null,
      level_name: tableData.level?.name || null,
      is_training_account: tableData.is_training_account || false,
      original_account_id: tableData.original_account?.id || null,
      original_account_email: tableData.original_account?.email || null,
      original_account_username: tableData.original_account?.username || null,
      balance: tableData.balance || null,
      account_type: tableData.account_type || undefined,
    };
  };

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
    created_by?: number;
    created_by_email?: string;
    created_by_username?: string;
    date_joined: string;
    last_login?: string | null;
    is_active?: boolean;
    is_training_account?: boolean;
    original_account_id?: number | null;
    original_account_email?: string | null;
    original_account_username?: string | null;
    balance?: string | null;
  }): User => {
    return {
      id: apiUser.id,
      username: apiUser.username,
      email: apiUser.email,
      phone_number: apiUser.phone_number,
      invitation_code: apiUser.invitation_code,
      role: apiUser.role,
      created_by: apiUser.created_by_username || null,
      status: apiUser.is_active !== false ? 'Active' : 'Inactive',
      date_joined: apiUser.date_joined,
      last_login: apiUser.last_login || null,
      level_id: apiUser.level?.id || null,
      level_name: apiUser.level?.level_name || null,
      is_training_account: apiUser.is_training_account || false,
      original_account_id: apiUser.original_account_id || null,
      original_account_email: apiUser.original_account_email || null,
      original_account_username: apiUser.original_account_username || null,
      balance: apiUser.balance ? parseFloat(apiUser.balance) : null,
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
    created_by?: string;
    created_by_id?: number;
    created_by_email?: string;
    status?: string;
    date_joined: string;
    last_login?: string | null;
    is_training_account?: boolean;
    original_account_id?: number | null;
    original_account_email?: string | null;
    original_account_username?: string | null;
    balance?: string | null;
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
      last_login: apiUser.last_login || null,
      level_id: apiUser.level?.id || null,
      level_name: apiUser.level?.level_name || null,
      is_training_account: apiUser.is_training_account || false,
      original_account_id: apiUser.original_account_id || null,
      original_account_email: apiUser.original_account_email || null,
      original_account_username: apiUser.original_account_username || null,
      balance: apiUser.balance ? parseFloat(apiUser.balance) : null,
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setListError('');

    try {
      let response;
      if (isAdmin) {
        response = await api.getAdminAgentUsers();
        if (response.table_data && response.table_data.length > 0) {
          const convertedUsers = response.table_data.map(convertTableDataToLocal);
          setUsers(convertedUsers);
        } else {
          const usersList = response.flat_list || response.users || [];
          const convertedUsers = usersList.map(convertAdminApiUserToLocal);
          setUsers(convertedUsers);
        }
      } else {
        response = await api.getMyUsers();
        if (response.table_data && response.table_data.length > 0) {
          const convertedUsers = response.table_data.map(convertTableDataToLocal);
          setUsers(convertedUsers);
        } else {
          const usersList = response.flat_list || response.users || [];
          const convertedUsers = usersList.map(convertApiUserToLocal);
          setUsers(convertedUsers);
        }
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
          if (response.table_data && response.table_data.length > 0) {
            const convertedUsers = response.table_data.map(convertTableDataToLocal);
            setUsers(convertedUsers);
          } else {
            const usersList = response.flat_list || response.users || [];
            const convertedUsers = usersList.map(convertAdminApiUserToLocal);
            setUsers(convertedUsers);
          }
        } else {
          response = await api.getMyUsers();
          if (response.table_data && response.table_data.length > 0) {
            const convertedUsers = response.table_data.map(convertTableDataToLocal);
            setUsers(convertedUsers);
          } else {
            const usersList = response.flat_list || response.users || [];
            const convertedUsers = usersList.map(convertApiUserToLocal);
            setUsers(convertedUsers);
          }
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
      if (isAdmin) {
        await api.activateUser(userId);
      } else {
        await api.agentActivateUser(userId);
      }
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
      if (isAdmin) {
        await api.deactivateUser(userId);
      } else {
        await api.agentDeactivateUser(userId);
      }
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

  const handleOpenDebitModal = (user: User) => {
    setSelectedUserForDebit(user);
    setDebitFormData({
      memberAccount: `${user.username} (ID: ${user.id})`,
      type: '',
      amount: '',
      remarkType: 'DEPOSIT',
      remark: '',
    });
    setDebitError('');
    setIsDebitModalOpen(true);
  };

  const handleCloseDebitModal = () => {
    setIsDebitModalOpen(false);
    setSelectedUserForDebit(null);
    setDebitFormData({
      memberAccount: '',
      type: '',
      amount: '',
      remarkType: 'DEPOSIT',
      remark: '',
    });
    setDebitError('');
  };

  const handleSubmitDebit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForDebit) return;

    setDebitLoading(true);
    setDebitError('');

    try {
      const amount = parseFloat(debitFormData.amount);
      if (isNaN(amount) || amount <= 0) {
        setDebitError('Please enter a valid amount greater than 0');
        setDebitLoading(false);
        return;
      }

      await api.addBalance({
        member_account: selectedUserForDebit.id,
        type: debitFormData.type.toUpperCase() as 'CREDIT' | 'DEBIT',
        amount: amount,
        remark_type: debitFormData.remarkType,
        remark: debitFormData.remark,
      });

      handleCloseDebitModal();
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
        setDebitError(errorMessages);
      } else {
        setDebitError(err instanceof Error ? err.message : 'Failed to add balance');
      }
    } finally {
      setDebitLoading(false);
    }
  };

  const handleOpenResetModal = (user: User) => {
    if (!user.level_id) {
      alert('This user does not have a level assigned. Please assign a level first.');
      return;
    }
    setSelectedUserForReset(user);
    setResetError('');
    setIsResetModalOpen(true);
  };

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setSelectedUserForReset(null);
    setResetError('');
  };

  const handleConfirmReset = async () => {
    if (!selectedUserForReset || !selectedUserForReset.level_id) return;

    setResetLoading(true);
    setResetError('');

    try {
      await api.resetUserOrder(selectedUserForReset.id, selectedUserForReset.level_id);
      handleCloseResetModal();
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
        setResetError(errorMessages);
      } else {
        setResetError(err instanceof Error ? err.message : 'Failed to reset order');
      }
    } finally {
      setResetLoading(false);
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
      original_account_refer_code: '',
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
      original_account_refer_code: '',
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setFieldErrors({});

    const errors: Record<string, string[]> = {};

    // Username validation
    if (!formData.username || formData.username.trim() === '') {
      errors.username = ['Username is required'];
    } else if (formData.username.trim().length < 3) {
      errors.username = ['Username must be at least 3 characters long'];
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errors.username = ['Username can only contain letters, numbers, and underscores'];
    }

    // Email validation
    if (!formData.email || formData.email.trim() === '') {
      errors.email = ['Email is required'];
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = ['Please enter a valid email address'];
    }

    // Phone number validation
    if (!formData.phone_number || formData.phone_number.trim() === '') {
      errors.phone_number = ['Phone number is required'];
    } else if (!validatePhoneNumber(formData.phone_number.trim())) {
      errors.phone_number = ['Please enter a valid phone number (at least 10 digits)'];
    }

    // Login password validation
    if (!formData.login_password || formData.login_password === '') {
      errors.login_password = ['Login password is required'];
    } else if (formData.login_password.length < 6) {
      errors.login_password = ['Login password must be at least 6 characters long'];
    }

    // Confirm login password validation
    if (!formData.confirm_login_password || formData.confirm_login_password === '') {
      errors.confirm_login_password = ['Please confirm your login password'];
    } else if (formData.login_password !== formData.confirm_login_password) {
      errors.confirm_login_password = ['Login passwords do not match'];
    }

    // Original account refer code validation
    if (!formData.original_account_refer_code || formData.original_account_refer_code.trim() === '') {
      errors.original_account_refer_code = ['Original account refer code is required'];
    }

    // Withdraw password validation
    if (!formData.withdraw_password || formData.withdraw_password === '') {
      errors.withdraw_password = ['Withdraw password is required'];
    } else if (formData.withdraw_password.length < 4) {
      errors.withdraw_password = ['Withdraw password must be at least 4 characters long'];
    }

    // Confirm withdraw password validation
    if (!formData.confirm_withdraw_password || formData.confirm_withdraw_password === '') {
      errors.confirm_withdraw_password = ['Please confirm your withdraw password'];
    } else if (formData.withdraw_password !== formData.confirm_withdraw_password) {
      errors.confirm_withdraw_password = ['Withdraw passwords do not match'];
    }

    // If there are validation errors, set them and return
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFormLoading(true);

    try {
      const trainingData: {
        username: string;
        email: string;
        phone_number: string;
        login_password: string;
        confirm_login_password: string;
        original_account_refer_code: string;
        withdraw_password: string;
        confirm_withdraw_password: string;
      } = {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        login_password: formData.login_password,
        confirm_login_password: formData.confirm_login_password,
        original_account_refer_code: formData.original_account_refer_code.trim(),
        withdraw_password: formData.withdraw_password,
        confirm_withdraw_password: formData.confirm_withdraw_password,
      };

      await api.createTrainingAccount(trainingData);
      setSuccess('Training account created successfully!');
      setFieldErrors({});

      setTimeout(() => {
        handleCloseModal();
        fetchUsers();
      }, 1500);
    } catch (err: any) {
      setFieldErrors({});

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
        setFieldErrors({
          _general: [err instanceof Error ? err.message : 'Failed to create training account'],
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
            Create Training Account
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invitation Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Original Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
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
                      <td className="px-4 py-3 text-sm">
                        {user.account_type === 'Training' || user.is_training_account ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Training
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Original
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.phone_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{user.invitation_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {user.is_training_account && user.original_account_username ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{user.original_account_username}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.original_account_email}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {user.balance !== null && user.balance !== undefined ? `$${user.balance.toFixed(2)}` : '-'}
                      </td>
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
                            onClick={() => handleOpenDebitModal(user)}
                            className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            title="Add Balance"
                          >
                            Debit
                          </button>
                          <button
                            onClick={() => handleOpenLevelModal(user)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Assign Level"
                          >
                            Level
                          </button>
                          <button
                            onClick={() => handleOpenResetModal(user)}
                            className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors whitespace-nowrap"
                            title="Reset Order"
                          >
                            Reset Order
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
                    <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Training Account</h2>
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
                    Original Account Refer Code *
                  </label>
                  <input
                    type="text"
                    name="original_account_refer_code"
                    value={formData.original_account_refer_code}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
                      fieldErrors.original_account_refer_code ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter original account refer code"
                  />
                  {fieldErrors.original_account_refer_code && Array.isArray(fieldErrors.original_account_refer_code) && fieldErrors.original_account_refer_code.length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.original_account_refer_code.map((err, idx) => (
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

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={formLoading}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-2 py-1.5 text-xs bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Creating...' : 'Create Training Account'}
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

      {isDebitModalOpen && selectedUserForDebit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add Balance (Debit/Credit)
                </h2>
                <button
                  onClick={handleCloseDebitModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {debitError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {debitError}
                </div>
              )}

              <form onSubmit={handleSubmitDebit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Account *
                  </label>
                  <input
                    type="text"
                    value={debitFormData.memberAccount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={debitFormData.type}
                    onChange={(e) => setDebitFormData({ ...debitFormData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={debitFormData.amount}
                    onChange={(e) => setDebitFormData({ ...debitFormData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remark Type *
                  </label>
                  <select
                    value={debitFormData.remarkType}
                    onChange={(e) => setDebitFormData({ ...debitFormData, remarkType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  >
                    <option value="DEPOSIT">Deposit</option>
                    <option value="WITHDRAWAL">Withdrawal</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="BONUS">Bonus</option>
                    <option value="PENALTY">Penalty</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                    <option value="REWARDS">Rewards</option>
                    <option value="REBATE">Rebate</option>
                    <option value="COMMISSION">Commission</option>
                    <option value="ACTIVATION_FEES">Activation Fees</option>
                    <option value="BASIC_SALARY">Basic Salary</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remark
                  </label>
                  <textarea
                    value={debitFormData.remark}
                    onChange={(e) => setDebitFormData({ ...debitFormData, remark: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    rows={3}
                    placeholder="Enter remark or description..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseDebitModal}
                    disabled={debitLoading}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={debitLoading}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {debitLoading ? 'Processing...' : 'Submit Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reset Order
                </h2>
                <button
                  onClick={handleCloseResetModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  disabled={resetLoading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {resetError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {resetError}
                </div>
              )}

              <div className="mb-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                        Are you sure you want to reset the order?
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseResetModal}
                  disabled={resetLoading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={resetLoading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    'Yes, Reset Order'
                  )}
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

