import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  completed: boolean;
  order: number;
}

const mockItems: OrderItem[] = [
  { id: 1, name: 'Item 1', description: 'First order item', price: 10.00, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop', completed: true, order: 1 },
  { id: 2, name: 'Item 2', description: 'Second order item', price: 15.50, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop', completed: true, order: 2 },
  { id: 3, name: 'Item 3', description: 'Third order item', price: 20.00, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop', completed: false, order: 3 },
  { id: 4, name: 'Item 4', description: 'Fourth order item', price: 25.75, image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop', completed: false, order: 4 },
  { id: 5, name: 'Item 5', description: 'Fifth order item', price: 30.00, image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop', completed: false, order: 5 },
  { id: 6, name: 'Item 6', description: 'Sixth order item', price: 35.25, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop', completed: false, order: 6 },
  { id: 7, name: 'Item 7', description: 'Seventh order item', price: 40.50, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop', completed: false, order: 7 },
  { id: 8, name: 'Item 8', description: 'Eighth order item', price: 45.00, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop', completed: false, order: 8 },
  { id: 9, name: 'Item 9', description: 'Ninth order item', price: 50.75, image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop', completed: false, order: 9 },
  { id: 10, name: 'Item 10', description: 'Tenth order item', price: 55.00, image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop', completed: false, order: 10 },
  { id: 11, name: 'Item 10', description: 'Tenth order item', price: 55.00, image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop', completed: false, order: 10 },
];

interface UserDetails {
  id: number;
  username: string;
  phoneNumber: string;
  balance: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  membershipLevel: string;
}

function SetupOrders() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<OrderItem[]>(mockItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [selectedItemForInsert, setSelectedItemForInsert] = useState<OrderItem | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (userId) {
      const userDataMap: Record<number, UserDetails> = {
        1: {
          id: 1,
          username: 'john_doe',
          phoneNumber: '+1234567890',
          balance: 1250.50,
          status: 'Active',
          membershipLevel: 'Premium',
        },
        2: {
          id: 2,
          username: 'jane_smith',
          phoneNumber: '+1234567891',
          balance: 850.25,
          status: 'Active',
          membershipLevel: 'Basic',
        },
        3: {
          id: 3,
          username: 'bob_wilson',
          phoneNumber: '+1234567892',
          balance: 2100.75,
          status: 'Active',
          membershipLevel: 'Premium',
        },
        4: {
          id: 4,
          username: 'alice_johnson',
          phoneNumber: '+1234567893',
          balance: 500.00,
          status: 'Active',
          membershipLevel: 'Basic',
        },
      };
      const userData = userDataMap[parseInt(userId)] || {
        id: parseInt(userId),
        username: `User ${userId}`,
        phoneNumber: 'N/A',
        balance: 0,
        status: 'Active' as const,
        membershipLevel: 'Basic',
      };
      setUserDetails(userData);
    }
  }, [userId]);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = filteredItems.filter((item) => item.completed).length;
  const totalItems = filteredItems.length;
  const progressPercentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInsert = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setSelectedItemForInsert(item);
      setIsInsertModalOpen(true);
    }
  };

  const handleCloseInsertModal = () => {
    setIsInsertModalOpen(false);
    setSelectedItemForInsert(null);
  };

  const handleConfirmInsert = (position: number) => {
    if (!selectedItemForInsert) return;

    const currentPosition = items.findIndex((item) => item.id === selectedItemForInsert.id);
    
    if (currentPosition === -1) return;

    // Create a new array with the item moved to the selected position
    const newItems = [...items];
    const [movedItem] = newItems.splice(currentPosition, 1);
    movedItem.completed = true;
    newItems.splice(position - 1, 0, movedItem);

    // Update order numbers
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setItems(updatedItems);
    handleCloseInsertModal();
    console.log('Inserted item:', selectedItemForInsert.id, 'at position:', position);
  };

  const getStatusBadge = (completed: boolean) => {
    if (completed) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Completed
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        Pending
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <button
          onClick={() => navigate('/dashboard/users')}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Setup Orders</h1>
        </div>

        {userDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    {userDetails.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userDetails.username}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {userDetails.id}</p>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userDetails.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">${userDetails.balance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    userDetails.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : userDetails.status === 'Suspended'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {userDetails.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Membership</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userDetails.membershipLevel}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedCount} / {totalItems} items completed
              </span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
              {totalItems > 0 && (
                <>
                  {/* Progress fill for completed segments */}
                  <div className="absolute inset-0 flex">
                    {filteredItems.map((item, index) => {
                      const segmentWidth = 100 / totalItems;
                      const segmentStart = (index / totalItems) * 100;
                      const isCompleted = item.completed;
                      
                      return (
                        <div
                          key={`fill-${item.id}`}
                          className="absolute top-0 bottom-0"
                          style={{
                            left: `${segmentStart}%`,
                            width: `${segmentWidth}%`,
                          }}
                        >
                          {isCompleted && (
                            <div
                              className="bg-blue-600 h-full transition-all duration-300"
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Vertical lines marking segment boundaries */}
                  <div className="absolute inset-0 flex">
                    {filteredItems.map((item, index) => {
                      const boundaryPosition = ((index + 1) / totalItems) * 100;
                      const isCompleted = item.completed;
                      
                      // Show line at the end of each segment (except the last one which is handled separately)
                      if (index < totalItems - 1) {
                        return (
                          <div
                            key={`line-${item.id}`}
                            className={`absolute top-0 bottom-0 w-0.5 ${
                              isCompleted 
                                ? 'bg-green-500 dark:bg-green-400' 
                                : 'bg-gray-400 dark:bg-gray-500'
                            }`}
                            style={{ 
                              left: `${boundaryPosition}%`,
                              transform: 'translateX(-50%)',
                            }}
                            title={`Item ${item.order}: ${item.name} - ${isCompleted ? 'Completed' : 'Pending'}`}
                          ></div>
                        );
                      }
                      return null;
                    })}
                    {/* Final boundary line at the end */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 right-0 bg-gray-400 dark:bg-gray-500"
                      title="End"
                    ></div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-2 flex justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {progressPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {totalItems} items total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by item name or description..."
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
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${item.completed ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-medium">#{item.order}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={item.description}>
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(item.completed)}</td>
                      <td className="px-4 py-3 text-sm">
                        {!item.completed ? (
                          <button
                            onClick={() => handleInsert(item.id)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Insert"
                          >
                            Insert
                          </button>
                        ) : (
                          <span className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded cursor-not-allowed">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                            } transition-colors`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return (
                          <span key={pageNum} className="px-2 py-2 text-gray-500 dark:text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isInsertModalOpen && selectedItemForInsert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Insert Item
                </h2>
                <button
                  onClick={handleCloseInsertModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Item to insert:</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedItemForInsert.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedItemForInsert.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Position to Insert:
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleConfirmInsert(index + 1)}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        item.completed
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Position {index + 1}:
                          </span>
                          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          {item.completed && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => handleConfirmInsert(items.length + 1)}
                    className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Position {items.length + 1}:
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          (End of list)
                        </span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseInsertModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SetupOrders;

