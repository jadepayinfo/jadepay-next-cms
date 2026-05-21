import { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';
import withAuth from '@/hoc/with_auth';
import { Backend, initHeaderWithServerSide } from '@/lib/axios';
import CallLogForm from '@/components/feature/customer-support/CallLogForm';
import FileAttachmentSection, {
  PendingAttachment,
} from '@/components/feature/customer-support/FileAttachment';
import ImagePopup from '@/components/feature/customer/ImagePopup';
import {
  DocumentGlobalOptions,
  getCountryCode,
  mapCatalogueToOptions,
} from '@/lib/document_options';
import { CatalogueItem } from '@/model/catalogueItem';
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
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [savingAttachmentId, setSavingAttachmentId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState<string | null>(null);
  const [currentAttachmentId, setCurrentAttachmentId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(initialRecord?.status ?? '');
  const [note, setNote] = useState(initialRecord?.note ?? '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [globalOptions, setGlobalOptions] = useState<DocumentGlobalOptions>({
    primary: [],
    secondary: [],
    additional: [],
    selfie: [{ value: 310, label: 'Scan Face' }],
  });
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  useEffect(() => {
    if (!customerInfo) return;

    const loadDocumentOptions = async () => {
      try {
        const resNationality = await axios.get('/api/masconfig/get-catalogue', {
          params: { config_key: 'country' },
        });
        const nationalityItems = Object.values(resNationality.data).filter(
          Boolean
        ) as CatalogueItem[];
        const matchedNationality = nationalityItems.find(
          (item) => item.id === customerInfo.customer_data.customer.nationality
        );
        const mappedCountry = getCountryCode(matchedNationality?.ict_id ?? 'MMR');
        if (!mappedCountry) return;

        setCountryCode(mappedCountry);

        const [resPrimary, resSecondary, resAdditional] = await Promise.all([
          axios.get('/api/masconfig/get-catalogue', {
            params: { config_key: `primary_document_${mappedCountry}` },
          }),
          axios.get('/api/masconfig/get-catalogue', {
            params: { config_key: `secondary_document_${mappedCountry}` },
          }),
          axios.get('/api/masconfig/get-catalogue-without-status', {
            params: { config_key: `additional_document_${mappedCountry}` },
          }),
        ]);

        setGlobalOptions({
          primary: mapCatalogueToOptions(resPrimary.data),
          secondary: mapCatalogueToOptions(resSecondary.data),
          additional: mapCatalogueToOptions(resAdditional.data),
          selfie: [{ value: 310, label: 'Scan Face' }],
        });
        setOptionsLoaded(true);
      } catch (error) {
        console.error('Failed to load document options:', error);
        setOptionsLoaded(false);
      }
    };

    loadDocumentOptions();
  }, [customerInfo]);

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

  const cleanupPreview = (id: string) => {
    setPreviewUrls((prev) => {
      const url = prev[id];
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setPendingFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupImageUrl(null);
    setCurrentAttachmentId(null);
  };

  const openAttachmentPopup = (id: string, existingUrl?: string) => {
    const url = previewUrls[id] ?? existingUrl ?? null;
    setPopupImageUrl(url);
    setCurrentAttachmentId(id);
    setIsPopupOpen(true);
  };

  const handleUploadFromPopup = (file: File) => {
    if (!currentAttachmentId) return;
    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => {
      const oldUrl = prev[currentAttachmentId];
      if (oldUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      return { ...prev, [currentAttachmentId]: url };
    });
    setPendingFiles((prev) => ({ ...prev, [currentAttachmentId]: file }));
  };

  const handleAddPending = () => {
    setPendingAttachments((prev) => [
      ...prev,
      {
        id: `pending-${Date.now()}`,
        docRole: '',
        doctypeId: 0,
        position: '',
      },
    ]);
  };

  const handlePendingMetaChange = (
    id: string,
    field: 'docRole' | 'doctypeId' | 'position',
    value: string | number
  ) => {
    setPendingAttachments((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'docRole') {
          return {
            ...item,
            docRole: String(value),
            doctypeId: 0,
          };
        }
        if (field === 'doctypeId') {
          return { ...item, doctypeId: Number(value) };
        }
        return { ...item, position: String(value) };
      })
    );
  };

  const handleRemovePending = (id: string) => {
    cleanupPreview(id);
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAttachment = async (id: string) => {
    const file = pendingFiles[id];
    const pending = pendingAttachments.find((item) => item.id === id);
    if (!file) {
      setAttachmentError('โปรดเลือกไฟล์ก่อนบันทึก');
      return;
    }
    if (!pending?.docRole) {
      setAttachmentError('โปรดเลือก Document Role');
      return;
    }
    if (!pending.position) {
      setAttachmentError('โปรดเลือก Position');
      return;
    }
    const isSelfie = pending.docRole.includes('selfie');
    if (!isSelfie && pending.doctypeId === 0) {
      setAttachmentError('โปรดเลือก Document Type');
      return;
    }

    const localPreview = previewUrls[id];
    setAttachmentError('');
    setSavingAttachmentId(id);
    try {
      const configId =
        isSelfie && pending.doctypeId === 0 ? 310 : pending.doctypeId;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('config_id', String(configId));
      formData.append('position', pending.position);
      formData.append('document_info', pending.docRole);
      formData.append('document_no', file.name);
      formData.append('customer_id', String(customer.user_id));

      const response = await axios.post(
        `/api/customer-support/${customerId}/attachment`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const saved = response.data?.data ?? response.data;
      const attachmentId = String(saved?.id ?? `f${Date.now()}`);
      const attachment: FileAttachment = {
        id: attachmentId,
        name: file.name,
        url: saved?.url ?? '',
        uploadedAt: saved?.uploaded_at ?? saved?.uploadedAt ?? new Date().toISOString(),
        documentInfo: pending.docRole,
        doctypeId: pending.doctypeId,
        position: pending.position,
      };
      setAttachments((prev) => [...prev, attachment]);

      // เก็บ blob preview ไว้แสดง thumbnail (เหมือน DocumentRow ก่อนโหลดจาก server)
      if (localPreview?.startsWith('blob:')) {
        setPreviewUrls((prev) => {
          const next = { ...prev };
          delete next[id];
          next[attachmentId] = localPreview;
          return next;
        });
      } else {
        cleanupPreview(id);
      }

      setPendingFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setAttachmentError('บันทึกเอกสารไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSavingAttachmentId(null);
    }
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
            pendingAttachments={pendingAttachments}
            previewUrls={previewUrls}
            pendingFiles={pendingFiles}
            savingId={savingAttachmentId}
            countryCode={countryCode}
            globalOptions={globalOptions}
            optionsLoaded={optionsLoaded}
            onAddPending={handleAddPending}
            onOpenPopup={openAttachmentPopup}
            onSave={handleSaveAttachment}
            onRemovePending={handleRemovePending}
            onPendingMetaChange={handlePendingMetaChange}
          />
          {attachmentError && (
            <p className="text-xs text-error mt-2">{attachmentError}</p>
          )}
        </div>
      </div>

      {isPopupOpen && currentAttachmentId && (
        <ImagePopup
          imageUrl={popupImageUrl ?? ''}
          onClose={closePopup}
          onUpload={handleUploadFromPopup}
        />
      )}

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
