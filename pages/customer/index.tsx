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
  IconSearch
} from "@/components/icon";
import InputCustom from "@/components/input/input";
import Datepicker, { DateRangeType } from "react-tailwindcss-datepicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ButtonOutline from "@/components/buttons/button_outline";
import { Backend } from "@/lib/axios";
import { Customer } from "@/model/customer";
import { ButtonFill } from "@/components/buttons";
import Link from "next/link";
import Pagination from "@/components/share/pagination";
import { Download, Upload, FileText, X, RefreshCw } from "lucide-react";

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

  // Filter states
  const [filterUsername, setFilterUsername] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeType>(initDateRange());

  // Table states
  const [isFillForm, setIsFillForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number>(0);
  const refPage = useRef(1);
  const [data, setData] = useState<Customer[]>([]);

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
      const { data: customerData, count: totalCount } = res_customer_list.data;

      setData(customerData);
      setCount(totalCount);
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
    setDateRange(initDateRange());
    refPage.current = 1;
    handleFilter();
  };

  // Download template handler
  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = '/temp/Jadepay_Onboarded_Customer_Data_Template.xlsx';
      link.download = 'Jadepay_Onboarded_Customer_Data_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('ดาวน์โหลดไม่สำเร็จ');
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
  const validateFile = (file: File): string | null => {
    // ตรวจสอบขนาดไฟล์ (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return 'ขนาดไฟล์ต้องไม่เกิน 50MB';
    }

    // ตรวจสอบนามสกุลไฟล์
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      return 'กรุณาเลือกไฟล์ .xlsx, .xls หรือ .csv เท่านั้น';
    }

    return null;
  };

  // Async upload handler
  const handleUpload = async () => {
  if (!uploadFile) {
    alert('กรุณาเลือกไฟล์ก่อน');
    return;
  }

  // Basic validation
  const validationError = validateFile(uploadFile);
  if (validationError) {
    alert(validationError);
    return;
  }

  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append('file', uploadFile);

    // เรียก NextJS API Route
    const response = await fetch('/api/ict-partner/upload-customer', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    alert(`ส่งไฟล์สำเร็จ! ระบบกำลังประมวลผลในพื้นหลัง`);
    
    // เคลียร์ไฟล์ทันที
    clearUpload();
    
  } catch (error: any) {
    console.error('Upload failed:', error);
    alert('อัปโหลดไม่สำเร็จ: ' + error.message);
  } finally {
    setIsUploading(false);
  }
};

  // Clear upload state
  const clearUpload = () => {
    setUploadFile(null);
    if (uploadFileRef.current) {
      uploadFileRef.current.value = '';
    }
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Manual refresh handler
  const handleRefresh = () => {
    refPage.current = 1;
    handleFilter();
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
                  {isUploading ? 'Uploading...' : 'Upload File'}
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
                    <span className="text-sm font-medium text-gray-900">{uploadFile.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(uploadFile.size)})</span>
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
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Register Date</th>
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
                        <td>{item.user_id}</td>
                        <td>{`${item.fullname}`.trim()}</td>
                        <td>{item.email}</td>
                        <td>{dayjs(item.created_at).format('DD/MM/YYYY HH:mm:ss')}</td>
                        <td>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            item.kyc_status === 'approved' ? 'bg-green-100 text-green-800' :
                            item.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            item.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.source}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/customer/edit/${item.customer_id}`}>
                              <ButtonFill className="px-3 py-2">
                                <IconEdit />
                              </ButtonFill>
                            </Link>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(CustomerPage);