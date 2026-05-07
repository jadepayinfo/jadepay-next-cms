import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DashboardCustomer } from '@/lib/dashboard_customers';

dayjs.extend(utc);

interface MonthlyRegisterItem {
  month: string;
  online: number;
  fileUpload: number;
  ict: number;
}

interface Props {
  customers: DashboardCustomer[];
}

export default function RegisterByMonthSection({ customers }: Props) {
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

  const monthlyRegisterData = useMemo<MonthlyRegisterItem[]>(() => {
    const initial = Array.from({ length: 12 }, (_, index) => ({
      month: dayjs.utc().month(index).format('MMM'),
      online: 0,
      fileUpload: 0,
      ict: 0
    }));

    customers.forEach((customer) => {
      const createdAt = dayjs.utc(customer.created_at);
      if (!createdAt.isValid() || createdAt.year() !== selectedYear) return;

      const monthIndex = createdAt.month();
      const source = (customer.source || '').toLowerCase();

      if (source === 'online') {
        initial[monthIndex].online += 1;
      } else if (source === 'fileupload') {
        initial[monthIndex].fileUpload += 1;
      } else if (source === 'ict') {
        initial[monthIndex].ict += 1;
      }
    });

    return initial;
  }, [customers, selectedYear]);

  const maxRegisterValue = Math.max(
    1,
    ...monthlyRegisterData.map((item) => Math.max(item.online, item.fileUpload, item.ict))
  );

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="card-title">Total Register by Month ({selectedYear})</h2>
            <p className="text-sm text-base-content/70">Source: Online / File Upload / ICT</p>
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
        <div className="flex items-center gap-3 text-xs text-base-content/70 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            Online
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            File Upload
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            ICT
          </span>
        </div>
        <div className="mt-3 grid grid-cols-12 items-end gap-2 h-52">
          {monthlyRegisterData.map((item) => (
            <div key={item.month} className="col-span-1 flex flex-col items-center justify-end gap-2">
              <div className="w-full flex items-end gap-1 h-full">
                <div
                  className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition"
                  style={{ height: `${(item.online / maxRegisterValue) * 100}%` }}
                  title={`${item.month} Online: ${item.online}`}
                />
                <div
                  className="flex-1 bg-secondary/80 hover:bg-secondary rounded-t transition"
                  style={{ height: `${(item.fileUpload / maxRegisterValue) * 100}%` }}
                  title={`${item.month} File Upload: ${item.fileUpload}`}
                />
                <div
                  className="flex-1 bg-accent/80 hover:bg-accent rounded-t transition"
                  style={{ height: `${(item.ict / maxRegisterValue) * 100}%` }}
                  title={`${item.month} ICT: ${item.ict}`}
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
