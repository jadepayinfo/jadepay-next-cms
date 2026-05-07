import { NextPage } from 'next';
import Link from 'next/link';
import withAuth from '@/hoc/with_auth';
import { initHeaderWithServerSide } from '@/lib/axios';
import { useAuth } from '@/context/auth_context';
import { useEffect, useState } from 'react';
import { fetchAllDashboardCustomers, DashboardCustomer } from '@/lib/dashboard_customers';
import RegisterByMonthSection from '@/components/feature/dashboard/register_by_month_section';

interface Props {}

const DashboardRegisterByMonthPage: NextPage<Props> = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [customers, setCustomers] = useState<DashboardCustomer[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await fetchAllDashboardCustomers();
        setCustomers(data);
      } catch {
        setErrorMessage('ไม่สามารถโหลดข้อมูล dashboard ได้');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

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
      <RegisterByMonthSection customers={customers} />
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);
  return { props: {} as Props };
};

export default withAuth(DashboardRegisterByMonthPage);
