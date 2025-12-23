import { NextPage } from "next";
import InputCustom from "@/components/input/input";
import { ChangeEvent, useEffect, useState } from "react";
import { uploadImage } from "@/lib/upload_image";
import TextareaCustom from "@/components/input/textarea";
import axios from "axios";
import { useRouter } from "next/router";
import withAuth from "@/hoc/with_auth";
import { MasConfigItem } from "@/model/mas_config";
import {
  PayloadBroadCastNotification,
  PayloadTopicNotification,
} from "@/model/notification";

interface Props {}

type SelectOption = {
  value: string;
  label: string;
};

const BroadcastContainer: NextPage<Props> = (props) => {
  const router = useRouter();
  const [broadcastType, setBroadcastType] = useState("all");
  const [title, setTitle] = useState("");
  const [manualPhones, setManualPhones] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastImages, setBroadcastImages] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // DDL Lang
  const [langList, setLangList] = useState<SelectOption[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  // DDL Topic
  const [topicList, setTopicList] = useState<SelectOption[]>([]);
  const [selectTopic, setselectTopic] = useState<string | null>(null);

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

  const parsePhoneNumbers = (input: string): string[] => {
    return input
      .split(/[\n,]+/)
      .map((phone) => phone.trim())
      .filter((phone) => phone.length > 0);
  };

  const handleCreate = async () => {
    // Validation
    if (!selectedLang) {
      alert("Please select a language");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!broadcastMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    let phoneNumbers: string[] = [];

    if (broadcastType === "manual") {
      phoneNumbers = parsePhoneNumbers(manualPhones);
      if (phoneNumbers.length === 0) {
        alert("Please enter at least one phone number");
        return;
      }
    }

    if (broadcastType === "manual") {
      const confirmed = confirm(
        `Are you sure you want to send notification to ${phoneNumbers.length} recipient(s)?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(
        `Are you sure you want to send notification to all recipient(s)?`
      );
      if (!confirmed) return;
    }

    setIsSending(true);

    try {
      let response = null;
      if (broadcastType === "manual") {
        phoneNumbers = parsePhoneNumbers(manualPhones);
        const payload: PayloadTopicNotification = {
          specific_users: phoneNumbers,
          image_url: broadcastImages || null,
          default_language: selectedLang,
          detail: {
            [selectedLang]: {
              subject: title,
              description: broadcastMessage,
            },
          },
        };
        response = await axios.post(
          "/api/notification/multi-cast-notification",
          payload
        );
      } else {
        const payload: PayloadBroadCastNotification = {
          topic: selectTopic,
          image_url: broadcastImages || null,
          default_language: selectedLang,
          detail: {
            [selectedLang]: {
              subject: title,
              description: broadcastMessage,
            },
          },
        };

        response = await axios.post(
          "/api/notification/broadcast-notification",
          payload
        );
      }

      console.log("Response:", response?.data);

      if (response && response.data.success) {
        if (broadcastType === "manual") {
          alert(
            `Broadcast notification sent successfully to ${phoneNumbers.length} recipient(s)!`
          );
        } else {
          alert(`Broadcast notification sent successfully !`);
        }
        setTitle("");
        setBroadcastMessage("");
        setBroadcastImages("");
        setManualPhones("");
        setBroadcastType("all");
      } else {
        alert("Failed to send broadcast notification");
      }
    } catch (error: any) {
      console.error("Send broadcast failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send broadcast notification. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const loadLangOptions = async () => {
      if (optionsLoaded) return;
      try {
        const [responseLang, responseTopic] = await Promise.all([
          await axios.get(`/api/masconfig/get-congig-by-group`, {
            params: {
              config_group: "notification_lang",
            },
          }),
          await axios.get(`/api/masconfig/get-congig-by-group`, {
            params: {
              config_group: "notification_taget",
            },
          }),
        ]);

        const LangOption: SelectOption[] = (
          Object.values(responseLang.data) as MasConfigItem[]
        )
          .filter((item) => item.config_values && item.config_name) // Filter out empty values
          .map((item) => ({
            value: item.config_values,
            label: item.config_name,
          }));

        const TopicOption: SelectOption[] = (
          Object.values(responseTopic.data) as MasConfigItem[]
        )
          .filter((item) => item.config_values && item.config_name) // Filter out empty values
          .map((item) => ({
            value: item.config_values,
            label: item.config_name,
          }));

        setLangList(LangOption);
        setTopicList(TopicOption);
        setOptionsLoaded(true);
      } catch (error) {
        console.error("Failed to load global options:", error);
      }
    };

    loadLangOptions();
  }, [optionsLoaded]);

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Broadcast Notification
        </h2>

        {/* Select Recipients Type */}
        <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Select Recipients
          </h3>

          <div className="space-y-3">
            {/* Option 1: Send to All */}
            <label
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                broadcastType === "all"
                  ? "bg-green-50 border-green-500"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="broadcastType"
                value="all"
                checked={broadcastType === "all"}
                onChange={(e) => setBroadcastType(e.target.value)}
                className="w-5 h-5 text-green-500 mt-0.5 focus:ring-2 focus:ring-green-500"
              />
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-900">
                  Send to All Customers
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Send message to all customers in the system
                </p>
              </div>
            </label>
          </div>
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
              <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
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

          {/* Topic Selection */}
        <div>
          <label
            htmlFor="notification-language"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Customer Group <span className="text-red-500">*</span>
          </label>
          <select
            id="notification-language"
            value={selectTopic || ""}
            onChange={(e) => {
              const value = e.target.value;
              setselectTopic(value || null);
            }}
            className="w-full px-4 py-3 border-solid border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
            style={{ border: "1px solid #d1d5db" }}
            required
          >
            <option value="">Select customer group</option>
            {topicList.map((topic, index) => (
              <option key={`${topic.value}-${index}`} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>

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

        {/* Message */}
        <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Message (Same for all)
          </h3>

          <TextareaCustom
            value={broadcastMessage}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 150) {
                setBroadcastMessage(value);
              }
            }}
            placeholder="Enter message to send to all selected customers..."
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none outline-none"
            style={{ border: "1px solid #d1d5db" }}
            title={""}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex-1 mr-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(broadcastMessage.length / 150) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round((broadcastMessage.length / 150) * 100)}% of message
              </p>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {broadcastMessage.length}/150
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSending}
            className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!title || !broadcastMessage || isSending}
            className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send Broadcast"}
          </button>
        </div>
      </div>
    </>
  );
};

export default BroadcastContainer;
