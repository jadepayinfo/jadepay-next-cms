import { KycDocument } from "@/model/kyc";
import { Redo, Undo, Upload } from "lucide-react";
import { ChangeEvent, FC, useState } from "react";

interface Props {
  imageUrl: string;
  onClose: () => void;
  onSaveRotation?: (rotation: number) => void;
  onUpload?: (file: File) => void;
  isLoading?: boolean;
  document?: KycDocument;
  initialRotation?: number;
}

const ImagePopup: FC<Props> = ({
  imageUrl,
  onClose,
  onSaveRotation,
  onUpload,
  isLoading,
  document,
  initialRotation = 0,
}) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    imageUrl ?? undefined
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const rotateLeft = () => setRotation((prev) => prev - 90);
  const rotateRight = () => setRotation((prev) => prev + 90);

  const handleOk = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile); // 👈 ส่ง file จริงออกไป
    }
    if (onSaveRotation) onSaveRotation(rotation);
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md p-6 w-[90vw] max-w-3xl max-h-[90vh] flex flex-col relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
          disabled={isLoading}
        >
          ✕
        </button>

{document && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Document Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {document.document_no && (
                <div>
                  <p className="text-gray-500 font-medium">Document No.</p>
                  <p className="text-gray-900">{document.document_no}</p>
                </div>
              )}
              {document.issue_country && (
                <div>
                  <p className="text-gray-500 font-medium">Issue Country</p>
                  <p className="text-gray-900">{document.issue_country}</p>
                </div>
              )}
              {document.issued_date && (
                <div>
                  <p className="text-gray-500 font-medium">Issued Date</p>
                  <p className="text-gray-900">
                    {new Date(document.issued_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
              {document.expired_date && (
                <div>
                  <p className="text-gray-500 font-medium">Expired Date</p>
                  <p className="text-gray-900">
                    {new Date(document.expired_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-2 mb-2">
          <button
            onClick={rotateLeft}
            className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            <Undo className="w-5 h-5 text-green-600" />
          </button>
          <button
            onClick={rotateRight}
            className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            <Redo className="w-5 h-5 text-green-600" />
          </button>
          <label className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100 cursor-pointer">
            <Upload className="w-5 h-5 text-green-600 mr-1" />
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex-1 overflow-auto flex justify-center items-center">
          {isLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : previewUrl || imageUrl ? (
            <img
              src={previewUrl ?? imageUrl}
              alt="Document"
              className="max-w-[50%] max-h-[50%] object-contain"
              style={{ transform: `rotate(${rotation}deg)` }}
              draggable={false}
            />
          ) : (
            <div className="text-gray-400">No image selected</div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleOk}
            className="btn btn-primary btn-sm px-4 py-2"
            disabled={isLoading}
          >
            OK
          </button>
          <button
            onClick={onClose}
            className="btn btn-sm px-4 py-2 border"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;
