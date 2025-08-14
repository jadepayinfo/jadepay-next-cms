import { useRef, useState } from "react";
import DocumentRow from "./DocumentRow";
import ImagePopup from "./ImagePopup";
import { FileText } from "lucide-react";
import { KycDocument } from "@/model/kyc";

interface Props {
  documents: KycDocument[];
  nationality: number;
  rotationAngles: Record<number, number>;
  openPopup: (docId: number) => Promise<void>;
  closePopup: () => void;
  saveRotation: (rotation: number) => void;
  handleSaveDocument: (doc: KycDocument, rotation: number) => void;
  handleDeleteDocument: (doc: KycDocument) => void;
}

const DocumentTable: React.FC<Props> = ({
  documents,
  nationality,
  rotationAngles,
  openPopup,
  closePopup,
  saveRotation,
  handleSaveDocument,
  handleDeleteDocument,
}) => {
  const idNoRefs = useRef<Record<string, HTMLInputElement>>({});
  const issueDateRefs = useRef<Record<string, HTMLInputElement>>({});
  const expireDateRefs = useRef<Record<string, HTMLInputElement>>({});

  const [popupImageUrl, setPopupImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  return (
    <div className="bg-[--bg-panel] border border-[--border-color] rounded-md mt-5 w-full">
      <div className="flex items-center mb-4 px-4 py-2">
        <FileText className="w-5 h-5 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
      </div>

      {/* wrapper scroll รอบ table */}
      <div className="overflow-x-auto w-full">
        <table className="table-auto w-max divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-2 py-2 min-w-[3rem] text-center">#</th>
              <th className="px-2 py-2 min-w-[6rem] text-center">Image</th>
              <th className="px-2 py-2 min-w-[10rem] text-center">Document Role</th>
              <th className="px-2 py-2 min-w-[10rem] text-center">Document Type</th>
              <th className="px-2 py-2 min-w-[8rem] text-center">Position</th>
              <th className="px-2 py-2 min-w-[12rem] text-center">Document No.</th>
              <th className="px-2 py-2 min-w-[12rem] text-center">Issued Date</th>
              <th className="px-2 py-2 min-w-[12rem] text-center">Expired Date</th>
              <th className="px-2 py-2 min-w-[10rem] text-center">ICT mapping</th>
              <th className="px-2 py-2 min-w-[6rem] text-center">Status</th>
              <th className="px-2 py-2 min-w-[12rem] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <DocumentRow
                key={doc.kyc_doc_id}
                index={index}
                doc={{ ...doc, rotationAngle: rotationAngles[doc.kyc_doc_id] ?? 0 }}
                idNoRefs={idNoRefs}
                issueDateRefs={issueDateRefs}
                expireDateRefs={expireDateRefs}
                country={""}
                documentRole={""}
                openPopup={() => openPopup(doc.kyc_doc_id)}
                handleSaveDocument={handleSaveDocument}
                handleDeleteDocument={handleDeleteDocument}
              />
            ))} 
          </tbody>
        </table>
      </div>

      {/* popup ไม่อยู่ใน scroll */}
      {popupImageUrl && (
        <ImagePopup
          imageUrl={popupImageUrl}
          onClose={closePopup}
          onSaveRotation={saveRotation}
          isLoading={isImageLoading}
        />
      )}
    </div>
  );
};

export default DocumentTable;
