export type StaffInfoType = {
  id: string;
  symbol: string;
  name: string;
  owner_id: string;
};

export type TokenType = {
  deal_id: string;
  token_id: number;
  symbol: string;
  token_name: string;
};

export type Token = {
    id: number;
    symbol: string;
    name: string;
    owner_id: string;
}

export interface Transfer {
    transactions: Transaction[];
}

export interface Transaction {
    user_id_from:             string;
    user_id_to:               string;
    token_id:                 number;
    amount:                   number;
    transaction_type:         string;
    reference_transaction_id: null;
    token_expire_type:        string;
    token_expire_duration:    number;
}
