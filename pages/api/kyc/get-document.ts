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
    console.log(`/api/v1/kyc/get-kyc-doc?kyc-doc-id=${kycDocId}`)
    const response = await Backend.get(`/api/v1/kyc/get-kyc-doc?kyc-doc-id=${kycDocId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'arraybuffer', // สำคัญมากสำหรับรับ binary data
    });
    console.log("🚀 ~ file: list.ts:20 ~ response:", response)
    res.setHeader("Content-Type", "image/jpeg");
    res.send(response.data); // ส่ง binary image กลับ


  } catch (error: any) {
    console.log('error', error);
    console.log('/api/v1/kyc/get-kyc-doc', error);
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}