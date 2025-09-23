export type ImageType = File | string | undefined;

export type UploadImage = {
  fileUrl: string;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string;
}
