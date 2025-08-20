export interface WalletTransaction {
    id: string;
    transaction_from: string;
    transaction_to: string;
    token_id: number;
    wallet_token_lot_id?: string;
    amount: number;
    transaction_type: string;
    reference_transaction_id: string;
    timestamp: number;
    token_expire_type: string;
    token_expire_duration?: number;
}
