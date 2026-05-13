import { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';
import withAuth from '@/hoc/with_auth';
import { Backend, initHeaderWithServerSide } from '@/lib/axios';
import CallLogForm from '@/components/feature/customer-support/CallLogForm';
import FileAttachmentSection from '@/components/feature/customer-support/FileAttachment';
import { CustomerInfo } from '@/model/customer';
import { CallLog, FileAttachment } from '@/model/customer-support';

dayjs.extend(utc);

interface SupportRecord {
  callLogs: CallLog[];
  attachments: FileAttachment[];
  note: string;
  status: string;
}

interface Props {
  customerInfo: CustomerInfo | null;
  customerId: number;
  initialRecord: SupportRecord | null;
}

const STATUS_OPTIONS = [
  'Pending',
  'wait for review',
  'Operation save',
  'Approved by Jadepay',
  'Processing',
  'KYC completed',
];

const CustomerSupportDetailPage: NextPage<Props> = ({ customerInfo, customerId, initialRecord }) => {
  const [callLogs, setCallLogs] = useState<CallLog[]>(initialRecord?.callLogs ?? []);
  const [attachments, setAttachments] = useState<FileAttachment[]>(initialRecord?.attachments ?? []);
  const [selectedStatus, setSelectedStatus] = useState(initialRecord?.status ?? '');
  const [note, setNote] = useState(initialRecord?.note ?? '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!customerInfo) {
    return (
      <div className="p-4">
        <Link href="/customer-support" className="link link-primary text-sm">
          ← กลับ
        </Link>
        <div className="mt-4 alert alert-error">
          <span>ไม่พบข้อมูลลูกค้า</span>
        </div>
      </div>
    );
  }

  const customer = customerInfo.customer_data.customer;

  const handleAddCallLog = async (log: CallLog) => {
    await axios.post(`/api/customer-support/${customerId}/call-log`, log);
    setCallLogs((prev) => [...prev, log]);
  };

  const handleAddAttachment = async (file: FileAttachment) => {
    await axios.post(`/api/customer-support/${customerId}/attachment`, file);
    setAttachments((prev) => [...prev, file]);
  };

  const handleSave = async () => {
    if (!selectedStatus) return;
    setSaveError('');
    try {
      await axios.put(`/api/customer-support/${customerId}/status`, { status: selectedStatus, note });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const displayStatus = selectedStatus || customer.kyc_status;

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/customer-support" className="link link-primary text-sm">
          ← กลับ
        </Link>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="card-title text-lg">{customer.fullname}</h2>
              <p className="text-sm text-base-content/60">{customer.mobile_no}</p>
            </div>
            <span className="badge badge-md badge-outline">{displayStatus}</span>
          </div>

          <div className="divider my-2" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-base-content/60">Email</span>
              <p className="font-medium">{customer.email || '-'}</p>
            </div>
            <div>
              <span className="text-base-content/60">Source</span>
              <p className="font-medium">{customer.source || '-'}</p>
            </div>
            <div>
              <span className="text-base-content/60">วันที่สมัคร</span>
              <p className="font-medium">{dayjs(customer.created_at).utc().format('DD/MM/YYYY HH:mm')}</p>
            </div>
            <div>
              <span className="text-base-content/60">Customer ID</span>
              <p className="font-medium text-base-content/80">{customer.customer_id}</p>
            </div>
          </div>

          {note && (
            <div className="mt-3 p-3 bg-base-200 rounded-lg text-sm">
              <span className="font-medium">หมายเหตุ: </span>{note}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <CallLogForm
            callLogs={callLogs}
            onAdd={handleAddCallLog}
          />
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <FileAttachmentSection
            attachments={attachments}
            onAdd={handleAddAttachment}
          />
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body space-y-3">
          <h3 className="font-semibold text-base">อัปเดตสถานะ</h3>

          <div className="form-control">
            <label className="label py-0">
              <span className="label-text text-xs">สถานะ</span>
            </label>
            <select
              className="select select-ui w-full max-w-xs"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">-- เลือกสถานะ --</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label py-0">
              <span className="label-text text-xs">หมายเหตุ</span>
            </label>
            <textarea
              className="textarea textarea-bordered textarea-sm w-full"
              rows={3}
              placeholder="บันทึกเพิ่มเติม..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
              disabled={!selectedStatus}
            >
              บันทึก
            </button>
            {saved && (
              <span className="text-sm text-success font-medium">บันทึกเรียบร้อย</span>
            )}
            {saveError && (
              <span className="text-sm text-error">{saveError}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);
  const { id } = ctx.query;
  const defaultProps: Props = { customerInfo: null, customerId: Number(id), initialRecord: null };
  try {
    const [customerRes, supportRes] = await Promise.allSettled([
      Backend.get(`/api/v1/customer/getinfo/${id}`),
      Backend.get(`/api/v1/customer-support/${id}`),
    ]);

    const customerInfo =
      customerRes.status === 'fulfilled' ? (customerRes.value.data?.data as CustomerInfo) ?? null : null;
    const initialRecord =
      supportRes.status === 'fulfilled' ? (supportRes.value.data?.data as SupportRecord) ?? null : null;

    return {
      props: {
        customerInfo,
        customerId: Number(id),
        initialRecord,
      },
    };
  } catch {
    return { props: defaultProps };
  }
};

export default withAuth(CustomerSupportDetailPage);
