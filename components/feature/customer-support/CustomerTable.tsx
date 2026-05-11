import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Customer } from '@/model/customer';

dayjs.extend(utc);

interface Props {
  items: Customer[];
}

const STATUS_CLASS: Record<string, string> = {
  'Pending': 'bg-gray-100 text-gray-700',
  'wait for review': 'bg-yellow-100 text-gray-700',
  'Operation save': 'bg-green-100 text-gray-800',
  'Approved by Jadepay': 'bg-green-800 text-white',
  'Processing': 'bg-blue-100 text-gray-800',
  'KYC completed': 'bg-blue-900 text-white',
};

export default function CustomerTable({ items }: Props) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อ-นามสกุล</th>
            <th>เบอร์โทร</th>
            <th>Source</th>
            <th>วันที่สมัคร</th>
            <th>สถานะ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-base-content/50 py-8">
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
          {items.map((item, idx) => (
            <tr
              key={item.customer_id}
              className="hover cursor-pointer"
              onClick={() => router.push(`/customer-support/${item.customer_id}`)}
            >
              <td className="text-base-content/60">{idx + 1}</td>
              <td className="font-medium">{item.fullname}</td>
              <td>{item.mobile_no}</td>
              <td>{item.source ?? '-'}</td>
              <td>{dayjs(item.created_at).utc().format('DD/MM/YYYY')}</td>
              <td>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_CLASS[item.kyc_status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {item.kyc_status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/customer-support/${item.customer_id}`);
                  }}
                >
                  ดูรายละเอียด
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
