import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const params = {
      ...req.query
    }

    const accessToken = req.cookies['token']
    const headers = { 'Authorization': `Bearer ${accessToken}` }
    const response = await Backend.get(`/api/v1/master/get-catalog-by-type`, { headers, params });
    
    res.json({ success: true, ...response.data.data })

  } catch (error: any) {

    const status = error.response?.status ?? 500
    const backendBody = error.response?.data
    const msg =
      (typeof backendBody === 'object' && backendBody?.message) ||
      (typeof backendBody === 'string' ? backendBody : null) ||
      error.message ||
      'Internal Server Error'

    console.error('[get-catalogue]', req.query, status, msg, backendBody)
    res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      message: msg,
      ...(typeof backendBody === 'object' && backendBody !== null ? { backend: backendBody } : {}),
    })
  }
}