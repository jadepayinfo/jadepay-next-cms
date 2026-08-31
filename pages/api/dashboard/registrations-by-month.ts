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
    const response = await Backend.get('/api/v1/dashboard/registrations-by-month', {
      headers,
      params: { year: req.query.year }
    });
    const body = response.data as { data?: Record<string, unknown> };
    console.log('[dashboard/registrations-by-month] body.data:', JSON.stringify(body?.data));
    return res.json({ success: true, ...(body?.data ?? body) });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message ?? error.message ?? 'Internal Server Error'
    });
  }
}
