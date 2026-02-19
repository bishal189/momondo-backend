import { useState } from 'react';
import type { User } from '../types';

interface AccountDetailsModalProps {
  user: User;
  onClose: () => void;
}

// Static data for now – replace with real API data later
const staticAccountDetails = {
  id: 4,
  username: 'Test1',
  phoneNumber: '23412345',
  copyCode: 'I4P0HM',
  superiorId: 3,
  superiorUser: 'itdemo',
  registrationDate: '2026-02-11, 15:41:03',
  lastLogin: '2026-02-11, 15:41:03',
  balance: 1484.71,
  commission: 349.5,
  frozeAmount: 0,
  membership: 'Beginner',
  credibilityPercent: 100,
  accountStatus: 'ACTIVE',
  robSingle: 'ALLOWED',
  allowWithdrawal: 'ALLOWED',
  walletName: 'null',
  walletPhone: 'null',
  walletAddress: 'null',
  networkType: 'null',
  currency: 'null',
  currentStage: 8,
  availableForDailyOrder: 30,
  progressCurrent: 8,
  progressTotal: 30,
  productRangeMin: 30,
  productRangeMax: 70,
  productRangeSliderPercent: 26.67,
  ticketAvailable: '',
};

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

export function AccountDetailsModal({ user: _user, onClose }: AccountDetailsModalProps) {
  const d = staticAccountDetails;

  const handleCopy = () => {
    navigator.clipboard.writeText(d.copyCode);
  };

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
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">prev</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{d.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{d.copyCode}</span>
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
            <DetailRow label="ID" value={d.id} />
            <DetailRow label="Username" value={d.username} />
            <DetailRow label="Phone Number" value={d.phoneNumber} />
            <DetailRow label="Superior ID" value={d.superiorId} />
            <DetailRow label="Superior User" value={d.superiorUser} />
            <DetailRow label="Registration Date" value={d.registrationDate} />
            <DetailRow label="Last Login" value={d.lastLogin} />
          </div>

          <CollapsibleSection title="User Account Details" defaultOpen={true}>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{d.balance}</p>
              </div>
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Commission</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{d.commission}</p>
              </div>
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Froze Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{d.frozeAmount}</p>
              </div>
            </div>
            <div className="space-y-3">
              <DetailRow label="Membership" value={d.membership} />
              <div className="py-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Credibility</span>
                  <span className="font-medium text-gray-900 dark:text-white">{d.credibilityPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${d.credibilityPercent}%` }}
                  />
                </div>
              </div>
              <DetailRow
                label="Account Status"
                value={<span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">{d.accountStatus}</span>}
              />
              <DetailRow
                label="Rob Single"
                value={<span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">{d.robSingle}</span>}
              />
              <DetailRow
                label="Allow Withdrawal"
                value={<span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">{d.allowWithdrawal}</span>}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Wallet Information" defaultOpen={true}>
            <div className="space-y-1">
              <DetailRow label="Wallet Name" value={d.walletName} />
              <DetailRow label="Wallet Phone" value={d.walletPhone} />
              <DetailRow label="Wallet Address" value={d.walletAddress} />
              <DetailRow label="Network Type" value={d.networkType} />
              <DetailRow label="Currency" value={d.currency} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Journey Information" defaultOpen={true}>
            <div className="space-y-3">
              <DetailRow label="Current Stage" value={d.currentStage} />
              <DetailRow label="Available for daily order" value={d.availableForDailyOrder} />
              <DetailRow label="Progress" value={`${d.progressCurrent}/${d.progressTotal}`} />
              <DetailRow label="Product Range" value={`${d.productRangeMin}% - ${d.productRangeMax}%`} />
              <div className="py-2">
                <div className="relative h-8 flex items-center">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gray-200 dark:bg-gray-600" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-blue-500 pointer-events-none"
                    style={{ width: `${d.productRangeSliderPercent}%` }}
                  />
                  <div
                    className="absolute top-0 left-0 -translate-y-full mb-1 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-medium"
                    style={{ left: `${d.productRangeSliderPercent}%`, transform: 'translate(-50%, -100%)' }}
                  >
                    {d.productRangeSliderPercent}%
                  </div>
                </div>
              </div>
              <DetailRow label="Ticket Available" value={d.ticketAvailable || '—'} />
              <button
                type="button"
                className="w-full mt-4 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
