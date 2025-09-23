import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const accessToken = req.cookies['token']
    const headers = { 'Authorization': `Bearer ${accessToken}` }
    const response = await Backend.post(`/api/v1/kyc/set-action-document`, req.body, {
      headers
    });
    res.json({ success: true, ...response.data.data })

  } catch (error: any) {
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}