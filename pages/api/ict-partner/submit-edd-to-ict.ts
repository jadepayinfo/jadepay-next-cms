import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const accessToken = req.cookies['token']
    const headers = { 'Authorization': `Bearer ${accessToken}` }
    const response = await Backend.post(`/api/v1/ict-partner/send-edd-document`, req.body, {
      headers
    });
    res.json({ success: true, ...response.data.data })

  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "Internal Server Error";
    res.status(status).json({
      success: false,
      message,
      ...(error.response?.data && { details: error.response.data }),
    });
  }
}