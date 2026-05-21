import formidable from 'formidable';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Backend } from '@/lib/axios';
import FormData from 'form-data';

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

const getField = (fields: formidable.Fields, key: string): string | undefined => {
  const value = fields[key];
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.toString().trim() || undefined;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { id } = req.query;
    const { fields, files } = await parseForm(req);

    const uploadedFile = files.file;
    if (!uploadedFile) {
      res.status(400).json({ success: false, message: 'File is required' });
      return;
    }

    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
    const filename = file.originalFilename || 'file.jpg';

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), filename);

    const configId = getField(fields, 'config_id');
    const position = getField(fields, 'position');
    const documentInfo = getField(fields, 'document_info');
    const documentNo = getField(fields, 'document_no');
    const customerId = getField(fields, 'customer_id');

    if (configId) formData.append('config_id', configId);
    if (position) formData.append('position', position);
    if (documentInfo) formData.append('document_info', documentInfo);
    if (documentNo) formData.append('document_no', documentNo);
    if (customerId) formData.append('customer_id', customerId);

    const accessToken = req.cookies.token || req.headers.authorization || '';
    const response = await Backend.post(
      `/api/v1/customer-support/${id}/attachments`,
      formData,
      {
        headers: {
          Authorization: typeof accessToken === 'string' ? `Bearer ${accessToken}` : '',
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
      }
    );

    res.status(response.status).json({
      success: true,
      data: response.data?.data ?? response.data,
    });
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? error.message ?? 'Internal Server Error';
    res.status(error.response?.status ?? 500).json({ success: false, message });
  }
}
