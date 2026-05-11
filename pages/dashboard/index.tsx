import { NextPage } from 'next';
import Link from 'next/link';
import withAuth from '@/hoc/with_auth';
import { initHeaderWithServerSide } from '@/lib/axios';
import { useAuth } from '@/context/auth_context';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  UserRound,
  ListOrdered
} from 'lucide-react';

interface Props {}

interface DashboardSummary {
  total_register: number;
  total_kyc_completed: number;
  total_pending: number;
  total_waiting_for_review: number;
  total_waiting_for_ict_approval: number;
  user_trend_period_days: number;
  user_trend: Array<{
    date: string;
    total_users: number;
  }>;
}

interface StatCard {
  title: string;
  value: string;
  note: string;
  icon: JSX.Element;
  valueClassName: string;
  iconWrapClassName: string;
  trendLabel: string;
  trendUp: boolean;
  trendClassName: string;
  href: string;
}

const DashBoardPage: NextPage<Props> = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const res = await axios.get('/api/dashboard');
        console.log("dashboard :", res.data);
        if (res.data?.success === false) {
          setErrorMessage(res.data?.message ?? 'ไม่สามารถโหลดข้อมูล dashboard ได้');
          setSummary(null);
          return;
        }
        setSummary({
          total_register: Number(res.data?.total_register ?? 0),
          total_kyc_completed: Number(res.data?.total_kyc_completed ?? 0),
          total_pending: Number(res.data?.total_pending ?? 0),
          total_waiting_for_review: Number(res.data?.total_waiting_for_review ?? 0),
          total_waiting_for_ict_approval: Number(res.data?.total_waiting_for_ict_approval ?? 0),
          user_trend_period_days: Number(res.data?.user_trend_period_days ?? 7),
          user_trend: Array.isArray(res.data?.user_trend) ? res.data.user_trend : []
        });
      } catch {
        setErrorMessage('ไม่สามารถโหลดข้อมูล dashboard ได้');
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const currentDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  const currentTimeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date());
  const userTrendBars = useMemo(() => {
    const points = summary?.user_trend ?? [];
    if (points.length === 0) {
      return {
        bars: [] as Array<{ date: string; shortDate: string; value: number; heightPct: number }>,
        firstDate: '',
        lastDate: ''
      };
    }

    const values = points.map((item) => Number(item.total_users ?? 0));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const hasVariation = max !== min;
    const range = hasVariation ? max - min : 1;

    const bars = points.map((item) => {
      const value = Number(item.total_users ?? 0);
      const normalized = hasVariation ? (value - min) / range : 0.5;
      const heightPct = hasVariation ? 30 + normalized * 70 : 55;
      return {
        date: item.date,
        shortDate: item.date.slice(5),
        value,
        heightPct
      };
    });

    return {
      bars,
      firstDate: points[0]?.date ?? '',
      lastDate: points[points.length - 1]?.date ?? ''
    };
  }, [summary?.user_trend]);

  const statCards = useMemo<StatCard[]>(() => {
    if (!summary) return [];

    return [
      {
        title: 'Pending',
        value: summary.total_pending.toLocaleString(),
        note: 'vs yesterday',
        icon: <ListOrdered className="w-6 h-6 text-red-500" />,
        valueClassName: 'text-red-500',
        iconWrapClassName: 'bg-red-100',
        trendLabel: '12%',
        trendUp: true,
        trendClassName: 'text-red-500 bg-red-100',
        href: '/dashboard/register-by-month'
      },
      {
        title: 'Waiting for ICT Approval',
        value: summary.total_waiting_for_ict_approval.toLocaleString(),
        note: 'vs yesterday',
        icon: <CircleAlert className="w-6 h-6 text-orange-500" />,
        valueClassName: 'text-orange-500',
        iconWrapClassName: 'bg-orange-100',
        trendLabel: '8%',
        trendUp: true,
        trendClassName: 'text-orange-500 bg-orange-100',
        href: '/dashboard/register-by-month'
      },
      {
        title: 'Waiting for Review',
        value: summary.total_waiting_for_review.toLocaleString(),
        note: 'vs yesterday',
        icon: <Clock3 className="w-6 h-6 text-yellow-500" />,
        valueClassName: 'text-yellow-500',
        iconWrapClassName: 'bg-yellow-100',
        trendLabel: '5%',
        trendUp: false,
        trendClassName: 'text-yellow-600 bg-yellow-100',
        href: '/dashboard/register-by-month'
      },
      {
        title: 'KYC Completed',
        value: summary.total_kyc_completed.toLocaleString(),
        note: 'vs yesterday',
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
        valueClassName: 'text-emerald-500',
        iconWrapClassName: 'bg-emerald-100',
        trendLabel: '15%',
        trendUp: true,
        trendClassName: 'text-emerald-600 bg-emerald-100',
        href: '/dashboard/kyc-approve-by-month'
      }
    ];
  }, [summary]);

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <span className="loading loading-spinner w-[2rem] text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-slate-50 min-h-full">
      <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 flex items-center justify-between">
        <p className="text-4 font-semibold text-slate-900">{currentDateLabel}</p>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
          <CalendarDays className="w-4 h-4" />
          <span>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}</span>
        </div>
      </div>
      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href} className="block group">
            <div className="card bg-white shadow-sm border border-slate-200 cursor-pointer transition-shadow group-hover:shadow-md rounded-2xl h-full">
              <div className="card-body flex-row items-start gap-4 p-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.iconWrapClassName}`}>
                  {card.icon}
                </div>
                <div className="flex-1">
                  <p className="text-2sm font-medium text-slate-900">{card.title}</p>
                  <h2 className={`text-5xl font-bold mt-1 ${card.valueClassName}`}>{card.value}</h2>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${card.trendClassName}`}>
                      {card.trendUp ? '↑' : '↓'} {card.trendLabel}
                    </span>
                    <span className="text-slate-500">{card.note}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/dashboard/approve-by-month" className="block group">
        <div className="card bg-white shadow-sm border border-slate-200 rounded-2xl">
          <div className="card-body p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <UserRound className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2sm font-medium text-slate-900">Total Users in System</p>
                  <h2 className="text-5xl font-bold mt-1 text-blue-600">
                    {summary?.total_register.toLocaleString() ?? '0'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">All registered users</p>
                </div>
              </div>
              <div className="w-full lg:w-[45%]">
                <div className="absolute -top-8 right-0">
                  <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700">
                    {summary?.user_trend_period_days ?? 7} Days
                  </div>
                </div>
                <div className="h-24 rounded-lg bg-slate-50 border border-slate-200 px-3 pt-2 pb-1 flex items-end gap-2">
                  {userTrendBars.bars.map((bar) => (
                    <div key={bar.date} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <span className="text-[10px] text-slate-500 leading-none">{bar.value}</span>
                      <div className="w-full flex items-end justify-center h-12">
                        <div
                          className="w-full max-w-5 rounded-sm bg-blue-500/80 hover:bg-blue-600 transition"
                          style={{ height: `${bar.heightPct}%` }}
                          title={`${bar.date}: ${bar.value.toLocaleString()}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 leading-none">{bar.shortDate}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{userTrendBars.firstDate}</span>
                  <span>{userTrendBars.lastDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="text-sm text-slate-500">Last updated: {currentTimeLabel}</div>
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);

  const defaultValue: Props = {};

  try {
    return {
      props: defaultValue
    };
  } catch (error: any) {
    console.error('DashBoardPage getServerSideProps error', error);
    return {
      props: defaultValue
    };
  }
};

export default withAuth(DashBoardPage);
