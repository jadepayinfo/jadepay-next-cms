import { useState, useEffect } from "react";
import axios from "axios";
import { CatalogueItem } from "@/model/catalogueItem";
import { EddDocument } from "@/model/kyc";
import { FileText, FilePlus2, SendHorizontal, CheckCircle, Trash2 } from "lucide-react";

type SelectOption = {
  value: number;
  label: string;
};

interface Props {
  documents: EddDocument[];
  /** ประเทศลูกค้า (ict_id จาก nationality เช่น "MMR", "THA") ใช้โหลด document type ตาม additional_document_{mappedCountry} */
  country?: string;
  onRemarkChange?: (doc: EddDocument, value: string) => void;
  onAddDocument?: () => void;
  /** ส่งข้อมูลไป 3rd party API */
  onSend?: () => void;
  onApprove?: (doc: EddDocument) => Promise<void>;
  onDelete?: (doc: EddDocument) => Promise<void>;
  onIctMappingChange?: (doc: EddDocument, ictMappingId: number) => void;
  onDocumentTypeChange?: (doc: EddDocument, doctypeId: number) => void;
  onFileClick?: (doc: EddDocument) => void;
}

const getCountryCode = (country: string): string => {
  switch (country) {
    case "MMR":
      return "mm";
    case "THA":
      return "th";
    default:
      return "";
  }
};

const mapToOptions = (data: unknown): SelectOption[] =>
  (Object.values(data ?? {}).filter(Boolean) as CatalogueItem[])
    .filter((item) => item?.id != null && item?.name_en)
    .map((item) => ({ value: item.id, label: item.name_en }));

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** ชื่อไฟล์สำหรับแสดง (document_no, ถ้าว่างใช้ doc_type แทน) */
const getDocDisplayName = (doc: EddDocument, fallback: string): string =>
  doc.document_no ||
  doc.url?.split("/").pop()?.split("?")[0] ||  
  doc.doc_type ||
  fallback;

/** เรียงเอกสารตามเดือน (upload_date) จากเก่าไปใหม่ แล้วคืน array พร้อมลำดับ (ไม่มีวันที่อยู่ท้าย) */
const sortByMonth = (
  docs: EddDocument[]
): { doc: EddDocument; order: number }[] => {
  const withDate = docs.map((doc) => ({
    doc,
    time: doc.updated_at
      ? new Date(doc.updated_at).getTime()
      : Number.POSITIVE_INFINITY,
  }));
  withDate.sort((a, b) => a.time - b.time);
  return withDate.map((item, index) => ({ doc: item.doc, order: index + 1 }));
};

const EDDDocumentTable: React.FC<Props> = ({
  documents,
  country = "",
  onRemarkChange,
  onAddDocument,
  onSend,
  onApprove,
  onDelete,
  onIctMappingChange,
  onDocumentTypeChange,
  onFileClick,
}) => {
  const mappedCountry = getCountryCode(country);
  /** แสดงเฉพาะเอกสารที่ document_category = EDD */
  const eddOnlyDocs = documents.filter(
    (doc) => doc.document_category === "EDD"
  );

  const [ictMappingOptions, setIctMappingOptions] = useState<SelectOption[]>([]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState<SelectOption[]>(
    []
  );
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  useEffect(() => {
    setOptionsLoaded(false);
  }, [mappedCountry]);

  useEffect(() => {
    const loadOptions = async () => {
      if (optionsLoaded) return;
      try {
        const ictPromise = axios.get(`/api/masconfig/get-catalogue`, {
          params: { config_key: "ict_mapping" },
        });
        const docTypePromise = mappedCountry
          ? axios.get(`/api/masconfig/get-catalogue`, {
              params: {
                config_key: "additional_document_" + mappedCountry,
              },
            })
          : Promise.resolve({ data: {} });
        const [resIct, resDocType] = await Promise.all([
          ictPromise,
          docTypePromise,
        ]);
        setIctMappingOptions(mapToOptions(resIct.data));
        setDocumentTypeOptions(mapToOptions(resDocType.data));
        setOptionsLoaded(true);
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    };
    loadOptions();
  }, [optionsLoaded, mappedCountry]);


  return (
    <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-md mt-5 min-w-0">
      {/* Header */}
      <div className="flex items-center mb-4">
        <FileText className="w-5 h-5 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Edd Document</h2>
      </div>

      {/* Add Document Button */}
      <div className="mb-4">
        <button
          type="button"
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={onAddDocument}
        >
          <FilePlus2 className="w-4 h-4 mr-2" />
          Add EDD document
        </button>
      </div>

      {/* Table - scroll แนวนอนเมื่อกว้างเกิน */}
      <div className="grid grid-cols-1 min-w-0">
        <div className="overflow-x-auto border border-gray-200 rounded-lg relative z-0 min-w-0">
          <table
            className="w-full text-sm text-center border border-gray-200"
            style={{ minWidth: "1100px" }}
          >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700 w-14">
                ลำดับ
              </th>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700 text-left">
                File
              </th>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700">
                Document Type
              </th>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700">
                Upload Date
              </th>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700">
                ict mapping
              </th>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700 text-left">
                Key pass
              </th>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700">
                Action
              </th>
              <th className="px-3 py-3 border border-gray-200 font-medium text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {eddOnlyDocs.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-gray-500 border border-gray-200"
                >
                  ไม่มีเอกสาร EDD
                </td>
              </tr>
            ) : (
              sortByMonth(eddOnlyDocs).map(({ doc, order }, index) => {
                const isApproved = doc.status === "approved";
                const isReadyToApprove =
                  !isApproved &&
                  doc.doctype_id !== 0 &&
                  doc.ict_mapping_id !== 0;
                return (
                <tr
                  key={doc.kyc_doc_id || `edd-row-${index}`}
                  className={`${isApproved ? "bg-gray-100 opacity-75" : "hover:bg-gray-50"}`}
                >
                  <td className="px-3 py-3 border border-gray-200 font-medium">
                    {order}
                  </td>
                  <td className="px-3 py-3 border border-gray-200 text-left">
                    {doc.kyc_doc_id > 0 ? (
                      <button
                        type="button"
                        className={`block w-full text-left ${isApproved ? "text-gray-600 hover:text-blue-600 hover:underline" : "text-blue-600 hover:text-blue-800 hover:underline"}`}
                        onClick={async () => {
                          try {
                            const url = `/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}`;
                            const res = await fetch(url, { credentials: "same-origin" });
                            if (!res.ok) throw new Error(res.statusText);
                            const blob = await res.blob();
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, "_blank", "noopener,noreferrer");
                          } catch (e) {
                            console.error(e);
                            window.open(`/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}`, "_blank");
                          }
                        }}
                      >
                        {getDocDisplayName(doc, `file ${index + 1}`)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`block w-full text-left ${isApproved ? "text-gray-500 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 hover:underline"}`}
                        onClick={() => !isApproved && onFileClick?.(doc)}
                        disabled={isApproved}
                      >
                        {getDocDisplayName(doc, `file ${index + 1}`)}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <select
                      className="select select-ui w-full min-w-[120px]"
                      value={
                        doc.doctype_id === 0 ? "" : String(doc.doctype_id)
                      }
                      onChange={(e) =>
                        onDocumentTypeChange?.(doc, Number(e.target.value) || 0)
                      }
                      disabled={isApproved}
                    >
                      <option value="" disabled>
                        Document Type
                      </option>
                      {optionsLoaded &&
                        documentTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <select
                      className="select select-ui w-full min-w-[120px]"
                      value={doc.ict_mapping_id === 0 ? "" : String(doc.ict_mapping_id)}
                      onChange={(e) =>
                        onIctMappingChange?.(doc, Number(e.target.value) || 0)
                      }
                      disabled={isApproved}
                    >
                      <option value="" disabled>
                        ICT Mapping
                      </option>
                      {optionsLoaded &&
                        ictMappingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 border border-gray-200 text-left">
                    <input
                      type="text"
                      className="w-full min-w-[120px] min-h-[40px] text-left px-2 py-2.5 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      style={{ border: "1px solid #d1d5db" }}
                      placeholder="Key pass"
                      value={doc.remark ?? ""}
                      onChange={(e) => onRemarkChange?.(doc, e.target.value)}
                      disabled={isApproved}
                    />
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      {onApprove && (
                        <button
                          type="button"
                        className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                          isApproved
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : isReadyToApprove
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          !isApproved && isReadyToApprove && onApprove(doc)
                        }
                        disabled={!isReadyToApprove}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                            isApproved
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                          onClick={() => !isApproved && onDelete(doc)}
                          disabled={isApproved}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 border border-gray-200">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        doc.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {doc.status ?? "pending"}
                    </span>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Send to 3rd party API */}
      <div className="mt-4">
        <button
          type="button"
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={onSend}
        >
          <SendHorizontal className="w-4 h-4 mr-2" />
          Send
        </button>
      </div>
    </div>
  );
};

export default EDDDocumentTable;
