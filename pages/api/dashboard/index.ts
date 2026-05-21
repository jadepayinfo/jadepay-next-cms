import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const accessToken = req.cookies['token'];
    const headers = { Authorization: `Bearer ${accessToken}` };
    const response = await Backend.get('/api/v1/dashboard', { headers });
    const body = response.data as {
      code?: number;
      data?: Record<string, unknown>;
      message?: string;
      status?: number;
    };

    if (body?.data) {
      return res.json({ success: true, ...body.data });
    }

    return res.json({ success: true, ...body });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message ?? error.message ?? 'Internal Server Error'
    });
  }
}
