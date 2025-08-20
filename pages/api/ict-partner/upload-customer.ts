import FormData from 'form-data'
import fs from 'fs'
import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next"
import { Backend } from "@/lib/axios";

export const config = {
  api: {
    bodyParser: false,
  },
}

const parseForm = (req: NextApiRequest) => {
  const form = formidable();
  return new Promise<any>(
    function (resolve, reject) {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      })
    })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await parseForm(req);
    console.log("Data from parseForm:", data);

    const file = data.files.file?.[0];
    console.log("File object:", file);

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'ไม่ได้อัปโหลดไฟล์' 
      });
    }

    // สร้างชื่อไฟล์ใหม่
    const newFileName = `${file.filepath}.${file.originalFilename.split('.').pop()}`;
    console.log("New filename:", newFileName);

    // คัดลอกไฟล์
    fs.copyFileSync(file.filepath, newFileName);

    // เตรียม FormData สำหรับส่งต่อ
    const formData = new FormData();
    formData.append('file', fs.createReadStream(newFileName));
    
    // เพิ่ม field type ถ้ามี
    if (data.fields?.type?.[0] != null) {
      formData.append('type', data.fields.type[0]);
      console.log("Type field value:", data.fields.type[0]);
    }

    console.log("FormData prepared for Backend");

    // เตรียม headers
    const accessToken = req.cookies['token'];
    console.log("AccessToken:", accessToken);

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      ...formData.getHeaders()
    };

    // Generate job ID
    const jobId = `upload_${Date.now()}`;
    
    // ส่งไฟล์ไป backend แบบ async (fire and forget)
    setImmediate(async () => {
      try {
        console.log(`[${jobId}] Starting background upload to ICT`);
        
        const response = await Backend.post(`/api/v1/ict-partner/upload-user`, formData, { headers });
        
        console.log(`[${jobId}] Backend Response:`, response.data);
        
        // ลบไฟล์ temp หลังส่งเสร็จ
        fs.unlinkSync(newFileName);
        console.log(`[${jobId}] Temp file cleaned up`);
        
      } catch (error: any) {
        console.error(`[${jobId}] Backend upload failed:`, error.message);
        
        // ลบไฟล์ temp แม้จะ error
        try {
          fs.unlinkSync(newFileName);
        } catch (cleanupError) {
          console.error(`[${jobId}] Failed to cleanup:`, cleanupError);
        }
      }
    });

    // ตอบกลับทันที (ไม่รอ backend)
    res.json({
      success: true,
      message: "File uploaded successfully and processing in background",
      job_id: jobId,
      status: "accepted"
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).send({
      success: false,
      message: error.message ?? "Internal Server Error",
    });
  }
}