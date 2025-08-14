import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    console.log("req.body. -->  :", req.body)
    const accessToken = req.cookies['token']
    const headers = { 'Authorization': `Bearer ${accessToken}` }
    const response = await Backend.patch(`/api/v1/customer/submit-customer`, req.body, {
      headers
    });
    console.log("response.data.data --> :", response.data.data )
    res.json({ success: true, ...response.data.data })

  } catch (error: any) {
    console.log('/api/v1/customer/submit-customer', error);
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}