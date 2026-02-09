/**
 * EDD Upload Document API
 * Client เรียก route นี้ (pages/api/edd/) ก่อน แล้ว route นี้ค่อย forward ไปที่ backend จริง /api/v1/edd/upload-edd-doc
 */
import formidable from "formidable";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { Backend } from "@/lib/axios";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest) => {
  const form = formidable({ multiples: false });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const { fields, files } = await parseForm(req);
    const formData = new FormData();

    const uploadedFile = files.file;
    if (uploadedFile) {
      const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      const filename = file.originalFilename || "file.jpg";
      formData.append("file", fs.createReadStream(file.filepath), filename);
    }

    const kycDocValue = Array.isArray(fields.kyc_doc_id)
    ? fields.kyc_doc_id[0]
    : fields.kyc_doc_id;
  if (kycDocValue) formData.append("kyc_doc_id", String(kycDocValue));

    const configValue = Array.isArray(fields.config_id)
      ? fields.config_id[0]
      : fields.config_id;
    if (configValue) formData.append("config_id", String(configValue));

    const userIdValue = Array.isArray(fields.user_id)
      ? fields.user_id[0]
      : fields.user_id;
    if (userIdValue) formData.append("user_id", String(userIdValue));

    const keyPassValue = Array.isArray(fields.key_pass)
      ? fields.key_pass[0]
      : fields.key_pass;
    if (keyPassValue != null) formData.append("key_pass", String(keyPassValue));

    const statusValue = Array.isArray(fields.status)
      ? fields.status[0]
      : fields.status;
    if (statusValue != null) formData.append("status", String(statusValue));

    

    const accessToken =
      (req.cookies.token as string) ||
      (req.headers.authorization as string) ||
      "";

    const response = await Backend.post(
      "/api/v1/edd/upload-edd-doc",
      formData,
      {
        headers: {
          Authorization:
            typeof accessToken === "string"
              ? `Bearer ${accessToken}`
              : "",
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error("EDD upload API error:", error);
    const status = error.response?.status ?? 500;
    const message =
      error.response?.data?.message ?? error.message ?? "Internal Server Error";
    res.status(status).json({ message });
  }
}
