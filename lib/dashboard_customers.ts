import axios from 'axios';

export interface DashboardCustomer {
  created_at: string;
  source: string | null;
  kyc_status: string;
}

export async function fetchAllDashboardCustomers(): Promise<DashboardCustomer[]> {
  const limit = 500;
  let page = 1;
  let hasMore = true;
  const collected: DashboardCustomer[] = [];

  while (hasMore) {
    const response = await axios.get('/api/customer/list', {
      params: {
        is_rekyc: false,
        page,
        limit
      }
    });

    const pageData = (response.data?.data ?? []) as DashboardCustomer[];
    const totalCount = Number(response.data?.count ?? 0);
    collected.push(...pageData);

    hasMore = collected.length < totalCount && pageData.length > 0;
    page += 1;
  }

  return collected;
}
