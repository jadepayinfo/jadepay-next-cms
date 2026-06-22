import { useRef, useState, useEffect } from "react";
import InputCustom from "@/components/input/input";
import { IconCalendar } from "@/components/icon";
import { getDateTimeNow, unixToDateString } from "@/lib/time";
import {
  FileText,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  FileWarning,
  Trash2
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
  savedRotationAngles: Record<number, number>;
  previewUrls: Record<number, string>;
  imageTimestamps: Record<number, number>;
  globalOptions: {
    primary: SelectOption[];
    secondary: SelectOption[];
    additional: SelectOption[];
    ictMapping: SelectOption[];
    nationality: SelectOption[];
    selfie: SelectOption[];
  };
  optionsLoaded: boolean;
  isSelected?: boolean;
  onSaveDocument: (doc: KycDocument, rotation: number) => void;
  onOpenPopup: (docId: KycDocument) => Promise<void>;
  onApproveDocument?: (doc: KycDocument) => Promise<void>;
  onRejectDocument?: (doc: KycDocument, reason: string) => Promise<void>;
  onInactiveDocument?: (doc: KycDocument, reason: string) => Promise<void>;
  onReactivateDocument?: (kdoc: KycDocument) => Promise<void>;
  onRequiredDocument?: (doc: KycDocument, reason: string) => Promise<void>;
  onSelectDoc?: (docId: number, checked: boolean) => void;

  onValidateDocument?: (
    fn: () => { isValid: boolean; errors: string[] }
  ) => void;
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
    case "MMR":
      return "mm";
    case "THA":
      return "th";
    default:
      return "mm";
  }
};

const normalizeDocRole = (documentInfo: string, country: string): string => {
  const normalized = (documentInfo || "").toLowerCase().trim();
  if (!normalized) return "";
  if (normalized === "selfie") return "selfie";

  const withUnderscores = normalized.replace(/ /g, "_");
  if (withUnderscores.includes("_document_")) {
    return withUnderscores;
  }

  const countrySuffix = `_${getCountryCode(country)}`;
  if (withUnderscores.endsWith(countrySuffix)) {
    return withUnderscores;
  }

  return `${withUnderscores}${countrySuffix}`;
};

const syncDateState = (
  dateString: string | null | undefined,
  setDate: (value: { startDate: Date | null; endDate: Date | null }) => void,
  setInput: (value: string) => void
) => {
  const hasValue = dateString && !isNaN(new Date(dateString).getTime());
  if (!hasValue) {
    setDate({ startDate: null, endDate: null });
    setInput("");
    return;
  }

  const parsed = new Date(dateString!);
  setDate(initStartDate(parsed.getTime() / 1000));
  setInput(formatDateDisplay(parsed));
};

const formatDateDisplay = (date: Date | null | undefined): string => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const formatMaskedDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseMaskedDateInput = (text: string): Date | null => {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1900 || year > 2100) return null;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const toNativeDateValue = (date: Date | null | undefined): string => {
  if (!date || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface DateFieldWithPickerProps {
  textValue: string;
  selectedDate: Date | null;
  onTextChange: (raw: string) => void;
  onCalendarSelect: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const DateFieldWithPicker: React.FC<DateFieldWithPickerProps> = ({
  textValue,
  selectedDate,
  onTextChange,
  onCalendarSelect,
  disabled = false,
  placeholder = "DD/MM/YYYY",
}) => {
  const nativeDateRef = useRef<HTMLInputElement>(null);

  const openCalendar = () => {
    if (disabled) return;
    if (typeof nativeDateRef.current?.showPicker === "function") {
      nativeDateRef.current.showPicker();
      return;
    }
    nativeDateRef.current?.click();
  };

  return (
    <div
      className={`relative w-full border rounded-md force-light-background ${
        disabled
          ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-100"
          : "border-[--border-color]"
      }`}
    >
      <input
        type="text"
        inputMode="numeric"
        maxLength={10}
        placeholder={placeholder}
        className="w-full min-h-[42px] px-3 pr-9 text-sm rounded-md bg-transparent outline-none"
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={disabled}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center px-2 text-base-content/60 hover:text-primary disabled:cursor-not-allowed"
        onClick={openCalendar}
        disabled={disabled}
        aria-label="เลือกวันที่จากปฏิทิน"
      >
        <IconCalendar className="text-[18px]" />
      </button>
      <input
        ref={nativeDateRef}
        type="date"
        className="sr-only"
        tabIndex={-1}
        min="1900-01-01"
        max="2100-12-31"
        value={toNativeDateValue(selectedDate)}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            onCalendarSelect(null);
            return;
          }
          const [year, month, day] = value.split("-").map(Number);
          onCalendarSelect(new Date(year, month - 1, day));
        }}
        disabled={disabled}
      />
    </div>
  );
};

const DocumentRow: React.FC<DocumentRowProps> = ({
  doc,
  index,
  country,
  rotationAngles,
  savedRotationAngles,
  previewUrls,
  imageTimestamps,
  globalOptions,
  optionsLoaded,
  isSelected = false,
  onSaveDocument,
  onOpenPopup,
  onApproveDocument,
  onRejectDocument,
  onInactiveDocument,
  onReactivateDocument,
  onRequiredDocument,
  onSelectDoc,
  onValidateDocument,
}) => {
  // Refs
  const idInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequiredModal, setShowRequiredModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requiredReason, setRequiredReason] = useState("");
  // Document states
  const [docRole, setDocRole] = useState(() =>
    normalizeDocRole(doc.document_info || "", country)
  );
  const [docType, setDocType] = useState(doc.doctype_id);
  const [docIdNo, setDocIdNo] = useState(doc.document_no ?? "");
  const [ictId, setICTID] = useState(doc.ict_mapping_id ?? 0);
  const [position, setPosition] = useState(doc.position || "");
  const [issue_country, setIssueCountry] = useState(doc.issue_country || "");

  // Date states - ใช้ null เมื่อไม่มีวันที่ เพื่อให้ currentData ตรงกับ originalData บน first load
  const dateIssuedString = doc.issued_date ?? "";
  const dateExpiredString = doc.expired_date ?? "";
  const dateIssued = new Date(dateIssuedString);
  const dateExpired = new Date(dateExpiredString);
  const hasValidIssuedDate =
    dateIssuedString && !isNaN(dateIssued.getTime());
  const hasValidExpiredDate =
    dateExpiredString && !isNaN(dateExpired.getTime());
  const [issuedDate, setIssuedDate] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>(() =>
    hasValidIssuedDate
      ? initStartDate(dateIssued.getTime() / 1000)
      : { startDate: null, endDate: null }
  );
  const [expiredDate, setExpiredDate] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>(() =>
    hasValidExpiredDate
      ? initStartDate(dateExpired.getTime() / 1000)
      : { startDate: null, endDate: null }
  );

  const [issuedDateInput, setIssuedDateInput] = useState(() =>
    formatDateDisplay(
      hasValidIssuedDate ? dateIssued : null
    )
  );
  const [expiredDateInput, setExpiredDateInput] = useState(() =>
    formatDateDisplay(
      hasValidExpiredDate ? dateExpired : null
    )
  );

  const mappedCountry = getCountryCode(country);
  const isSelfie = docRole.includes("selfie");
  // Helper functions
  const getDocumentOptions = (docRole: string): SelectOption[] => {
    if (docRole.includes("primary")) return globalOptions.primary;
    else if (docRole.includes("secondary")) return globalOptions.secondary;
    else if (docRole.includes("additional")) return globalOptions.additional;
    else if (docRole.includes("selfie")) return globalOptions.selfie;
    else return [];
  };

  const formatDate = (date: Date | null | undefined): string | null => {
    if (!date) return null;
    // Check if date is valid
    if (isNaN(date.getTime())) return null;
    //return date.toISOString().split("T")[0];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Computed values
  const currentDocOptions = optionsLoaded ? getDocumentOptions(docRole) : [];
  const currentICTOptions = optionsLoaded ? globalOptions.ictMapping : [];
  const currentNationalityOptions = optionsLoaded
    ? globalOptions.nationality
    : [];
  // Event handlers
  const handleDocRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocRole(e.target.value);
  };

  const applyDateValue = (date: Date | null, isIssued: boolean) => {
    const display = formatDateDisplay(date);
    const emptyDateState = { startDate: null, endDate: null };

    if (isIssued) {
      setIssuedDateInput(display);
    } else {
      setExpiredDateInput(display);
    }

    if (!date) {
      if (isIssued) {
        setIssuedDate(emptyDateState);
      } else {
        setExpiredDate(emptyDateState);
      }
      return;
    }

    const currentDateState = isIssued ? issuedDate : expiredDate;
    const currentDate = currentDateState.startDate
      ? new Date(currentDateState.startDate)
      : new Date();

    date.setHours(currentDate.getHours(), currentDate.getMinutes());
    const newDateState = { startDate: date, endDate: date };

    if (isIssued) {
      setIssuedDate(newDateState);
    } else {
      setExpiredDate(newDateState);
    }
  };

  const handleMaskedDateChange = (raw: string, isIssued: boolean) => {
    const formatted = formatMaskedDateInput(raw);
    if (isIssued) {
      setIssuedDateInput(formatted);
    } else {
      setExpiredDateInput(formatted);
    }

    if (!formatted) {
      applyDateValue(null, isIssued);
      return;
    }

    const parsed = parseMaskedDateInput(formatted);
    if (!parsed) return;

    applyDateValue(parsed, isIssued);
  };
 const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {

    const validation = validateDocument();
    if (!validation.isValid) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน:\n\n" + validation.errors.join("\n"));
      return;
    }

    setHasUnsavedChanges(false);
    setJustSaved(true);

    const updated: KycDocument = {
      ...doc,
      doctype_id: docType,
      document_info: docRole,
      position,
      document_no: docIdNo,
      issued_date: formatDate(issuedDate.startDate),
      expired_date: formatDate(expiredDate.startDate),
      ict_mapping_id: ictId,
      status: "review",
      issue_country: issue_country,
    };
    (updated as any)._docIndex = index; // ส่ง index ไปด้วย
    onSaveDocument(updated, rotationAngles[doc.kyc_doc_id] ?? 0);
  };

  // Modal handlers
  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("กรุณาระบุเหตุผล");
      return;
    }

    if (onRejectDocument) {
      try {
        await onRejectDocument(doc, rejectReason);
        closeRejectModal();
      } catch (error) {}
    }
  };

  const onDeleteRow = async () => {
      if (onRejectDocument) {
      try {
        await onRejectDocument(doc, "");
        closeRejectModal();
      } catch (error) {}
    }
  }

  const openRequiredModal = () => {
    setShowRequiredModal(true);
  };

  const closeRequiredModal = () => {
    setShowRequiredModal(false);
    setRequiredReason("");
  };

  const confirmRequired = async () => {
    if (!requiredReason.trim()) {
      alert("กรุณาระบุเหตุผล");
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
          status: "required",
        };

        await onRequiredDocument(updated, requiredReason);
        closeRequiredModal();
      } catch (error) {}
    }
  };

  const handleApprove = async () => {
    if (hasUnsavedChanges) {
      alert("กรุณาบันทึกข้อมูลก่อนทำการอนุมัติเอกสาร");
      return;
    }

    const validation = validateDocument();
    if (!validation.isValid) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน:\n\n" + validation.errors.join("\n"));
      return;
    }

    if (onApproveDocument) {
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
          status: "approved",
        };
        await onApproveDocument(updated);
      } catch (error) {}
    }
  };

  // Validation function
  const validateDocument = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!docRole) {
      errors.push("กรุณาเลือก Document Role");
    }
    // ICT Mapping
    if (ictId === 0 && currentICTOptions.length > 0) {
      errors.push("กรุณาเลือก ICT Mapping");
    }

    // Position
      if (!position ) {       
        errors.push("กรุณาเลือก Position");
      }

    if (!isSelfie && docRole !== "additional_document_mm") {
      // Document Type
      if (docType === 0) {
        errors.push("กรุณาเลือก Document Type");
      }

      // Position
      if (!position && docRole.includes("document")) {
        errors.push("กรุณาเลือก Position");
      }

      // Document No
      if (!docIdNo.trim() && docRole.includes("document")) {
        errors.push("กรุณากรอก Document No");
      }

      // Issued Date
      if (!formatDate(issuedDate.startDate) && docRole.includes("document")) {
        errors.push("กรุณาเลือก Issued Date");
      }

      // Expired Date
      if (!formatDate(expiredDate.startDate) && docRole.includes("document")) {
        errors.push("กรุณาเลือก Expired Date");
      }
      if (issue_country === "" && currentNationalityOptions.length > 0) {
        errors.push("กรุณาเลือก Issued Country");
      }

    }

   return { isValid: errors.length === 0, errors };
    //return { isValid: false, errors };
  };

  // Status logic
  const status = doc.status;
  const isApproved = status === "approved";
  const isRejected = status === "reject";

 

  const checkForChanges = () => {
    // check File
    let checkFile_Change = false;
    if (rotationAngles[doc.kyc_doc_id] !== undefined && rotationAngles[doc.kyc_doc_id] !== 0) {
      checkFile_Change = true;
    }

    let checkFile_Upload = false;
    if (previewUrls[doc.kyc_doc_id]) {
      checkFile_Upload = true;
    }
    const currentIssuedDate = formatDate(issuedDate.startDate);
    const currentExpiredDate = formatDate(expiredDate.startDate);
    const originalIssuedDate = doc.issued_date ? formatDate(new Date(doc.issued_date)) : null;
    const originalExpiredDate = doc.expired_date ? formatDate(new Date(doc.expired_date)) : null;

    //check control
    const currentData = {
      docRole,
      docType,
      position,
      docIdNo,
      ictId,
      issuedDate: currentIssuedDate,
      expiredDate: currentExpiredDate,
    };

    const originalDocInfo = (doc.document_info || "").toLowerCase();
    const originalData = {
      docRole: normalizeDocRole(originalDocInfo, country),
      docType: doc.doctype_id,
      position: doc.position || "",
      docIdNo: doc.document_no ?? "",
      ictId: doc.ict_mapping_id ?? 0,
      issuedDate: originalIssuedDate,
      expiredDate: originalExpiredDate,
    };
    const hasChanges =
      JSON.stringify(currentData) !== JSON.stringify(originalData);
    const shouldShowUnsaved = hasChanges || checkFile_Change || checkFile_Upload;
    setHasUnsavedChanges(shouldShowUnsaved);

    return hasChanges;
  };

  const clearcontrol = () => {
    setDocType(0);
    setDocIdNo("");
    setPosition("");
    setIssuedDate(initStartDate(undefined));
    setExpiredDate(initStartDate(undefined));
  };

  const docSyncKey = [
    doc.kyc_doc_id,
    doc.doctype_id,
    doc.document_no,
    doc.position,
    doc.issued_date,
    doc.expired_date,
    doc.ict_mapping_id,
    doc.issue_country,
    doc.document_info,
  ].join("|");

  const lastSyncedDocKey = useRef(docSyncKey);

  useEffect(() => {
    if (hasUnsavedChanges || justSaved) return;
    if (lastSyncedDocKey.current === docSyncKey) return;

    lastSyncedDocKey.current = docSyncKey;
    const nextRole = normalizeDocRole(doc.document_info || "", country);
    if (nextRole !== docRole) setDocRole(nextRole);
    if (doc.doctype_id !== docType) setDocType(doc.doctype_id);
    setDocIdNo(doc.document_no ?? "");
    setICTID(doc.ict_mapping_id ?? 0);
    setPosition(doc.position || "");
    setIssueCountry(doc.issue_country || "");
    syncDateState(doc.issued_date, setIssuedDate, setIssuedDateInput);
    syncDateState(doc.expired_date, setExpiredDate, setExpiredDateInput);
  }, [docSyncKey, hasUnsavedChanges, justSaved, country, doc]);

  useEffect(() => {
    if (justSaved) {
      setJustSaved(false);
      return;
    }
    checkForChanges();
  }, [
    docRole,
    docType,
    position,
    docIdNo,
    ictId,
    issuedDate.startDate,
    expiredDate.startDate,
    rotationAngles[doc.kyc_doc_id],
    issue_country,
    previewUrls[doc.kyc_doc_id],
  ]);

  useEffect(() => {
    if (onValidateDocument) {
      onValidateDocument(validateDocument);
    }
  }, [onValidateDocument, validateDocument]);

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-4 sticky left-0 bg-white z-10 border-r ">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectDoc?.(doc.kyc_doc_id, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isApproved || isRejected}
          />
        </td>
        {/* Action Buttons */}
        <td className="px-3 py-4 sticky left-12 bg-white z-10 border-r w-28">
          {status === "approved" ? (
            <div className="flex justify-center items-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div className="flex flex-col gap-1 w-full">
              <div className="flex gap-1 justify-center">
                <div className="relative group">
                  <button
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || isRejected}
                    className={`p-1.5 rounded-lg transition-colors ${
                      hasUnsavedChanges
                        ? "text-blue-600 hover:bg-blue-50 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    บันทึกข้อมูล
                  </div>
                </div>

                {onApproveDocument && (
                  <div className="relative group">
                    <button
                      onClick={handleApprove}
                      disabled={isApproved || isRejected}
                      className={`p-1.5 rounded-lg transition-colors ${
                        !isApproved && !isRejected
                          ? "text-green-600 hover:bg-green-50 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      อนุมัติเอกสาร
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-1 justify-center">
                {onRejectDocument && (
                  doc.kyc_doc_id > 0 ?(
                  <div className="relative group">
                    <button
                      onClick={openRejectModal}
                      disabled={isApproved || isRejected}
                      className={`p-1.5 rounded-lg transition-colors ${
                        !isApproved && !isRejected
                          ? "text-red-600 hover:bg-red-50 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      ปฏิเสธเอกสาร
                    </div>
                  </div>
                ):(
                   <div className="relative group">
                    <button
                      onClick={onDeleteRow}
                      // className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={isApproved || isRejected}
                       className={`p-1.5 rounded-lg transition-colors text-red-600 hover:bg-red-50 cursor-pointer`}                   
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      ลบแถว
                    </div>
                  </div>
                ))}
                {/* <div className="relative group">
                  <button
                    onClick={openRequiredModal}
                    // className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    disabled={isApproved || isRejected}
                     className={`p-1.5 rounded-lg transition-colors ${
                        isApproved || !isRejected
                          ? "text-orange-600 hover:bg-orange-50 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed opacity-50"
                      }`}
                  >
                    <FileWarning className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    ต้องการเพิ่มเติม
                  </div>
                </div> */}
              </div>
            </div>
          )}
        </td>

        {/* Image */}
        <td className="px-3 py-4 text-center sticky left-40 bg-white z-10 border-r w-32">
          {previewUrls[doc.kyc_doc_id] ? (
            <img
              src={previewUrls[doc.kyc_doc_id]}
              alt="preview"
              className="w-20 h-20 object-contain cursor-pointer transition-transform mx-auto"
              style={{
                transform: `rotate(${rotationAngles[doc.kyc_doc_id] ?? 0}deg)`,
              }}
              onClick={() => onOpenPopup(doc)}
            />
          ) : doc.kyc_doc_id > 0 && doc.status !== "required" ? (
            <img
              src={`/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}${imageTimestamps[doc.kyc_doc_id] ? `&t=${imageTimestamps[doc.kyc_doc_id]}` : ''}`}
              alt="doc"
              className="w-20 h-20 object-contain cursor-pointer transition-transform mx-auto"
              style={{
                transform: `rotate(${rotationAngles[doc.kyc_doc_id] ?? savedRotationAngles[doc.kyc_doc_id] ?? 0}deg)`,
              }}
              onClick={() => onOpenPopup(doc)}
            />
          ) : (
            <div
              className="text-center text-gray-500 cursor-pointer"
              onClick={() => onOpenPopup(doc)}
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
            disabled={isApproved || isRejected}
          >
            <option value="" disabled>
              Document Role
            </option>
            <option value={`selfie`}>Selfie</option>
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
            className={`select select-ui w-full `}
            value={ docType === 0 ? "" : String(docType)}
            onChange={(e) => setDocType(Number(e.target.value))}
            disabled={ isApproved || isRejected}
          >
            <option value="" >
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
            disabled={  isApproved || isRejected}
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
            disabled={isSelfie || isApproved || isRejected}
          />
        </td>

        {/* Issued Date */}
        <td className="px-3 py-4">
          <DateFieldWithPicker
            textValue={issuedDateInput}
            selectedDate={issuedDate.startDate}
            onTextChange={(raw) => handleMaskedDateChange(raw, true)}
            onCalendarSelect={(date) => applyDateValue(date, true)}
            disabled={isSelfie || isApproved || isRejected}
            placeholder="DD/MM/YYYY"
          />
        </td>

        {/* Expired Date */}
        <td className="px-3 py-4">
          <DateFieldWithPicker
            textValue={expiredDateInput}
            selectedDate={expiredDate.startDate}
            onTextChange={(raw) => handleMaskedDateChange(raw, false)}
            onCalendarSelect={(date) => applyDateValue(date, false)}
            disabled={isSelfie || isApproved || isRejected}
            placeholder="DD/MM/YYYY"
          />
        </td>

        {/* Issue Country */}
        <td className="px-3 py-4">
          <select
            className="select select-ui w-full"
            value={issue_country === "" ? "" : issue_country}
            onChange={(e) => setIssueCountry(e.target.value)}
            disabled={isSelfie ||  isApproved || isRejected}
          >
            <option value="" disabled>
              Issue Country
            </option>
            {currentNationalityOptions?.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </td>

        {/* ICT Mapping */}
        <td className="px-3 py-4">
          <select
            className="select select-ui w-full"
            value={ictId === 0 ? "" : String(ictId)}
            onChange={(e) => setICTID(Number(e.target.value))}
            disabled={isApproved || isRejected}>
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
                : status === "Approved by Jadepay"
                  ? "bg-green-100 text-green-800"
                  : status === "reject"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
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
    </>
  );
};

export default DocumentRow;
