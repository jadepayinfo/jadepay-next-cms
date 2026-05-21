import axios from "axios";

const extractUploadUrl = (payload: unknown): string => {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const candidates = ["url", "location", "s3_location", "path", "file_url"];
    for (const key of candidates) {
      if (typeof obj[key] === "string" && (obj[key] as string).trim()) {
        return (obj[key] as string).trim();
      }
    }
  }

  throw new Error("Invalid upload response: missing file URL");
};

export const uploadImage = async (file: File, prefix?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (prefix) formData.append('prefix', `${prefix}`);

    const response = await axios.post('/api/upload/upload-image', formData);

    const data = response.data?.data ?? response.data;
    return extractUploadUrl(data);
};

export const base64ToFile = (base64String: string, filename: string): File | null => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    try {
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error creating File:", error);
      return null;
    }
  };