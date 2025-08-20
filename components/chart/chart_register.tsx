import { useTheme } from '@/context/theme_context';
import { toNumber } from '@/lib/number';
import { getDate } from '@/lib/time';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  ChartOptions
} from 'chart.js';
import { useRef } from 'react';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);

const ChartRegister = (data: any) => {
  const { datas, timeType } = data;
  const chartRef = useRef<ChartJS<'bar'>>();

  const { primaryColor } = useTheme();

  console.log('datas', datas);

  const textColor = getComputedStyle(
    document!.getElementById('main-app') as Element
  ).getPropertyValue('--chart-text');


  let itemsChart: Array<any> = [];
  let chartLabels: Array<string> = [];

  datas?.registration?.forEach((a: any) => {
    itemsChart.push(a.amount);
    let labelAxisX = '';
    if (timeType === 'day') {
      labelAxisX = 'DD/MM/YYYY';
    } else if (timeType === 'month') {
      labelAxisX = 'MM/YYYY';
    } else if (timeType === 'year') {
      labelAxisX = 'YYYY';
    }
    chartLabels.push(getDate(a.date, labelAxisX));
  });

  let ctx: any;

  const options: ChartOptions | any = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30
      }
    },
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        grace: '5%',
        grid: {
          display: true
        },
        ticks: {
          color: textColor,
          stepSize: 10,
          max: 100
        }
      },
      x: {
        display: true,
        ticks: { display: true, color: textColor }
      }
    },
    animation: {
      duration: 0,
      onComplete: (context: any) => {
        const chart = context.chart;
        ctx = ctx ?? chart.ctx;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chart.data.datasets.forEach((dataset: any, i: number) => {
          let meta = chart.getDatasetMeta(i);
          // console.log('meta', meta);
          meta.data.forEach(function (bar: any, index: number) {
            const data = dataset.data[index] as unknown as string;
            ctx.fillText(`${toNumber(data, 0)} คน`, bar.x, bar.y - 5);
          });
        });
      }
    },
    plugins: {
      legend: {
        display: false // This hides all text in the legend and also the labels.
      },
      tooltip: {
        enabled: true,
        // enabled: false,
        callbacks: {
          label: (context: any) => `${toNumber(context.raw, 0)} คน`
        }
      }
    }
  };

  const dataConfig = {
    labels: chartLabels,
    datasets: [
      {
        type: 'bar' as const,
        label: '',
        backgroundColor: primaryColor,
        borderColor: primaryColor,
        data: itemsChart,
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="relative min-h-[300px] w-full h-full ss:w-[210px] xs:w-full">
      <Chart ref={chartRef} type="bar" options={options} data={dataConfig} />
    </div>
  );
};

export default ChartRegister;
