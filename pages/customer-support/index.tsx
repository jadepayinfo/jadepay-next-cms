import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';
import withAuth from '@/hoc/with_auth';
import { initHeaderWithServerSide } from '@/lib/axios';
import CustomerTable from '@/components/feature/customer-support/CustomerTable';
import { Customer } from '@/model/customer';
import axios from 'axios';
import Pagination from '@/components/share/pagination';

interface Props {}

const LIMIT = 10;

const CustomerSupportPage: NextPage<Props> = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const refPage = useRef(1);

  const fetchData = async (page: number, name: string) => {
    setLoading(true);
    try {
      let params = `is_rekyc=false&status=Pending&page=${page}&limit=${LIMIT}`;
      if (name) params += `&name=${name}`;
      const res = await axios.get(`/api/customer/list?${params}`);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setCount(Math.ceil((res.data?.count ?? 0) / LIMIT));
    } catch {
      setData([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, '');
  }, []);

  const handleSearch = () => {
    refPage.current = 1;
    fetchData(1, search);
  };

  const handleClear = () => {
    setSearch('');
    refPage.current = 1;
    fetchData(1, '');
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold">ติดตามเอกสาร</h1>
        <p className="text-sm text-base-content/60">รายการลูกค้าสถานะ Pending รอการติดตาม</p>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              className="input input-bordered input-sm w-full sm:w-64"
              placeholder="ค้นหาชื่อลูกค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-sm btn-primary" onClick={handleSearch}>
              ค้นหา
            </button>
            {search && (
              <button className="btn btn-sm btn-ghost" onClick={handleClear}>
                ล้าง
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner w-8 text-primary" />
            </div>
          ) : (
            <>
              <div className="text-xs text-base-content/50 mb-2">
                แสดง {data.length} รายการ
              </div>
              <CustomerTable items={data} />
              <div className="flex justify-end mt-2">
                <Pagination
                  count={count}
                  currentPage={refPage.current}
                  onPageChange={(page) => {
                    refPage.current = page;
                    fetchData(page, search);
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
