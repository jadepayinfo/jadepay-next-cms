type CampaignType = 'register' | 'kyc' | 'referrer' | 'referee';
export interface CampaignItem {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  campaign_type: CampaignType;
  condition: ConditionCampaign;
  action_id: string;
  action: ActionCampaign;
  status: 'active' | 'inactive'
}

type periodType = 'month' | 'year' | 'lifetime';
export interface ConditionCampaign {
  period: periodType;
  end_date: number;
  platform: string;
  start_date: number;
  campaign_limit: number;
}

type ActionType = 'transfer_amount' | 'add_customer_to_deal_whitelist';
export interface ActionCampaign {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  action_type: ActionType;
  config: ConfigTransferAmount & ConfigDealWhitelist;
}

interface ConfigTransferAmount {
  token_id: number;
  token_amount: number;
  wallet_token_owner_id: string;
}
interface ConfigDealWhitelist {
  deal_id: string;
}
