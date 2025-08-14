import { TokenType } from '@/model/token';

export interface DealListType {
  page: number;
  count: number;
  data: DealDetailItemType[];
}

export interface DealDetailItemType {
  id: string;
  price: number;
  start_date: number;
  end_date: number;
  status: string;
  title: string;
  details: string;
  agreement: string;
  remark: string;
  thumbnail_image: string;
  banner_image: string;
  quota: number;
  quota_type: string;
  quantity: number;
  tag_ids: string[];
  wallet_receiver_id: string;
  owner_company_id: string;
  owner_platform_id: string;
  platforms: string[];
  is_required_kyc: boolean;
  is_special: boolean;
  is_show_qrcode: boolean;
  qrcode_timeout: number;
  created_at: string;
  user_id: string | null;
  products: DealProductType[];
  supported_tokens: SupportedTokensType[];
  redeemed_amount: number,
  remain_amount: number
}

export interface DealProductType {
  deal_id: string;
  product_id: string;
  usage_amount: number;
  name: string;
  details: string;
  image: string;
  is_unlimited_amount: boolean;
  tag_ids: string[];
  product_type: string;
  fix_code: string | null;
  total_amount: number;
  used_amount: number;
  available_amount: number;
  expired_amount: number;
}

export interface SupportedTokensType {
  deal_id: string;
  token_id: number;
  symbol: string;
  token_name: string;
}

export interface DealType {
  id: string;
  price: number;
  start_date: number;
  end_date: number;
  status: string;
  title: string;
  details: string;
  agreement: string;
  remark: string;
  thumbnail_image: string;
  banner_image: string;
  quota: number;
  quota_type: string;
  quantity: number;
  tag_ids: string[];
  wallet_receiver_id: string;
  owner_company_id: string;
  owner_platform_id: string;
  platforms: string[];
  is_required_kyc: boolean;
  is_special: boolean;
  is_show_qrcode: boolean;
  qrcode_timeout: number;
  deal_value: number;
  products: ProductDealType[];
  supported_tokens: TokenType[];
  created_at: string;
  user_id: null;
  club_id: null;
}

export type ProductDealType = {
  deal_id: string;
  product_id: string;
  usage_amount: number;
  name: string;
  details: string;
  image: string;
  is_unlimited_amount: boolean;
  tag_ids: string[];
  product_type: string;
  fix_code: string | null;
  total_amount: number;
  used_amount: number;
  available_amount: number;
  expired_amount: number;
};
