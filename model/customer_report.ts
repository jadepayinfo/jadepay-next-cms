export interface CustomerReport {
    data: undefined | {
    Name: string;
    Gender: string;
    Dob: string;
    Email: string;
    Phone: string;
    IsBlock: boolean
    RegisterDate: string
    Balance: number
    IsKyc: boolean
    }[]
    total_records: number
}


export type CustomerReportItems ={
    name: string;
    gender: string;
    dob: string;
    email: string;
    phone: string;
    register_date: string
    is_block: boolean
    balance: number
    is_kyc: boolean
}