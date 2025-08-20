export interface wallet_token {
    id: string;
    token_id: number;
    owner_id: string;
    user_type: string;
    wallet_type: string;
    max_credit_balance: number;
    status: string;
}

export interface WalletTokenLotList {
    wallet_token_id: string;
    data: WalletTokenLot[];
}

export interface WalletTokenLot {
    id: string;
    wallet_token_id: string;
    token_id: number;
    received_amount: number;
    used_amount: number;
    expired_at: Date;
}
