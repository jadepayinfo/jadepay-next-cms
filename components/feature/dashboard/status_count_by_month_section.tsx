import dayjs from 'dayjs';

export interface MonthlyTotal {
  month: number;
  total: number;
}

interface Props {
  series: MonthlyTotal[];
  selectedYear: number;
  yearOptions: number[];
  onYearChange: (year: number) => void;
  title: string;
  subtitle: string;
  barClassName?: string;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  dayjs().month(i).format('MMM')
);

export default function StatusCountByMonthSection({
  series,
  selectedYear,
  yearOptions,
  onYearChange,
  title,
  subtitle,
  barClassName = 'bg-success/80 hover:bg-success'
}: Props) {
  const maxValue = Math.max(1, ...series.map((item) => item.total));

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
                  onChange={(e) => onYearChange(Number(e.target.value))}
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

        <div className="mt-3 grid grid-cols-12 gap-2 h-52">
          {series.map((item, idx) => (
            <div key={item.month} className="col-span-1 flex flex-col">
              <div
                className="flex-1 relative tooltip tooltip-top"
                data-tip={`${MONTH_LABELS[idx]}: ${item.total}`}
              >
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-t transition flex items-center justify-center overflow-hidden ${barClassName}`}
                  style={{ height: `${(item.total / maxValue) * 100}%` }}
                >
                  {item.total > 0 && (
                    <span className="text-[9px] font-bold text-white leading-none">
                      {item.total.toLocaleString()}
                    </span>
                  )}
                </div>
                {item.total === 0 && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] text-base-content/40 leading-none">
                    0
                  </span>
                )}
              </div>
              <span className="text-xs text-center text-base-content/70 mt-1 leading-none">
                {MONTH_LABELS[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
