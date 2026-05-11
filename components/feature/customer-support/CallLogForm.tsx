import { useState } from 'react';
import dayjs from 'dayjs';
import { CallLog, CallResult } from '@/model/customer-support';

interface Props {
  callLogs: CallLog[];
  onAdd: (log: CallLog) => void;
}

const CALL_RESULTS: CallResult[] = ['ติดต่อได้', 'ไม่รับสาย', 'เครื่องปิด', 'ไม่สามารถติดต่อได้'];

const ATTEMPT_LABELS = ['ครั้งที่ 1', 'ครั้งที่ 2', 'ครั้งที่ 3'];

export default function CallLogForm({ callLogs, onAdd }: Props) {
  const nextAttempt = (callLogs.length + 1) as 1 | 2 | 3;
  const isDone = callLogs.length >= 3;

  const [result, setResult] = useState<CallResult>('ไม่รับสาย');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = () => {
    if (isDone) return;
    setSaving(true);
    setTimeout(() => {
      onAdd({
        attempt: nextAttempt,
        calledAt: new Date().toISOString(),
        result,
        note,
      });
      setNote('');
      setResult('ไม่รับสาย');
      setSaving(false);
    }, 300);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-base">บันทึกการโทร</h3>

      {ATTEMPT_LABELS.map((label, i) => {
        const log = callLogs[i];
        const isUnlocked = i < callLogs.length || i === callLogs.length;
        const isActive = i === callLogs.length && !isDone;

        return (
          <div
            key={i}
            className={`border rounded-lg p-4 transition-all ${
              log ? 'border-base-300 bg-base-200/40' : isActive ? 'border-primary/40 bg-base-100' : 'border-base-200 bg-base-200/20 opacity-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`badge badge-sm ${
                  log
                    ? log.result === 'ติดต่อได้'
                      ? 'badge-success'
                      : 'badge-error'
                    : isActive
                    ? 'badge-primary badge-outline'
                    : 'badge-ghost'
                }`}
              >
                {label}
              </span>
              {log && (
                <span className="text-xs text-base-content/60">
                  {dayjs(log.calledAt).format('DD/MM/YYYY HH:mm')}
                </span>
              )}
            </div>

            {log ? (
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">ผล:</span>{' '}
                  <span className={log.result === 'ติดต่อได้' ? 'text-success' : 'text-error'}>
                    {log.result}
                  </span>
                </p>
                {log.note && (
                  <p className="text-sm text-base-content/70">
                    <span className="font-medium">หมายเหตุ:</span> {log.note}
                  </p>
                )}
              </div>
            ) : isActive ? (
              <div className="space-y-3 mt-2">
                <div className="form-control">
                  <label className="label py-0">
                    <span className="label-text text-xs">ผลการโทร</span>
                  </label>
                  <select
                    className="select select-ui w-full max-w-xs"
                    value={result}
                    onChange={(e) => setResult(e.target.value as CallResult)}
                  >
                    {CALL_RESULTS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label py-0">
                    <span className="label-text text-xs">หมายเหตุ</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered textarea-sm w-full"
                    rows={2}
                    placeholder="บันทึกเพิ่มเติม..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? <span className="loading loading-spinner loading-xs" /> : null}
                  บันทึกการโทร
                </button>
              </div>
            ) : (
              <p className="text-xs text-base-content/40">ยังไม่ถึงรอบนี้</p>
            )}
          </div>
        );
      })}

      {isDone && (
        <div className="alert alert-warning text-sm py-2">
          <span>ครบ 3 ครั้งแล้ว ไม่สามารถบันทึกการโทรเพิ่มได้</span>
        </div>
      )}
    </div>
  );
}
