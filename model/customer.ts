import { KycDocument, KycInfo } from "./kyc";

export interface Customer {
  customer_id: number;
  user_id: number;
  fullname: string;
  email: string;
  mobile_no: string;
  nationality: number;
  nationality_th_desc: string;
  nationality_en_desc: string;
  nationality_mm_desc: string;
  native_name: string; // Assuming string format or you can use Date
  dob: string | null;        // Assuming string format or you can use Date
  gender: string;
  marital: string;
  residential: string;
  occupation: number;
  occupation_th_desc: string;
  occupation_en_desc: string;
  occupation_mm_desc: string;
  other_occupation: string;
  occupation_ict: string;
  visa_type: string;
  income: number;
  income_th_desc: string;
  income_en_desc: string;
  income_mm_desc: string;
  income_ict: string;
  active: boolean;
  kyc_status: string;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  deleted_by: number;
  deleted_at: string | null;
  source: string | null;
  my_reference_code: string | null;
  reference_code: string | null;
  reference_customer_id: number | null;
  reference_fullname: string | null;
  edd_status: string | null;
  edd_approved_by: string | null;
  edd_approved_at: string | null;
}

export interface CustomerInfo {
  kyc_data: {
    kyc_data: KycInfo;
    kyc_documents: KycDocument[];
  };
  customer_data: {
    customer: Customer;
    customer_address: CustomerAddress[];
  };
}

export interface CustomerAddress {
  address_id: number;
  customer_id: number;
  address_type: string;
  zipcode: string;
  state: string;
  city: string;
  sub_district: string;
  address: string;
  company_name: string;
  company_address: string;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
}

export interface CustomerRequest {
  customer: CustomerDataRequest;
  customer_address: CustomerAddressRequest[];
}


export interface CustomerDataRequest {
  customer_id: number;
  user_id: number;
  full_name: string;
  email: string;
  mobile_no: string;
  nationality: number;
  native_name: string;
  dob: string | null;        // Assuming string format or you can use Date
  gender: string;
  marital: string;
  residential: string;
  occupation: number;
  other_occupation: string;
  income: number;
  active: boolean;
  updated_by: number;
}

export interface CustomerAddressRequest {
  address_id: number;
  customer_id: number;
  address_type: string;
  zipcode: string;
  state: string;
  city: string;
  sub_district: string;
  address: string;
  company_name: string;
  company_address: string;
}