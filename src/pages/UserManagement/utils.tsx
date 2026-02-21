import type { User } from './types';

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function getStatusBadge(status: string) {
  const styles = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
      {status}
    </span>
  );
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(trimmed);
}

export function flattenUsersResponse(usersList: User[]): User[] {
  return usersList.flatMap((u) => [u, ...(u.training_accounts ?? [])]);
}
