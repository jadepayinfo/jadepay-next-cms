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
  FileWarning,
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
    nationality: SelectOption[];
  };
  optionsLoaded: boolean;
  isSelected?: boolean;
  onSaveDocument: (doc: KycDocument, rotation: number) => void;
  onOpenPopup: (docId: number) => Promise<void>;
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

const DocumentRow: React.FC<DocumentRowProps> = ({
  doc,
  index,
  country,
  rotationAngles,
  previewUrls,
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
  const issueDateRef = useRef<HTMLInputElement>(null);
  const expireDateRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequiredModal, setShowRequiredModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requiredReason, setRequiredReason] = useState("");

  // Document states
  const [docRole, setDocRole] = useState(() => {
    const initial = doc.document_info || "";
    return (
      initial.toLowerCase().replace(/ /g, "_") + "_" + getCountryCode(country)
    );
  });
  const [docType, setDocType] = useState(doc.doctype_id);
  const [docIdNo, setDocIdNo] = useState(doc.document_no ?? "");
  const [ictId, setICTID] = useState(doc.ict_mapping_id ?? 0);
  const [position, setPosition] = useState(doc.position || "");
  const [issue_country, setIssueCountry] = useState(doc.issue_country || "");

  // Date states
  const dateIssuedString = doc.issued_date ?? "";
  const dateExpiredString = doc.expired_date ?? "";
  const dateIssued = new Date(dateIssuedString);
  const dateExpired = new Date(dateExpiredString);
  const [issuedDate, setIssuedDate] = useState(() =>
    initStartDate(dateIssued.getTime() / 1000)
  );
  const [expiredDate, setExpiredDate] = useState(() =>
    initStartDate(dateExpired.getTime() / 1000)
  );

  const mappedCountry = getCountryCode(country);
  const isSelfie = docRole.includes("selfie");
  // Helper functions
  const getDocumentOptions = (docRole: string): SelectOption[] => {
    if (docRole.includes("primary")) return globalOptions.primary;
    else if (docRole.includes("secondary")) return globalOptions.secondary;
    else if (docRole.includes("additional")) return globalOptions.additional;
    else return [];
  };

  const formatDate = (date: Date | null | undefined): string | null => {
    if (!date) return null;
    return date.toISOString().split("T")[0];
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
      status: "review",
      issue_country: issue_country,
    };
    setHasUnsavedChanges(false);
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
          status: "approve",
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

      // ICT Mapping
      if (ictId === 0 && currentICTOptions.length > 0) {
        errors.push("กรุณาเลือก ICT Mapping");
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  // Status logic
  const status = doc.status;
  const isApproved = status === "approve";
  const isRejected = status === "reject";

  console.log("isRejected : ", isRejected);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const checkForChanges = () => {
    // check File
    let checkFile_Change = false;
    if (rotationAngles[doc.kyc_doc_id] != 0) {
      checkFile_Change = false;
    }

    //check control
    const currentData = {
      docRole,
      docType,
      position,
      docIdNo,
      ictId,
      issuedDate: formatDate(issuedDate.startDate),
      expiredDate: formatDate(expiredDate.startDate),
    };

    const originalData = {
      docRole:
        (doc.document_info || "").toLowerCase().replace(/ /g, "_") +
        "_" +
        getCountryCode(country),
      docType: doc.doctype_id,
      position: doc.position || "",
      docIdNo: doc.document_no ?? "",
      ictId: doc.ict_mapping_id ?? 0,
      issuedDate: formatDate(issuedDate.startDate),
      expiredDate: formatDate(expiredDate.startDate),
    };

    const hasChanges =
      JSON.stringify(currentData) !== JSON.stringify(originalData);
    if (hasChanges || checkFile_Change) {
      setHasUnsavedChanges(true);
      clearcontrol();
    } else {
      setHasUnsavedChanges(false);
    }
    return hasChanges;
  };

  const clearcontrol = () => {
    setDocType(0);
    setDocIdNo("");
    setPosition("");
    const dateTemp = new Date("");
    setIssuedDate(initStartDate(dateTemp.getTime() / 1000));
    setExpiredDate(initStartDate(dateTemp.getTime() / 1000));
  };

  useEffect(() => {
    checkForChanges();
  }, [
    docRole,
    docType,
    position,
    docIdNo,
    ictId,
    issuedDate,
    expiredDate,
    rotationAngles[doc.kyc_doc_id],
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
          {status === "approve" ? (
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
                      // className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      disabled={isApproved || isRejected}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isApproved || !isRejected
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
                  <div className="relative group">
                    <button
                      onClick={openRejectModal}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      ปฏิเสธเอกสาร
                    </div>
                  </div>
                )}
                <div className="relative group">
                  <button
                    onClick={openRequiredModal}
                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <FileWarning className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    ต้องการเพิ่มเติม
                  </div>
                </div>
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
            disabled={isApproved}
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
            className={`select select-ui w-full ${isSelfie ? "opacity-50 cursor-not-allowed" : ""}`}
            value={isSelfie ? "" : docType === 0 ? "" : String(docType)}
            onChange={(e) => setDocType(Number(e.target.value))}
            disabled={isSelfie || isApproved}
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
            disabled={isSelfie || isApproved}
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
            disabled={isSelfie || isApproved}
          />
        </td>

        {/* Issued Date */}
        <td className="px-3 py-4">
          <div className="relative">
            <input
              ref={issueDateRef}
              type="date"
              className={`relative w-full flex items-center border py force-light-background rounded-md ${
                isSelfie || isApproved
                  ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                  : "border-[--border-color]"
              }`}
              style={
                isSelfie || isApproved
                  ? { border: "1px solid #e5e7eb", backgroundColor: "#f3f4f6" }
                  : { border: "1px solid #d1d5db" }
              }
              value={formatDate(issuedDate.startDate) || ""}
              onChange={(e) => handleDateChange(e.target.value, true)}
              disabled={isSelfie || isApproved}
            />
          </div>
        </td>

        {/* Expired Date */}
        <td className="px-3 py-4">
          <div className="relative">
            <input
              ref={expireDateRef}
              type="date"
              className={`relative w-full flex items-center border py force-light-background rounded-md ${
                isSelfie || isApproved
                  ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                  : "border-[--border-color]"
              }`}
              style={
                isSelfie || isApproved
                  ? { border: "1px solid #e5e7eb", backgroundColor: "#f3f4f6" }
                  : { border: "1px solid #d1d5db" }
              }
              value={formatDate(expiredDate.startDate) || ""}
              onChange={(e) => handleDateChange(e.target.value, false)}
              disabled={isSelfie || isApproved}
            />
          </div>
        </td>

        {/* Issue Country */}
        <td className="px-3 py-4">
          <select
            className="select select-ui w-full"
            value={issue_country === "" ? "" : issue_country}
            onChange={(e) => setIssueCountry(e.target.value)}
            disabled={isSelfie || isApproved}
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
            disabled={isSelfie || isApproved}
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
