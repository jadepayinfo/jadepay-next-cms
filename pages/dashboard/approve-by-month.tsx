import { NextPage } from 'next';
import Link from 'next/link';
import withAuth from '@/hoc/with_auth';
import { initHeaderWithServerSide } from '@/lib/axios';
import { useAuth } from '@/context/auth_context';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import StatusCountByMonthSection, { MonthlyTotal } from '@/components/feature/dashboard/status_count_by_month_section';

interface Props {}

function buildYearOptions(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= 2022; y--) {
    years.push(y);
  }
  return years;
}

const DashboardApproveByMonthPage: NextPage<Props> = () => {
  const { user } = useAuth();
  const yearOptions = useMemo(() => buildYearOptions(), []);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [series, setSeries] = useState<MonthlyTotal[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const res = await axios.get('/api/dashboard/approve-by-month', {
          params: { year: selectedYear }
        });
        if (res.data?.success === false) {
          setErrorMessage(res.data?.message ?? 'ไม่สามารถโหลดข้อมูล dashboard ได้');
          setSeries([]);
          return;
        }
        console.log('[approve-by-month] res.data:', res.data);
        setSeries(Array.isArray(res.data?.series) ? res.data.series : []);
      } catch {
        setErrorMessage('ไม่สามารถโหลดข้อมูล dashboard ได้');
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, selectedYear]);

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <span className="loading loading-spinner w-[2rem] text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="link link-primary text-sm">
          ← Back to Dashboard
        </Link>
      </div>
      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}
      <StatusCountByMonthSection
        series={series}
        selectedYear={selectedYear}
        yearOptions={yearOptions}
        onYearChange={setSelectedYear}
        title="Total Approve by Month"
        subtitle="Status: Approved by Jadepay"
      />
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);
  return { props: {} as Props };
};

export default withAuth(DashboardApproveByMonthPage);
