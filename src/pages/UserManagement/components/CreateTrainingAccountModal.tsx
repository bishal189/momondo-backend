import type { CreateTrainingFormData } from '../types';

interface CreateTrainingAccountModalProps {
  isOpen: boolean;
  formData: CreateTrainingFormData;
  fieldErrors: Record<string, string[]>;
  success: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CreateTrainingAccountModal({
  isOpen,
  formData,
  fieldErrors,
  success,
  loading,
  onChange,
  onSubmit,
  onClose,
}: CreateTrainingAccountModalProps) {
  if (!isOpen) return null;

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
      fieldErrors[field] ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
    }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Training Account</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {fieldErrors._general && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {fieldErrors._general.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {(['username', 'email', 'phone_number', 'original_account_refer_code', 'login_password', 'confirm_login_password', 'withdraw_password', 'confirm_withdraw_password'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field === 'username' && 'Username *'}
                  {field === 'email' && 'Email *'}
                  {field === 'phone_number' && 'Phone Number *'}
                  {field === 'original_account_refer_code' && 'Original Account Refer Code *'}
                  {field === 'login_password' && 'Login Password *'}
                  {field === 'confirm_login_password' && 'Confirm Login Password *'}
                  {field === 'withdraw_password' && 'Withdraw Password *'}
                  {field === 'confirm_withdraw_password' && 'Confirm Withdraw Password *'}
                </label>
                <input
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : field === 'phone_number' ? 'tel' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={onChange}
                  required
                  className={inputClass(field)}
                  placeholder={
                    field === 'username' ? 'Enter username' :
                    field === 'email' ? 'Enter email' :
                    field === 'phone_number' ? 'Enter phone number' :
                    field === 'original_account_refer_code' ? 'Enter original account refer code' :
                    field === 'login_password' ? 'Enter login password' :
                    field === 'confirm_login_password' ? 'Please confirm your login password' :
                    field === 'withdraw_password' ? 'Enter withdraw password' :
                    'Please confirm your withdraw password'
                  }
                />
                {fieldErrors[field]?.map((err, idx) => (
                  <div key={idx} className="mt-1 text-sm text-red-600 dark:text-red-400">{err}</div>
                ))}
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-2 py-1.5 text-xs bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating...' : 'Create Training Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
