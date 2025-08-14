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

    // แนบฟิลด์อื่น ๆ ถ้ามี และต้องแน่ใจว่าไม่ใช่ null/undefined
    if (fields.config) {
      // fields.config อาจเป็น string หรือ string[]
      const configValue = Array.isArray(fields.config) ? fields.config[0] : fields.config;
      if (configValue) formData.append("config", configValue);
    }

    if (fields.position) {
      const positionValue = Array.isArray(fields.position) ? fields.position[0] : fields.position;
      if (positionValue) formData.append("position", positionValue);
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
