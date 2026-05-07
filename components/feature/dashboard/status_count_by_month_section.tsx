import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DashboardCustomer } from '@/lib/dashboard_customers';

dayjs.extend(utc);

interface MonthlyItem {
  month: string;
  count: number;
}

interface Props {
  customers: DashboardCustomer[];
  title: string;
  subtitle: string;
  kycStatus: string;
  barClassName?: string;
}

export default function StatusCountByMonthSection({
  customers,
  title,
  subtitle,
  kycStatus,
  barClassName = 'bg-success/80 hover:bg-success'
}: Props) {
  const currentYear = dayjs().utc().year();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const yearOptions = useMemo(() => {
    const years = new Set<number>([currentYear]);
    customers.forEach((customer) => {
      const createdAt = dayjs.utc(customer.created_at);
      if (createdAt.isValid()) years.add(createdAt.year());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [customers, currentYear]);

  const monthlyData = useMemo<MonthlyItem[]>(() => {
    const initial = Array.from({ length: 12 }, (_, index) => ({
      month: dayjs.utc().month(index).format('MMM'),
      count: 0
    }));

    customers.forEach((customer) => {
      if (customer.kyc_status !== kycStatus) return;

      const createdAt = dayjs.utc(customer.created_at);
      if (!createdAt.isValid() || createdAt.year() !== selectedYear) return;

      initial[createdAt.month()].count += 1;
    });

    return initial;
  }, [customers, selectedYear, kycStatus]);

  const maxValue = Math.max(1, ...monthlyData.map((item) => item.count));

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="card-title">
              {title} ({selectedYear})
            </h2>
            <p className="text-sm text-base-content/70">{subtitle}</p>
          </div>
          <div className="w-full md:w-56">
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/70 whitespace-nowrap">Filter by Year</span>
              <div className="flex-1 rounded-md border border-slate-400 bg-base-100 px-2">
                <select
                  className="select w-full border-0 bg-transparent focus:outline-none focus:ring-0"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-12 items-end gap-2 h-52">
          {monthlyData.map((item) => (
            <div key={item.month} className="col-span-1 flex flex-col items-center justify-end gap-2">
              <div className="w-full flex items-end h-full">
                <div
                  className={`w-full rounded-t transition ${barClassName}`}
                  style={{ height: `${(item.count / maxValue) * 100}%` }}
                  title={`${item.month}: ${item.count}`}
                />
              </div>
              <span className="text-xs text-base-content/70">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
