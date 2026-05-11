import { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import withAuth from '@/hoc/with_auth';
import { Backend, initHeaderWithServerSide } from '@/lib/axios';
import { useCustomerSupport } from '@/context/customer_support_context';
import CallLogForm from '@/components/feature/customer-support/CallLogForm';
import FileAttachmentSection from '@/components/feature/customer-support/FileAttachment';
import { CustomerInfo } from '@/model/customer';
import { FileAttachment } from '@/model/customer-support';

dayjs.extend(utc);

interface Props {
  customerInfo: CustomerInfo | null;
  customerId: number;
}

const STATUS_OPTIONS = [
  'Pending',
  'wait for review',
  'Operation save',
  'Approved by Jadepay',
  'Processing',
  'KYC completed',
];

const CustomerSupportDetailPage: NextPage<Props> = ({ customerInfo, customerId }) => {
  const { getRecord, addCallLog, addAttachment, updateStatus } = useCustomerSupport();
  const record = getRecord(customerId);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    if (!selectedStatus) return;
    updateStatus(customerId, selectedStatus, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddAttachment = (file: FileAttachment) => {
    addAttachment(customerId, file);
  };

  const displayStatus = record.updatedStatus || customer.kyc_status;

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

          {record.note && (
            <div className="mt-3 p-3 bg-base-200 rounded-lg text-sm">
              <span className="font-medium">หมายเหตุ: </span>{record.note}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <CallLogForm
            callLogs={record.callLogs}
            onAdd={(log) => addCallLog(customerId, log)}
          />
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <FileAttachmentSection
            attachments={record.attachments}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);
  const { id } = ctx.query;
  const defaultProps: Props = { customerInfo: null, customerId: Number(id) };
  try {
    const res = await Backend.get(`/api/v1/customer/getinfo/${id}`);
    return {
      props: {
        customerInfo: (res.data?.data as CustomerInfo) ?? null,
        customerId: Number(id),
      },
    };
  } catch {
    return { props: defaultProps };
  }
};

export default withAuth(CustomerSupportDetailPage);
