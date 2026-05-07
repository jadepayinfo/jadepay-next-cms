import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Link from "next/link";
import axios from "axios";
import Datepicker, {
  DateRangeType,
  DateValueType,
} from "react-tailwindcss-datepicker";
import { RefreshCw, SquarePen, View } from "lucide-react";
import { Customer } from "@/model/customer";
import InputCustom from "@/components/input/input";
import Pagination from "@/components/share/pagination";
import { ButtonFill, ButtonOutline } from "@/components/buttons";
import {
  IconCalendar,
  IconCloseOutline,
  IconFilter,
  IconSearch,
} from "@/components/icon";

dayjs.extend(utc);

const limit = 10;
const reKycStatusOptions = [
  "All",
  "Pending Re-KYC",
  "Re-KYCProcessing",
  "Waiting for review",
  "Approved by Jadepay",
  "Processing",
  "Waiting for ICT Approval",
  "Re-KYC completed",
  "Reject",
] as const;

const initDateRange = (): DateRangeType => ({
  startDate: null as any,
  endDate: null as any,
});

const getKycStatusClass = (status: string) => {
  switch (status) {
    case "Pending Re-KYC":
      return "bg-orange-100 text-orange-800";
    case "Re-Processing":
      return "bg-red-900 text-white";
    case "Waiting for review":
      return "bg-yellow-100 text-gray-700";
    case "Processing":
      return "bg-blue-100 text-gray-800";
    case "Waiting for ICT Approval":
      return "bg-blue-200 text-gray-800";
    case "Re-KYC completed":
      return "bg-blue-900 text-white";
    case "Approved by Jadepay":
      return "bg-green-800 text-white";
    case "Reject":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/** สถานะที่เปิดได้แค่ดู — สอดคล้องกับหน้า customer list + Re-KYC completed */
const isReKycViewOnly = (kycStatus: string) =>
  kycStatus === "Approved by Jadepay" ||
  kycStatus === "Duplicate" ||
  kycStatus === "Waiting for ICT Approval" ||
  kycStatus === "KYC completed" ||
  kycStatus === "Re-KYC completed";

const ReKycPage = () => {
  const refPage = useRef(1);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [data, setData] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [filterUsername, setFilterUsername] = useState("");
  const [filterName, setFilterName] = useState("");
  const [status, setStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeType>(initDateRange());

  const handleDateValueChange = (newValue: DateValueType) => {
    setDateRange((newValue as DateRangeType) ?? initDateRange());
  };

  const handleFilter = async () => {
    setLoading(true);

    let params = `is_rekyc=true&page=${refPage.current}&limit=${limit}`;
    if (filterUsername) {
      params += `&mobile_no=${encodeURIComponent(filterUsername)}`;
    }
    if (filterName) {
      params += `&name=${encodeURIComponent(filterName)}`;
    }
    if (status !== "" && status !== "All") {
      params += `&status=${encodeURIComponent(status)}`;
    }
    if (dateRange?.startDate && dateRange?.endDate) {
      const startDate = dayjs(dateRange.startDate).startOf("day").unix();
      const endDate = dayjs(dateRange.endDate).endOf("day").unix();
      params += `&registered_at_start=${startDate}&registered_at_end=${endDate}`;
    }

    try {
      const response = await axios.get(`/api/customer/list?${params}`);
      const { data: customers, count: totalCount } = response.data;
      setData(customers ?? []);
      setCount(Math.ceil((totalCount ?? 0) / limit));
    } catch (error) {
      setData([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setFilterUsername("");
    setFilterName("");
    setStatus("");
    setDateRange(initDateRange());
    refPage.current = 1;
    void handleFilter();
  };

  const handleRefresh = () => {
    refPage.current = 1;
    void handleFilter();
  };

  const handleCheckboxChange = (customerId: number, checked: boolean) => {
    setSelectedCustomers((prev) =>
      checked ? [...prev, customerId] : prev.filter((id) => id !== customerId)
    );
  };

  const handleEddSend = async () => {
    try {
      const response = await axios.post("/api/ict-partner/submit-edd-to-ict", {
        user_ids: selectedCustomers,
      });
      if (response.data?.success !== false) {
        alert("ส่งข้อมูล EDD ไป ICT สำเร็จ");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        err.message ??
        "ส่งข้อมูล EDD ไม่สำเร็จ";
      alert(msg);
    }
  };

  const handleProcess = async () => {
    if (selectedCustomers.length === 0) return;
    try {
      const response = await axios.post("/api/ict-partner/submit-to-ict", {
        user_ids: selectedCustomers,
      });
      if (response.status === 200) {
        setData((prevData) =>
          prevData.map((item) =>
            selectedCustomers.includes(item.customer_id)
              ? { ...item, kyc_status: "Processing" }
              : item
          )
        );
        alert("ส่งข้อมูลลูกค้าไปยัง ICT สำเร็จ");
        //await handleEddSend();
        void handleFilter();
      }
    } catch (error) {
      alert("ส่งข้อมูลลูกค้าไปยัง ICT ไม่สำเร็จ");
    } finally {
      setSelectedCustomers([]);
    }
  };

  useEffect(() => {
    void handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="p-4 border border-[--border-color] rounded-lg mt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <div className="text-lg font-semibold">Re-KYC Queue</div>
            <div className="text-sm text-gray-500">
              ติดตามลูกค้าในกระบวนการ Re-KYC
            </div>
          </div>
          <ButtonOutline
            className="flex items-center gap-2 px-4 py-2 border border-[--border-color] rounded-md hover:bg-gray-50"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </ButtonOutline>
        </div>

        <div className="flex flex-col gap-4 pb-4 xl:flex-row xl:items-center">
          <div className="mt-1">
            <IconFilter className="text-[26px]" />
          </div>
          <div className="grow">
            <InputCustom
              name="username"
              title="Username(Mobile No.)"
              type="text"
              placeholder="Username(Mobile No.)"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
            />
          </div>
          <div className="grow">
            <InputCustom
              name="name"
              title="Name"
              type="text"
              placeholder="Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>
          <div className="mt-4 grow">
            <select
              className="select select-ui w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="" disabled>
                Status
              </option>
              {reKycStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 grow">
            <div className="date-box relative w-full border border-[--border-color] rounded-md">
              <Datepicker
                showShortcuts={true}
                displayFormat={"DD/MM/YYYY"}
                inputClassName="ss:text-[12px] xs:text-[14px]"
                value={dateRange}
                onChange={handleDateValueChange}
                toggleIcon={() => false}
                inputId="rekyc_filter_date"
                placeholder="Re-KYC date"
              />
              <label
                className="absolute inset-y-0 right-0 flex items-center mr-3 cursor-pointer"
                htmlFor="rekyc_filter_date"
              >
                <IconCalendar className="text-[20px]" />
              </label>
            </div>
          </div>
          <ButtonOutline
            className="h-[40px] border border-[--border-color] rounded-md mt-4"
            onClick={() => void handleFilter()}
          >
            <IconSearch />
          </ButtonOutline>
          <ButtonOutline
            className="h-[40px] border border-[--border-color] rounded-md mt-4"
            onClick={clearFilter}
          >
            <IconCloseOutline />
          </ButtonOutline>
        </div>

        <div className="overflow-x-auto border border-[--border-color] rounded-lg">
          <table className="table">
            <thead>
              <tr className="border-[--border-color]">
                <th></th>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Re-KYC Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <span className="loading loading-dots loading-sm text-primary"></span>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.customer_id} className="hover border-[--border-color]">
                    <td>
                      {item.kyc_status === "Processing" ||
                      item.kyc_status === "Waiting for ICT Approval" ||
                      item.kyc_status === "Re-KYC completed" ? (
                        <div className="w-4 h-4"></div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(item.customer_id)}
                          onChange={(e) =>
                            handleCheckboxChange(item.customer_id, e.target.checked)
                          }
                        />
                      )}
                    </td>
                    <td>{item.mobile_no}</td>
                    <td>{`${item.fullname}`.trim()}</td>
                    <td>{item.email}</td>
                    <td>{dayjs(item.kcy_created_at).utc().format("DD/MM/YYYY")}</td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getKycStatusClass(
                          item.kyc_status
                        )}`}
                      >
                        {item.kyc_status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/customer/re-kyc/edit/${item.customer_id}?kyc_id=${item.kyc_id}`}
                      >
                        {isReKycViewOnly(item.kyc_status) ? (
                          <ButtonFill
                            className="px-3 py-2 btn-primary"
                            title="View Details"
                          >
                            <View className="w-4 h-4" />
                          </ButtonFill>
                        ) : (
                          <ButtonFill
                            className="px-3 py-2 btn-warning"
                            title="Edit Re-KYC"
                          >
                            <SquarePen className="w-4 h-4" />
                          </ButtonFill>
                        )}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    ไม่พบข้อมูล Re-KYC
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Pagination
            count={count}
            currentPage={refPage.current ?? 1}
            onPageChange={(pageValue) => {
              refPage.current = pageValue;
              void handleFilter();
            }}
          />
        </div>
        <div className="flex justify-end mt-4">
          <ButtonFill
            className="btn btn-primary btn-sm p-3 min-h-[38px]"
            type="button"
            disabled={selectedCustomers.length === 0}
            onClick={() => void handleProcess()}
          >
            send to ICT
          </ButtonFill>
        </div>
      </div>
    </>
  );
};

export default ReKycPage;
