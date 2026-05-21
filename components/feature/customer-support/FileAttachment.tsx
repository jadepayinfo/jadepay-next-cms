import { useState } from 'react';
import dayjs from 'dayjs';
import { FileText, FilePlus2, Save } from 'lucide-react';
import { FileAttachment as FileAttachmentType } from '@/model/customer-support';
import {
  DocumentGlobalOptions,
  getDocumentOptions,
} from '@/lib/document_options';

export interface PendingAttachment {
  id: string;
  docRole: string;
  doctypeId: number;
  position: string;
}

interface Props {
  attachments: FileAttachmentType[];
  pendingAttachments: PendingAttachment[];
  previewUrls: Record<string, string>;
  pendingFiles: Record<string, File>;
  savingId: string | null;
  countryCode: string;
  globalOptions: DocumentGlobalOptions;
  optionsLoaded: boolean;
  onAddPending: () => void;
  onOpenPopup: (id: string, existingUrl?: string) => void;
  onSave: (id: string) => void;
  onRemovePending: (id: string) => void;
  onPendingMetaChange: (
    id: string,
    field: 'docRole' | 'doctypeId' | 'position',
    value: string | number
  ) => void;
}

const isImageFile = (nameOrUrl: string) =>
  /\.(jpe?g|png|gif|webp|bmp)$/i.test(nameOrUrl);

const getDocTypeLabel = (
  doctypeId: number | undefined,
  docRole: string | undefined,
  globalOptions: DocumentGlobalOptions
) => {
  if (!doctypeId || !docRole) return '-';
  const option = getDocumentOptions(docRole, globalOptions).find(
    (item) => item.value === doctypeId
  );
  return option?.label ?? String(doctypeId);
};

export default function FileAttachment({
  attachments,
  pendingAttachments,
  previewUrls,
  pendingFiles,
  savingId,
  countryCode,
  globalOptions,
  optionsLoaded,
  onAddPending,
  onOpenPopup,
  onSave,
  onRemovePending,
  onPendingMetaChange,
}: Props) {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const renderThumbnail = (
    id: string,
    nameOrUrl: string,
    existingUrl?: string
  ) => {
    const previewUrl = previewUrls[id];
    const displayUrl = previewUrl || existingUrl;
    const showImage =
      displayUrl &&
      isImageFile(nameOrUrl || displayUrl) &&
      !brokenImages[id];

    if (showImage && displayUrl) {
      return (
        <img
          src={displayUrl}
          alt={nameOrUrl || 'attachment'}
          className="w-20 h-20 object-contain cursor-pointer mx-auto border border-base-300 rounded bg-white"
          onClick={() => onOpenPopup(id, existingUrl)}
          onError={() =>
            setBrokenImages((prev) => ({ ...prev, [id]: true }))
          }
        />
      );
    }

    return (
      <div
        className="w-20 h-20 flex flex-col items-center justify-center text-base-content/50 cursor-pointer border border-dashed border-base-300 rounded mx-auto hover:bg-base-200/50"
        onClick={() => onOpenPopup(id, existingUrl)}
      >
        <FileText className="w-6 h-6 mb-1" />
        <p className="text-xs font-medium">ไฟล์</p>
      </div>
    );
  };

  const renderMetaFields = (pending: PendingAttachment, disabled: boolean) => {
    const docOptions = optionsLoaded
      ? getDocumentOptions(pending.docRole, globalOptions)
      : [];
    const isSelfie = pending.docRole.includes('selfie');

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">Document Role</span>
          </label>
          <select
            className="select select-ui w-full"
            value={pending.docRole}
            disabled={disabled}
            onChange={(e) => onPendingMetaChange(pending.id, 'docRole', e.target.value)}
          >
            <option value="" disabled>
              Document Role
            </option>
            <option value="selfie">Selfie</option>
            <option value={`primary_document_${countryCode}`}>Primary</option>
            <option value={`secondary_document_${countryCode}`}>Secondary</option>
            <option value={`additional_document_${countryCode}`}>Additional</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">Document Type</span>
          </label>
          <select
            className="select select-ui w-full"
            value={pending.doctypeId === 0 ? '' : String(pending.doctypeId)}
            disabled={disabled || isSelfie || !pending.docRole}
            onChange={(e) =>
              onPendingMetaChange(pending.id, 'doctypeId', Number(e.target.value))
            }
          >
            <option value="">Document Type</option>
            {docOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">Position</span>
          </label>
          <select
            className="select select-ui w-full"
            value={pending.position}
            disabled={disabled}
            onChange={(e) => onPendingMetaChange(pending.id, 'position', e.target.value)}
          >
            <option value="" disabled>
              Position
            </option>
            <option value="FRONT">FRONT</option>
            <option value="BACK">BACK</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-base">เอกสารแนบ</h3>

      {attachments.length === 0 && pendingAttachments.length === 0 && (
        <p className="text-sm text-base-content/50">ยังไม่มีเอกสารแนบ</p>
      )}

      <div className="space-y-2">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="flex flex-col gap-2 p-3 border border-base-300 rounded-lg bg-base-200/30"
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {renderThumbnail(file.id, file.name, file.url)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-base-content/50">
                  {dayjs(file.uploadedAt).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-xs btn-ghost"
              >
                ดู
              </a>
            </div>
            {(file.documentInfo || file.doctypeId || file.position) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-base-content/60">Role: </span>
                  <span className="font-medium">{file.documentInfo || '-'}</span>
                </div>
                <div>
                  <span className="text-base-content/60">Type: </span>
                  <span className="font-medium">
                    {getDocTypeLabel(file.doctypeId, file.documentInfo, globalOptions)}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/60">Position: </span>
                  <span className="font-medium">{file.position || '-'}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {pendingAttachments.map((pending) => {
          const file = pendingFiles[pending.id];
          const hasPreview = !!previewUrls[pending.id];
          const canSave = !!file;
          const isSaving = savingId === pending.id;

          return (
            <div
              key={pending.id}
              className="p-3 border border-primary/30 rounded-lg bg-base-100"
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {renderThumbnail(
                    pending.id,
                    file?.name ?? '',
                    previewUrls[pending.id]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file?.name ?? 'เอกสารใหม่ (ยังไม่บันทึก)'}
                  </p>
                  <p className="text-xs text-warning">
                    {hasPreview
                      ? 'เลือก Role / Type / Position แล้วกดบันทึก'
                      : 'คลิกรูปเพื่อเลือกไฟล์'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className={`btn btn-xs btn-ghost ${
                      canSave ? 'text-blue-600' : 'text-gray-400 opacity-50'
                    }`}
                    onClick={() => onSave(pending.id)}
                    disabled={!canSave || isSaving}
                    title="บันทึกเอกสาร"
                  >
                    {isSaving ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => onRemovePending(pending.id)}
                    disabled={isSaving}
                  >
                    ลบ
                  </button>
                </div>
              </div>
              {renderMetaFields(pending, isSaving)}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn-sm btn-outline btn-primary flex items-center gap-2"
        onClick={onAddPending}
        disabled={!!savingId || !countryCode}
      >
        <FilePlus2 className="w-4 h-4" />
        แนบเอกสาร
      </button>
      {!countryCode && (
        <p className="text-xs text-warning">ไม่พบรหัสประเทศสำหรับโหลดประเภทเอกสาร</p>
      )}
    </div>
  );
}
