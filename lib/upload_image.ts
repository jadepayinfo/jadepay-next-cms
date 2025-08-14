import axios from "axios";

export const uploadImage = async (file: File, prefix?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (prefix) formData.append('prefix', `${prefix}`);
    const response = await axios.post('/api/upload', formData);
    const { s3_location } = response.data.data;
    return s3_location ?? '';
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