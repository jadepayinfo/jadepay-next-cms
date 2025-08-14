import { NextPage } from "next";
import withAuth from "@/hoc/with_auth";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  IconCalendar,
  IconCloseOutline,
  IconEdit,
  IconFilter,
  IconSearch,
} from "@/components/icon";
import InputCustom from "@/components/input/input";
import Datepicker, { DateRangeType } from "react-tailwindcss-datepicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ButtonOutline from "@/components/buttons/button_outline";
import { Backend, initHeaderWithServerSide } from "@/lib/axios";
import { Customer } from "@/model/customer";
import { ButtonFill } from "@/components/buttons";
import Link from "next/link";
import Pagination from "@/components/share/pagination";

dayjs.extend(utc);

interface Props {}

const CustomerPage: NextPage<Props> = (props) => {
  const router = useRouter();
  const limit = 10;

  const initDateRange = () => {
    const start = dayjs.utc().startOf("month");
    const end = dayjs.utc().endOf("month");
    return { startDate: start as any, endDate: end as any };
  };

  const [filterUsername, setFilterUsername] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeType>(initDateRange());

  const [isFillForm, setIsFillForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number>(0);
  const refPage = useRef(1);

  const [data, setData] = useState<Customer[]>([]);

  const handleDateValueChange = (newValue: any) => {
    setDateRange(newValue);
  };
  const handleFilter = async () => {
    setIsFillForm(true);
    setLoading(true);

    let params = `page=${refPage.current}&limit=${limit}`;

    if (filterUsername) {
      params += `&username=${filterUsername}`;
    }
    if (filterName) {
      params += `&name=${filterName}`;
    }
    if (dateRange?.startDate && dateRange?.endDate) {
      const startDate = dayjs(dateRange.startDate).format('YYYY-MM-DDTHH:mm:ssZ');
      const endDate = dayjs(dateRange.endDate).format('YYYY-MM-DDTHH:mm:ssZ');
      params += `&startDate=${startDate}&endDate=${endDate}`;
    }

    try {
      const res_customer_list = await Backend.get(`/api/v1/customer/get-list?${params}`);
      const { data: customerData, count: totalCount } = res_customer_list.data; // Assuming your API returns data and total count

      const totalPages = Math.ceil(totalCount / limit);

      setData(customerData);
      setCount(totalCount); // Corrected: Use totalCount here
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customer list:", error);
      setLoading(false);
      setData([]);
      setCount(0);
    }
  };

  const clearFilter = () => {
    setFilterUsername("");
    setFilterName("");
    setDateRange(initDateRange()); // รีเซ็ต dateRange
    refPage.current = 1; // กลับไปหน้าแรก
    handleFilter(); // โหลดข้อมูลใหม่โดยไม่มี Filter
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await handleFilter();
      setLoading(false);
      setIsFillForm(true); // Set isFillForm to true after initial load
    };

    fetchData();
  }, [router]);
  return (
    <>
      <div className="p-4">
        <Breadcrumbs title="Customer" items={[{ label: "" }]} />
        <div className="p-4 border border-[--border-color] rounded-lg mt-5">
          <div>
            <div>Search User</div>
            <div className="flex gap-4 items-center pb-4 ">
              <div className="mt-4">
                <IconFilter className="text-[30px] " />
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
                <div className="date-box relative w-full border border-[--border-color] rounded-md">
                  <Datepicker
                    showShortcuts={true}
                    displayFormat={"DD/MM/YYYY"}
                    inputClassName="ss:text-[12px] xs:text-[14px]"
                    value={dateRange!}
                    onChange={handleDateValueChange}
                    toggleIcon={() => false}
                    inputId="filter_date"
                    placeholder="Register date"
                  />
                  <label
                    className="absolute inset-y-0 right-0 flex items-center mr-3 cursor-pointer"
                    htmlFor="filter_date"
                  >
                    <IconCalendar className="text-[20px]" />
                  </label>
                </div>
              </div>
              <ButtonOutline
                className="h-[40px] border border-[--border-color] rounded-md mt-4"
                onClick={handleFilter}
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
          </div>
          <div>
            <div className="overflow-x-auto border border-[--border-color] rounded-lg">
              <table className="table ">
                <thead>
                  <tr className="border-[--border-color]">
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Register Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="h-full">
                      <td colSpan={8} className="text-center">
                        <div className="flex justify-center items-center">
                          <span className="loading loading-dots loading-sm text-primary"></span>
                        </div>
                      </td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data?.map((item,index) => (
                      <tr key={index} className="hover border-[--border-color]">
                        <td>{item.user_id}</td>
                        <td>{`${item.fullname}`.trim()}</td>
                        <td>{item.email}</td>
                        <td> {dayjs(item.created_at).format('DD/MM/YYYY HH:mm:ss')}</td>
                        <td>{item.kyc_status}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/customer/edit/${item.customer_id}`}>
                              <ButtonFill>
                                <IconEdit />
                              </ButtonFill>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="h-full">
                      <td colSpan={8} className="text-center">
                        <div className="flex justify-center items-center">
                          ไม่พบข้อมูล
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Pagination
                count={count}
                currentPage={refPage.current ?? 1}
                onPageChange={(pageValue) => {
                  refPage.current = pageValue;
                  handleFilter();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(CustomerPage);