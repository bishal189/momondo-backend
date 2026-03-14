import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api, type Transaction as ApiTransaction } from '../services/api';

interface Transaction {
  id: number;
  memberAccount: string;
  memberId: number;
  type: 'Debit' | 'Credit';
  amount: number;
  remarkType: string;
  remark: string;
  status: 'Completed' | 'Pending' | 'Failed';
  createdAt: string;
  transactionId: string;
}

const convertApiTransactionToLocal = (apiTransaction: ApiTransaction): Transaction => {
  const typeMap: Record<string, 'Debit' | 'Credit'> = {
    'DEBIT': 'Debit',
    'CREDIT': 'Credit',
    'DEPOSIT': 'Credit',
    'WITHDRAWAL': 'Debit',
  };

  const statusMap: Record<string, 'Completed' | 'Pending' | 'Failed'> = {
    'COMPLETED': 'Completed',
    'PENDING': 'Pending',
    'FAILED': 'Failed',
  };

  const transactionType = typeMap[apiTransaction.type.toUpperCase()] || 
    (apiTransaction.type.toUpperCase().includes('DEBIT') || apiTransaction.type.toUpperCase().includes('WITHDRAWAL') ? 'Debit' : 'Credit');

  return {
    id: apiTransaction.id,
    memberAccount: `${apiTransaction.member_account_username} (ID: ${apiTransaction.member_account})`,
    memberId: apiTransaction.member_account,
    type: transactionType,
    amount: parseFloat(apiTransaction.amount),
    remarkType: apiTransaction.remark_type,
    remark: apiTransaction.remark,
    status: statusMap[apiTransaction.status.toUpperCase()] || 'Pending',
    createdAt: apiTransaction.created_at,
    transactionId: apiTransaction.transaction_id,
  };
};

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedForApprove, setSelectedForApprove] = useState<Transaction | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<Transaction | null>(null);
  const [modalError, setModalError] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
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

    fetchUserRole();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.getAdminAgentTransactions();

      const convertedTransactions = response.transactions.map(convertApiTransactionToLocal);
      setTransactions(convertedTransactions);
      setTotalCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const canApproveReject = isAdmin || isAgent;

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(
    (transaction) => {
      if (searchTerm) {
        const matchesSearch =
          transaction.memberAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.remark.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      }
      return true;
    }
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedTransactions = filteredTransactions;

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

  const handleApprove = async (transactionId: number) => {
    setModalError('');
    setActionLoading(transactionId);
    try {
      await api.approveTransaction(transactionId);
      toast.success('Transaction approved successfully.');
      setSelectedForApprove(null);
      await fetchTransactions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to approve transaction';
      setModalError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (transactionId: number) => {
    setModalError('');
    setActionLoading(transactionId);
    try {
      await api.rejectTransaction(transactionId);
      toast.success('Transaction rejected.');
      setSelectedForReject(null);
      await fetchTransactions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reject transaction';
      setModalError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const isPending = (t: Transaction) => t.status === 'Pending';
  const approveDisabled = (t: Transaction) => !isPending(t) || actionLoading === t.id;
  const rejectDisabled = (t: Transaction) => !isPending(t) || actionLoading === t.id;

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
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
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                {totalCount} transaction{totalCount !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading transactions...
            </div>
          ) : (
            <>
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
                      {canApproveReject && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      )}
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
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(transaction.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </td>
                      {canApproveReject && (
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedForApprove(transaction); setSelectedForReject(null); setModalError(''); }}
                              disabled={approveDisabled(transaction)}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === transaction.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => { setSelectedForReject(transaction); setSelectedForApprove(null); setModalError(''); }}
                              disabled={rejectDisabled(transaction)}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === transaction.id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canApproveReject ? 10 : 9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} transactions
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

      {selectedForApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Approve Transaction</h2>
                <button onClick={() => { setSelectedForApprove(null); setModalError(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" disabled={actionLoading === selectedForApprove.id}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {modalError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {modalError}
                </div>
              )}
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to approve this transaction?</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Transaction ID: {selectedForApprove.transactionId}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => { setSelectedForApprove(null); setModalError(''); }} disabled={actionLoading === selectedForApprove.id} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button type="button" onClick={() => handleApprove(selectedForApprove.id)} disabled={actionLoading === selectedForApprove.id} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {actionLoading === selectedForApprove.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Approving...
                    </>
                  ) : (
                    'Yes, Approve'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedForReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reject Transaction</h2>
                <button onClick={() => { setSelectedForReject(null); setModalError(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" disabled={actionLoading === selectedForReject.id}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {modalError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {modalError}
                </div>
              )}
              <div className="mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">Are you sure you want to reject this transaction?</p>
                  <p className="mt-2 text-xs text-red-700 dark:text-red-300">Transaction ID: {selectedForReject.transactionId}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => { setSelectedForReject(null); setModalError(''); }} disabled={actionLoading === selectedForReject.id} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button type="button" onClick={() => handleReject(selectedForReject.id)} disabled={actionLoading === selectedForReject.id} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {actionLoading === selectedForReject.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Rejecting...
                    </>
                  ) : (
                    'Yes, Reject'
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

export default Transactions;


