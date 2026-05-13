import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FileAttachment as FileAttachmentType } from '@/model/customer-support';
import { uploadImage } from '@/lib/upload_image';

interface Props {
  attachments: FileAttachmentType[];
  onAdd: (file: FileAttachmentType) => Promise<void>;
}

export default function FileAttachment({ attachments, onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file, 'customer-support');
      onAdd({
        id: `f${Date.now()}`,
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
      });
    } catch {
      setError('อัปโหลดไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-base">เอกสารแนบ</h3>

      {attachments.length === 0 && !uploading && (
        <p className="text-sm text-base-content/50">ยังไม่มีเอกสารแนบ</p>
      )}

      <div className="space-y-2">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200/30"
          >
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
        ))}
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFile}
          accept="image/*,.pdf,.doc,.docx"
        />
        <button
          className="btn btn-sm btn-outline btn-primary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              กำลังอัปโหลด...
            </>
          ) : (
            '+ แนบเอกสาร'
          )}
        </button>
      </div>
    </div>
  );
}
