export type StaticSummaryType = {
  balance: number;
  burn_total: number;
  earn_total: number;
  total_user: number;
  user_register: number;
  user_percentage: number;
  total_partner: number;
  kyc: number;
  total_balance: number;
  all_burn_total: number;
  all_earn_total: number;
};

export type DealItemType = {
  id: string;
  name: string;
  redeem_count: number;
  earn_coins: number;
  percentage: number;
};

export type DealSummaryType = {
  name: string;
  data: DealItemType[];
};

export type PartnerSummaryType = {
  burn_total: number;
  earn_total: number;
  burn_bath_total: number;
  earn_bath_total: number;
  data: PartnerDataType[];
};

export type PartnerDataType = {
  name: string;
  data: PartnerItemType[];
};

export type PartnerItemType = {
  name: string;
  deal_id: string;
  burn_total: number;
  earn_total: number;
  parnter_total: number;
  percentage: number;
  burn_bath_total: number;
  earn_bath_total: number;
  token_id: number;
};

export type TransectionSummaryType = {
  data: TransectionItemType[] | undefined;
};

export type TransectionItemType = {
  partner: string;
  earn: number;
  total: number;
};
