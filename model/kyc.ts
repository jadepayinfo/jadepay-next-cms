export interface KycRequest {
  person_info: KycPersonInfo; 
  address_info: KycAddressInfo;
  step: string;
}

export interface KycPersonInfo {
  nationality: string;
  document_type: string;
  document_id: string;
  expire_date: string | null; // time.Time -> string | null
  first_name: string;
  middle_name: string;
  last_name: string;
  native_name: string;
  dob: string | null; // time.Time -> string | null
  email: string;
  gender: string;
  marital: string;
  residential: string;
  occupation: number;
  income: number;
}

export interface KycAddress {
  postcode: string;
  address_state: string;
  address_city: string;
  address_sub_district: string;
  address_input: string;
  name: string;
}

export interface KycAddressInfo {
  contact_address: KycAddress;
  work_address: KycAddress;
}


export interface KycInfo {
  kyc_id: number;
  user_id: number;
  kyc_status: string;
  step: string;
  tnc_status: number[];
  active: boolean;
  operation_approve_by: number;
  operation_approve_at: string;
  ict_approve_at: string;
  kyc_level: string;
  kyc_score: number;
  kyc_risk_status: string;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
}

export interface KycDocument {
  kyc_doc_id: number;
  kyc_id: number;
  user_id: number;
  doc_type: string;
  position: string;
  doc_id_no: string;
  url: string;
  document_no :string | null;
  document_info:string | null;
  issued_date: string | null;
  expired_date: string | null;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  active: boolean;
  rotationAngle: number| null| undefined;
}