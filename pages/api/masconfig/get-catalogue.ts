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
    const response = await Backend.get(`/api/v1/master/get-catalogue-by-type`, { headers, params });
    
    console.log("req.query  :",req.query )
    console.log("response.data.data  :", response.data.data )
    res.json({ success: true, ...response.data.data })

  } catch (error: any) {
    console.log('/api/v1/master/get-catalogue-by-type', error);
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}