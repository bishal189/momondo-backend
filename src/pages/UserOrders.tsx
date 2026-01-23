import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  completed?: boolean;
}

const transformApiProduct = (apiProduct: {
  id: number;
  image: string | null;
  image_url: string | null;
  title: string;
  description: string;
  price: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}): Product => {
  return {
    id: apiProduct.id,
    title: apiProduct.title,
    description: apiProduct.description,
    image: apiProduct.image_url || '',
    price: apiProduct.price || '0.00',
    status: apiProduct.status === 'ACTIVE' ? 'Active' : 'Inactive',
    createdAt: new Date(apiProduct.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6'),
  };
};

function UserOrders() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [userProductsData, setUserProductsData] = useState<{
    user_id: number;
    username: string;
    min_orders: number;
  } | null>(null);
  const [userProductsLoading, setUserProductsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState<{
    user_id: number;
    username: string;
    completed: number;
    min_orders: number;
  } | null>(null);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [selectedProductForInsert, setSelectedProductForInsert] = useState<Product | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [insertLoading, setInsertLoading] = useState(false);
  const [insertError, setInsertError] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    if (userId) {
      fetchUserProducts();
      fetchProducts();
      fetchCompletedCount();
    }
  }, [userId, searchTerm]);

  useEffect(() => {
    if (!userId) return;

    const pollInterval = setInterval(() => {
      fetchCompletedCount();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [userId]);

  const fetchCompletedCount = async () => {
    if (!userId) return;
    
    try {
      const data = await api.getUserCompletedCount(parseInt(userId));
      setCompletedCount(data);
    } catch (err) {
      console.error('Error fetching completed count:', err);
    }
  };

  const fetchUserProducts = async () => {
    if (!userId) return;
    
    setUserProductsLoading(true);
    try {
      const data = await api.getUserProducts(parseInt(userId));
      setUserProductsData(data);
    } catch (err) {
      console.error('Error fetching user products:', err);
    } finally {
      setUserProductsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params: { status?: 'ACTIVE'; search?: string } = { status: 'ACTIVE' };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await api.getProducts(params);
      const transformedProducts = response.products.map(transformApiProduct);
      setProducts(transformedProducts);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products;

  const minOrders = completedCount?.min_orders || userProductsData?.min_orders || 0;
  const totalBoxes = minOrders > 0 ? minOrders : products.length;
  const completedProducts = completedCount?.completed || 0;
  const progressPercentage = totalBoxes > 0 ? (completedProducts / totalBoxes) * 100 : 0;
  
  const progressBoxes = Array.from({ length: totalBoxes }, (_, index) => index + 1);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInsertClick = (product: Product) => {
    setSelectedProductForInsert(product);
    setSelectedPosition(null);
    setIsInsertModalOpen(true);
  };

  const handleCloseInsertModal = () => {
    setIsInsertModalOpen(false);
    setSelectedProductForInsert(null);
    setSelectedPosition(null);
    setInsertError('');
  };

  const handleInsertAtPosition = async () => {
    if (!userId || !selectedProductForInsert || !selectedPosition) return;
    
    setInsertLoading(true);
    setInsertError('');

    try {
      await api.insertProductAtPosition(selectedProductForInsert.id, selectedPosition);
      handleCloseInsertModal();
      await fetchCompletedCount();
    } catch (err) {
      setInsertError(err instanceof Error ? err.message : 'Failed to insert product at position');
    } finally {
      setInsertLoading(false);
    }
  };

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

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/user-management')}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress
              {(completedCount || userProductsData) && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                  ({(completedCount || userProductsData)?.username})
                </span>
              )}
            </h2>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {completedProducts} / {totalBoxes} completed
            </span>
          </div>
          
          {userProductsLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading progress data...
            </div>
          ) : totalBoxes > 0 ? (
            <div className="w-full flex gap-1 justify-start flex-nowrap overflow-x-auto pb-2">
              {progressBoxes.map((boxNumber) => {
                const isCompleted = boxNumber <= completedProducts;
                const boxWidth = `calc((100% - ${(totalBoxes - 1) * 4}px) / ${totalBoxes})`;
                return (
                  <div
                    key={boxNumber}
                    className="relative group flex-shrink-0"
                    title={`Order ${boxNumber}`}
                    style={{ width: boxWidth, minWidth: '20px' }}
                  >
                    <div
                      className={`w-full h-10 rounded border transition-all duration-300 flex items-center justify-center ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 dark:from-green-600 dark:to-green-700 dark:border-green-700 shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-none">
                          {boxNumber}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded py-0.5 px-1.5 whitespace-nowrap">
                        Order {boxNumber}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                          <div className="border-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No orders required
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Progress: {Math.round(progressPercentage)}%
            </div>
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.id}</td>
                          <td className="px-4 py-3 text-sm">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.title}
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
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{product.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={product.description}>
                            {product.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                            ${parseFloat(product.price || '0').toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">{getStatusBadge(product.status)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{product.createdAt}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleInsertClick(product)}
                              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Insert
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
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

      {isInsertModalOpen && selectedProductForInsert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Insert Product
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

              {insertError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {insertError}
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Product to insert:</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedProductForInsert.image && (
                      <img
                        src={selectedProductForInsert.image}
                        alt={selectedProductForInsert.title}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedProductForInsert.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{selectedProductForInsert.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {totalBoxes > 0 ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Select a position to insert this product (1 to {totalBoxes}):
                    </p>
                    <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      {progressBoxes.map((position) => {
                        const isCompleted = position <= completedProducts;
                        const isSelected = selectedPosition === position;
                        return (
                          <button
                            key={position}
                            onClick={() => setSelectedPosition(position)}
                            disabled={insertLoading}
                            className={`w-full p-3 text-left border rounded-lg transition-colors ${
                              isSelected
                                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                : isCompleted
                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Position {position}:
                                </span>
                                {isCompleted && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {!isSelected && (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6 text-center py-8 text-gray-500 dark:text-gray-400">
                  No positions available
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseInsertModal}
                  disabled={insertLoading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsertAtPosition}
                  disabled={insertLoading || !selectedPosition}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {insertLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserOrders;

