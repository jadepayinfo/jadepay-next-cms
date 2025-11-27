import { uploadImage } from "@/lib/upload_image";
import { NextPage } from "next";
import { ChangeEvent, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import withAuth from "@/hoc/with_auth";
import { parse } from "csv-parse/browser/esm/sync";

interface Props {}

const BroadcastFromFIleContainer: NextPage<Props> = (props) => {
  const router = useRouter();

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [broadcastImages, setBroadcastImages] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // CSV functions
  const handleCSVUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setCsvFile(file);
      // Parse CSV with proper handling of quotes and commas
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const records = parse(text, {
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true,
          });
          console.log("Parsed CSV rows:", records);
          setCsvData(records);
          setCsvPreview(records);
        } catch (error) {
          console.error("CSV parsing error:", error);
          alert("Failed to parse CSV file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const removeCSVFile = () => {
    setCsvFile(null);
    setCsvData([]);
    setCsvPreview([]);
  };
  const downloadTemplate = () => {
    const template = "phone,title,message\n6690xxxxxxx,Hello,Hello customer";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notification_template.csv";
    a.click();
  };

  const handleBroadcastImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Check file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only PNG, JPG files");
      e.target.value = ""; // Reset input
      return;
    }

    // Check file size (5MB = 10 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(
        `File size exceeds 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
      e.target.value = ""; // Reset input
      return;
    }
    setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadImage(file);
      setBroadcastImages(uploadedUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeBroadcastImage = () => {
    setBroadcastImages("");
  };

  const handleCreate = async () => {
    // Validation
    if (!csvFile || csvData.length < 2) {
      alert("Please upload a CSV file with at least one customer");
      return;
    }

    // Parse CSV data (skip header row)
    const customers = csvData
      .slice(1)
      .filter((row) => row.length >= 3 && row[0].trim());

    if (customers.length === 0) {
      alert("No valid customer data found in CSV file");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to send personalized notifications to ${customers.length} customer(s)?`
    );
    if (!confirmed) return;

    setIsSending(true);

    try {
      // Prepare arrays for batch sending
      const phoneNumbers: string[] = [];
      const subjects: string[] = [];
      const descriptions: string[] = [];

      customers.forEach(([phone, title, message]) => {
        phoneNumbers.push(phone.trim());
        subjects.push(title.trim());
        descriptions.push(message.trim());
      });

      // Send all notifications in one API call
      const payload = {
        mode: "file",
        phoneNo: phoneNumbers,
        subject: subjects,
        description: descriptions,
        image: broadcastImages || undefined,
      };

      console.log("Sending batch notification from CSV:", payload);

      const response = await axios.post(
        "/api/notification/send_notification",
        payload
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        alert(
          `All notifications sent successfully!\n\n` +
            `✅ Sent to ${customers.length} customer(s)`
        );

        // Reset form
        setCsvFile(null);
        setCsvData([]);
        setCsvPreview([]);
        setBroadcastImages("");
      } else {
        alert("Failed to send notifications");
      }
    } catch (error: any) {
      console.error("Send broadcast from file failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send notifications. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Send Notification From CSV File
        </h2>

        {/* Instructions */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h3 className="text-base font-semibold text-yellow-900 mb-3">
            📋 CSV File Format:
          </h3>
          <ul className="space-y-2 text-sm text-yellow-900">
            <li>
              • Column 1: <strong>phone</strong> - Phone number (e.g.,
              0812345678)
            </li>
            <li>
              • Column 2: <strong>title</strong> - title text
            </li>
            <li>
              • Column 3: <strong>message</strong> - Message text
            </li>
            <li>
              • First row should be header:{" "}
              <code className="bg-yellow-100 px-2 py-1 rounded">
                phone,title,message
              </code>
            </li>
          </ul>
          <button
            onClick={downloadTemplate}
            className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors"
          >
            📥 Download Template CSV
          </button>
        </div>

        {/* Upload Area */}
        <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            1. Upload CSV File
          </h3>

          {!csvFile ? (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-16 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
              <div className="text-7xl mb-4">📁</div>
              <p className="text-gray-600 font-semibold text-lg mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">CSV file only</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">📄</div>
                </div>
                <button
                  onClick={removeCSVFile}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 font-semibold transition-colors"
                >
                  🗑️ Remove
                </button>
              </div>

              {/* Data Preview */}
              {csvPreview.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Preview of CSV Data:
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">
                            Message
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvPreview.slice(1, 4).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900">
                              {row[0]}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {row[1]}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {row[2]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvData.length > 4 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... and {csvData.length - 4} more rows
                    </p>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-400 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold">
                  📊 Summary: Found {csvData.length - 1} customer
                  {csvData.length - 1 > 1 ? "s" : ""} in the file
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  The system will automatically send messages according to the
                  file
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Attach Images */}
        <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Attach Images (Optional)
          </h3>

          {isUploadingImage ? (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 flex flex-col items-center justify-center bg-blue-50">
              <div className="text-6xl mb-4 animate-pulse" aria-hidden="true">
                ⏳
              </div>
              <p className="text-blue-600 font-medium mb-2">
                Uploading image...
              </p>
              <p className="text-sm text-gray-500">Please wait</p>
            </div>
          ) : !broadcastImages ? (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-gray-600 font-medium">Click to upload image</p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG up to 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleBroadcastImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative group w-full max-w-md">
              <div className="relative w-full h-64 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100">
                <img
                  src={broadcastImages}
                  alt="Attached notification image"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={removeBroadcastImage}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 font-semibold transition-colors"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Info */}
        {csvFile && (
          <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              ⚠️ Each customer will receive their own personalized message as
              specified in the CSV file
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {csvFile && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={removeCSVFile}
              disabled={isSending}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSending}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending
                ? "Sending..."
                : `📤 Send to ${csvData.length - 1} Customer${csvData.length - 1 > 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BroadcastFromFIleContainer;
