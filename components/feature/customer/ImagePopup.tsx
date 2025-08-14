import { Redo, Undo } from "lucide-react";
import { FC, useState } from "react";

interface Props {
  imageUrl: string;
  onClose: () => void;
  onSaveRotation?: (rotation: number) => void;
  isLoading?: boolean;
}

const ImagePopup: FC<Props> = ({ imageUrl, onClose, onSaveRotation, isLoading }) => {
  const [rotation, setRotation] = useState(0);

  const rotateLeft = () => setRotation((prev) => prev - 90);
  const rotateRight = () => setRotation((prev) => prev + 90);

  const handleOk = () => {
    if (onSaveRotation) onSaveRotation(rotation);
    onClose();
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
        </div>

        <div className="flex-1 overflow-auto flex justify-center items-center">
          {isLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <img
              src={imageUrl}
              alt="Document"
              className="max-w-full max-h-full object-contain"
              style={{ transform: `rotate(${rotation}deg)` }}
              draggable={false}
            />
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
