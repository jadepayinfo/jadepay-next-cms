export interface SmartPayInfo {
    id: string;
    created_at: number;
    updated_at: number;
    channel: string;
    channel_id: string;
    service: string;
    product: string;
    product_group: string;
    source_of_fund: string;
    action_id: string;
    action: Action;
}

export interface Action {
    id: string;
    created_at: number;
    updated_at: number;
    name: string;
    action_type: ActionType;
    config: Config;
}

export type ActionType = "transfer_multiply" | "transfer_amount";

export interface Config {
    token_id: number;
    multiply_amount?: number;
    token_amount?: number;
    wallet_token_owner_id: string;
}

export interface SmartPayData {
    channel: string;
    channel_id: string;
    service: string;
    product: string;
    product_group: string;
    source_of_fund: string;
    action: ActionData;
}

export interface ActionData {
    name: string;
    action_type: ActionType;
    config: Config;
}

export interface SmartPayDataUpdate {
    channel: string;
    channel_id: string;
    service: string;
    product: string;
    product_group: string;
    source_of_fund: string;
}

export interface ActionDataUpdate {
    name: string;
    action_type: ActionType;
    config: Config;
}

// {
//     "id": "cmfs08hy545gq3c739c0",
//     "created_at": "2023-04-18T06:51:07.507Z",
//     "updated_at": "2023-04-18T06:51:07.507Z",
//     "channel": "sabuymoney",
//     "channel_id": "3000022",
//     "service": "SBM",
//     "product": "Sabuy Counter Top up Wallet",
//     "product_group": "Sabuy Counter",
//     "action_id": "cmfs08hy545gq3c739bg",
//     "action": {
//         "id": "cmfs08hy545gq3c739bg",
//         "created_at": "2023-04-18T06:51:07.507Z",
//         "updated_at": "2023-04-18T06:51:07.507Z",
//         "name": "smartpay_sabuymoney_3000022_SBM",
//         "action_type": "transfer_multiply",
//         "config": {
//             "token_id": 2,
//             "multiply_amount": 1,
//             "wallet_token_owner_id": "sbm-sabuymoney"
//         }
//     }
