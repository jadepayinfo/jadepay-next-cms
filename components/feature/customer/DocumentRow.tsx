import { useRef, useState, useEffect } from "react";
import InputCustom from "@/components/input/input";
import { getDateTimeNow, unixToDateString } from "@/lib/time";
import { 
  FileText, 
  Save, 
  CheckCircle, 
  XCircle, 
  Archive, 
  RotateCcw,
  AlertCircle,
  Info,
  FileWarning
} from "lucide-react";
import { KycDocument } from "@/model/kyc";

// Types
type SelectOption = {
  value: number;
  label: string;
};

interface DocumentRowProps {
  doc: KycDocument;
  index: number;
  country: string;
  rotationAngles: Record<number, number>;
  previewUrls: Record<number, string>;
  globalOptions: {
    primary: SelectOption[];
    secondary: SelectOption[];
    additional: SelectOption[];
    ictMapping: SelectOption[];
  };
  optionsLoaded: boolean;
  onSaveDocument: (doc: KycDocument, rotation: number) => void;
  onOpenPopup: (docId: number) => Promise<void>;
  onApproveDocument?: (doc: KycDocument) => Promise<void>;
  onRejectDocument?: (doc: KycDocument, reason: string) => Promise<void>;
  onInactiveDocument?: (doc: KycDocument, reason: string) => Promise<void>;
  onReactivateDocument?: (kdoc: KycDocument) => Promise<void>;
  onRequiredDocument?: (doc: KycDocument, reason: string) => Promise<void>;
}

// Helper Functions
const initStartDate = (data?: number) => {
  let currentDate = getDateTimeNow();
  if (data) {
    const newDate = new Date(unixToDateString(data));
    return { startDate: newDate, endDate: newDate };
  } else {
    const newDate = new Date(currentDate);
    newDate.setHours(0, 0);
    return { startDate: newDate, endDate: newDate };
  }
};

const getCountryCode = (country: string): string => {
  switch (country) {
    case "MMR": return "mm";
    case "THA": return "th";
    default: return "mm";
  }
};

const DocumentRow: React.FC<DocumentRowProps> = ({
  doc,
  index,
  country,
  rotationAngles,
  previewUrls,
  globalOptions,
  optionsLoaded,
  onSaveDocument,
  onOpenPopup,
  onApproveDocument,
  onRejectDocument,
  onInactiveDocument,
  onReactivateDocument,
  onRequiredDocument,
}) => {
  // Refs
  const idInputRef = useRef<HTMLInputElement>(null);
  const issueDateRef = useRef<HTMLInputElement>(null);
  const expireDateRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [showRequiredModal, setShowRequiredModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [inactiveReason, setInactiveReason] = useState('');
  const [requiredReason, setRequiredReason] = useState('');

  // Document states
  const [docRole, setDocRole] = useState(() => {
    const initial = doc.document_info || "";
    return initial.toLowerCase().replace(/ /g, "_") + "_" + getCountryCode(country);
  });
  const [docType, setDocType] = useState(doc.doctype_id);
  const [docIdNo, setDocIdNo] = useState(doc.document_no ?? "");
  const [ictId, setICTID] = useState(doc.ict_mapping_id ?? 0);
  const [position, setPosition] = useState(doc.position || "");

  // Date states
  const dateIssuedString = doc.issued_date ?? "";
  const dateExpiredString = doc.expired_date ?? "";
  const dateIssued = new Date(dateIssuedString);
  const dateExpired = new Date(dateExpiredString);
  const [issuedDate, setIssuedDate] = useState(() => initStartDate(dateIssued.getTime() / 1000));
  const [expiredDate, setExpiredDate] = useState(() => initStartDate(dateExpired.getTime() / 1000));

  const mappedCountry = getCountryCode(country);
  // Helper functions
  const getDocumentOptions = (docRole: string): SelectOption[] => {
    if (docRole.includes("primary")) return globalOptions.primary;
    else if (docRole.includes("secondary")) return globalOptions.secondary;
    else return globalOptions.additional;
  };

  const formatDate = (date: Date | null | undefined): string | null => {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  };

  // Computed values
  const currentDocOptions = optionsLoaded ? getDocumentOptions(docRole) : [];
  const currentICTOptions = optionsLoaded ? globalOptions.ictMapping : [];
  
  // Event handlers
  const handleDocRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocRole(e.target.value);
  };

  const handleDateChange = (value: string, isIssued: boolean) => {
    const selectedDate = new Date(value);
    const currentDateState = isIssued ? issuedDate : expiredDate;
    const currentDate = new Date(currentDateState.startDate!);
    
    selectedDate.setHours(currentDate.getHours(), currentDate.getMinutes());
    const newDateState = { startDate: selectedDate, endDate: selectedDate };
    
    if (isIssued) {
      setIssuedDate(newDateState);
    } else {
      setExpiredDate(newDateState);
    }
  };

  const handleSave = () => {
    const updated: KycDocument = {
      ...doc,
      doctype_id: docType,
      document_info: docRole,
      position,
      document_no: docIdNo,
      issued_date: formatDate(issuedDate.startDate),
      expired_date: formatDate(expiredDate.startDate),
      ict_mapping_id: ictId,
      status:"save"
    };
    onSaveDocument(updated, rotationAngles[doc.kyc_doc_id] ?? 0);
  };

  // Modal handlers
  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผล');
      return;
    }
    
    if (onRejectDocument) {
      try {
        await onRejectDocument(doc, rejectReason);
        closeRejectModal();
      } catch (error) {
        console.error('Failed to reject document:', error);
      }
    }
  };

  const openInactiveModal = () => {
    setShowInactiveModal(true);
  };

  const closeInactiveModal = () => {
    setShowInactiveModal(false);
    setInactiveReason('');
  };

  const confirmInactive = async () => {
    if (!inactiveReason.trim()) {
      alert('กรุณาระบุเหตุผล');
      return;
    }
    
    if (onInactiveDocument) {
      try {
        await onInactiveDocument(doc, inactiveReason);
        closeInactiveModal();
      } catch (error) {
        console.error('Failed to inactive document:', error);
      }
    }
  };

  const openRequiredModal = () => {
    setShowRequiredModal(true);
  };

  const closeRequiredModal = () => {
    setShowRequiredModal(false);
    setRequiredReason('');
  };

  const confirmRequired = async () => {
    if (!requiredReason.trim()) {
      alert('กรุณาระบุเหตุผล');
      return;
    }
    
  
    if (onRequiredDocument) {
      try {
          const updated: KycDocument = {
            ...doc,
            doctype_id: docType,
            document_info: docRole,
            position,
            document_no: docIdNo,
            issued_date: formatDate(issuedDate.startDate),
            expired_date: formatDate(expiredDate.startDate),
            ict_mapping_id: ictId,
            status:"required"
          };

        await onRequiredDocument(updated, requiredReason);
        closeRequiredModal();
      } catch (error) {
        console.error('Failed to required document:', error);
      }
    }
  };

  const reactivateDocument = async () => {
    if (window.confirm('คุณต้องการเปิดใช้งานเอกสารนี้ใหม่หรือไม่?')) {
      if (onReactivateDocument) {
        try {
          await onReactivateDocument(doc);
        } catch (error) {
          console.error('Failed to reactivate document:', error);
        }
      }
    }
  };

  // Status logic
  const status = doc.status;
  const isInactive = status === 'Inactive' || !doc.action;
  const isRejected = status === 'Rejected';

  return (
    <>
      <tr className="hover:bg-gray-50">
        {/* Index */}
        <td className="px-3 py-4 text-center">{index + 1}</td>

        {/* Image */}
        <td className="px-3 py-4 text-center">
          {previewUrls[doc.kyc_doc_id] ? (
            <img
              src={previewUrls[doc.kyc_doc_id]}
              alt="preview"
              className="w-20 h-20 object-contain cursor-pointer transition-transform mx-auto"
              style={{
                transform: `rotate(${rotationAngles[doc.kyc_doc_id] ?? 0}deg)`,
              }}
              onClick={() => onOpenPopup(doc.kyc_doc_id)}
            />
          ) : doc.kyc_doc_id !== 0 && doc.status !== "required" ? (
            <img
              src={`/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}`}
              alt="doc"
              className="w-20 h-20 object-contain cursor-pointer transition-transform mx-auto"
              style={{
                transform: `rotate(${rotationAngles[doc.kyc_doc_id] ?? 0}deg)`,
              }}
              onClick={() => onOpenPopup(doc.kyc_doc_id)}
            />
          ) : (
            <div
              className="text-center text-gray-500 cursor-pointer"
              onClick={() => onOpenPopup(doc.kyc_doc_id)}
            >
              <FileText className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-medium">IMG</p>
              <p className="text-xxs">Document</p>
            </div>
          )}
        </td>

        {/* Document Role */}
        <td className="px-3 py-4">
          <select
            className="select select-ui w-full"
            value={docRole}
            onChange={handleDocRoleChange}
          >
            <option value="" disabled>
              Document Role
            </option>
            <option value={`selfie${mappedCountry}`}>Selfie</option>
            <option value={`primary_document_${mappedCountry}`}>Primary</option>
            <option value={`secondary_document_${mappedCountry}`}>
              Secondary
            </option>
            <option value={`additional_document_${mappedCountry}`}>
              Additional
            </option>
          </select>
        </td>

        {/* Document Type */}
        <td className="px-3 py-4">
          <select
            className="select select-ui w-full"
            value={docType === 0 ? "" : String(docType)}
            onChange={(e) => setDocType(Number(e.target.value))}
          >
            <option value="" disabled>
              Document Type
            </option>
            {currentDocOptions?.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </td>

        {/* Position */}
        <td className="py-2 px-3">
          <select
            className="select select-ui w-full"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="" disabled>
              Position
            </option>
            <option value="FRONT">FRONT</option>
            <option value="BACK">BACK</option>
          </select>
        </td>

        {/* Document No */}
        <td className="py-2 px-3 w-24">
          <InputCustom
            name="Document No"
            title="Document No"
            type="text"
            placeholder="document no"
            value={docIdNo}
            onChange={(e) => setDocIdNo(e.target.value)}
            noWrapperMargin
          />
        </td>

        {/* Issued Date */}
        <td className="px-3 py-4">
          <div className="relative">
            <input
              ref={issueDateRef}
              type="date"
              className="relative w-full flex items-center border border-[--border-color] py force-light-background rounded-md"
              style={{ border: "1px solid #d1d5db" }}
              value={formatDate(issuedDate.startDate) || ""}
              onChange={(e) => handleDateChange(e.target.value, true)}
            />
          </div>
        </td>

        {/* Expired Date */}
        <td className="px-3 py-4">
          <div className="relative">
            <input
              ref={expireDateRef}
              type="date"
              className="relative w-full flex items-center border border-[--border-color] py force-light-background rounded-md"
              style={{ border: "1px solid #d1d5db" }}
              value={formatDate(expiredDate.startDate) || ""}
              onChange={(e) => handleDateChange(e.target.value, false)}
            />
          </div>
        </td>

        {/* ICT Mapping */}
        <td className="px-3 py-4">
          <select
            className="select select-ui w-full"
            value={ictId === 0 ? "" : String(ictId)}
            onChange={(e) => setICTID(Number(e.target.value))}
          >
            <option value="" disabled>
              ICT Mapping
            </option>
            {currentICTOptions?.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </td>

        {/* Status Badge */}
        <td className="px-3 py-4 text-center">
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              status === "review"
                ? "bg-yellow-100 text-yellow-800"
                : status === "approve"
                  ? "bg-green-100 text-green-800"
                  : status === "reject"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        </td>

        {/* Action Buttons */}
        <td className="px-3 py-4">
          {status === "approve" ? (
            // ถ้า status = approve ให้แสดงแค่ข้อความ
           <div className="flex justify-center items-center">
      <CheckCircle className="w-6 h-6 text-green-600" />
    </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* บรรทัดที่ 1 - ปุ่มหลัก */}
              <div className="flex gap-1 justify-center">
                <div className="relative group">
                  <button
                    onClick={handleSave}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    บันทึกข้อมูล
                  </div>
                </div>

                {onApproveDocument && (
                  <div className="relative group">
                    <button
                      onClick={() => onApproveDocument(doc)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      อนุมัติเอกสาร
                    </div>
                  </div>
                )}

                {onRejectDocument && (
                  <div className="relative group">
                    <button
                      onClick={openRejectModal}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      ปฏิเสธเอกสาร
                    </div>
                  </div>
                )}
              </div>

              {/* บรรทัดที่ 2 - ปุ่มรอง */}
              <div className="flex gap-1 justify-center">
                <div className="relative group">
                  <button
                    onClick={openRequiredModal}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <FileWarning className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    ต้องการเพิ่มเติม
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={openInactiveModal}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    เอกสารไม่ใช้งาน
                  </div>
                </div>
              </div>
            </div>
          )}
        </td>

        {/* Remark */}
        <td className="px-3 py-4 text-sm">
          {!doc.remark ? (
            <span className="text-gray-400">-</span>
          ) : (
            <div className="flex items-center gap-1">
              {isRejected ? (
                <AlertCircle className="w-3 h-3 text-red-500" />
              ) : (
                <Info className="w-3 h-3 text-blue-500" />
              )}
              <span
                className={`text-xs ${isRejected ? "text-red-600" : "text-gray-600"}`}
              >
                {doc.remark}
              </span>
            </div>
          )}
        </td>
      </tr>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold">ปฏิเสธเอกสาร</h3>
            </div>
            <p className="text-gray-600 mb-4">
              กรุณาระบุเหตุผลในการปฏิเสธเอกสารนี้
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 h-24 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="เช่น ภาพไม่ชัด, เอกสารหมดอายุ, ข้อมูลไม่ตรงกัน..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeRejectModal}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Required Modal */}
      {showRequiredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FileWarning className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">ต้องการเอกสารเพิ่มเติม</h3>
            </div>
            <p className="text-gray-600 mb-4">
              กรุณาระบุเหตุผลในการขอเอกสารเพิ่มเติม
            </p>
            <textarea
              value={requiredReason}
              onChange={(e) => setRequiredReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 h-24 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="เช่น ขาดเอกสารประกอบ, ต้องการหลักฐานเพิ่มเติม, รายละเอียดไม่ครบถ้วน..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeRequiredModal}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmRequired}
                className="flex-1 px-4 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700"
              >
                ส่งคำขอ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Modal */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Archive className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold">ทำให้เอกสารไม่ใช้งาน</h3>
            </div>
            <p className="text-gray-600 mb-4">
              กรุณาระบุเหตุผลในการทำให้เอกสารนี้ไม่ใช้งาน
            </p>
            <textarea
              value={inactiveReason}
              onChange={(e) => setInactiveReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 h-24 resize-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="เช่น เอกสารซ้ำ, ผู้ใช้ขอให้หยุดใช้งาน, เปลี่ยนเอกสารใหม่..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeInactiveModal}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmInactive}
                className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentRow;