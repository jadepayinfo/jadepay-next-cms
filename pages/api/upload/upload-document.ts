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

const parseForm = (req:NextApiRequest) => {
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

    const file = data.files.file?.[0];

    const newFileName = file ? `${file.filepath}.${file.originalFilename.split('.').pop()}` : null;

    if (!file || !newFileName) {
      return res.status(400).json({ success: false, message: 'ไม่ได้อัปโหลดไฟล์' });
    }

    fs.copyFileSync(file.filepath, newFileName)

    const formData = new FormData()
    formData.append('file', fs.createReadStream(newFileName))

    if (data.fields?.prefix?.[0] != null) {
      formData.append('prefix', data.fields.prefix[0])
    }

    // เพิ่มการจัดการ Field 'step' ถ้ามี
    if (data.fields?.step?.[0] != null) {
      formData.append('step', data.fields.step[0]);
    }


    const accessToken = req.cookies['token']

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      ...formData.getHeaders()
    }
    // const response = await Backend.post(`/api/v1/kyc/upload-kyc-doc`, formData, { headers })
    // console.log("Backend Response:", response.data); // Log Response ที่ได้จาก Backend
    // fs.unlinkSync(newFileName)
    // res.json(response.data)
    res.json("")
  } catch (error: any) {
    console.log('upload', error)
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}