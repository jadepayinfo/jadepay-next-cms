import dayjs from 'dayjs';

export interface RegistrationMonth {
  month: number;
  online: number;
  file_upload: number;
  ict: number;
  other: number;
  total: number;
}

interface Props {
  series: RegistrationMonth[];
  selectedYear: number;
  yearOptions: number[];
  onYearChange: (year: number) => void;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  dayjs().month(i).format('MMM')
);

export default function RegisterByMonthSection({ series, selectedYear, yearOptions, onYearChange }: Props) {
  const maxValue = Math.max(
    1,
    ...series.map((item) => Math.max(item.online, item.file_upload, item.ict, item.other))
  );

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="card-title">Total Register by Month ({selectedYear})</h2>
            <p className="text-sm text-base-content/70">Source: Online / File Upload / ICT / Other</p>
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
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral" />
            Other
          </span>
        </div>

        <div className="mt-3 grid grid-cols-12 gap-2 h-52">
          {series.map((item, idx) => (
            <div key={item.month} className="col-span-1 flex flex-col">
              <div className="flex-1 relative flex items-end gap-px">
                <div
                  className="flex-1 relative h-full tooltip tooltip-top"
                  data-tip={`Online: ${item.online}`}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary/80 hover:bg-primary rounded-t transition"
                    style={{ height: `${(item.online / maxValue) * 100}%` }}
                  />
                </div>
                <div
                  className="flex-1 relative h-full tooltip tooltip-top"
                  data-tip={`File Upload: ${item.file_upload}`}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-secondary/80 hover:bg-secondary rounded-t transition"
                    style={{ height: `${(item.file_upload / maxValue) * 100}%` }}
                  />
                </div>
                <div
                  className="flex-1 relative h-full tooltip tooltip-top"
                  data-tip={`ICT: ${item.ict}`}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-accent/80 hover:bg-accent rounded-t transition"
                    style={{ height: `${(item.ict / maxValue) * 100}%` }}
                  />
                </div>
                <div
                  className="flex-1 relative h-full tooltip tooltip-top"
                  data-tip={`Other: ${item.other}`}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-neutral/60 hover:bg-neutral rounded-t transition"
                    style={{ height: `${(item.other / maxValue) * 100}%` }}
                  />
                </div>
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
