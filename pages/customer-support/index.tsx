import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';
import withAuth from '@/hoc/with_auth';
import { initHeaderWithServerSide } from '@/lib/axios';
import CustomerTable from '@/components/feature/customer-support/CustomerTable';
import FieldWorkForm from '@/components/feature/customer-support/FieldWorkForm';
import {
  CUSTOMER_SUPPORT_STAGE_OPTIONS,
  CustomerSupportFieldInfo,
  CustomerSupportListItem,
  CustomerSupportStage,
} from '@/model/customer-support';
import axios from 'axios';
import Pagination from '@/components/share/pagination';

interface Props {}

const LIMIT = 10;
const DEFAULT_STAGE: CustomerSupportStage = 'Pending';

const EMPTY_FILTERS: CustomerSupportFieldInfo = {
  name: '',
  email: '',
  mobileNo: '',
  gender: '',
  marital: '',
};

type SearchState = CustomerSupportFieldInfo & {
  supportStage: CustomerSupportStage;
};

const EMPTY_SEARCH: SearchState = {
  ...EMPTY_FILTERS,
  supportStage: DEFAULT_STAGE,
};

const buildQuery = (page: number, filters: SearchState) => {
  const params = new URLSearchParams({
    support_status: filters.supportStage,
    page: String(page),
    limit: String(LIMIT),
  });
  if (filters.name) params.set('name', filters.name);
  if (filters.email) params.set('email', filters.email);
  if (filters.mobileNo) params.set('mobile_no', filters.mobileNo);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.marital) params.set('marital', filters.marital);
  return params.toString();
};

const CustomerSupportPage: NextPage<Props> = () => {
  const [data, setData] = useState<CustomerSupportListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchState>(EMPTY_SEARCH);
  const [appliedFilters, setAppliedFilters] = useState<SearchState>(EMPTY_SEARCH);
  const refPage = useRef(1);

  const fetchData = async (page: number, searchFilters: SearchState) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/customer-support/list?${buildQuery(page, searchFilters)}`);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      const total = res.data?.pagination?.count ?? res.data?.count ?? 0;
      setCount(Math.ceil(total / LIMIT));
    } catch {
      setData([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, EMPTY_SEARCH);
  }, []);

  const handleFilterChange = (
    field: keyof CustomerSupportFieldInfo,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleStageChange = (value: CustomerSupportStage) => {
    setFilters((prev) => ({ ...prev, supportStage: value }));
  };

  const handleSearch = () => {
    refPage.current = 1;
    setAppliedFilters(filters);
    fetchData(1, filters);
  };

  const handleClear = () => {
    setFilters(EMPTY_SEARCH);
    setAppliedFilters(EMPTY_SEARCH);
    refPage.current = 1;
    fetchData(1, EMPTY_SEARCH);
  };

  const hasActiveFilters =
    appliedFilters.supportStage !== DEFAULT_STAGE ||
    Object.values({
      name: appliedFilters.name,
      email: appliedFilters.email,
      mobileNo: appliedFilters.mobileNo,
      gender: appliedFilters.gender,
      marital: appliedFilters.marital,
    }).some(Boolean);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold">ติดตามเอกสาร</h1>
        <p className="text-sm text-base-content/60">รายการลูกค้ารอการติดตามและ follow up</p>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="form-control max-w-md mb-4">
            <label className="label py-0">
              <span className="label-text text-xs font-medium">สถานะลูกค้า</span>
            </label>
            <select
              className="select select-ui w-full"
              value={filters.supportStage}
              onChange={(e) => handleStageChange(e.target.value as CustomerSupportStage)}
            >
              {CUSTOMER_SUPPORT_STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <FieldWorkForm
            title="ค้นหา"
            value={filters}
            onChange={handleFilterChange}
          />

          <div className="flex flex-wrap gap-2 mt-2">
            <button className="btn btn-sm btn-primary" onClick={handleSearch}>
              ค้นหา
            </button>
            {hasActiveFilters && (
              <button className="btn btn-sm btn-ghost" onClick={handleClear}>
                ล้าง
              </button>
            )}
          </div>

          <div className="divider my-2" />

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner w-8 text-primary" />
            </div>
          ) : (
            <>
              <div className="text-xs text-base-content/50 mb-2">
                แสดง {data.length} รายการ
              </div>
              <CustomerTable
                items={data}
                currentPage={refPage.current}
                pageSize={LIMIT}
              />
              <div className="flex justify-end mt-2">
                <Pagination
                  count={count}
                  currentPage={refPage.current}
                  onPageChange={(page) => {
                    refPage.current = page;
                    fetchData(page, appliedFilters);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);
  return { props: {} as Props };
};

export default withAuth(CustomerSupportPage);
