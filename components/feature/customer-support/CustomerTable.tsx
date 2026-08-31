import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { CustomerSupportListItem } from '@/model/customer-support';

dayjs.extend(utc);

interface Props {
  items: CustomerSupportListItem[];
  currentPage?: number;
  pageSize?: number;
}

const formatGender = (value: string) => {
  if (value === 'M') return 'Male';
  if (value === 'F') return 'Female';
  return value || '-';
};

const formatMarital = (value: string) => {
  if (value === 'Y') return 'Yes';
  if (value === 'N') return 'No';
  return value || '-';
};

const STATUS_CLASS: Record<string, string> = {
  'Pending': 'bg-gray-100 text-gray-700',
  '1st Follow up': 'bg-orange-100 text-orange-800',
  '2nd Follow up': 'bg-amber-100 text-amber-900',
  'Submitted to Jadepay': 'bg-green-100 text-green-800',
  'Cancelled by Customer': 'bg-red-100 text-red-800',
  'wait for review': 'bg-yellow-100 text-gray-700',
  'Operation save': 'bg-green-100 text-gray-800',
  'Approved by Jadepay': 'bg-green-800 text-white',
  'Processing': 'bg-blue-100 text-gray-800',
  'KYC completed': 'bg-blue-900 text-white',
};

export default function CustomerTable({
  items,
  currentPage = 1,
  pageSize = 10,
}: Props) {
  const router = useRouter();
  const rowOffset = (currentPage - 1) * pageSize;

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อ-นามสกุล</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Marital</th>
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
              <td colSpan={10} className="text-center text-base-content/50 py-8">
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
              <td className="text-base-content/60">{rowOffset + idx + 1}</td>
              <td className="font-medium">{item.fullname}</td>
              <td>{item.email || '-'}</td>
              <td>{formatGender(item.gender)}</td>
              <td>{formatMarital(item.marital)}</td>
              <td>{item.mobile_no}</td>
              <td>{item.source ?? '-'}</td>
              <td>{dayjs(item.created_at).utc().format('DD/MM/YYYY')}</td>
              <td>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_CLASS[item.support_stage] ?? STATUS_CLASS[item.kyc_status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {item.support_stage || item.kyc_status}
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
