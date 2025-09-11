export interface FileCustomerUpoad {
  name: string;
  phone_number: string;
  Passport: string;
  dob: string; // ISO date string
  issue_date: string; // ISO date string
  expire_date: string; // ISO date string
  issue_country: string;
  gender: string;
  status: string;
  email: string;
  selfieImg: string | null;
  passportImg: string | null;
  work_permitImg: string | null;
  work_permitImg_back: string | null;
  pink_card_front: string | null;
  pink_card_back: string | null;
  name_list: string | null;
  work_permit_no: string | null;
  pink_card_no: string | null;
  work_permit_issue_date: string; // ISO date string
  work_permit_exprie_date: string; // ISO date string
  work_permit_issue_country: string;
  company_name: string;
  address: string;
  town: string;
  city: string;
  State: string;
  zip_code: string;
  Remarks: string;
  monthly_income: string;
  Nationality: string;
  occupation: string;
  other_occupation: string;
  resident_type: string;
}



