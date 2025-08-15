import { useRef, useState } from "react";
import DocumentRow from "./DocumentRow";
import ImagePopup from "./ImagePopup";
import { FileText ,FilePlus2} from "lucide-react";
import { KycDocument } from "@/model/kyc";
import { ButtonOutline } from "@/components/buttons";

interface Props {
  documents: KycDocument[];
  rotationAngles: Record<number, number>;
   previewUrls: Record<number, string>;
  openPopup: (docId: number) => Promise<void>;
  closePopup: () => void;
  saveRotation: (rotation: number) => void;
  handleSaveDocument: (doc: KycDocument, rotation: number) => void;
  handleDeleteDocument: (doc: KycDocument) => void;
  handleAddDocument: () => void;
}

const DocumentTable: React.FC<Props> = ({
  documents,
  rotationAngles,
  previewUrls,
  openPopup,
  closePopup,
  saveRotation,
  handleSaveDocument,
  handleDeleteDocument,
  handleAddDocument,
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
        <br/>  
      </div>

<div className="px-4 pb-4">
  <ButtonOutline
    className="h-[40px] border border-[--border-color] rounded-md mt-4"
    onClick={handleAddDocument}
  >
    <FilePlus2 />
  </ButtonOutline>
</div>
    

      {/* wrapper scroll รอบ table */}
      <div className="overflow-x-auto  w-full max-w-full">
      
      <table className="table table-xs w-full table-fixed table-pin-rows table-pin-cols text-center">
    
    <thead>
      <tr>
             <th className="w-10">#</th>
              <th className="w-32">Image</th>
              <th className="w-40">Document Role</th>
              <th className="w-48">Document Type</th>
              <th className="w-32">Position</th>
              <th className="w-40">Document No.</th>
              <th className="w-40">Issued Date</th>
              <th className="w-40">Expired Date</th>
              <th className="w-48">ICT mapping</th>
              <th className="w-24">Status</th>
              <th className="w-48">Action</th>
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
                previewUrl={previewUrls[doc.kyc_doc_id]}
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
