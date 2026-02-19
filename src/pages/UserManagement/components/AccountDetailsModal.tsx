import { useState } from 'react';
import toast from 'react-hot-toast';
import type { User } from '../types';
import type { AccountDetailsResponse } from '../../../services/api';

interface AccountDetailsModalProps {
  user: User;
  details: AccountDetailsResponse | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}

function parseCredibilityPercent(credibility: string): number {
  const m = credibility.match(/(\d+)/);
  return m ? Math.min(100, Math.max(0, parseInt(m[1], 10))) : 0;
}

function parseProductRange(productRange: string | null | undefined): { min: number; max: number } {
  if (productRange == null || typeof productRange !== 'string') return { min: 0, max: 0 };
  const m = productRange.match(/(\d+)\s*%\s*-\s*(\d+)\s*%/);
  if (!m) return { min: 0, max: 0 };
  const min = Math.max(0, Math.min(100, parseInt(m[1], 10)));
  const max = Math.max(0, Math.min(100, parseInt(m[2], 10)));
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-between text-left"
      >
        <span>{title}</span>
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
      {open && <div className="p-4 bg-white dark:bg-gray-800">{children}</div>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

export function AccountDetailsModal({ user: _user, details, loading, error, onClose }: AccountDetailsModalProps) {
  const handleCopy = () => {
    if (!details) return;
    navigator.clipboard.writeText(details.invitation_code).then(
      () => toast.success('Invitation code copied to clipboard'),
      () => toast.error('Failed to copy')
    );
  };

  const credibilityPercent = details ? parseCredibilityPercent(details.credibility) : 0;
  const productRange = details ? parseProductRange(details.product_range) : { min: 0, max: 0 };
  const productRangeWidth = productRange.max - productRange.min;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {loading && !details && (
            <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              Loading account details…
            </div>
          )}
          {!loading && details && (
            <>
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{details.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{details.invitation_code}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <DetailRow label="ID" value={details.id} />
                <DetailRow label="Username" value={details.username} />
                <DetailRow label="Phone Number" value={details.phone_number} />
                <DetailRow label="Superior ID" value={details.superior_id} />
                <DetailRow label="Superior User" value={details.superior_username} />
                <DetailRow label="Registration Date" value={details.registration_date} />
                <DetailRow label="Last Login" value={details.last_login} />
              </div>

              <CollapsibleSection title="User Account Details" defaultOpen={true}>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{details.balance}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Commission</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{details.commission}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Froze Amount</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{details.froze_amount}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <DetailRow label="Membership" value={details.membership} />
                  <div className="py-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Credibility</span>
                      <span className="font-medium text-gray-900 dark:text-white">{details.credibility}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${credibilityPercent}%` }}
                      />
                    </div>
                  </div>
                  <DetailRow
                    label="Account Status"
                    value={<span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">{details.account_status}</span>}
                  />
                  <DetailRow
                    label="Rob Single"
                    value={<span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">{details.rob_single}</span>}
                  />
                  <DetailRow
                    label="Allow Withdrawal"
                    value={<span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">{details.allow_withdrawal}</span>}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Wallet Information" defaultOpen={true}>
                <div className="space-y-1">
                  <DetailRow label="Wallet Name" value={details.wallet_name ?? '—'} />
                  <DetailRow label="Wallet Phone" value={details.wallet_phone ?? '—'} />
                  <DetailRow label="Wallet Address" value={details.wallet_address ?? '—'} />
                  <DetailRow label="Network Type" value={details.network_type ?? '—'} />
                  <DetailRow label="Currency" value={details.currency ?? '—'} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Journey Information" defaultOpen={true}>
                <div className="space-y-3">
                  <DetailRow label="Current Stage" value={details.current_stage} />
                  <DetailRow label="Available for daily order" value={details.available_for_daily_order} />
                  <DetailRow label="Progress" value={details.progress} />
                  <DetailRow label="Product Range" value={details.product_range ?? '—'} />
                  <div className="py-2">
                    <div className="relative h-8 flex items-center">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gray-200 dark:bg-gray-600" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-blue-500 pointer-events-none"
                        style={{ left: `${productRange.min}%`, width: `${productRangeWidth}%` }}
                      />
                      {productRangeWidth > 0 && (
                        <>
                          <div
                            className="absolute top-0 -translate-y-full mb-1 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-medium"
                            style={{ left: `${productRange.min}%`, transform: 'translate(-50%, -100%)' }}
                          >
                            {productRange.min}%
                          </div>
                          <div
                            className="absolute top-0 -translate-y-full mb-1 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-medium"
                            style={{ left: `${productRange.max}%`, transform: 'translate(-50%, -100%)' }}
                          >
                            {productRange.max}%
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
