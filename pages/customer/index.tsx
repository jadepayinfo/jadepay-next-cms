import { NextPage } from "next";
import withAuth from "@/hoc/with_auth";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { useEffect, useRef, useState } from "react";
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
import { Customer } from "@/model/customer";
import { ButtonFill } from "@/components/buttons";
import Link from "next/link";
import Pagination from "@/components/share/pagination";
import {
  Download,
  Upload,
  FileText,
  X,
  RefreshCw,
  View,
  UserCheck,
} from "lucide-react";

import AlertSBD from "@/components/share/modal/alert_sbd";
import axios from "axios";
import * as XLSX from "xlsx";

import { FileCustomerUpoad } from "@/model/ict_customer_upload";
dayjs.extend(utc);

interface Props {}

interface ExcelRow {
  [key: string]: string | number | Date | null;
}

const CustomerPage: NextPage<Props> = (props) => {
  const limit = 10;

  const initDateRange = () => {
    const start = dayjs.utc().startOf("month");
    const end = dayjs.utc().endOf("month");
    return { startDate: null as any, endDate: null as any };
  };

  // Filter states
  const [filterUsername, setFilterUsername] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeType>(initDateRange());
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  // Table states
  const [isFillForm, setIsFillForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number>(0);
  const refPage = useRef(1);
  const [data, setData] = useState<Customer[]>([]);

  
  // check bok
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const handleCheckboxChange = (customerId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    }
  };

  // Upload states (simplified for async)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  const handleDateValueChange = (newValue: any) => {
    setDateRange(newValue);
  };

  const handleFilter = async () => {
    setIsFillForm(true);
    setLoading(true);

    let params = `page=${refPage.current}&limit=${limit}`;

    if (filterUsername) {
      params += `&mobile_no=${filterUsername}`;
    }
    if (filterName) {
      params += `&name=${filterName}`;
    }
    if (dateRange?.startDate && dateRange?.endDate) {
      const startDate = dayjs(dateRange.startDate).startOf("day").unix();
      const endDate = dayjs(dateRange.endDate).endOf("day").unix();
      params += `&registered_at_start=${startDate}&registered_at_end=${endDate}`;
    }
    if (source !="" &&source!= "All") {      
      params += `&source=${source}`;
    }
    if (status !="" &&status!= "All") {      
      params += `&status=${status}`;
    }

    try {
      const res_customer_list = await axios.get(`/api/customer/list?${params}`);

      const { data, count } = res_customer_list.data;
      const totalPages = Math.ceil(count / limit);
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
    setFilterUsername("");
    setFilterName("");
    setDateRange(initDateRange());
    refPage.current = 1;
    handleFilter();
  };

  // Download template handler
  const handleDownload = async () => {
    try {
      const link = document.createElement("a");
      link.href = "/temp/Jadepay_Onboarded_Customer_Data_Template.xlsx";
      link.download = "Jadepay_Onboarded_Customer_Data_Template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("ดาวน์โหลดไม่สำเร็จ");
    }
  };

  // Upload handlers (async - fire and forget)
  const handleUploadClick = () => {
    uploadFileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  // Simplified file validation
  const validateFile = async (file: File): Promise<string | null> => {
    // check file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return "ขนาดไฟล์ต้องไม่เกิน 50MB";
    }

    // check file extention
    const fileName = file.name.toLowerCase();
    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".csv")
    ) {
      return "กรุณาเลือกไฟล์ .xlsx, .xls หรือ .csv เท่านั้น";
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // แปลงเป็น array of arrays เพื่อเข้าถึงข้อมูลได้ง่าย
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // ใช้ array index แทน column names
        defval: null, // ค่า default สำหรับ empty cells
      });

      // check row 2 (index 1)
      const secondRow = data[1]; // row 2 (index 1)

      if (!Array.isArray(secondRow) || secondRow.length < 3) {
        return "พบข้อมูลน้อยกว่าหรือเท่ากับ 1 แถว กรุณาตรวจสอบไฟล์อีกครั้ง";
      }

      const firstCol = secondRow[0]; // column
      const secondCol = secondRow[1]; // column B
      const thirdCol = secondRow[2]; // column C

      if (!firstCol || !secondCol || !thirdCol) {
        return "พบข้อมูลน้อยกว่าหรือเท่ากับ 1 แถว กรุณาตรวจสอบไฟล์อีกครั้ง";
      }
    } catch (error) {
      return "เกิดข้อผิดพลาดในการอ่านไฟล์";
    }

    return null;
  };

  // Async upload handler
  const handleUpload = async () => {
    if (!uploadFile) {
      alert("กรุณาเลือกไฟล์ก่อน");
      return;
    }

    // Basic validation
    const validationError = await validateFile(uploadFile);
    if (validationError) {
      AlertSBD.fire({
        icon: "error",
        titleText: validationError,
        text: "",
        showConfirmButton: false,
      });
      return;
    }

    setIsUploading(true);

    try {
      const excelData = await readExcelToJSON(uploadFile);
      const uploadCustomers: FileCustomerUpoad[] = [];
      excelData.forEach((row, index) => {
        try {
          console.log("row :", row);
          const data: FileCustomerUpoad = {
            name: String(row["Name"] || ""),
            phone_number: String(row["Phone Number"] || 0),
            Passport: String(row["Passport"] || ""),
            dob: dayjs(row["DOB (MM/DD/YYYY)"]).format("YYYY-MM-DD"),
            issue_date: dayjs(row["Issue Date"]).format("YYYY-MM-DD"),
            expire_date: dayjs(row["Expire Date"]).format("YYYY-MM-DD"),
            issue_country: String(row["Issue Country"] || ""),
            gender: String(row["Gender"] || ""),
            status: String(row["Status"] || ""),
            email: String(row["GMAIL"] || ""),
            selfieImg: row["Selfie"] ? String(row["Selfie"]) : null,
            passportImg: row["Passport Photo"]
              ? String(row["Passport Photo"])
              : null,
            work_permitImg: row["Work Permit Photo"]
              ? String(row["Work Permit Photo"])
              : null,
            work_permitImg_back: row["Work Permit Back"]
              ? String(row["Work Permit Back"])
              : null,
            pink_card_front: row["Pink Card (Front)"]
              ? String(row["Pink Card (Front)"])
              : null,
            pink_card_back: row["Pink Card (Back)"]
              ? String(row["Pink Card (Back)"])
              : null,
            name_list: row["Name List"] ? String(row["Name List"]) : null,
            work_permit_no: row["Work Permit"]
              ? String(row["Work Permit"])
              : null,
            pink_card_no: row["Pink Card"] ? String(row["Pink Card"]) : null,
            work_permit_issue_date: dayjs(row["Issue Date_1"]).format(
              "YYYY-MM-DD"
            ),
            work_permit_exprie_date: dayjs(row["Exprie Date"]).format(
              "YYYY-MM-DD"
            ),
            work_permit_issue_country: String(row["Issue Country_1"] || ""),
            company_name: String(row["Company Name"] || ""),
            address: String(row["Address"] || ""),
            town: String(row["Town"] || ""),
            city: String(row["City"] || ""),
            State: String(row["State"] || ""),
            zip_code: String(row["Zip Code"] || 0),
            Remarks: String(row["Remarks"] || ""),
            monthly_income: String(row["Monthly Income"] || ""),
            Nationality: String(row["Nationality"] || ""),
            occupation: String(row["Occupation"] || ""),
            other_occupation: String(row["Other Occupation"] || ""),
            resident_type: String(row["Resident Type"] || ""),
          };
          uploadCustomers.push(data);
        } catch (error) {
          console.error(`Error processing row ${index + 1}:`, error);
          return;
        }
      });

      const response = await axios.post("/api/ict-partner/upload-customer", {
        uploadCustomers,
        file_name: uploadFile.name,
      });

      alert(`ส่งไฟล์สำเร็จ! ระบบกำลังประมวลผลในพื้นหลัง`);

      clearUpload();
    } catch (error: any) {
      alert("อัปโหลดไม่สำเร็จ: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Clear upload state
  const clearUpload = () => {
    setUploadFile(null);
    if (uploadFileRef.current) {
      uploadFileRef.current.value = "";
    }
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // read file to json
  const readExcelToJSON = async (file: File): Promise<ExcelRow[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      cellDates: true,
      dateNF: "yyyy-mm-dd",
      raw: false,
    });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      dateNF: "yyyy-mm-dd",
      defval: null,
      blankrows: false,
      raw: false,
    }) as ExcelRow[];
    console.log("jsonData : ", jsonData);
    return jsonData;
  };

  // Manual refresh handler
  const handleRefresh = () => {
    refPage.current = 1;
    handleFilter();
  };

  const handleProcess = async () => {
    try {
      const response = await axios.post("/api/ict-partner/submit-to-ict", {
        user_ids: selectedCustomers,
      });

      if (response.status == 200) {
        setData((prevData) =>
          prevData.map((item) =>
            selectedCustomers.includes(item.customer_id)
              ? { ...item, kyc_status: "Processing" }
              : item
          )
        );
        setSelectedCustomers([]);
        alert("ส่งข้อมูลลูกค้าไปยัง ICT สำเร็จ");
        handleFilter();
      }
    } catch (error) {
      console.error("Submit to ICT error:", error);
      // withAuth interceptor จะจัดการ 401/403 แล้ว
    }
  };

  const handleApproveKYC = async (UserIdId: number, customerName: string) => {
    const confirmResult = confirm(
      `ต้องการแก้ไขข้อมูล approve สำหรับ ${customerName} หรือไม่?`
    );
    if (!confirmResult) return;
    try {
      const response = await axios.post("/api/kyc/approve-kyc", {
        user_id: UserIdId,
      });

      handleFilter();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการแก้ไข Approve");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await handleFilter();
      setLoading(false);
      setIsFillForm(true);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="p-4">
        <Breadcrumbs title="Customer" items={[{ label: "" }]} />
        <div className="p-4 border border-[--border-color] rounded-lg mt-5">
          <div>
            {/* Header with Download/Upload buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Search User</div>

              <div className="flex gap-2">
                {/* Download Template Button */}
                <ButtonOutline
                  className="flex items-center gap-2 px-4 py-2 border border-[--border-color] rounded-md hover:bg-gray-50"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </ButtonOutline>

                {/* Upload Button */}
                <ButtonOutline
                  className="flex items-center gap-2 px-4 py-2 border border-[--border-color] rounded-md hover:bg-gray-50"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload File"}
                </ButtonOutline>

                {/* Refresh Button */}
                <ButtonOutline
                  className="flex items-center gap-2 px-4 py-2 border border-[--border-color] rounded-md hover:bg-gray-50"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </ButtonOutline>

                {/* Hidden file input */}
                <input
                  ref={uploadFileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Upload File Preview */}
            {uploadFile && (
              <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {uploadFile.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(uploadFile.size)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isUploading && (
                      <ButtonFill
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        onClick={handleUpload}
                      >
                        Upload
                      </ButtonFill>
                    )}

                    <button
                      onClick={clearUpload}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simple loading indicator */}
                {isUploading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    กำลังส่งไฟล์...
                  </div>
                )}
              </div>
            )}

            {/* Search Filters */}
            <div className="flex gap-4 items-center pb-4">
              <div className="mt-4">
                <IconFilter className="text-[30px]" />
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
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="" disabled>
                    Source
                  </option>
                  <option value="All">All</option>
                  <option value="Online">Online</option>
                  <option value="FileUpload">FileUpload</option>
                  <option value="ICT">ICT</option>
                </select>
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
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Wait for review">Waiting for review</option>
                  <option value="Operation save">Operation save</option>
                  <option value="Approved by Jadepay">Approved by Jadepay</option>
                  <option value="Processing">Processing</option>
                  <option value="Waiting for ICT Approval">Waiting for ICT Approval</option>
                  <option value="KYC completed">KYC completed</option>
                </select>
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

          {/* Data Table */}
          <div>
            <div className="overflow-x-auto border border-[--border-color] rounded-lg">
              <table className="table">
                <thead>
                  <tr className="border-[--border-color]">
                    <th></th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Register Date</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="h-full">
                      <td colSpan={6} className="text-center">
                        <div className="flex justify-center items-center">
                          <span className="loading loading-dots loading-sm text-primary"></span>
                        </div>
                      </td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data?.map((item, index) => (
                      <tr key={index} className="hover border-[--border-color]">
                        <td>
                          {item.kyc_status === "Processing" ||
                          item.kyc_status === "Waiting for ICT approval" ||
                          item.kyc_status === "duplicate" ||
                          item.kyc_status === "KYC complete" ? (
                            <div className="w-4 h-4"></div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(
                                item.customer_id
                              )}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  item.customer_id,
                                  e.target.checked
                                )
                              }
                            />
                          )}
                        </td>
                        <td>{item.mobile_no}</td>
                        <td>{`${item.fullname}`.trim()}</td>
                        <td>{item.email}</td>
                        <td>
                          {dayjs(item.created_at).utc().format("DD/MM/YYYY")}
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              item.kyc_status === "Waiting for review" ? "bg-yellow-100 text-gray-700":
                              item.kyc_status === "Operation Save" ? "bg-green-100 text-gray-800":
                              item.kyc_status === "Approved by Jadepay" ? "bg-green-200 text-gray-800":
                              item.kyc_status === "Processing" ? "bg-blue-100 text-gray-800":
                              item.kyc_status === "Waiting for ICT Approval" ? "bg-blue-200 text-gray-800":
                              item.kyc_status === "KYC completed" ? "bg-blue-900 text-white":
                              item.kyc_status === "Reject" || item.kyc_status === "duplicate"  ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.kyc_status}
                          </span>
                        </td>
                        <td>{item.source}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/customer/edit/${item.customer_id}`}>
                              {item.kyc_status === "Approved by Jadepay" ||
                              item.kyc_status === "duplicate" ||
                              item.kyc_status === "Waiting for ICT Approval" ||
                              item.kyc_status === "KYC Completed" ? (
                                <ButtonFill
                                  className="px-3 py-2 btn-primary"
                                  title="View Details"
                                >
                                  <View className="w-4 h-4" />
                                </ButtonFill>
                              ) : (
                                <ButtonFill
                                  className="px-3 py-2 btn-warning"
                                  title="Edit Customer"
                                >
                                  <IconEdit />
                                </ButtonFill>
                              )}
                            </Link>
                            {item.kyc_status === "duplicate" ||
                            item.kyc_status === "Waiting for ICT Approval" ? (
                              <ButtonFill
                                className="px-3 py-2 btn-info"
                                onClick={() =>
                                  handleApproveKYC(item.user_id, item.fullname)
                                }
                                title="Approved KYC"
                              >
                                <UserCheck className="w-4 h-4" />
                              </ButtonFill>
                            ) : (
                              ""
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="h-full">
                      <td colSpan={6} className="text-center">
                        <div className="flex justify-center items-center">
                          ไม่พบข้อมูล
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

            <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-lg mt-5">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* KYC Status Flow */}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    KYC Status Flow:
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Step 1 */}
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-normal text-[12px]">
                      1. Pending (User entry)
                    </span>
                    <span className="text-gray-400">→</span>
                    {/* Step 2 */}
                    <span className="px-3 py-1 bg-yellow-100 text-gray-700 rounded-full font-normal text-[12px]">
                      2. Waiting for review
                    </span>
                    <span className="text-gray-400">→</span>

                    {/* Step 3 */}
                    <span className="px-3 py-1 bg-green-100 text-gray-800 rounded-full font-medium text-[12px]">
                      3. Operation Save
                    </span>
                    <span className="text-gray-400">→</span>
                    {/* Step 4 */}
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full font-medium text-[12px]">
                      4. Approved by Jadepay
                    </span>
                    <span className="text-gray-400">→</span>
                    {/* Step 5 */}
                    <span className="px-3 py-1 bg-blue-100 text-yellow-800 rounded-full font-medium text-[12px]">
                      5. Processing
                    </span>
                    <span className="text-gray-400">→</span>

                    {/* Step 6 */}
                    <span className="px-3 py-1 bg-blue-200 text-yellow-800 rounded-full font-medium text-[12px]">
                      6. Waiting for ICT Approval
                    </span>
                    <span className="text-gray-400">→</span>

                    {/* Step 7 */}
                    <span className="px-3 py-1 bg-blue-900 text-white rounded-full font-medium text-[12px]">
                      7. KYC completed
                    </span>
                  </div>

                </div>

                {/* Action Button */}
                <div className="flex gap-4 items-center">
                  <ButtonFill
                    className="btn btn-primary btn-sm p-3 min-h-[38px]"
                    type="button"
                    onClick={handleProcess}
                  >
                    {"send to ICT"}
                    {loading && (
                      <span className="ml-1 loading loading-spinner"></span>
                    )}
                  </ButtonFill>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(CustomerPage);
