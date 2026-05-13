import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const { id } = req.query;
    const accessToken = req.cookies['token'];
    const headers = { Authorization: `Bearer ${accessToken}` };
    const response = await Backend.get(`/api/v1/customer-support/${id}`, { headers });
    res.json({ success: true, data: response.data?.data ?? response.data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message ?? 'Internal Server Error' });
  }
}
