import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { ['kyc-doc-id']: kycDocId } = req.query;
    const accessToken = req.cookies['token']
    const headers = { 'Authorization': `Bearer ${accessToken}` }
   
    const response = await Backend.get(`/api/v1/kyc/get-kyc-doc?kyc-doc-id=${kycDocId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'arraybuffer', // สำคัญมากสำหรับรับ binary data
    });

    res.setHeader("Content-Type", "image/jpeg");
    res.send(response.data); // ส่ง binary image กลับ


  } catch (error: any) {
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}