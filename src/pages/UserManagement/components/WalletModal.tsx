import type { User, WalletFormData } from '../types';

interface WalletModalProps {
  user: User;
  formData: WalletFormData;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputBase =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-400/30 dark:focus:border-blue-400 transition-shadow';

export function WalletModal({ user: _user, formData, onClose, onChange, onSubmit }: WalletModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200/80 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Wallet Information
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -m-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Text fields - stacked */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Wallet Name
            </label>
            <input
              type="text"
              name="walletName"
              value={formData.walletName}
              onChange={onChange}
              placeholder="Please enter wallet name"
              className={inputBase}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Wallet Address
            </label>
            <input
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={onChange}
              placeholder="Please enter wallet address"
              className={inputBase}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={onChange}
              placeholder="Please enter phone number"
              className={inputBase}
            />
          </div>

          {/* Currency - pill selection */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</span>
            <div className="flex flex-wrap gap-2">
              {['USDT', 'USDC', 'ETH', 'BTC'].map((c) => (
                <label
                  key={c}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                    formData.currency === c
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={c}
                    checked={formData.currency === c}
                    onChange={onChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Network Type - pill selection */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Network Type</span>
            <div className="flex flex-wrap gap-2">
              {['TRC 20', 'ERC 20', 'BTC'].map((n) => (
                <label
                  key={n}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                    formData.networkType === n
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="networkType"
                    value={n}
                    checked={formData.networkType === n}
                    onChange={onChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{n}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Ok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
