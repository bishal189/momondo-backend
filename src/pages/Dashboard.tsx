function Dashboard() {
  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">1,234</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">567</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$12,345</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">+12%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Welcome to Monodo Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is your dashboard. You can navigate through the sidebar to access different sections.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

