export interface UserLevel {
  id: number;
  level: number;
  level_name: string;
  required_points: number;
  commission_rate: string;
  min_orders: number;
  benefits: string;
  status: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  invitation_code: string;
  role: string;
  level?: UserLevel | null;
  created_by?: number;
  created_by_email?: string;
  created_by_username?: string;
  date_joined: string;
  last_login?: string | null;
  is_active?: boolean;
  is_training_account?: boolean;
  original_account?: number | null;
  original_account_id?: number | null;
  original_account_email?: string | null;
  original_account_username?: string | null;
  balance?: string | null;
  balance_frozen?: boolean;
  balance_frozen_amount?: string | null;
  training_accounts?: User[];
}

export interface CreateTrainingFormData {
  username: string;
  phone_number: string;
  email: string;
  login_password: string;
  confirm_login_password: string;
  original_account_refer_code: string;
  withdraw_password: string;
  confirm_withdraw_password: string;
}

export interface DebitFormData {
  memberAccount: string;
  type: string;
  amount: string;
  remarkType: string;
  remark: string;
}

export interface EditUserFormData {
  username: string;
  email: string;
  level_id: string;
  parent_id: string;
  phone_number: string;
  balance: string;
  today_commission: string;
  freeze_amount: string;
  credibility: string;
  withdrawal_min_amount: string;
  withdrawal_max_amount: string;
  withdrawal_needed_to_complete_order: string;
  matching_range_min: string;
  matching_range_max: string;
  password: string;
  confirm_password: string;
  payment_password: string;
  confirm_payment_password: string;
  allow_rob_order: boolean;
  allow_withdrawal: boolean;
  number_of_draws: string;
  winning_amount: string;
  custom_winning_amount: string;
}

export interface WalletFormData {
  walletName: string;
  walletAddress: string;
  phoneNumber: string;
  currency: string;
  networkType: string;
}
