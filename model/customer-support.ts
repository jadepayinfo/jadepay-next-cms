export type CustomerStatus = 'รอดำเนินการ' | 'ติดต่อได้' | 'ติดต่อไม่ได้' | 'ดำเนินการแล้ว';

export type CallResult = 'ติดต่อได้' | 'ไม่รับสาย' | 'เครื่องปิด' | 'ไม่สามารถติดต่อได้';

export type DocumentType = 'บัตรประชาชน' | 'ทะเบียนบ้าน' | 'สำเนาบัญชีธนาคาร' | 'อื่นๆ';

export interface CallLog {
  attempt: 1 | 2 | 3;
  calledAt: string;
  result: CallResult;
  note: string;
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
