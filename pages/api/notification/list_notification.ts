import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const params = {
      ...req.query,
      page: req.query?.page ?? 1,
      limit: req.query?.limit ?? 10,
    }
    const accessToken = req.cookies['token']
    const headers = { 'Authorization': `Bearer ${accessToken}` }
    const response = await Backend.get(`/api/v1/gateway/get-list-notification`, { headers , params });   
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