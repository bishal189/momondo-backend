import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const ITEMS_PER_PAGE = 10;
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  completed?: boolean;
  position?: number | null;
  reviewStatus?: string | null;
  inserted_for_user?: boolean;
}

interface AssignedProduct {
  id: number;
  title: string;
  position: number;
  price?: string | number;
}

interface OrderOverview {
  user_id: number;
  username: string;
  current_orders_made: number;
  orders_received_today: number;
  max_orders_by_level: number;
  start_continuous_orders_after: number;
  daily_available_orders: number;
  assigned_products: AssignedProduct[];
}

function transformApiProduct(apiProduct: {
  id: number;
  image: string | null;
  image_url: string | null;
  title: string;
  description: string;
  price: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  position?: number;
  review_status?: string;
  inserted_for_user?: boolean;
}): Product {
  return {
    id: apiProduct.id,
    title: apiProduct.title,
    description: apiProduct.description,
    image: apiProduct.image_url || '',
    price: apiProduct.price || '0.00',
    status: apiProduct.status === 'ACTIVE' ? 'Active' : 'Inactive',
    createdAt: new Date(apiProduct.created_at)
      .toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6'),
    position: apiProduct.position,
    reviewStatus: apiProduct.review_status,
    inserted_for_user: apiProduct.inserted_for_user,
  };
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? ''}`}>{status}</span>
  );
}

function UserOrders() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [orderOverview, setOrderOverview] = useState<OrderOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [startContinuousAfter, setStartContinuousAfter] = useState('0');
  const [pendingAssignedProducts, setPendingAssignedProducts] = useState<AssignedProduct[]>([]);
  const [pendingRemoves, setPendingRemoves] = useState<number[]>([]);
  const [pendingPositionUpdates, setPendingPositionUpdates] = useState<Record<number, number>>({});
  const [overviewUpdateLoading, setOverviewUpdateLoading] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  useEffect(() => {
    const v = orderOverview?.start_continuous_orders_after;
    if (v != null) setStartContinuousAfter(String(v));
  }, [orderOverview?.start_continuous_orders_after]);

  useEffect(() => {
    setPendingPositionUpdates({});
    if (pendingAssignedProducts.length === 0) return;
    const start = parseInt(startContinuousAfter, 10) || 0;
    setPendingAssignedProducts((prev) =>
      prev.map((p, i) => ({ ...p, position: start + 1 + i }))
    );
  }, [startContinuousAfter]);

  useEffect(() => {
    if (userId) fetchOrderOverview();
  }, [userId]);

  useEffect(() => {
    if (userId) fetchProducts();
  }, [userId, searchTerm, priceMin, priceMax, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceMin, priceMax]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => fetchOrderOverview(true), 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchOrderOverview = async (silent = false) => {
    if (!userId) return;
    if (!silent) {
      setOverviewLoading(true);
      setOverviewError('');
    }
    try {
      const data = await api.getUserOrderOverview(parseInt(userId, 10));
      setOrderOverview((prev) => {
        if (!prev) return data as OrderOverview;
        if (
          prev.orders_received_today === data.orders_received_today &&
          prev.current_orders_made === data.current_orders_made &&
          prev.daily_available_orders === data.daily_available_orders &&
          prev.assigned_products?.length === data.assigned_products?.length &&
          (data.assigned_products ?? []).every(
            (p, i) =>
              prev.assigned_products?.[i]?.id === p.id &&
              prev.assigned_products?.[i]?.position === p.position &&
              prev.assigned_products?.[i]?.price === p.price
          )
        ) {
          return prev;
        }
        return data as OrderOverview;
      });
    } catch (err) {
      if (!silent) setOverviewError(err instanceof Error ? err.message : 'Failed to load order overview');
    } finally {
      if (!silent) setOverviewLoading(false);
    }
  };

  const fetchProducts = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const params: { status?: 'ACTIVE'; search?: string; min_price?: string; max_price?: string; limit: number; offset: number; user_id?: number } = {
        status: 'ACTIVE',
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (priceMin.trim() !== '') params.min_price = priceMin.trim();
      if (priceMax.trim() !== '') params.max_price = priceMax.trim();
      if (userId) params.user_id = parseInt(userId, 10);

      const response = await api.getProducts(params);
      setProducts(response.products.map(transformApiProduct));
      setTotalCount(response.count ?? response.products.length);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAddToContinuousOrder = (product: Product) => {
    const assigned = orderOverview?.assigned_products ?? [];
    const start = parseInt(startContinuousAfter, 10) || 0;
    const nextPosition = start + 1 + assigned.length + pendingAssignedProducts.length;
    const maxVal = orderOverview?.max_orders_by_level ?? Infinity;
    if (nextPosition > maxVal) {
      toast.error('Cannot add more: next position would exceed maximum orders by level.');
      return;
    }
    if (pendingAssignedProducts.some((p) => p.id === product.id) || assigned.some((p) => p.id === product.id)) {
      toast.error('Product already in continuous orders.');
      return;
    }
    setPendingAssignedProducts((prev) => [
      ...prev,
      { id: product.id, title: product.title, position: nextPosition, price: product.price },
    ]);
  };

  const handleRemoveFromList = (p: AssignedProduct) => {
    if (pendingAssignedProducts.some((x) => x.id === p.id)) {
      setPendingAssignedProducts((prev) => prev.filter((x) => x.id !== p.id));
    } else {
      setPendingRemoves((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
    }
  };

  const handleReplaceNextOrder = (product: Product) => {
    const start = parseInt(startContinuousAfter, 10) || 0;
    const nextPos = start + 1;
    const maxVal = orderOverview?.max_orders_by_level ?? Infinity;
    if (nextPos > maxVal) {
      toast.error('Next position exceeds maximum orders by level.');
      return;
    }
    const merged = [...assignedFiltered, ...pendingAssignedProducts];
    const withEffectivePos = merged.map((p) => ({ ...p, effectivePosition: pendingPositionUpdates[p.id] ?? p.position }));
    const sortedList = [...withEffectivePos].sort((a, b) => a.effectivePosition - b.effectivePosition);
    const itemAtNext = sortedList.find((p) => p.effectivePosition === nextPos);
    if (!itemAtNext) {
      setPendingAssignedProducts((prev) => {
        const withoutThis = prev.filter((p) => p.id !== product.id);
        return [...withoutThis, { id: product.id, title: product.title, position: nextPos, price: product.price }];
      });
      return;
    }
    const isFromServer = assignedFiltered.some((p) => p.id === itemAtNext.id);
    if (isFromServer) {
      setPendingRemoves((prev) => (prev.includes(itemAtNext.id) ? prev : [...prev, itemAtNext.id]));
    }
    const shifting = sortedList.filter((p) => p.effectivePosition > nextPos);
    setPendingPositionUpdates((prev) => {
      const next: Record<number, number> = { ...prev };
      shifting.forEach((p) => {
        next[p.id] = p.effectivePosition - 1;
      });
      return next;
    });
    const newLastPosition = start + sortedList.length;
    setPendingAssignedProducts((prev) => {
      const removeIds = new Set([product.id]);
      if (!isFromServer) removeIds.add(itemAtNext.id);
      return [
        ...prev.filter((p) => !removeIds.has(p.id)),
        { id: product.id, title: product.title, position: newLastPosition, price: product.price },
      ];
    });
  };

  const handleSaveOk = async () => {
    if (!userId || orderOverview == null) return;
    setOverviewUpdateLoading(true);
    try {
      const num = parseInt(startContinuousAfter, 10);
      const maxVal = orderOverview.max_orders_by_level ?? Infinity;
      if (Number.isNaN(num) || num < 0) {
        toast.error('Enter a valid number (0 or greater).');
        return;
      }
      if (num > maxVal) {
        toast.error('Cannot be greater than Maximum orders received by level (' + maxVal + ').');
        return;
      }
      const assignedFiltered = (orderOverview.assigned_products ?? []).filter((p) => !pendingRemoves.includes(p.id));
      const merged = [...assignedFiltered, ...pendingAssignedProducts]
        .map((p) => ({ ...p, position: pendingPositionUpdates[p.id] ?? p.position }))
        .sort((a, b) => a.position - b.position);
      const assigned_products = merged.map((p) => ({ product_id: p.id, position: p.position }));
      await api.updateUserOrderOverview(parseInt(userId, 10), {
        start_continuous_orders_after: num,
        assigned_products,
      });
      toast.success('Journey has been set');
      setPendingAssignedProducts([]);
      setPendingRemoves([]);
      setPendingPositionUpdates({});
      await fetchOrderOverview(true);
      await fetchProducts(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setOverviewUpdateLoading(false);
    }
  };

  const performReset = async () => {
    if (!userId) return;
    setShowResetConfirmModal(false);
    setOverviewUpdateLoading(true);
    try {
      await api.resetUserContinuousOrders(parseInt(userId, 10));
      setPendingAssignedProducts([]);
      setPendingRemoves([]);
      setPendingPositionUpdates({});
      toast.success('Continuous orders reset.');
      await fetchOrderOverview(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset continuous orders');
    } finally {
      setOverviewUpdateLoading(false);
    }
  };

  const handleReset = () => {
    if (!userId) return;
    setShowResetConfirmModal(true);
  };

  const displayUsername = orderOverview?.username ?? 'User';
  const dailyAvailable = orderOverview?.daily_available_orders ?? 30;
  const todayOrders = orderOverview?.orders_received_today ?? 0;
  const assignedProducts = orderOverview?.assigned_products ?? [];
  const assignedFiltered = useMemo(
    () => assignedProducts.filter((p) => !pendingRemoves.includes(p.id)),
    [assignedProducts, pendingRemoves]
  );
  const sortedAssigned = useMemo(() => {
    const merged = [...assignedFiltered, ...pendingAssignedProducts].map((p) => ({
      ...p,
      position: pendingPositionUpdates[p.id] ?? p.position,
    }));
    return merged.sort((a, b) => a.position - b.position);
  }, [assignedFiltered, pendingAssignedProducts, pendingPositionUpdates]);
  const nextPositions = useMemo(() => {
    const start = parseInt(startContinuousAfter, 10) || 0;
    const maxVal = orderOverview?.max_orders_by_level ?? 30;
    const positions: number[] = [];
    for (let i = 1; i <= Math.min(5, Math.max(0, maxVal - start)); i++) {
      positions.push(start + i);
    }
    return positions;
  }, [startContinuousAfter, orderOverview?.max_orders_by_level]);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  const clampStartInput = (v: string) => {
    setStartContinuousAfter(v);
    const maxVal = orderOverview?.max_orders_by_level;
    if (maxVal != null && v !== '' && !Number.isNaN(Number(v)) && Number(v) > maxVal) {
      setStartContinuousAfter(String(maxVal));
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/user-management')}
              className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to list
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Current user: {displayUsername}</h1>
          </div>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          {overviewLoading && (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">Loading order overview...</div>
          )}
          {overviewError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {overviewError}
            </div>
          )}
          {!overviewLoading && (
            <div className="space-y-5 flex flex-col">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current number of orders made:</label>
                  <input
                    type="number"
                    readOnly
                    value={orderOverview?.current_orders_made ?? 0}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orders received today:</label>
                  <input
                    type="number"
                    readOnly
                    value={orderOverview?.orders_received_today ?? 0}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum orders received by level:</label>
                  <input
                    type="number"
                    readOnly
                    value={orderOverview?.max_orders_by_level ?? 0}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start continuous orders after several orders:</label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min={0}
                      max={orderOverview?.max_orders_by_level ?? undefined}
                      value={startContinuousAfter}
                      onChange={(e) => clampStartInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {nextPositions.length > 0 && (
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Next product positions: {nextPositions.join(', ')}{nextPositions.length >= 5 ? '…' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Products:</label>
                <div className="flex flex-col gap-2">
                  {sortedAssigned.length === 0 ? (
                    <span className="text-sm text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 w-full max-w-xl inline-block">
                      Please select continuous orders in the product list
                    </span>
                  ) : (
                    sortedAssigned.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border border-green-200 dark:border-green-700 w-full max-w-xl"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-medium">({p.position})</span>
                          <span className="text-green-700 dark:text-green-300">
                            {p.price != null && p.price !== ''
                              ? typeof p.price === 'number'
                                ? p.price.toFixed(2)
                                : p.price
                              : '—'}
                          </span>
                          <span>{p.title}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromList(p);
                          }}
                          className="p-0.5 rounded hover:bg-green-200 dark:hover:bg-green-800 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveOk}
                  disabled={overviewUpdateLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {overviewUpdateLoading ? 'Saving...' : 'OK'}
                </button>
                <button
                  type="button"
                  onClick={() => handleReset()}
                  disabled={overviewUpdateLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset continuous orders
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="relative w-full min-h-[128px]">
                  <div className="absolute left-0 right-0 top-[52px] h-0.5 bg-gray-200 dark:bg-gray-600" />
                  {Array.from({ length: Math.max(dailyAvailable, 1) + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-[46px] h-3 flex justify-center -translate-x-1/2"
                      style={{ left: `${(i / Math.max(dailyAvailable, 1)) * 100}%` }}
                    >
                      <div className="w-px h-3 bg-gray-300 dark:bg-gray-500" />
                    </div>
                  ))}
                  <div
                    className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2"
                    style={{
                      left:
                        dailyAvailable > 0
                          ? todayOrders >= dailyAvailable
                            ? '100%'
                            : `${Math.min(98, Math.max(2, (todayOrders / dailyAvailable) * 100))}%`
                          : '10%',
                      top: '52px',
                    }}
                  >
                    <div className="w-1 h-5 bg-red-500 rounded-sm" />
                    <svg className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">({todayOrders})</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Today Orders: {todayOrders}</span>
                  </div>
                  {sortedAssigned.map((p) => {
                    const posPct = dailyAvailable > 0 ? (p.position / dailyAvailable) * 100 : 0;
                    return (
                      <div
                        key={p.id}
                        className="absolute flex flex-col items-center -translate-x-1/2"
                        style={{ left: `${Math.min(98, Math.max(2, posPct))}%`, top: 0 }}
                      >
                        <div className="relative inline-flex items-center justify-center w-7 h-8">
                          <svg
                            className="absolute inset-0 w-full h-full text-green-500 dark:text-green-500 drop-shadow-sm"
                            viewBox="0 0 24 36"
                            fill="currentColor"
                            aria-hidden
                          >
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 12 12 24 12 24s12-12 12-24C24 5.37 18.63 0 12 0z" />
                          </svg>
                          <span className="relative z-10 text-teal-200 dark:text-teal-300 text-xs font-bold select-none" style={{ transform: 'rotate(-45deg)' }}>
                            {p.position}
                          </span>
                        </div>
                        <div className="w-0.5 h-3 bg-green-500 -mt-0.5 rounded-full" />
                      </div>
                    );
                  })}
                  <div className="absolute right-0 bottom-0 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Daily Available Orders: {dailyAvailable}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalCount} product{totalCount !== 1 ? 's' : ''} found
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by price:</span>
              <div className="flex items-center gap-2">
                <label htmlFor="user-orders-price-min" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Min
                </label>
                <input
                  id="user-orders-price-min"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => {
                    setPriceMin(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-400 dark:text-gray-500">–</span>
              <div className="flex items-center gap-2">
                <label htmlFor="user-orders-price-max" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Max
                </label>
                <input
                  id="user-orders-price-max"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="999"
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
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
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
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
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddToContinuousOrder(product)}
                                disabled={sortedAssigned.some((p) => p.id === product.id)}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                              >
                                Add to Continuous Order
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReplaceNextOrder(product)}
                                className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium"
                              >
                                Replace Next Order
                              </button>
                            </div>
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
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} product
                    {totalCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmation</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to reset this user journey!</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performReset}
                disabled={overviewUpdateLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserOrders;
