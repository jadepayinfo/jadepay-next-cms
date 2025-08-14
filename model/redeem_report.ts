export interface RedeemReportI {
  data: undefined | RedeemReportItems[]
  total_records: number
}


export type RedeemReportItems = {
  platform: string;
  customer: string;
  deal_id: string;
  deal_name: string;
  qr_code: string;
  value: number;
  created_at: string;
}