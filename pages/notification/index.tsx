import { NextPage } from "next";
import withAuth from "@/hoc/with_auth";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import InputCustom from "@/components/input/input";
import {
  IconCalendar,
  IconCloseOutline,
  IconFilter,
  IconSearch,
} from "@/components/icon";
import Pagination from "@/components/share/pagination";
import { Notification } from "@/model/notification";
import ButtonOutline from "@/components/buttons/button_outline";
import ButtonFill from "@/components/buttons/button_fill";
import Datepicker, { DateRangeType } from "react-tailwindcss-datepicker";
import { useEffect, useRef, useState } from "react";
//import CardNotification from '@/components/feature/notification/card_notification';
import { Backend, initHeaderWithServerSide } from "@/lib/axios";
import Router, { useRouter } from "next/router";
import { dateToUnix } from "@/lib/time";
import axios from "axios";
import dayjs from "dayjs";

interface Props {}
const NotificationPage: NextPage<Props> = (props) => {
  const router = useRouter();
  const date = new Date();
  const [dateRange, setDateRange] = useState<DateRangeType>();
  const [filterUsername, setFilterUsername] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const refPage = useRef(1);
  const limit = 10;
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log("dateRangedateRangedateRange : " + dateRange);
  }, [dateRange]);

  const handleDateValueChange = (newValue: any) => {
    setDateRange(newValue);
  };

  const goToCreate = () => {
    router.push("/notification/create");
  };

  const handleFilter = async () => {
    let params = `page=${refPage.current}&limit=${limit}`;

    if (filterUsername) {
      params += `&mobile_no=${filterUsername}`;
    }
    if (title != "") {
      if (params != "") {
        params += "&";
      }
      params += `title=${title}`;
    }

    if (dateRange != null) {
      if (params != "") {
        params += "&";
      }
      const date_from = dateToUnix(dateRange?.startDate!);
      const date_to = dateToUnix(dateRange?.endDate!);
      params += `date_from=${date_from}&date_to=${date_to}`;
    }
    //router.push(`/notification?${params}`);
    try {
      const res_customer_list = await axios.get(`/api/notification/list_notification?${params}`);

      const { data, count } = res_customer_list.data;
      const totalPages = Math.ceil(count / limit);
      console.log(data)
      setData(data);
      setCount(totalPages);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setData([]);
      setCount(0);
    }
  };

  const clearFilter = () => {
    let setDateRangeNull = {
      startDate: null,
      endDate: null,
    };
    handleDateValueChange(setDateRangeNull);
    setFilterUsername("");
    setTitle("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await handleFilter();
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="p-4">
        <Breadcrumbs
          title="Notification"
          items={[
            {
              label: "Notification",
            },
          ]}
        />
        <div className="p-4 border border-[--border-color] rounded-lg mt-5">
          <div className="flex items-center justify-between">
            <div>Notification</div>
            <ButtonFill
              className="btn btn-primary btn-sm p-3 min-h-[42px] mt-4"
              onClick={goToCreate}
            >
              Create Notification
            </ButtonFill>
          </div>
          <div className="flex flex-wrap gap-4 items-center pb-4 ">
            <div className="mt-4">
              <IconFilter className="text-[30px] " />
            </div>
            <div className="grow min-w-[120px]">
              <InputCustom
                className=""
                name="Mobile No."
                title="Mobile No."
                type="text"
                placeholder="Mobile No."
                value={title}
                onChange={(e) => setFilterUsername(e.target.value)}
              />
            </div>
            <div className="grow min-w-[120px]">
              <InputCustom
                className=""
                name="title"
                title="Title"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mt-4 grow date-box relative w-full max-w-[220px] border-2 border-[--border-color]  rounded-md">
              <Datepicker
                showShortcuts={true}
                displayFormat={"DD/MM/YYYY"}
                inputClassName="ss:text-[12px] xs:text-[14px]"
                value={dateRange!}
                onChange={handleDateValueChange}
                toggleIcon={() => false}
                inputId="daterange"
                placeholder="Date"
              />
              <label
                className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
                htmlFor="daterange"
              >
                <IconCalendar className="text-[20px]" />
              </label>
            </div>
            {/* <div className="mt-4 grow">
              <select
                className="select select-ui min-w-[150px]"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value={''} className="text-">
                  Platform
                </option>
                {platformOption.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div> */}
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
          <div>
            <div className="overflow-x-auto border border-[--border-color] rounded-lg">
              <table className="table">
                <thead>
                  <tr className="border-[--border-color]">
                    <th></th>
                    <th>Icon</th>
                    <th>Notification Type</th>
                    <th>Send Type</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Send To User</th>
                    <th>Send Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="h-full">
                      <td colSpan={5} className="text-center">
                        <div className="flex justify-center items-center">
                          <span className="loading loading-dots loading-sm text-primary"></span>
                        </div>
                      </td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={index} className="hover border-[--border-color]">
                        <td>{index + 1}</td>
                        <td>
                          {item.img_url ? (
                            <img
                              src={item.img_url}
                              alt="notification"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400">No icon</span>
                          )}
                        </td>
                        <td>{item.topic || "-"}</td>
                        <td>{item.type || "-"}</td>
                        <td>
                          {item.subject || "-"}
                        </td>
                        <td className="max-w-xs truncate">
                           {item.description|| "-"}
                        </td>
                         <td className="max-w-xs truncate">
                          {item.specific_users && item.specific_users.length > 0
                            ? item.specific_users.join(", ")
                            : "-"}
                        </td>
                        <td>
                          {dayjs(item.created_at).utc().format("DD/MM/YYYY")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-gray-500 py-4"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* {props.data.map((item) => {
              return (
                <CardNotification
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  title={item.title}
                  message={item.message}
                  send_date={item.send_date}
                  platforms={item.platforms}
                />
              );
            })} */}
          </div>
          <div>
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

export default withAuth(NotificationPage);
