import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  superiorId: string;
  phoneNumber: string;
  balance: number;
  availableDailyOrder: number;
  takingOrdersToday: boolean;
  currentOrdersMade: number;
  ordersReceivedToday: number;
  todaysCommission: number;
  credibility: number;
  superiorUser: string;
  invitationCode: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  membershipLevel: string;
  frozenAmount: number;
  robSingle: boolean;
  allowWithdrawal: boolean;
  registrationTime: string;
  lastLoginTime: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    username: 'john_doe',
    superiorId: 'SUP001',
    phoneNumber: '+1234567890',
    balance: 1250.50,
    availableDailyOrder: 10,
    takingOrdersToday: true,
    currentOrdersMade: 5,
    ordersReceivedToday: 3,
    todaysCommission: 45.75,
    credibility: 95,
    superiorUser: 'admin_user',
    invitationCode: 'INV123456',
    status: 'Active',
    membershipLevel: 'Premium',
    frozenAmount: 0,
    robSingle: false,
    allowWithdrawal: true,
    registrationTime: '2024-01-15 10:30:00',
    lastLoginTime: '2024-01-20 14:25:00',
  },
  {
    id: 2,
    username: 'jane_smith',
    superiorId: 'SUP002',
    phoneNumber: '+1234567891',
    balance: 850.25,
    availableDailyOrder: 8,
    takingOrdersToday: false,
    currentOrdersMade: 2,
    ordersReceivedToday: 1,
    todaysCommission: 25.50,
    credibility: 88,
    superiorUser: 'john_doe',
    invitationCode: 'INV123457',
    status: 'Active',
    membershipLevel: 'Basic',
    frozenAmount: 100.00,
    robSingle: true,
    allowWithdrawal: true,
    registrationTime: '2024-01-16 11:15:00',
    lastLoginTime: '2024-01-19 09:10:00',
  },
  {
    id: 3,
    username: 'bob_wilson',
    superiorId: 'SUP003',
    phoneNumber: '+1234567892',
    balance: 2100.75,
    availableDailyOrder: 15,
    takingOrdersToday: true,
    currentOrdersMade: 8,
    ordersReceivedToday: 5,
    todaysCommission: 120.00,
    credibility: 98,
    superiorUser: 'admin_user',
    invitationCode: 'INV123458',
    status: 'Active',
    membershipLevel: 'Premium',
    frozenAmount: 0,
    robSingle: false,
    allowWithdrawal: true,
    registrationTime: '2024-01-10 08:45:00',
    lastLoginTime: '2024-01-20 16:30:00',
  },
];

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<Partial<User>>({
    username: '',
    superiorId: '',
    phoneNumber: '',
    balance: 0,
    availableDailyOrder: 0,
    takingOrdersToday: false,
    currentOrdersMade: 0,
    ordersReceivedToday: 0,
    todaysCommission: 0,
    credibility: 0,
    superiorUser: '',
    invitationCode: '',
    status: 'Active',
    membershipLevel: 'Basic',
    frozenAmount: 0,
    robSingle: false,
    allowWithdrawal: true,
  });
  const [isDebitModalOpen, setIsDebitModalOpen] = useState(false);
  const [selectedUserForDebit, setSelectedUserForDebit] = useState<User | null>(null);
  const [debitFormData, setDebitFormData] = useState({
    memberAccount: '',
    type: '',
    amount: 0.00,
    remarkType: 'Deposit',
    remark: '',
  });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm) ||
      user.invitationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.superiorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddDebit = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUserForDebit(user);
      setDebitFormData({
        memberAccount: `${user.username} (ID: ${user.id})`,
        type: '',
        amount: 0.00,
        remarkType: 'Deposit',
        remark: '',
      });
      setIsDebitModalOpen(true);
    }
  };

  const handleCloseDebitModal = () => {
    setIsDebitModalOpen(false);
    setSelectedUserForDebit(null);
    setDebitFormData({
      memberAccount: '',
      type: '',
      amount: 0.00,
      remarkType: 'Deposit',
      remark: '',
    });
  };

  const handleSubmitDebit = () => {
    if (!selectedUserForDebit) return;

    console.log('Debit/Credit Transaction:', {
      userId: selectedUserForDebit.id,
      username: selectedUserForDebit.username,
      ...debitFormData,
    });

    handleCloseDebitModal();
  };

  const handleSetupOrders = (userId: number) => {
    navigate(`/dashboard/users/${userId}/setup-orders`);
  };

  const handleResetQty = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToReset(user);
      setIsResetModalOpen(true);
    }
  };

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setUserToReset(null);
  };

  const handleConfirmReset = () => {
    if (!userToReset) return;

    const updatedUsers = users.map((user) =>
      user.id === userToReset.id
        ? {
            ...user,
            currentOrdersMade: 0,
            ordersReceivedToday: 0,
            availableDailyOrder: user.availableDailyOrder,
          }
        : user
    );

    setUsers(updatedUsers);
    handleCloseResetModal();
    console.log('Quantity reset for user:', userToReset.username);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      Suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const handleAddNew = () => {
    setAddFormData({
      username: '',
      superiorId: '',
      phoneNumber: '',
      balance: 0,
      availableDailyOrder: 0,
      takingOrdersToday: false,
      currentOrdersMade: 0,
      ordersReceivedToday: 0,
      todaysCommission: 0,
      credibility: 0,
      superiorUser: '',
      invitationCode: '',
      status: 'Active',
      membershipLevel: 'Basic',
      frozenAmount: 0,
      robSingle: false,
      allowWithdrawal: true,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormData({
      username: '',
      superiorId: '',
      phoneNumber: '',
      balance: 0,
      availableDailyOrder: 0,
      takingOrdersToday: false,
      currentOrdersMade: 0,
      ordersReceivedToday: 0,
      todaysCommission: 0,
      credibility: 0,
      superiorUser: '',
      invitationCode: '',
      status: 'Active',
      membershipLevel: 'Basic',
      frozenAmount: 0,
      robSingle: false,
      allowWithdrawal: true,
    });
  };

  const handleSaveNew = () => {
    const newUser: User = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      username: addFormData.username || '',
      superiorId: addFormData.superiorId || '',
      phoneNumber: addFormData.phoneNumber || '',
      balance: addFormData.balance || 0,
      availableDailyOrder: addFormData.availableDailyOrder || 0,
      takingOrdersToday: addFormData.takingOrdersToday || false,
      currentOrdersMade: addFormData.currentOrdersMade || 0,
      ordersReceivedToday: addFormData.ordersReceivedToday || 0,
      todaysCommission: addFormData.todaysCommission || 0,
      credibility: addFormData.credibility || 0,
      superiorUser: addFormData.superiorUser || '',
      invitationCode: addFormData.invitationCode || `INV${Date.now()}`,
      status: addFormData.status || 'Active',
      membershipLevel: addFormData.membershipLevel || 'Basic',
      frozenAmount: addFormData.frozenAmount || 0,
      robSingle: addFormData.robSingle || false,
      allowWithdrawal: addFormData.allowWithdrawal !== undefined ? addFormData.allowWithdrawal : true,
      registrationTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6'),
      lastLoginTime: 'Never',
    };

    setUsers([...users, newUser]);
    handleCloseAddModal();
    console.log('New user created:', newUser);
  };

  const handleAddInputChange = (field: keyof User, value: string | number | boolean) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add New User
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by username, phone, invitation code, or superior ID..."
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Superior ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Daily Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Taking Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Orders Made</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Orders Received</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credibility</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Superior User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invitation Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Frozen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rob Single</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Withdrawal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reg. Time</th>
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
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.superiorId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.phoneNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">${user.balance.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.availableDailyOrder}</td>
                      <td className="px-4 py-3 text-sm">
                        {user.takingOrdersToday ? (
                          <span className="text-green-600 dark:text-green-400">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.currentOrdersMade}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.ordersReceivedToday}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">${user.todaysCommission.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.credibility}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.superiorUser}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{user.invitationCode}</td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.membershipLevel}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">${user.frozenAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        {user.robSingle ? (
                          <span className="text-blue-600 dark:text-blue-400">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.allowWithdrawal ? (
                          <span className="text-green-600 dark:text-green-400">Yes</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.registrationTime}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.lastLoginTime}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddDebit(user.id)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Add Debit"
                          >
                            Debit
                          </button>
                          <button
                            onClick={() => handleSetupOrders(user.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Setup Orders"
                          >
                            Orders
                          </button>
                          <button
                            onClick={() => handleResetQty(user.id)}
                            className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                            title="Reset Qty"
                          >
                            Reset
                          </button>
                          <div className="relative">
                            <button
                              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              title="More Actions"
                            >
                              ⋮
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={21} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add New User
                </h2>
                <button
                  onClick={handleCloseAddModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={addFormData.username || ''}
                        onChange={(e) => handleAddInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={addFormData.phoneNumber || ''}
                        onChange={(e) => handleAddInputChange('phoneNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Superior ID
                      </label>
                      <input
                        type="text"
                        value={addFormData.superiorId || ''}
                        onChange={(e) => handleAddInputChange('superiorId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SUP001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Superior User
                      </label>
                      <input
                        type="text"
                        value={addFormData.superiorUser || ''}
                        onChange={(e) => handleAddInputChange('superiorUser', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="admin_user"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Invitation Code
                      </label>
                      <input
                        type="text"
                        value={addFormData.invitationCode || ''}
                        onChange={(e) => handleAddInputChange('invitationCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Membership Level
                      </label>
                      <select
                        value={addFormData.membershipLevel || 'Basic'}
                        onChange={(e) => handleAddInputChange('membershipLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={addFormData.balance || ''}
                        onChange={(e) => handleAddInputChange('balance', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frozen Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={addFormData.frozenAmount || ''}
                        onChange={(e) => handleAddInputChange('frozenAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Credibility (%)
                      </label>
                      <input
                        type="number"
                        value={addFormData.credibility || ''}
                        onChange={(e) => handleAddInputChange('credibility', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Today's Commission
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={addFormData.todaysCommission || ''}
                        onChange={(e) => handleAddInputChange('todaysCommission', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Available Daily Order
                      </label>
                      <input
                        type="number"
                        value={addFormData.availableDailyOrder || ''}
                        onChange={(e) => handleAddInputChange('availableDailyOrder', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Orders Made
                      </label>
                      <input
                        type="number"
                        value={addFormData.currentOrdersMade || ''}
                        onChange={(e) => handleAddInputChange('currentOrdersMade', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Orders Received Today
                      </label>
                      <input
                        type="number"
                        value={addFormData.ordersReceivedToday || ''}
                        onChange={(e) => handleAddInputChange('ordersReceivedToday', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={addFormData.status || 'Active'}
                        onChange={(e) => handleAddInputChange('status', e.target.value as 'Active' | 'Inactive' | 'Suspended')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addFormData.takingOrdersToday || false}
                          onChange={(e) => handleAddInputChange('takingOrdersToday', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Taking Orders Today</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addFormData.robSingle || false}
                          onChange={(e) => handleAddInputChange('robSingle', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Rob Single</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addFormData.allowWithdrawal !== undefined ? addFormData.allowWithdrawal : true}
                          onChange={(e) => handleAddInputChange('allowWithdrawal', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow Withdrawal</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create User
                  </button>
                </div>
              </form>
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
                  Add Debit/Credit Transaction
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

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitDebit();
                }}
                className="space-y-4"
              >
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setDebitFormData({ ...debitFormData, amount: parseFloat(e.target.value) || 0.00 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Remark Type:
                  </label>
                  <select
                    value={debitFormData.remarkType}
                    onChange={(e) => setDebitFormData({ ...debitFormData, remarkType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Rewards">Rewards</option>
                    <option value="Rebate">Rebate</option>
                    <option value="Activation Fees">Activation Fees</option>
                    <option value="Basic Salary">Basic Salary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remark
                  </label>
                  <textarea
                    value={debitFormData.remark}
                    onChange={(e) => setDebitFormData({ ...debitFormData, remark: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter remark or description..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseDebitModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Submit Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && userToReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Reset Quantity
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This will reset order quantities for this user.
                  </p>
                </div>
                <button
                  onClick={handleCloseResetModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to reset the quantity for <span className="font-semibold text-gray-900 dark:text-white">{userToReset.username}</span>?
                </p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p><span className="font-medium">Current Orders Made:</span> {userToReset.currentOrdersMade}</p>
                    <p><span className="font-medium">Orders Received Today:</span> {userToReset.ordersReceivedToday}</p>
                    <p className="text-yellow-600 dark:text-yellow-400 font-medium mt-2">
                      These values will be reset to 0.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseResetModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Reset Quantity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;

