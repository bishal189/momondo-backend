import type { PrimaryWalletDetail, PrimaryWalletPayload } from '../services/api';
import type { WalletFormData } from '../pages/UserManagement/types';

export const WALLET_NETWORK_TYPES = ['TRC20', 'USDT', 'BTC', 'USDC', 'ETH'] as const;

export type WalletNetworkType = (typeof WALLET_NETWORK_TYPES)[number];

const NETWORK_ALIASES: Record<string, WalletNetworkType> = {
  'TRC 20': 'TRC20',
};

export function normalizeNetworkType(value: string | undefined | null): WalletNetworkType {
  if (!value?.trim()) return 'TRC20';
  const trimmed = value.trim();
  const alias = NETWORK_ALIASES[trimmed];
  if (alias) return alias;
  const match = WALLET_NETWORK_TYPES.find((n) => n.toUpperCase() === trimmed.toUpperCase());
  return match ?? 'TRC20';
}

export const defaultWalletFormData = (): WalletFormData => ({
  accountHolderName: '',
  walletName: '',
  walletAddress: '',
  phoneNumber: '',
  networkType: 'TRC20',
});

export function mapPrimaryWalletToForm(
  wallet: PrimaryWalletDetail | null | undefined,
  fallbackPhone = ''
): WalletFormData {
  const rawNetwork = wallet?.crypto_network ?? wallet?.network_type;
  return {
    accountHolderName: wallet?.account_holder_name ?? '',
    walletName: wallet?.crypto_wallet_name ?? wallet?.wallet_name ?? '',
    walletAddress: wallet?.crypto_wallet_address ?? wallet?.wallet_address ?? '',
    phoneNumber: wallet?.user_phone_number ?? wallet?.phone_number ?? fallbackPhone,
    networkType: normalizeNetworkType(rawNetwork),
  };
}

export function mapFormToPrimaryWalletPayload(form: WalletFormData): PrimaryWalletPayload {
  return {
    account_holder_name: form.accountHolderName.trim(),
    wallet_name: form.walletName.trim(),
    wallet_address: form.walletAddress.trim(),
    phone_number: form.phoneNumber.trim(),
    network_type: form.networkType,
  };
}
