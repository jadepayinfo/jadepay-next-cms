import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CatalogueItem } from "@/model/catalogueItem";
import { FileText, FilePlus2, CheckCircle } from "lucide-react";
import { KycDocument } from "@/model/kyc";
import DocumentRow from "./DocumentRow"; // สร้างไฟล์ DocumentRow.tsx แยก

// Types
type SelectOption = {
  value: number;
  label: string;
};

interface Props {
  documents: KycDocument[];
  rotationAngles: Record<number, number>;
  previewUrls: Record<number, string>;
  country: string;
  openPopup: (docId: number) => Promise<void>;
  closePopup: () => void;
  saveRotation: (rotation: number) => void;
  handleSaveDocument: (doc: KycDocument, rotation: number) => void;
  handleDeleteDocument: (doc: KycDocument) => void;
  handleAddDocument: () => void;
  handleApproveDocument?: (doc: KycDocument) => Promise<void>;
  handleRejectDocument?: (doc: KycDocument, reason: string) => Promise<void>;
  handleInactiveDocument?: (doc: KycDocument, reason: string) => Promise<void>;
  handleReactivateDocument?: (doc: KycDocument) => Promise<void>;
  handleRequiredDocument?: (doc: KycDocument, reason: string) => Promise<void>;
}

// Helper Functions
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

const DocumentTable: React.FC<Props> = ({
  documents,
  rotationAngles,
  previewUrls,
  country,
  openPopup,
  closePopup,
  saveRotation,
  handleSaveDocument,
  handleDeleteDocument,
  handleAddDocument,
  handleApproveDocument,
  handleRejectDocument,
  handleInactiveDocument,
  handleReactivateDocument,
  handleRequiredDocument,
}) => {
  const [globalOptions, setGlobalOptions] = useState<{
    primary: SelectOption[];
    secondary: SelectOption[];
    additional: SelectOption[];
    ictMapping: SelectOption[];
    nationality: SelectOption[];
  }>({
    primary: [],
    secondary: [],
    additional: [],
    ictMapping: [],
    nationality: [],
  });
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  // multi approve
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const validationRefs = useRef<Record<number, () => { isValid: boolean; errors: string[] }>>({});

  // handlers approve
  const handleSelectDoc = (docId: number, checked: boolean) => {
    const newSelected = new Set(selectedDocs);
    if (checked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocs(newSelected);
    setSelectAll(newSelected.size === documents.length);
  };

  const handleSelectAll = (checked: boolean) => {
      if (checked) {
    // Filter เฉพาะเอกสารที่ไม่ใช่ approve
    const selectableIds = new Set(
      documents
        .filter(doc => doc.status !== "approve")
        .map(doc => doc.kyc_doc_id)
    );
    setSelectedDocs(selectableIds);
    setSelectAll(checked);
  } else {
    setSelectedDocs(new Set());
    setSelectAll(false);
  }
  };

  const handleBulkApprove = async () => {
    if (selectedDocs.size === 0) {
      alert("กรุณาเลือกเอกสารที่ต้องการอนุมัติ");
      return;
    }

    const selectedDocuments = documents.filter(doc => selectedDocs.has(doc.kyc_doc_id));
      const validationResults = selectedDocuments.map((doc, index) => {
      const validationFn = validationRefs.current[doc.kyc_doc_id];
      return {
        doc,
        index,
        validation: validationFn ? validationFn() : { isValid: false, errors: ["Cannot validate document"] }
      };
    });

    const invalidDocs = validationResults.filter(result => !result.validation.isValid);

    if (invalidDocs.length > 0) {
      const errorMessages = invalidDocs.map(result => 
        `เอกสาร ${result.index + 1}: ${result.validation.errors.join(", ")}`
      );
      
      alert(`ไม่สามารถอนุมัติได้ กรุณาแก้ไขข้อมูลต่อไปนี้:\n\n${errorMessages.join("\n")}`);
      return;
    }

    if (handleApproveDocument) {
      try {
        for (const doc of selectedDocuments) {
          await handleApproveDocument(doc);
        }
        setSelectedDocs(new Set());
        setSelectAll(false);
        alert(`อนุมัติเอกสารสำเร็จ ${selectedDocuments.length} รายการ`);
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการอนุมัติเอกสารบางรายการ โปรดติดต่อ admin");
      }
    }
  };

  
  // 🚀 Load options ครั้งเดียวตอน component mount
  useEffect(() => {
    const loadGlobalOptions = async () => {
      if (optionsLoaded) return;

      try {
        const mappedCountry = getCountryCode(country);
        const [
          resPrimary,
          resSecondary,
          resAdditional,
          respICTMapping,
          resNationality,
        ] = await Promise.all([
          axios.get(`/api/masconfig/get-catalogue`, {
            params: { config_key: "primary_document_" + mappedCountry },
          }),
          axios.get(`/api/masconfig/get-catalogue`, {
            params: { config_key: "secondary_document_" + mappedCountry },
          }),
          axios.get(`/api/masconfig/get-catalogue`, {
            params: { config_key: "additional_document_" + mappedCountry },
          }),
          axios.get(`/api/masconfig/get-catalogue`, {
            params: { config_key: "ict_mapping" },
          }),
          axios.get(`/api/masconfig/get-catalogue`, {
            params: { config_key: "country" },
          }),
        ]);

        const mapToOptions = (data: any): SelectOption[] =>
          (Object.values(data).filter(Boolean) as CatalogueItem[])
            .filter((item) => item?.id && item?.name_en)
            .map((item) => ({ value: item.id, label: item.name_en }));

        setGlobalOptions({
          primary: mapToOptions(resPrimary.data),
          secondary: mapToOptions(resSecondary.data),
          additional: mapToOptions(resAdditional.data),
          ictMapping: mapToOptions(respICTMapping.data),
          nationality: mapToOptions(resNationality.data),
        });

        setOptionsLoaded(true);
      } catch (error) {
        console.error("Failed to load global options:", error);
      }
    };

    loadGlobalOptions();
  }, [country, optionsLoaded]);

  return (
    <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-md mt-5">
      {/* Header */}
      <div className="flex items-center mb-4">
       <div className="flex items-center">
          <FileText className="w-5 h-5 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Documents</h2>          
          {/* {selectedDocs.size > 0 && (
            <span className="ml-2 text-sm text-blue-600">
              ({selectedDocs.size} selected)
            </span>
          )} */}
        </div>       

      </div>

      {/* Add Document Button */}
      <div className="mb-6">
        <button
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={handleAddDocument}
        >
          <FilePlus2 className="w-4 h-4 mr-2" />
          Add Document
        </button>
      </div>

      {selectedDocs.size > 0 && (
          <button
            onClick={handleBulkApprove}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
          Approve ({selectedDocs.size})
          </button>
        )}

      {/* Table */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-1 items-start">
        <div className="overflow-x-auto border border-gray-200 rounded-lg relative z-0">
          <table
            className="table-fixed w-full text-sm text-center border-collapse"
            style={{ minWidth: "1400px" }}
          >
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-12 px-3 py-3 border-b font-medium text-gray-700 sticky left-0 bg-gray-50 z-20 border-r">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="w-28 px-3 py-3 border-b font-medium text-gray-700 sticky left-12 bg-gray-50 z-20 border-r">
                  Action
                </th>
                <th className="w-32 px-3 py-3 border-b font-medium text-gray-700 sticky left-40 bg-gray-50 z-20 border-r">
                  Image
                </th>
                <th className="w-40 px-3 py-3 border-b font-medium text-gray-700">
                  Document Role
                </th>
                <th className="w-48 px-3 py-3 border-b font-medium text-gray-700">
                  Document Type
                </th>
                <th className="w-32 px-3 py-3 border-b font-medium text-gray-700">
                  Position
                </th>
                <th className="w-52 px-3 py-3 border-b font-medium text-gray-700">
                  Document No.
                </th>
                <th className="w-48 px-3 py-3 border-b font-medium text-gray-700">
                  Issued Date
                </th>
                <th className="w-48 px-3 py-3 border-b font-medium text-gray-700">
                  Expired Date
                </th>
                <th className="w-48 px-3 py-3 border-b font-medium text-gray-700">
                  Issued Country
                </th>
                <th className="w-48 px-3 py-3 border-b font-medium text-gray-700">
                  ICT Mapping
                </th>
                <th className="w-28 px-3 py-3 border-b font-medium text-gray-700">
                  Status
                </th>
                <th className="w-52 px-3 py-3 border-b font-medium text-gray-700">
                  Remark
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <DocumentRow
                  key={doc.kyc_doc_id}
                  doc={doc}
                  index={index}
                  country={country}
                  rotationAngles={rotationAngles}
                  previewUrls={previewUrls}
                  globalOptions={globalOptions}
                  optionsLoaded={optionsLoaded}
                  onSaveDocument={handleSaveDocument}
                  onOpenPopup={openPopup}
                  onApproveDocument={handleApproveDocument}
                  onRejectDocument={handleRejectDocument}
                  onInactiveDocument={handleInactiveDocument}
                  onReactivateDocument={handleReactivateDocument}
                  onRequiredDocument={handleRequiredDocument}
                  isSelected={selectedDocs.has(doc.kyc_doc_id)}
                  onSelectDoc={handleSelectDoc}
                  onValidateDocument={(fn) => {
          validationRefs.current[doc.kyc_doc_id] = fn;
        }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentTable;
