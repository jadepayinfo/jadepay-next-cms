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
  const form = formidable({ multiples: true });
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

    // Formidable v3+ returns files as array directly
    const fileArray = data.files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      throw new Error('No file uploaded');
    }

    const newFileName = `${file.filepath}.${file.originalFilename.split('.').pop()}`;

    fs.copyFileSync(file.filepath, newFileName)

    const formData = new FormData()
    formData.append('file', fs.createReadStream(newFileName))

    // Handle prefix field
    const prefix = data.fields?.prefix;
    const prefixValue = Array.isArray(prefix) ? prefix[0] : prefix;
    if (prefixValue != null) {
      formData.append('prefix', prefixValue)
    }

    const accessToken = req.cookies['token']
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      ...formData.getHeaders()
    }
    
    const response = await Backend.post(`/api/v1/upload/upload-image`, formData, { headers })
    fs.unlinkSync(newFileName)
    res.json(response.data)
  } catch (error: any) {
    console.error('Upload error:', error.response?.data || error.message)
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}
