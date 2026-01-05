import { useState } from 'react';

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
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    console.log('Add Debit for user:', userId);
  };

  const handleSetupOrders = (userId: number) => {
    console.log('Setup Orders for user:', userId);
  };

  const handleResetQty = (userId: number) => {
    console.log('Reset Qty for user:', userId);
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

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
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
    </div>
  );
}

export default Users;

