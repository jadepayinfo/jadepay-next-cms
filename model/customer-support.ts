export type CustomerStatus = 'รอดำเนินการ' | 'ติดต่อได้' | 'ติดต่อไม่ได้' | 'ดำเนินการแล้ว';

export type CallResult = 'ติดต่อได้' | 'ไม่รับสาย' | 'เครื่องปิด' | 'ไม่สามารถติดต่อได้';

export type DocumentType = 'บัตรประชาชน' | 'ทะเบียนบ้าน' | 'สำเนาบัญชีธนาคาร' | 'อื่นๆ';

export interface CallLog {
  attempt: 1 | 2 | 3;
  calledAt: string;
  result: CallResult;
  note: string;
  followUpBy?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  documentInfo?: string;
  doctypeId?: number;
  position?: string;
}

export interface CustomerSupportFieldInfo {
  name: string;
  email: string;
  mobileNo: string;
  gender: string;
  marital: string;
}

export type CustomerSupportStage =
  | 'Pending'
  | '1st Follow up'
  | '2nd Follow up'
  | 'Submitted to Jadepay'
  | 'Cancelled by Customer';

export const CUSTOMER_SUPPORT_STAGE_OPTIONS: { value: CustomerSupportStage; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: '1st Follow up', label: '1st Follow up' },
  { value: '2nd Follow up', label: '2nd Follow up' },
  { value: 'Submitted to Jadepay', label: 'Submitted to Jadepay' },
  { value: 'Cancelled by Customer', label: 'Cancelled by Customer' },
];

export interface CustomerSupportListItem {
  customer_id: number;
  fullname: string;
  email: string;
  gender: string;
  marital: string;
  mobile_no: string;
  source: string | null;
  created_at: string;
  kyc_status: string;
  support_stage: CustomerSupportStage;
}

export interface CustomerSupportItem {
  id: string;
  fullName: string;
  phone: string;
  documentType: DocumentType;
  createdAt: string;
  status: CustomerStatus;
  callLogs: CallLog[];
  attachments: FileAttachment[];
  note: string;
}
