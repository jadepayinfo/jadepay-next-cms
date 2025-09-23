import { Backend } from '@/lib/axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { username, password } = req.body;
    const payload = {
      username,
      password
    }
    const response = await Backend.post(`/api/v1/auth/signin`, payload);
    res.json({ success: true, ...response.data })
  } catch (error: any) {
    res
      .status(500)
      .send({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
  }
}