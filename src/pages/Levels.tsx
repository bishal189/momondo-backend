import { useState } from 'react';

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
}

const mockLevels: Level[] = [
  {
    id: 1,
    levelNumber: 1,
    levelName: 'Bronze',
    requiredPoints: 0,
    commissionRate: 5.0,
    minimumOrders: 0,
    benefits: 'Basic referral rewards',
    status: 'Active',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    levelNumber: 2,
    levelName: 'Silver',
    requiredPoints: 100,
    commissionRate: 7.5,
    minimumOrders: 10,
    benefits: 'Enhanced commission rates',
    status: 'Active',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 3,
    levelNumber: 3,
    levelName: 'Gold',
    requiredPoints: 500,
    commissionRate: 10.0,
    minimumOrders: 50,
    benefits: 'Premium rewards and priority support',
    status: 'Active',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 4,
    levelNumber: 4,
    levelName: 'Platinum',
    requiredPoints: 1000,
    commissionRate: 12.5,
    minimumOrders: 100,
    benefits: 'Exclusive benefits and higher commissions',
    status: 'Active',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 5,
    levelNumber: 5,
    levelName: 'Diamond',
    requiredPoints: 2500,
    commissionRate: 15.0,
    minimumOrders: 250,
    benefits: 'VIP status and maximum rewards',
    status: 'Active',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 6,
    levelNumber: 6,
    levelName: 'Master',
    requiredPoints: 5000,
    commissionRate: 20.0,
    minimumOrders: 500,
    benefits: 'Elite tier with special privileges',
    status: 'Inactive',
    createdAt: '2024-01-15 14:30:00',
  },
];

function Levels() {
  const [levels, setLevels] = useState<Level[]>(mockLevels);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<Partial<Level>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);
  const itemsPerPage = 10;

  const filteredLevels = levels.filter(
    (level) =>
      level.levelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.levelNumber.toString().includes(searchTerm) ||
      level.benefits.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);
  const paginatedLevels = filteredLevels.slice(
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

  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
    setFormData({
      levelNumber: level.levelNumber,
      levelName: level.levelName,
      requiredPoints: level.requiredPoints,
      commissionRate: level.commissionRate,
      minimumOrders: level.minimumOrders,
      benefits: level.benefits,
      status: level.status,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedLevel(null);
    setFormData({});
  };

  const handleSave = () => {
    if (!selectedLevel) return;

    const updatedLevels = levels.map((level) =>
      level.id === selectedLevel.id
        ? {
            ...level,
            ...formData,
          }
        : level
    );

    setLevels(updatedLevels);
    handleCloseModal();
    console.log('Level updated:', { id: selectedLevel.id, ...formData });
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
  };

  const handleConfirmDelete = () => {
    if (!levelToDelete) return;

    const updatedLevels = levels.filter((level) => level.id !== levelToDelete.id);
    setLevels(updatedLevels);
    handleCloseDeleteModal();
    console.log('Level deleted:', levelToDelete);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Levels</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Add New Level
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by level name, number, benefits, or status..."
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
                {filteredLevels.length} level{filteredLevels.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Required Points</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min Orders</th>
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
                            onClick={() => handleDelete(level)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLevels.length)} of {filteredLevels.length} level{filteredLevels.length !== 1 ? 's' : ''}
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

      {isEditModalOpen && selectedLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                      Required Points
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Orders
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
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
                    <p><span className="font-medium">Required Points:</span> {levelToDelete.requiredPoints.toLocaleString()}</p>
                    <p><span className="font-medium">Commission Rate:</span> {levelToDelete.commissionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Level
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Levels;

