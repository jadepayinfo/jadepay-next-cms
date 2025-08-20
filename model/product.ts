import { ApiParamConfig } from "@/model/api_param_config";

export type ImageType = File | string | undefined;

export interface ProductListType {
  page: number;
  count: number;
  data: ProductItemType[];
}

export interface ProductItemType {
  id: string;
  name: string;
  details: string;
  image: string;
  is_unlimited_amount: boolean;
  tag_ids: string[];
  product_type: string;
  fix_code: string | null;
  total_amount: number;
  reserved_amount: number;
  available_amount: number;
  expired_amount: number;
}

export interface ProductInfoType {
  id: string;
  name: string;
  details: string;
  image: string;
  is_unlimited_amount: boolean;
  tag_ids: string[];
  product_type: string;
  fix_code: string | null;
  api_param_config: ApiParamConfig[];
}

export interface StaticVoucherType {
  code: string;
  expired_at: number;
}
