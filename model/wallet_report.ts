export interface TransactionI {
  data: TransactionItems[] | undefined;
  total_records: number;
}

export type TransactionItems = {
  id: string;
  transaction_from: string;
  transaction_to: string;
  token_id: number;
  amount: number;
  transaction_type: string;
  token_expire_type: string;
  token_expire_duration: string;
  created_at: string;
  deal_id: string;
  title: string;
  convert_type: string;
  description: string;
  channel: string | null;
  channel_id: string | null;
  service: string | null;
  product: string | null;
  platform : string | null;
  qr_code: string | null;
  action_by: string | null;
}
