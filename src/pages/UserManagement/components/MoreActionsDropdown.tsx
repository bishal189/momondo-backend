import { createPortal } from 'react-dom';
import type { User } from '../types';

interface MoreActionsDropdownProps {
  user: User;
  anchor: { left: number; top: number };
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onWalletInfo: (user: User) => void;
  onEdit: (user: User) => void;
  onAccountDetails: (user: User) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MoreActionsDropdown({
  user,
  anchor,
  dropdownRef,
  onWalletInfo,
  onEdit,
  onAccountDetails,
  onMouseEnter,
  onMouseLeave,
}: MoreActionsDropdownProps) {
  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1"
      style={{ left: anchor.left, top: anchor.top }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onWalletInfo(user)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <span className="text-gray-400">&gt;</span>
        Wallet Information
      </button>
      <button
        type="button"
        onClick={() => onEdit(user)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <span className="text-gray-400">&gt;</span>
        Edit
      </button>
      <button
        type="button"
        onClick={() => onAccountDetails(user)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <span className="text-gray-400">&gt;</span>
        Account Details
      </button>
    </div>,
    document.body
  );
}
