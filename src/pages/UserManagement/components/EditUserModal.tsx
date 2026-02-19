import { useState, useRef } from 'react';
import type { EditUserFormData } from '../types';
import type { Level } from '../../../services/api';

const labelWidth = 'w-[220px] shrink-0';
const inputBase =
  'flex-1 min-w-0 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow appearance-none';

const RequiredStar = () => <span className="text-red-500 ml-0.5">*</span>;

interface EditUserModalProps {
  isOpen: boolean;
  formData: EditUserFormData;
  levels: Level[];
  error: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onMatchingRangeChange: (min: number, max: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <label className={`${labelWidth} text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center`}>
        {label}
        {required && <RequiredStar />}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function EditUserModal({
  isOpen,
  formData,
  levels,
  error,
  loading,
  onChange,
  onMatchingRangeChange,
  onSubmit,
  onClose,
}: EditUserModalProps) {
  const [rangeActiveSide, setRangeActiveSide] = useState<'min' | 'max' | null>(null);
  const rangeTrackRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const parseRange = (s: string, fallback: number) => {
    if (s === '' || s === undefined) return fallback;
    const n = Number(s);
    return Number.isNaN(n) ? fallback : Math.min(100, Math.max(0, n));
  };
  const minVal = parseRange(formData.matching_range_min, 30);
  const maxVal = parseRange(formData.matching_range_max, 70);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(100, Math.max(0, Number((e.target as HTMLInputElement).value) || 0));
    onMatchingRangeChange(Math.min(v, maxVal), maxVal);
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(100, Math.max(0, Number((e.target as HTMLInputElement).value) || 0));
    onMatchingRangeChange(minVal, Math.max(v, minVal));
  };
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseRange(e.target.value, 0);
    onMatchingRangeChange(v, Math.max(v, maxVal));
  };
  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseRange(e.target.value, 100);
    onMatchingRangeChange(Math.min(v, minVal), v);
  };

  const handleRangeTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = rangeTrackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setRangeActiveSide(percent < (minVal + maxVal) / 2 ? 'min' : 'max');
  };
  const handleRangeTrackMouseLeave = () => setRangeActiveSide(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update User</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 -m-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="px-6 py-4 overflow-y-auto">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-0">
              <FieldRow label="Username" required>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={onChange}
                  required
                  className={inputBase}
                  placeholder="Username"
                />
              </FieldRow>
              <FieldRow label="Level" required>
                <select
                  name="level_id"
                  value={formData.level_id}
                  onChange={onChange}
                  required
                  className={inputBase}
                >
                  <option value="">Select level</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.level_name}
                    </option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Parent ID" required>
                <input
                  type="number"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={onChange}
                  required
                  className={inputBase}
                  placeholder="Parent ID"
                />
              </FieldRow>
              <FieldRow label="Phone Number" required>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={onChange}
                  required
                  className={inputBase}
                  placeholder="Phone number"
                />
              </FieldRow>
              <FieldRow label="Email">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Email"
                />
              </FieldRow>
              <FieldRow label="Balance">
                <input
                  type="number"
                  step="0.01"
                  name="balance"
                  value={formData.balance}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="0.00"
                />
              </FieldRow>
              <FieldRow label="Today Commission">
                <input
                  type="number"
                  step="0.01"
                  name="today_commission"
                  value={formData.today_commission}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="0.00"
                />
              </FieldRow>
              <FieldRow label="Freeze amount">
                <input
                  type="number"
                  step="0.01"
                  name="freeze_amount"
                  value={formData.freeze_amount}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="0.00"
                />
              </FieldRow>
              <FieldRow label="Credibility" required>
                <input
                  type="number"
                  name="credibility"
                  value={formData.credibility}
                  onChange={onChange}
                  required
                  className={inputBase}
                  placeholder="100"
                />
              </FieldRow>
              <FieldRow label="Withdrawal minimum amount">
                <input
                  type="number"
                  step="0.01"
                  name="withdrawal_min_amount"
                  value={formData.withdrawal_min_amount}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="0.00"
                />
              </FieldRow>
              <FieldRow label="Withdrawal maximum amount">
                <input
                  type="number"
                  step="0.01"
                  name="withdrawal_max_amount"
                  value={formData.withdrawal_max_amount}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Please enter withdrawal maximum amount"
                />
              </FieldRow>
              <FieldRow label="Withdrawal needed to complete order">
                <input
                  type="number"
                  step="0.01"
                  name="withdrawal_needed_to_complete_order"
                  value={formData.withdrawal_needed_to_complete_order}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Please enter withdrawal needed to complete order"
                />
              </FieldRow>

              {/* Matching range - dual slider with scale and 0/100 labels */}
              <div className="flex items-center gap-4 py-2.5">
                <div className={`${labelWidth} text-sm font-medium text-gray-700 dark:text-gray-300`}>
                  Matching range
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Track: grey | blue (selected) | grey — mouse position sets which thumb receives clicks */}
                  <div
                    ref={rangeTrackRef}
                    onMouseMove={handleRangeTrackMouseMove}
                    onMouseLeave={handleRangeTrackMouseLeave}
                    className="relative h-10 flex flex-col justify-center"
                  >
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-gray-200 dark:bg-gray-500" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-blue-600 pointer-events-none"
                      style={{ left: `${minVal}%`, width: `${Math.max(0, maxVal - minVal)}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxVal > 0 ? maxVal : 100}
                      value={minVal}
                      onChange={handleMinChange}
                      className={`absolute h-5 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-200 ${rangeActiveSide === 'max' ? 'z-0' : 'z-20'}`}
                      style={{ left: 0, width: maxVal === 0 ? '100%' : `${maxVal}%` }}
                    />
                    <input
                      type="range"
                      min={minVal < 100 ? minVal : 0}
                      max={100}
                      value={maxVal}
                      onChange={handleMaxChange}
                      className={`absolute h-5 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)] [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-200 ${rangeActiveSide === 'max' ? 'z-20' : 'z-10'}`}
                      style={{ left: minVal === 100 ? '0%' : `${minVal}%`, width: minVal === 100 ? '100%' : `${100 - minVal}%` }}
                    />
                  </div>
                  {/* Scale: tick marks + 0 and 100 labels */}
                  <div className="relative flex items-end justify-between pt-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">0</span>
                    <div className="absolute left-0 right-0 top-0 flex justify-between pointer-events-none px-0.5">
                      {Array.from({ length: 11 }, (_, i) => (
                        <span key={i} className="w-px h-1.5 bg-gray-300 dark:bg-gray-500 rounded-full shrink-0" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">100</span>
                  </div>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {minVal}% – {maxVal}%
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Min %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.matching_range_min}
                        onChange={handleMinInputChange}
                        className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <span className="text-gray-400 text-xs">–</span>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Max %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.matching_range_max}
                        onChange={handleMaxInputChange}
                        className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <FieldRow label="Password">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Please enter password"
                  autoComplete="new-password"
                />
              </FieldRow>
              <FieldRow label="Payment password">
                <input
                  type="password"
                  name="payment_password"
                  value={formData.payment_password}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Please enter payment password"
                  autoComplete="new-password"
                />
              </FieldRow>
              <FieldRow label="Confirm Password">
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              </FieldRow>
              <FieldRow label="Confirm Payment password">
                <input
                  type="password"
                  name="confirm_payment_password"
                  value={formData.confirm_payment_password}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Confirm payment password"
                  autoComplete="new-password"
                />
              </FieldRow>

              {/* Toggle: Whether to allow rob order */}
              <div className="flex items-center gap-4 py-2.5">
                <span className={`${labelWidth} text-sm font-medium text-gray-700 dark:text-gray-300`}>
                  Whether to allow rob order
                </span>
                <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="allow_rob_order"
                    checked={formData.allow_rob_order}
                    onChange={onChange}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-blue-500 transition-colors" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>

              {/* Toggle: Whether to allow withdrawal */}
              <div className="flex items-center gap-4 py-2.5">
                <span className={`${labelWidth} text-sm font-medium text-gray-700 dark:text-gray-300`}>
                  Whether to allow withdrawal
                </span>
                <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="allow_withdrawal"
                    checked={formData.allow_withdrawal}
                    onChange={onChange}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-blue-500 transition-colors" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>

              <FieldRow label="Number of draws">
                <input
                  type="number"
                  min={0}
                  name="number_of_draws"
                  value={formData.number_of_draws}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="0"
                />
              </FieldRow>
              <FieldRow label="Winning amount">
                <input
                  type="number"
                  step="0.01"
                  name="winning_amount"
                  value={formData.winning_amount}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="0.00"
                />
              </FieldRow>
              <FieldRow label="Custom winning amount">
                <input
                  type="text"
                  name="custom_winning_amount"
                  value={formData.custom_winning_amount}
                  onChange={onChange}
                  className={inputBase}
                  placeholder="Custom amount"
                />
              </FieldRow>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
