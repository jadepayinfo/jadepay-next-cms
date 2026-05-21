import { createContext, useContext, useState, ReactNode } from 'react';
import { CallLog, FileAttachment } from '@/model/customer-support';

interface CustomerRecord {
  callLogs: CallLog[];
  attachments: FileAttachment[];
  note: string;
  updatedStatus: string;
}

interface CustomerSupportContextValue {
  getRecord: (customerId: number) => CustomerRecord;
  addCallLog: (customerId: number, log: CallLog) => void;
  addAttachment: (customerId: number, file: FileAttachment) => void;
  updateStatus: (customerId: number, status: string, note: string) => void;
}

const defaultRecord = (): CustomerRecord => ({
  callLogs: [],
  attachments: [],
  note: '',
  updatedStatus: '',
});

const CustomerSupportContext = createContext<CustomerSupportContextValue | null>(null);

export function CustomerSupportProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Record<number, CustomerRecord>>({});

  const getRecord = (customerId: number): CustomerRecord =>
    records[customerId] ?? defaultRecord();

  const addCallLog = (customerId: number, log: CallLog) => {
    setRecords((prev) => {
      const existing = prev[customerId] ?? defaultRecord();
      return { ...prev, [customerId]: { ...existing, callLogs: [...existing.callLogs, log] } };
    });
  };

  const addAttachment = (customerId: number, file: FileAttachment) => {
    setRecords((prev) => {
      const existing = prev[customerId] ?? defaultRecord();
      return { ...prev, [customerId]: { ...existing, attachments: [...existing.attachments, file] } };
    });
  };

  const updateStatus = (customerId: number, status: string, note: string) => {
    setRecords((prev) => {
      const existing = prev[customerId] ?? defaultRecord();
      return { ...prev, [customerId]: { ...existing, updatedStatus: status, note } };
    });
  };

  return (
    <CustomerSupportContext.Provider value={{ getRecord, addCallLog, addAttachment, updateStatus }}>
      {children}
    </CustomerSupportContext.Provider>
  );
}

export function useCustomerSupport() {
  const ctx = useContext(CustomerSupportContext);
  if (!ctx) throw new Error('useCustomerSupport must be used within CustomerSupportProvider');
  return ctx;
}
