import { useState } from 'react';

interface LoginActivity {
  id: number;
  user: string;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  loginTime: string;
}

const mockActivities: LoginActivity[] = [
  {
    id: 1,
    user: 'john_doe',
    ipAddress: '192.168.1.100',
    browser: 'Chrome 120.0',
    operatingSystem: 'Windows 11',
    deviceType: 'Desktop',
    loginTime: '2024-01-20 14:25:30',
  },
  {
    id: 2,
    user: 'jane_smith',
    ipAddress: '192.168.1.101',
    browser: 'Firefox 121.0',
    operatingSystem: 'macOS 14.2',
    deviceType: 'Desktop',
    loginTime: '2024-01-20 13:15:45',
  },
  {
    id: 3,
    user: 'bob_wilson',
    ipAddress: '192.168.1.102',
    browser: 'Safari 17.2',
    operatingSystem: 'iOS 17.2',
    deviceType: 'Mobile',
    loginTime: '2024-01-20 12:30:20',
  },
  {
    id: 4,
    user: 'alice_brown',
    ipAddress: '192.168.1.103',
    browser: 'Chrome 120.0',
    operatingSystem: 'Android 14',
    deviceType: 'Mobile',
    loginTime: '2024-01-20 11:45:10',
  },
  {
    id: 5,
    user: 'charlie_davis',
    ipAddress: '192.168.1.104',
    browser: 'Edge 120.0',
    operatingSystem: 'Windows 10',
    deviceType: 'Desktop',
    loginTime: '2024-01-20 10:20:55',
  },
  {
    id: 6,
    user: 'diana_miller',
    ipAddress: '192.168.1.105',
    browser: 'Chrome 120.0',
    operatingSystem: 'Linux Ubuntu 22.04',
    deviceType: 'Desktop',
    loginTime: '2024-01-20 09:15:30',
  },
  {
    id: 7,
    user: 'john_doe',
    ipAddress: '192.168.1.100',
    browser: 'Chrome Mobile 120.0',
    operatingSystem: 'Android 13',
    deviceType: 'Mobile',
    loginTime: '2024-01-19 18:45:20',
  },
  {
    id: 8,
    user: 'jane_smith',
    ipAddress: '192.168.1.101',
    browser: 'Safari 17.1',
    operatingSystem: 'macOS 14.1',
    deviceType: 'Desktop',
    loginTime: '2024-01-19 16:30:15',
  },
];

function LoginActivities() {
  const [activities, setActivities] = useState<LoginActivity[]>(mockActivities);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredActivities = activities.filter(
    (activity) =>
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ipAddress.includes(searchTerm) ||
      activity.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.operatingSystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.deviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDeviceTypeBadge = (deviceType: string) => {
    const styles = {
      Desktop: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Mobile: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Tablet: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[deviceType as keyof typeof styles] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
        {deviceType}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Login Activities</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by user, IP address, browser, OS, or device type..."
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
                {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'} found
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Operating System</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Login Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedActivities.length > 0 ? (
                  paginatedActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{activity.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{activity.user}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{activity.ipAddress}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{activity.browser}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{activity.operatingSystem}</td>
                      <td className="px-4 py-3 text-sm">{getDeviceTypeBadge(activity.deviceType)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{activity.loginTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No login activities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'}
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

export default LoginActivities;

