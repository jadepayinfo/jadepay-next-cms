import InputCustom from "@/components/input/input";
import TextareaCustom from "@/components/input/textarea";
import { uploadImage } from "@/lib/upload_image";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Customer } from "@/model/customer";
import { PayloadTopicNotification } from "@/model/notification";
import { MasConfigItem } from "@/model/mas_config";

interface Props {}

type SelectOption = {
  value: string;
  label: string;
};

const SingleContainer: NextPage<Props> = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [attachedImage, setAttachedImage] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // DDL Lang
  const [langList, setLangList] = useState<SelectOption[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const handleSearchCustomer = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter search query");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    try {
      let params = `page=1&limit=10`;
      params += `&mobile_no=${searchQuery}`;

      const response = await axios.get(`/api/customer/list?${params}`);


      if (response.data.success && response.data.data) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
        alert("No customers found");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to search customers. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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
      setAttachedImage(uploadedUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setAttachedImage("");
  };

  const handleCreate = async () => {
    // Validation
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }
    if (!selectedLang) {
      alert("Please select a language");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      // Prepare payload
      const payload: PayloadTopicNotification = {
        specific_users: [selectedCustomer.mobile_no],
        image_url: attachedImage || null,
        default_language: selectedLang,
        detail: {
          [selectedLang]: {
            subject: title,
            description: message,
          },
        },
      };

      console.log("Payload to send:",  JSON.stringify(payload));

      const response = await axios.post(
        "/api/notification/multi-cast-notification",
        payload
      );

      if (response.data.success) {
        alert("Notification sent successfully!");
        // Reset form
        setTitle("");
        setMessage("");
        setAttachedImage("");
        setSelectedCustomer(null);
        setSelectedLang(null);
        // Optionally redirect to list page
        // router.push("/notification");
      } else {
        alert("Failed to send notification");
      }
    } catch (error: any) {
      console.error("Send notification failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send notification. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const loadLangOptions = async () => {
     if (optionsLoaded) return;
      try {
        const response = await axios.get(`/api/masconfig/get-congig-by-group`, {
              params: {
                config_group: "notification_lang",
              },
            });

         const LangOption: SelectOption[] = (
                  Object.values(response.data) as MasConfigItem[]
                )
                .filter((item) => item.config_values && item.config_name) // Filter out empty values
                .map((item) => ({
                  value: item.config_values,
                  label: item.config_name ,
                }));

        setLangList(LangOption);
        setOptionsLoaded(true);     
      } catch (error) {
        console.error("Failed to load global options:", error);
      }
    };

    loadLangOptions();
  }, [optionsLoaded]);


  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Notification Details
      </h2>

      {/* Select Customer */}
      <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Select Customer
        </h3>

        <div className="mb-4">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="🔍 Search by name or phone number..."
              className="flex-1 px-4 py-3 border-solid border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              style={{ border: "1px solid #d1d5db" }}
              aria-label="Search customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchCustomer()}
            />
            <button
              onClick={handleSearchCustomer}
              disabled={isSearching}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4 space-y-2 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-2">
              Found {searchResults.length} customer(s):
            </p>
            {searchResults.map((customer, index) => (
              <div
                key={customer.customer_id || index}
                onClick={() => selectCustomer(customer)}
                className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {customer.mobile_no
                      ? customer.mobile_no
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {customer.fullname || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {customer.mobile_no || "N/A"} | Name:{" "}
                      {customer.fullname || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-xl text-gray-400">→</div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Customer */}
        {selectedCustomer && (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedCustomer.fullname
                  ? selectedCustomer.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedCustomer.fullname || "Unknown"}
                </p>
                <p className="text-sm text-gray-600">
                  📞 {selectedCustomer.mobile_no}
                </p>
              </div>
            </div>
            <div className="text-3xl text-green-500" aria-label="Selected">
              ✓
            </div>
          </div>
        )}
      </section>

      {/* Image Upload */}
      <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Add Image
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Size Recommendation: 800×600 px or 1200×630 px
        </p>

        {isUploadingImage ? (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 flex flex-col items-center justify-center bg-blue-50">
            <div className="text-6xl mb-4 animate-pulse" aria-hidden="true">
              ⏳
            </div>
            <p className="text-blue-600 font-medium mb-2">Uploading image...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        ) : !attachedImage ? (
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
            <div className="text-6xl mb-4" aria-hidden="true">
              🖼️
            </div>
            <p className="text-gray-600 font-medium mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload image"
              disabled={isUploadingImage}
            />
          </label>
        ) : (
          <div className="relative group w-full max-w-md">
            <div className="relative w-full h-64 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100">
              <img
                src={attachedImage}
                alt="Attached notification image"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={removeImage}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 font-semibold transition-colors"
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Language Selection */}
      <div>
        <label
          htmlFor="notification-language"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Language <span className="text-red-500">*</span>
        </label>
        <select
          id="notification-language"
          value={selectedLang || ""}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedLang(value || null);
          }}
          className="w-full px-4 py-3 border-solid border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
          style={{ border: "1px solid #d1d5db" }}
          required
        >
          <option value="">Select Language</option>
          {langList.map((lang, index) => (
            <option key={`${lang.value}-${index}`} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="notification-title"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <InputCustom
          name="title"
          title="Title"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Details */}
      <div>
        <label
          htmlFor="notification-details"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Details <span className="text-red-500">*</span>
        </label>
        <TextareaCustom
          title="Details"
          placeholder="Details"
          name="detail"
          value={message}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 150) {
              setMessage(value);
            }
          }}
          required
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex-1 mr-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(message.length / 150) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((message.length / 150) * 100)}% of message
            </p>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {message.length}/150
          </p>
        </div>
      </div>

      {/* Info Box */}
      {selectedCustomer && (
        <div
          className="bg-blue-50 border border-blue-400 rounded-lg p-4"
          role="status"
        >
          <p className="text-sm text-blue-900">
            💡 Message will be sent to {selectedCustomer.mobile_no}
            {attachedImage && " with 1 image"}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!title || !message || !selectedCustomer || !selectedLang || isSending}
          className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? "Sending..." : "Create"}
        </button>
      </div>
    </div>
  );
};

export default SingleContainer;
