import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api, type Level as ApiLevel } from '../services/api';

interface Level {
  id: number;
  levelNumber: number;
  levelName: string;
  requiredPoints: number;
  commissionRate: number;
  minimumOrders: number;
  benefits: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  frozenCommissionRate?: number | null;
}

const transformApiLevel = (apiLevel: ApiLevel): Level => {
  return {
    id: apiLevel.id,
    levelNumber: apiLevel.level,
    levelName: apiLevel.level_name,
    requiredPoints: apiLevel.required_points,
    commissionRate: parseFloat(apiLevel.commission_rate),
    minimumOrders: apiLevel.min_orders,
    benefits: apiLevel.benefits,
    status: apiLevel.status === 'ACTIVE' ? 'Active' : 'Inactive',
    createdAt: new Date(apiLevel.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6'),
    frozenCommissionRate: apiLevel.frozen_commission_rate ?? null,
  };
};

function Levels() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<Partial<Level>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<Partial<Level>>({
    levelNumber: 1,
    levelName: '',
    requiredPoints: 0,
    commissionRate: 0,
    minimumOrders: 0,
    benefits: '',
    status: 'Active',
    frozenCommissionRate: undefined,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLevels();
  }, [searchTerm, statusFilter]);

  const fetchLevels = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: { status?: 'ACTIVE' | 'INACTIVE'; search?: string } = {};
      if (statusFilter) {
        params.status = statusFilter as 'ACTIVE' | 'INACTIVE';
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.getLevels(params);
      const transformedLevels = response.results.map(transformApiLevel);
      setLevels(transformedLevels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch levels');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(levels.length / itemsPerPage);
  const paginatedLevels = levels.slice(
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

  const getLevelBadge = (levelName: string) => {
    const styles: Record<string, string> = {
      Bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      Silver: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Platinum: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Diamond: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      Master: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[levelName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
        {levelName}
      </span>
    );
  };

  const handleEdit = async (level: Level) => {
    setSelectedLevel(level);
    setEditError('');
    setEditLoading(true);
    setIsEditModalOpen(true);

    try {
      const apiLevel = await api.getLevelDetail(level.id);
      const transformedLevel = transformApiLevel(apiLevel);
      
      setFormData({
        levelNumber: transformedLevel.levelNumber,
        levelName: transformedLevel.levelName,
        requiredPoints: transformedLevel.requiredPoints,
        commissionRate: transformedLevel.commissionRate,
        minimumOrders: transformedLevel.minimumOrders,
        benefits: transformedLevel.benefits,
        status: transformedLevel.status,
        frozenCommissionRate: transformedLevel.frozenCommissionRate,
      });
      setSelectedLevel(transformedLevel);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to fetch level details');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedLevel(null);
    setFormData({});
    setEditError('');
    setUpdateError('');
  };

  const handleSave = async () => {
    if (!selectedLevel) return;

    setUpdateError('');
    setUpdateLoading(true);

    try {
      const levelData = {
        level: formData.levelNumber || selectedLevel.levelNumber,
        level_name: formData.levelName || selectedLevel.levelName,
        required_points: formData.requiredPoints ?? selectedLevel.requiredPoints,
        commission_rate: (formData.commissionRate ?? selectedLevel.commissionRate).toFixed(2),
        min_orders: formData.minimumOrders ?? selectedLevel.minimumOrders,
        benefits: formData.benefits || selectedLevel.benefits,
        status: ((formData.status || selectedLevel.status) === 'Active' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
        frozen_commission_rate: formData.frozenCommissionRate ?? null,
      };

      await api.updateLevel(selectedLevel.id, levelData);
      toast.success('Level updated successfully.');
      handleCloseModal();
      fetchLevels();
    } catch (err: any) {
      const errorMessage = err.errors
        ? Object.entries(err.errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
              return `${key}: ${value}`;
            })
            .join('\n')
        : (err instanceof Error ? err.message : 'Failed to update level');
      setUpdateError(errorMessage);
      toast.error('Failed to update level');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (field: keyof Level, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = (level: Level) => {
    setLevelToDelete(level);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLevelToDelete(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!levelToDelete) return;

    setDeleteError('');
    setDeleteLoading(true);

    try {
      await api.deleteLevel(levelToDelete.id);
      handleCloseDeleteModal();
      fetchLevels();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete level');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddNew = () => {
    setAddFormData({
      levelNumber: levels.length + 1,
      levelName: '',
      requiredPoints: 0,
      commissionRate: 0,
      minimumOrders: 0,
      benefits: '',
      status: 'Active',
      frozenCommissionRate: undefined,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddError('');
    setAddFormData({
      levelNumber: levels.length + 1,
      levelName: '',
      requiredPoints: 0,
      commissionRate: 0,
      minimumOrders: 0,
      benefits: '',
      status: 'Active',
      frozenCommissionRate: undefined,
    });
  };

  const handleSaveNew = async () => {
    setAddError('');
    setAddLoading(true);

    try {
      const levelData = {
        level: addFormData.levelNumber || 1,
        level_name: addFormData.levelName || '',
        required_points: addFormData.requiredPoints || 0,
        commission_rate: (addFormData.commissionRate || 0).toFixed(2),
        min_orders: addFormData.minimumOrders || 0,
        benefits: addFormData.benefits || '',
        status: (addFormData.status === 'Active' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
        frozen_commission_rate: addFormData.frozenCommissionRate ?? null,
      };

      await api.createLevel(levelData);
      handleCloseAddModal();
      fetchLevels();
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
        setAddError(errorMessages);
      } else {
        setAddError(err instanceof Error ? err.message : 'Failed to create level');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddInputChange = (field: keyof Level, value: string | number) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Levels</h1>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Add New Level
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by level name or level number..."
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
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'ACTIVE' | 'INACTIVE' | '');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {levels.length} level{levels.length !== 1 ? 's' : ''} found
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
              <p className="text-gray-600 dark:text-gray-400">Loading levels...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Minimum Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Frozen %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Number of Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Benefits</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedLevels.length > 0 ? (
                    paginatedLevels.map((level) => (
                      <tr key={level.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{level.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">Level {level.levelNumber}</td>
                        <td className="px-4 py-3 text-sm">{getLevelBadge(level.levelName)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-medium">{level.requiredPoints.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">{level.commissionRate}%</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{level.frozenCommissionRate != null ? `${level.frozenCommissionRate}%` : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{level.minimumOrders}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={level.benefits}>
                          {level.benefits}
                        </td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(level.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{level.createdAt}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(level)}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(level)}
                              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No levels found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, levels.length)} of {levels.length} level{levels.length !== 1 ? 's' : ''}
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

      {isEditModalOpen && selectedLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Level - {selectedLevel.levelName}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {editLoading && (
                <div className="mb-4 text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400">Loading level details...</p>
                </div>
              )}

              {editError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              {updateError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                  {updateError}
                </div>
              )}

              {!editLoading && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="space-y-4"
                >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level Number
                    </label>
                    <input
                      type="number"
                      value={formData.levelNumber || ''}
                      onChange={(e) => handleInputChange('levelNumber', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level Name
                    </label>
                    <input
                      type="text"
                      value={formData.levelName || ''}
                      onChange={(e) => handleInputChange('levelName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Balance
                    </label>
                    <input
                      type="number"
                      value={formData.requiredPoints || ''}
                      onChange={(e) => handleInputChange('requiredPoints', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.commissionRate || ''}
                      onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frozen %
                    </label>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Frozen %</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{formData.frozenCommissionRate != null ? `${formData.frozenCommissionRate}%` : '—'}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.frozenCommissionRate ?? 0}
                      onChange={(e) => handleInputChange('frozenCommissionRate', parseInt(e.target.value) || 0)}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Orders
                    </label>
                    <input
                      type="number"
                      value={formData.minimumOrders || ''}
                      onChange={(e) => handleInputChange('minimumOrders', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => handleInputChange('status', e.target.value as 'Active' | 'Inactive')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Benefits
                  </label>
                  <textarea
                    value={formData.benefits || ''}
                    onChange={(e) => handleInputChange('benefits', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && levelToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Level
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleCloseDeleteModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">Level {levelToDelete.levelNumber} - {levelToDelete.levelName}</span>?
                </p>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><span className="font-medium">Level Number:</span> {levelToDelete.levelNumber}</p>
                    <p><span className="font-medium">Level Name:</span> {levelToDelete.levelName}</p>
                    <p><span className="font-medium">Minimum Balance:</span> {levelToDelete.requiredPoints.toLocaleString()}</p>
                    <p><span className="font-medium">Commission Rate:</span> {levelToDelete.commissionRate}%</p>
                  </div>
                </div>
              </div>

              {deleteError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Level'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add New Level
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

              {addError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                  {addError}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveNew();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level Number
                    </label>
                    <input
                      type="number"
                      value={addFormData.levelNumber || ''}
                      onChange={(e) => handleAddInputChange('levelNumber', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level Name
                    </label>
                    <input
                      type="text"
                      value={addFormData.levelName || ''}
                      onChange={(e) => handleAddInputChange('levelName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g., Bronze, Silver, Gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Balance
                    </label>
                    <input
                      type="number"
                      value={addFormData.requiredPoints || ''}
                      onChange={(e) => handleAddInputChange('requiredPoints', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={addFormData.commissionRate || ''}
                      onChange={(e) => handleAddInputChange('commissionRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frozen %
                    </label>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Frozen %</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{addFormData.frozenCommissionRate != null ? `${addFormData.frozenCommissionRate}%` : '—'}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={addFormData.frozenCommissionRate ?? 0}
                      onChange={(e) => handleAddInputChange('frozenCommissionRate', parseInt(e.target.value) || 0)}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Orders
                    </label>
                    <input
                      type="number"
                      value={addFormData.minimumOrders || ''}
                      onChange={(e) => handleAddInputChange('minimumOrders', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={addFormData.status || 'Active'}
                      onChange={(e) => handleAddInputChange('status', e.target.value as 'Active' | 'Inactive')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Benefits
                  </label>
                  <textarea
                    value={addFormData.benefits || ''}
                    onChange={(e) => handleAddInputChange('benefits', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                    placeholder="Describe the benefits for this level..."
                  />
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
                    disabled={addLoading}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addLoading ? 'Creating...' : 'Create Level'}
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

export default Levels;

