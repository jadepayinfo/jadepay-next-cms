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
   
    const contentType =
      response.headers['content-type'] ?? 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.send(response.data);


  } catch (error: any) {
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}