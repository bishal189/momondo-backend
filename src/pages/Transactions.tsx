import { useState } from 'react';

interface Transaction {
  id: number;
  memberAccount: string;
  memberId: number;
  type: 'Debit' | 'Credit';
  amount: number;
  remarkType: 'Deposit' | 'Rewards' | 'Rebate' | 'Activation Fees' | 'Basic Salary' | 'Withdrawal' | 'Commission' | 'Other';
  remark: string;
  status: 'Completed' | 'Pending' | 'Failed';
  createdAt: string;
  transactionId: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    memberAccount: 'john_doe (ID: 1)',
    memberId: 1,
    type: 'Credit',
    amount: 500.00,
    remarkType: 'Deposit',
    remark: 'Initial deposit',
    status: 'Completed',
    createdAt: '2024-01-15 10:30:00',
    transactionId: 'TXN001234567',
  },
  {
    id: 2,
    memberAccount: 'jane_smith (ID: 2)',
    memberId: 2,
    type: 'Credit',
    amount: 250.50,
    remarkType: 'Rewards',
    remark: 'Referral bonus',
    status: 'Completed',
    createdAt: '2024-01-15 11:15:00',
    transactionId: 'TXN001234568',
  },
  {
    id: 3,
    memberAccount: 'bob_wilson (ID: 3)',
    memberId: 3,
    type: 'Debit',
    amount: 100.00,
    remarkType: 'Withdrawal',
    remark: 'Withdrawal request',
    status: 'Pending',
    createdAt: '2024-01-15 12:00:00',
    transactionId: 'TXN001234569',
  },
  {
    id: 4,
    memberAccount: 'john_doe (ID: 1)',
    memberId: 1,
    type: 'Credit',
    amount: 45.75,
    remarkType: 'Commission',
    remark: 'Daily commission',
    status: 'Completed',
    createdAt: '2024-01-15 14:20:00',
    transactionId: 'TXN001234570',
  },
  {
    id: 5,
    memberAccount: 'alice_johnson (ID: 4)',
    memberId: 4,
    type: 'Credit',
    amount: 75.00,
    remarkType: 'Rebate',
    remark: 'Order rebate',
    status: 'Completed',
    createdAt: '2024-01-15 15:45:00',
    transactionId: 'TXN001234571',
  },
  {
    id: 6,
    memberAccount: 'jane_smith (ID: 2)',
    memberId: 2,
    type: 'Debit',
    amount: 50.00,
    remarkType: 'Activation Fees',
    remark: 'Account activation',
    status: 'Completed',
    createdAt: '2024-01-16 09:00:00',
    transactionId: 'TXN001234572',
  },
  {
    id: 7,
    memberAccount: 'bob_wilson (ID: 3)',
    memberId: 3,
    type: 'Credit',
    amount: 200.00,
    remarkType: 'Basic Salary',
    remark: 'Monthly salary',
    status: 'Completed',
    createdAt: '2024-01-16 10:30:00',
    transactionId: 'TXN001234573',
  },
  {
    id: 8,
    memberAccount: 'john_doe (ID: 1)',
    memberId: 1,
    type: 'Debit',
    amount: 25.00,
    remarkType: 'Other',
    remark: 'Service fee',
    status: 'Failed',
    createdAt: '2024-01-16 11:15:00',
    transactionId: 'TXN001234574',
  },
];

function Transactions() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'All' | 'Debit' | 'Credit'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'Pending' | 'Failed'>('All');
  const itemsPerPage = 10;

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const matchesSearch =
        transaction.memberAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.remark.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'All' || transaction.type === filterType;
      const matchesStatus = filterStatus === 'All' || transaction.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    }
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      Credit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Debit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles]}`}>
        {type}
      </span>
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'Credit' ? '+' : '-';
    const color = type === 'Credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    return (
      <span className={`font-medium ${color}`}>
        {sign}${amount.toFixed(2)}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by member account, transaction ID, or remark..."
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
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as 'All' | 'Debit' | 'Credit');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Types</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as 'All' | 'Completed' | 'Pending' | 'Failed');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remark Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remark</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{transaction.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{transaction.transactionId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{transaction.memberAccount}</td>
                      <td className="px-4 py-3 text-sm">{getTypeBadge(transaction.type)}</td>
                      <td className="px-4 py-3 text-sm">{formatAmount(transaction.amount, transaction.type)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{transaction.remarkType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={transaction.remark}>
                        {transaction.remark}
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(transaction.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{transaction.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
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

export default Transactions;

