import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, type Level } from '../../services/api';
import type { User, CreateTrainingFormData, DebitFormData, EditUserFormData, WalletFormData } from './types';
import { formatDate, getStatusBadge, validateEmail, validatePhoneNumber, flattenUsersResponse } from './utils';
import { ITEMS_PER_PAGE } from './constants';
import {
  CreateTrainingAccountModal,
  LevelModal,
  DebitModal,
  ResetModal,
  EditUserModal,
  WalletModal,
  AccountDetailsModal,
  MoreActionsDropdown,
} from './components';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTrainingFormData>({
    username: '', phone_number: '', email: '', login_password: '', confirm_login_password: '',
    original_account_refer_code: '', withdraw_password: '', confirm_withdraw_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [levelAssignLoading, setLevelAssignLoading] = useState(false);
  const [levelError, setLevelError] = useState('');

  const [selectedUserForDebit, setSelectedUserForDebit] = useState<User | null>(null);
  const [debitFormData, setDebitFormData] = useState<DebitFormData>({
    memberAccount: '', type: '', amount: '', remarkType: 'DEPOSIT', remark: '',
  });
  const [debitLoading, setDebitLoading] = useState(false);
  const [debitError, setDebitError] = useState('');

  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const getDefaultEditFormData = (): EditUserFormData => ({
    username: '',
    email: '',
    level_id: '',
    parent_id: '',
    phone_number: '',
    balance: '',
    today_commission: '',
    freeze_amount: '',
    credibility: '',
    withdrawal_min_amount: '',
    withdrawal_max_amount: '',
    withdrawal_needed_to_complete_order: '',
    matching_range_min: '30',
    matching_range_max: '70',
    password: '',
    confirm_password: '',
    payment_password: '',
    confirm_payment_password: '',
    allow_rob_order: false,
    allow_withdrawal: true,
    number_of_draws: '',
    winning_amount: '',
    custom_winning_amount: '',
  });
  const [editFormData, setEditFormData] = useState<EditUserFormData>(getDefaultEditFormData);
  const [editModalLevels, setEditModalLevels] = useState<Level[]>([]);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');

  const [selectedUserForWallet, setSelectedUserForWallet] = useState<User | null>(null);
  const [selectedUserForAccountDetails, setSelectedUserForAccountDetails] = useState<User | null>(null);
  const [walletFormData, setWalletFormData] = useState<WalletFormData>({
    walletName: '', walletAddress: '', phoneNumber: '', currency: 'USDT', networkType: 'TRC 20',
  });
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletSubmitLoading, setWalletSubmitLoading] = useState(false);
  const [walletError, setWalletError] = useState('');

  const [moreMenuUser, setMoreMenuUser] = useState<User | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<{ left: number; top: number } | null>(null);
  const moreMenuButtonRef = useRef<HTMLDivElement | null>(null);
  const moreMenuDropdownRef = useRef<HTMLDivElement | null>(null);
  const moreMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMoreMenuCloseTimer = () => {
    if (moreMenuCloseTimerRef.current) {
      clearTimeout(moreMenuCloseTimerRef.current);
      moreMenuCloseTimerRef.current = null;
    }
  };
  const scheduleMoreMenuClose = () => {
    clearMoreMenuCloseTimer();
    moreMenuCloseTimerRef.current = setTimeout(() => setMoreMenuUser(null), 150);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setListError('');
    try {
      const response = isAdmin ? await api.getAdminAgentUsers() : await api.getMyUsers();
      setUsers(flattenUsersResponse((response.users ?? []) as User[]));
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => clearMoreMenuCloseTimer();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const roleData = await api.checkRole();
        const adminStatus = roleData.is_admin || roleData.role === 'ADMIN';
        setIsAdmin(adminStatus);
        setLoading(true);
        setListError('');
        const response = adminStatus ? await api.getAdminAgentUsers() : await api.getMyUsers();
        setUsers(flattenUsersResponse((response.users ?? []) as User[]));
      } catch (err) {
        setListError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!moreMenuUser) return;
    const onClose = (e: MouseEvent) => {
      const target = e.target as Node;
      if (moreMenuButtonRef.current?.contains(target) || moreMenuDropdownRef.current?.contains(target)) return;
      setMoreMenuUser(null);
    };
    document.addEventListener('click', onClose);
    return () => document.removeEventListener('click', onClose);
  }, [moreMenuUser]);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone_number.includes(searchTerm) ||
      u.invitation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.created_by_username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleActivate = async (userId: number) => {
    setActionLoading(userId);
    try {
      if (isAdmin) await api.activateUser(userId);
      else await api.agentActivateUser(userId);
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to activate user');
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
      setSelectedLevelId(user.level?.id?.toString() ?? '');
    } catch {
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
        return;
      }
      await api.assignLevelToUser(selectedUser.id, levelId);
      handleCloseLevelModal();
      await fetchUsers();
    } catch (err: any) {
      setLevelError(err.errors ? Object.entries(err.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n') : (err.message || 'Failed to assign level'));
    } finally {
      setLevelAssignLoading(false);
    }
  };

  const handleOpenDebitModal = (user: User) => {
    setSelectedUserForDebit(user);
    setDebitFormData({ memberAccount: `${user.username} (ID: ${user.id})`, type: '', amount: '', remarkType: 'DEPOSIT', remark: '' });
    setDebitError('');
  };

  const handleCloseDebitModal = () => {
    setSelectedUserForDebit(null);
    setDebitFormData({ memberAccount: '', type: '', amount: '', remarkType: 'DEPOSIT', remark: '' });
    setDebitError('');
  };

  const handleDebitFormChange = (field: keyof DebitFormData, value: string) => {
    setDebitFormData((prev) => ({ ...prev, [field]: value }));
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
        return;
      }
      await api.addBalance({
        member_account: selectedUserForDebit.id,
        type: debitFormData.type.toUpperCase() as 'CREDIT' | 'DEBIT',
        amount,
        remark_type: debitFormData.remarkType,
        remark: debitFormData.remark,
      });
      toast.success('Balance updated successfully.');
      handleCloseDebitModal();
      await fetchUsers();
    } catch (err: any) {
      setDebitError(err.errors ? Object.entries(err.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n') : (err.message || 'Failed to add balance'));
    } finally {
      setDebitLoading(false);
    }
  };

  const handleOpenResetModal = (user: User) => {
    if (!user.level?.id) {
      alert('Please assign a level first.');
      return;
    }
    setSelectedUserForReset(user);
    setResetError('');
  };

  const handleCloseResetModal = () => {
    setSelectedUserForReset(null);
    setResetError('');
  };

  const handleConfirmReset = async () => {
    if (!selectedUserForReset?.level?.id) return;
    setResetLoading(true);
    setResetError('');
    try {
      await api.resetUserOrder(selectedUserForReset.id, selectedUserForReset.level.id);
      handleCloseResetModal();
      await fetchUsers();
    } catch (err: any) {
      setResetError(err.errors ? Object.entries(err.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n') : (err.message || 'Failed to reset'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleOpenOrdersModal = (user: User) => {
    navigate(`/dashboard/user-management/${user.id}/orders`);
  };

  const handleOpenWalletModal = (user: User) => {
    setSelectedUserForWallet(user);
    setWalletError('');
    setWalletFormData({
      walletName: '',
      walletAddress: '',
      phoneNumber: user.phone_number ?? '',
      currency: 'USDT',
      networkType: 'TRC 20',
    });
    setMoreMenuUser(null);
  };

  const handleCloseWalletModal = () => {
    setSelectedUserForWallet(null);
    setWalletError('');
  };

  useEffect(() => {
    if (!selectedUserForWallet) return;
    let cancelled = false;
    setWalletLoading(true);
    setWalletError('');
    api
      .getPrimaryWallet(selectedUserForWallet.id)
      .then((res) => {
        if (cancelled) return;
        const w = res.wallet;
        setWalletFormData({
          walletName: w?.wallet_name ?? '',
          walletAddress: w?.wallet_address ?? '',
          phoneNumber: w?.phone_number ?? selectedUserForWallet.phone_number ?? '',
          currency: w?.currency ?? 'USDT',
          networkType: w?.network_type ?? 'TRC 20',
        });
      })
      .catch((err) => {
        if (!cancelled) setWalletError(err instanceof Error ? err.message : 'Failed to load wallet');
      })
      .finally(() => {
        if (!cancelled) setWalletLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedUserForWallet]);

  const handleWalletFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWalletFormData((prev) => ({ ...prev, [name]: value }));
    if (walletError) setWalletError('');
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForWallet) return;
    setWalletError('');
    setWalletSubmitLoading(true);
    try {
      await api.updatePrimaryWallet(selectedUserForWallet.id, {
        wallet_name: walletFormData.walletName.trim(),
        wallet_address: walletFormData.walletAddress.trim(),
        phone_number: walletFormData.phoneNumber.trim(),
        currency: walletFormData.currency,
        network_type: walletFormData.networkType,
      });
      toast.success('Wallet information saved.');
      handleCloseWalletModal();
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Failed to save wallet');
    } finally {
      setWalletSubmitLoading(false);
    }
  };

  const handleOpenEditUserModal = async (user: User) => {
    setSelectedUserForEdit(user);
    setEditUserError('');
    setIsEditUserModalOpen(true);
    setMoreMenuUser(null);
    setEditFormData({
      ...getDefaultEditFormData(),
      username: user.username ?? '',
      email: user.email ?? '',
      phone_number: user.phone_number ?? '',
      level_id: user.level?.id?.toString() ?? '',
      parent_id: user.created_by?.toString() ?? '',
      balance: user.balance ?? '',
      freeze_amount: user.balance_frozen_amount ?? '',
    });
    try {
      const res = await api.getLevels({ status: 'ACTIVE' });
      setEditModalLevels(res.results);
    } catch {
      setEditModalLevels([]);
    }
  };

  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUserForEdit(null);
    setEditFormData(getDefaultEditFormData());
    setEditUserError('');
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const t = e.target;
    const value = t.type === 'checkbox' ? (t as HTMLInputElement).checked : t.value;
    setEditFormData((prev) => ({ ...prev, [t.name]: value }));
    if (editUserError) setEditUserError('');
  };

  const handleSubmitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setEditUserError('');
    const d = editFormData;
    const u = d.username.trim();
    const p = d.phone_number.trim();
    if (!u) { setEditUserError('Username is required'); return; }
    if (!p) { setEditUserError('Phone number is required'); return; }
    if (!validatePhoneNumber(p)) { setEditUserError('Please enter a valid phone number'); return; }
    if (d.level_id === '') { setEditUserError('Level is required'); return; }
    if (d.parent_id.trim() === '') { setEditUserError('Parent ID is required'); return; }
    if (d.credibility.trim() === '') { setEditUserError('Credibility is required'); return; }
    if (d.password || d.confirm_password) {
      if (d.password.length < 6) { setEditUserError('Password must be at least 6 characters'); return; }
      if (d.password !== d.confirm_password) { setEditUserError('Passwords do not match'); return; }
    }
    setEditUserLoading(true);
    try {
      const payload: Record<string, unknown> = {
        username: u,
        email: d.email?.trim() || undefined,
        phone_number: p,
        level_id: d.level_id ? parseInt(d.level_id, 10) : undefined,
        parent_id: d.parent_id.trim() || undefined,
        credibility: d.credibility.trim() || undefined,
        allow_rob_order: d.allow_rob_order,
        allow_withdrawal: d.allow_withdrawal,
      };
      if (d.password && d.confirm_password) {
        payload.new_password = d.password;
        payload.confirm_new_password = d.confirm_password;
      }
      if (d.balance !== '') payload.balance = parseFloat(d.balance);
      if (d.today_commission !== '') payload.today_commission = parseFloat(d.today_commission);
      if (d.freeze_amount !== '') payload.freeze_amount = parseFloat(d.freeze_amount);
      if (d.withdrawal_min_amount !== '') payload.withdrawal_min_amount = parseFloat(d.withdrawal_min_amount);
      if (d.withdrawal_max_amount !== '') payload.withdrawal_max_amount = parseFloat(d.withdrawal_max_amount);
      if (d.withdrawal_needed_to_complete_order !== '') payload.withdrawal_needed_to_complete_order = parseFloat(d.withdrawal_needed_to_complete_order);
      if (d.matching_range_min !== '') payload.matching_range_min = parseFloat(d.matching_range_min);
      if (d.matching_range_max !== '') payload.matching_range_max = parseFloat(d.matching_range_max);
      if (d.payment_password) payload.payment_password = d.payment_password;
      if (d.confirm_payment_password) payload.confirm_payment_password = d.confirm_payment_password;
      if (d.number_of_draws !== '') payload.number_of_draws = parseInt(d.number_of_draws, 10);
      if (d.winning_amount !== '') payload.winning_amount = parseFloat(d.winning_amount);
      if (d.custom_winning_amount !== '') payload.custom_winning_amount = d.custom_winning_amount;
      await api.updateUser(selectedUserForEdit.id, payload as any);
      toast.success('User updated successfully.');
      handleCloseEditUserModal();
      await fetchUsers();
    } catch (err: unknown) {
      const ex = err as { errors?: Record<string, string | string[]>; message?: string };
      const msg = ex.errors
        ? Object.entries(ex.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
        : (ex.message ?? 'Failed to update');
      setEditUserError(msg);
      toast.error(msg);
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSuccess('');
    setFieldErrors({});
    setFormData({ username: '', phone_number: '', email: '', login_password: '', confirm_login_password: '', original_account_refer_code: '', withdraw_password: '', confirm_withdraw_password: '' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSuccess('');
    setFieldErrors({});
    setFormData({ username: '', phone_number: '', email: '', login_password: '', confirm_login_password: '', original_account_refer_code: '', withdraw_password: '', confirm_withdraw_password: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setFieldErrors({});
    const errors: Record<string, string[]> = {};
    if (!formData.username?.trim()) errors.username = ['Username is required'];
    else if (formData.username.trim().length < 3) errors.username = ['At least 3 characters'];
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) errors.username = ['Letters, numbers, underscores only'];
    if (!formData.email?.trim()) errors.email = ['Email is required'];
    else if (!validateEmail(formData.email.trim())) errors.email = ['Invalid email'];
    if (!formData.phone_number?.trim()) errors.phone_number = ['Phone is required'];
    else if (!validatePhoneNumber(formData.phone_number.trim())) errors.phone_number = ['Invalid phone'];
    if (!formData.login_password) errors.login_password = ['Password required'];
    else if (formData.login_password.length < 6) errors.login_password = ['At least 6 characters'];
    if (formData.login_password !== formData.confirm_login_password) errors.confirm_login_password = ['Passwords do not match'];
    if (!formData.original_account_refer_code?.trim()) errors.original_account_refer_code = ['Refer code required'];
    if (!formData.withdraw_password) errors.withdraw_password = ['Required'];
    else if (formData.withdraw_password.length < 4) errors.withdraw_password = ['At least 4 characters'];
    if (formData.withdraw_password !== formData.confirm_withdraw_password) errors.confirm_withdraw_password = ['Passwords do not match'];
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFormLoading(true);
    try {
      await api.createTrainingAccount({
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        login_password: formData.login_password,
        confirm_login_password: formData.confirm_login_password,
        original_account_refer_code: formData.original_account_refer_code.trim(),
        withdraw_password: formData.withdraw_password,
        confirm_withdraw_password: formData.confirm_withdraw_password,
      });
      setSuccess('Training account created successfully!');
      toast.success('Training account created successfully!');
      setTimeout(() => {
        handleCloseModal();
        fetchUsers();
      }, 1500);
    } catch (err: any) {
      if (err.errors) {
        const normalized: Record<string, string[]> = {};
        Object.keys(err.errors).forEach((key) => {
          normalized[key] = Array.isArray(err.errors[key]) ? err.errors[key] : [String(err.errors[key])];
        });
        setFieldErrors(normalized);
      } else {
        setFieldErrors({ _general: [err.message || 'Failed to create'] });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const openMoreMenu = (e: React.MouseEvent<HTMLDivElement>, user: User) => {
    clearMoreMenuCloseTimer();
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const w = 180;
    const sidebar = 260;
    const pad = 12;
    const left = Math.max(sidebar, Math.min(rect.left, window.innerWidth - w - pad));
    const top = Math.min(rect.bottom + 4, window.innerHeight - 220);
    setMoreMenuAnchor({ left, top });
    setMoreMenuUser(user);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          {!isAdmin && (
            <button onClick={handleOpenModal} className="px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
              Create Training Account
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</div>
            </div>
          </div>

          {listError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {listError}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {['ID', 'Account Type', 'Username', 'Email', 'Phone Number', 'Invitation Code', 'Original Account', 'Balance', 'Role', 'Level', 'Created By', 'Status', 'Frozen', 'Frozen Amount', 'Date Joined', 'Last Login', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.id}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_training_account ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                            {user.is_training_account ? 'Training' : 'Original'}
                          </span>
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
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {user.balance != null ? `$${Number(user.balance).toFixed(2)}` : '$0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{user.role}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.level?.level_name ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.created_by_username ?? '-'}</td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(user.is_active !== false ? 'Active' : 'Inactive')}</td>
                        <td className="px-4 py-3 text-sm">
                          {user.balance_frozen ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-red-600 dark:bg-red-700">Frozen</span>
                          ) : <span className="text-gray-400 dark:text-gray-500">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.balance_frozen_amount != null && user.balance_frozen_amount !== '' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800">
                              ${Number(user.balance_frozen_amount).toFixed(2)}
                            </span>
                          ) : <span className="text-gray-400 dark:text-gray-500">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(user.date_joined)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(user.last_login ?? null)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-nowrap items-center gap-1.5">
                            <button onClick={() => handleOpenOrdersModal(user)} className="flex-shrink-0 px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 font-medium whitespace-nowrap">Orders</button>
                            <button onClick={() => handleOpenLevelModal(user)} className="flex-shrink-0 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium whitespace-nowrap">Level</button>
                            <button onClick={() => handleOpenDebitModal(user)} className="flex-shrink-0 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium whitespace-nowrap">Debit</button>
                            <button onClick={() => handleOpenResetModal(user)} className="flex-shrink-0 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium whitespace-nowrap">Reset</button>
                            <div ref={moreMenuUser?.id === user.id ? moreMenuButtonRef : undefined} onMouseEnter={(e) => openMoreMenu(e, user)} onMouseLeave={scheduleMoreMenuClose} className="relative inline-block">
                              <button type="button" className="flex-shrink-0 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600 font-medium whitespace-nowrap">More</button>
                            </div>
                            {user.is_active === false && (
                              <button onClick={() => handleActivate(user.id)} disabled={actionLoading === user.id} className="flex-shrink-0 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 whitespace-nowrap">
                                {actionLoading === user.id ? '...' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={17} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {moreMenuUser && moreMenuAnchor && (
                <MoreActionsDropdown
                  user={moreMenuUser}
                  anchor={moreMenuAnchor}
                  dropdownRef={moreMenuDropdownRef}
                  onWalletInfo={handleOpenWalletModal}
                  onEdit={handleOpenEditUserModal}
                  onAccountDetails={(user) => { setSelectedUserForAccountDetails(user); setMoreMenuUser(null); }}
                  onMouseEnter={clearMoreMenuCloseTimer}
                  onMouseLeave={scheduleMoreMenuClose}
                />
              )}

              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Previous</button>
                    <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CreateTrainingAccountModal
        isOpen={isModalOpen}
        formData={formData}
        fieldErrors={fieldErrors}
        success={success}
        loading={formLoading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      {selectedUserForAccountDetails && (
        <AccountDetailsModal user={selectedUserForAccountDetails} onClose={() => setSelectedUserForAccountDetails(null)} />
      )}

      {selectedUserForWallet && (
        <WalletModal
          user={selectedUserForWallet}
          formData={walletFormData}
          loading={walletLoading}
          submitLoading={walletSubmitLoading}
          error={walletError}
          onClose={handleCloseWalletModal}
          onChange={handleWalletFormChange}
          onSubmit={handleWalletSubmit}
        />
      )}

      {isLevelModalOpen && selectedUser && (
        <LevelModal
          user={selectedUser}
          levels={levels}
          selectedLevelId={selectedLevelId}
          onSelectLevel={setSelectedLevelId}
          onClose={handleCloseLevelModal}
          onAssign={handleAssignLevel}
          loading={levelAssignLoading}
          error={levelError}
        />
      )}

      {selectedUserForDebit && (
        <DebitModal
          user={selectedUserForDebit}
          formData={debitFormData}
          loading={debitLoading}
          error={debitError}
          onFormChange={handleDebitFormChange}
          onSubmit={handleSubmitDebit}
          onClose={handleCloseDebitModal}
        />
      )}

      {selectedUserForReset && (
        <ResetModal user={selectedUserForReset} loading={resetLoading} error={resetError} onConfirm={handleConfirmReset} onClose={handleCloseResetModal} />
      )}

      <EditUserModal
        isOpen={isEditUserModalOpen}
        formData={editFormData}
        levels={editModalLevels}
        error={editUserError}
        loading={editUserLoading}
        onChange={handleEditFormChange}
        onMatchingRangeChange={(min, max) => setEditFormData((prev) => ({ ...prev, matching_range_min: String(min), matching_range_max: String(max) }))}
        onSubmit={handleSubmitEditUser}
        onClose={handleCloseEditUserModal}
      />
    </div>
  );
}
