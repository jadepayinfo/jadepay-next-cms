// pages/api/kyc/upload.ts
import formidable from "formidable";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { Backend } from "@/lib/axios";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // ปิด bodyParser เพื่อใช้ formidable แยก multipart/form-data เอง
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    // แยก multipart/form-data ออกมา
    const { fields, files } = await parseForm(req);
   
    // รับไฟล์ที่ client ส่งมา ชื่อฟิลด์เป็น "file" (ปรับตามจริง)
    const uploadedFile = files.file;
    if (!uploadedFile) {
      res.status(400).json({ message: "File is required" });
      return;
    }

    // formidable รองรับ single หรือ multiple files
    // ถ้าเป็น array ให้เอาตัวแรก (กรณี multiple=false ปกติจะไม่เป็น array)
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    // สร้างชื่อไฟล์ fallback กรณี originalFilename เป็น null หรือ undefined
    const filename = file.originalFilename || "file.jpg";

    // สร้าง FormData สำหรับส่งไป backend
    const formData = new FormData();

    // แนบไฟล์โดยใช้ fs.createReadStream
    formData.append("file", fs.createReadStream(file.filepath), filename);

    if (fields.kyc_doc_id) {
      const kycDocIdValue = Array.isArray(fields.kyc_doc_id) ? fields.kyc_doc_id[0] : fields.kyc_doc_id;
      if (kycDocIdValue) formData.append("kyc_doc_id", kycDocIdValue);
    }
   
    if (fields.config_id) {
      const configValue = Array.isArray(fields.config_id) ? fields.config_id[0] : fields.config_id;
      if (configValue) formData.append("config_id", configValue);
    }

    if (fields.position) {
      const positionValue = Array.isArray(fields.position) ? fields.position[0] : fields.position;
      if (positionValue) formData.append("position", positionValue);
    }

    if (fields.document_no) {
      const documentNoValue = Array.isArray(fields.document_no) ? fields.document_no[0] : fields.document_no;
      if (documentNoValue) formData.append("document_no", documentNoValue);
    }

    if (fields.issued_date) {
      const issuedDateValue = Array.isArray(fields.issued_date) ? fields.issued_date[0] : fields.issued_date;
      if (issuedDateValue) formData.append("issued_date", issuedDateValue);
    }

    if (fields.expired_date) {
      const expiredDateValue = Array.isArray(fields.expired_date) ? fields.expired_date[0] : fields.expired_date;
      if (expiredDateValue) formData.append("expired_date", expiredDateValue);
    }

    if (fields.ict_mapping) {
      console.log("ict_mapping  ==> ",fields.ict_mapping)
      const ictValue = Array.isArray(fields.ict_mapping) ? fields.ict_mapping[0] : fields.ict_mapping;
      if (ictValue) formData.append("ict_id", ictValue);
    }

    if (fields.action) {
      const actionValue = Array.isArray(fields.action) ? fields.action[0] : fields.action;
      if (actionValue) formData.append("action", actionValue);
    }

     if (fields.user_id) {
      const userIdValue = Array.isArray(fields.user_id) ? fields.user_id[0] : fields.user_id;
      if (userIdValue) formData.append("cus_id", userIdValue);
    }
    

    // รับ token จาก cookie หรือ header (แก้ตามจริง)
    const accessToken = req.cookies.token || req.headers.authorization || "";

    // เรียก API Backend Go
    const response = await Backend.post("/api/v1/kyc/upload-kyc-doc", formData, {
      headers: {
        Authorization: typeof accessToken === "string" ? `Bearer ${accessToken}` : "",
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity, // กันปัญหาไฟล์ใหญ่
    });

    // ส่งผลลัพธ์กลับ client
    res.status(response.status).json(response.data);

  } catch (error: any) {
    console.error("Upload API error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}
