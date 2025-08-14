import { FC, FormEventHandler, useEffect, useRef, useState } from "react";
import { Customer, CustomerAddress, CustomerAddressRequest, CustomerDataRequest, CustomerInfo, CustomerRequest } from "@/model/customer";
import DocumentTable from "./DocumentTable";
import { useRouter } from "next/router";
import { getDateTimeNow, unixToDateString } from "@/lib/time";
import { CatalogueItem } from "@/model/catalogueItem";
import Datepicker, { DateRangeType, DateType } from "react-tailwindcss-datepicker";
import axios from "axios";
import {   User,  FileText,  BookUser, MapPin} from "lucide-react";
import InputCustom from "@/components/input/input";
import { IconCalendar } from "@/components/icon";
import Select, { components } from "react-select";
import { ButtonFill, ButtonOutline } from "@/components/buttons";
import ImagePopup from "./ImagePopup";
import { KycDocument, KycInfo } from "@/model/kyc";

interface Props {
 customerInfo?: CustomerInfo;
}

const initStartDate = (data?: number) => {
  let currentDate = getDateTimeNow();

  if (data) {
    const newDate = new Date(unixToDateString(data));
    return {
      startDate: newDate,
      endDate: newDate,
    };
  } else {
    const newDate = new Date(currentDate);
    newDate.setHours(0, 0);
    return {
      startDate: newDate,
      endDate: newDate,
    };
  }
};

type SelectOption = {
  value: number;
  label: string;
};

const CustomerForm: FC<Props> = ({ customerInfo }) => {
  const router = useRouter();
  const initPage = useRef<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Selfie Image
  const [selfeIMG, setSelfieIMG] = useState<number | undefined| null >(undefined);
  // Customer Info
  const [Fullname, setFullname] = useState(
    customerInfo?.customer_data?.customer?.fullname ?? ""
  );
  const [Email, setEmail] = useState(
    customerInfo?.customer_data?.customer?.email ?? ""
  );
  const [MobileNo, setMobileNo] = useState(
    customerInfo?.customer_data?.customer?.mobile_no ?? ""
  );
  const [Gender, setGender] = useState(
    customerInfo?.customer_data?.customer?.gender ?? ""
  );
  const [Marital, setMarital] = useState(
    customerInfo?.customer_data?.customer?.marital ?? ""
  );
  const [Residential, setResidential] = useState(
    customerInfo?.customer_data?.customer?.residential ?? ""
  );
  const [KycLevel, setKycLevel] = useState(
    customerInfo?.kyc_data.kyc_data.kyc_level ?? ""
  );
  const [KycScore, setKycScore] = useState(
    customerInfo?.kyc_data.kyc_data.kyc_score ?? ""
  );
  const [KycRiskStatus, setKycRiskStatus] = useState(
    customerInfo?.kyc_data.kyc_data.kyc_risk_status ?? ""
  );
  const [KycStatus, setKycStatus] = useState(
    customerInfo?.kyc_data.kyc_data.kyc_status ?? ""
  );
  // DDL Nationality
  const [NationalityList, setNationalityList] = useState<SelectOption[]>([]);
  const [Nationality, setNationality] = useState<SelectOption>();
  const [LoadingOwnerNationality, setLoadingOwnerNationality] = useState(false);
  const rawNationalityList = useRef<CatalogueItem[]>([]);
  const [ownerNationality, setOwnerNationality] = useState<CatalogueItem | null>();
  // DDL Occupation
  const [OccupationList, setOccupationList] = useState<SelectOption[]>([]);
  const [Occupation, setOccupation] = useState<SelectOption>();
  const [LoadingOwnerOccupation, setloadingOwnerOccupation] = useState(false);
  const rawOccupationList = useRef<CatalogueItem[]>([]);
  const [ownerOccupation, setOwnerOccupation] =    useState<CatalogueItem | null>();
  // DDL MonthlyIncome
  const [MonthlyIncomeList, setMonthlyIncomeList] = useState<SelectOption[]>([] );
  const [MonthlyIncome, setMonthlyIncome] = useState<SelectOption>();
  const [LoadingOwnerMonthlyIncome, setLoadingOwnerMonthlyIncome] =    useState(false);
  const rawMonthlyIncomeList = useRef<CatalogueItem[]>([]);
  const [ownerMonthlyIncome, setOwnerMonthlyIncome] =    useState<CatalogueItem | null>();
  //DOB
  const dateDOBString = customerInfo?.customer_data?.customer?.dob ?? "";
  const dateDOB = new Date(dateDOBString);
  const [dob, setDOB] = useState<DateRangeType>(
    initStartDate(dateDOB.getTime() / 1000)
  );
  //Address
  const objaddress = customerInfo?.customer_data?.customer_address;
  const objContractaddress = objaddress?.find( (i) => i?.address_type === "contact"  );
  const objWorkctaddress = objaddress?.find((i) => i?.address_type === "work");
  const ContactAddressId = objContractaddress?.address_id ?? 0;
  const [ContactAddress, setContactAddress] = useState(objContractaddress?.address ?? "");
  const [ContactSubDistrict, setContactSubDistrict] = useState(objContractaddress?.sub_district ?? "");
  const [ContactCity, setContactCity] = useState(objContractaddress?.city ?? "" );
  const [ContactState, setContactState] = useState(objContractaddress?.state ?? "");
  const [ContactZipcode, setContactZipcode] = useState(objContractaddress?.zipcode ?? "");

  const WorkAddressId = objWorkctaddress?.address_id ?? 0;
  const [WorkCompanyName, setCompanyName] = useState(objWorkctaddress?.company_name ?? "");
  const [WorkAddress, setWorkAddress] = useState(objWorkctaddress?.company_address ?? "");
  const [WorkSubDistrict, setWorkSubDistrict] = useState(objWorkctaddress?.sub_district ?? "");
  const [WorkCity, setWorkCity] = useState(objWorkctaddress?.city ?? "");
  const [WorkState, setWorkState] = useState(objWorkctaddress?.state ?? "");
  const [WorkZipcode, setWorkZipcode] = useState(objWorkctaddress?.zipcode ?? "" );

  //docement
  const [documents, setDocuments] = useState(customerInfo?.kyc_data.kyc_documents ?? []);
  const primaryDocs = documents.filter(doc =>
    doc.document_info?.toLowerCase().includes("primary")
  );

  // kyc data
  const [kyc, setKyc] = useState(customerInfo?.kyc_data.kyc_data ?? null);
  // popup open image & rotation
  const [popupImageUrl, setPopupImageUrl] = useState<string | null>(null);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [rotationAngles, setRotationAngles] = useState<Record<number, number>>({});
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const openPopup = async (docId: number) => {
    setIsImageLoading(true);
    try {
      // fetch รูปภาพจาก backend
      const resp = await fetch(`/api/kyc/get-document?kyc-doc-id=${docId}`);
      if (!resp.ok) throw new Error("Cannot fetch image");
      const blob = await resp.blob();

      // มุมหมุนปัจจุบัน
      const rotation = rotationAngles[docId] ?? 0;

      // หมุนรูปถ้าจำเป็น (ใช้ฟังก์ชัน rotateImage ที่มีอยู่)
      let url: string;
      if (rotation === 0) {
        url = URL.createObjectURL(blob);
      } else {
        const rotatedBlob = await rotateImage(blob, rotation);
        url = URL.createObjectURL(rotatedBlob);
      }

      setPopupImageUrl(url);
      setCurrentDocId(docId);
    } catch (err) {
      alert("โหลดรูปไม่สำเร็จ");
    } finally {
      setIsImageLoading(false);
    }
  };

  const closePopup = () => {
    if (popupImageUrl) {
      URL.revokeObjectURL(popupImageUrl);
    }
    setPopupImageUrl(null);
    setCurrentDocId(null);
  };
 
    // บันทึกมุมการหมุนจาก popup (ยังไม่อัปโหลดไฟล์)
  const saveRotation = async (rotation: number) => {
    if (currentDocId === null) return;
    console.log("saveRotation : ", rotation, currentDocId);
    setRotationAngles((prev) => ({
      ...prev,
      [currentDocId]: rotation,
    }));

  };

  const handleSaveDocument = async (doc: KycDocument,rotation: number) => {
  try {
    // 1. ดึงรูปภาพต้นฉบับจาก backend
    const imageResponse = await fetch(`/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}`);
    if (!imageResponse.ok) throw new Error("Cannot fetch image file");

    const blob = await imageResponse.blob();

    // 3. หมุนรูป blob ถ้ามุม 0 ให้ใช้ blob เดิมเลย

    const rotatedBlob = rotation === 0 ? blob : await rotateImage(blob, rotation);
    const file = new File([rotatedBlob], `document_${doc.kyc_doc_id}.jpg`, { type: "image/jpeg" });

    // 5. สร้าง FormData เพื่อส่งข้อมูลไป API
    const formData = new FormData();
    formData.append("file", file);
    formData.append("config", doc.kyc_doc_id.toString()); // กำหนดค่าตาม API ต้องการ
    formData.append("position", "FRONT"); // กำหนดค่าตาม API ต้องการ

    // 6. เรียก API upload (แก้ URL ให้ตรงกับ backend จริง)
    const uploadResponse = await fetch("/api/kyc/upload-document", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload failed");
    }

    alert("อัปโหลดเอกสารสำเร็จ");
  } catch (error) {
    console.error("Upload failed", error);
    alert("อัปโหลดเอกสารล้มเหลว");
  }
};

  const handleDeleteDocument = (doc: KycDocument) => {
    console.log("Delete", doc);
  };

  const handleChangeStartDate = (value: DateType) => {
    let date = new Date(dob.startDate!);
    const hour = date.getHours();
    const min = date.getMinutes();
    // set new date with old time
    let newDate = new Date(value!);
    newDate.setHours(hour, min);
    setDOB({
      startDate: newDate,
      endDate: newDate,
    });
  };
  
  const mappingNationality = (select: SelectOption | undefined) => {
    if (select) {
      const rawArray = Object.values(rawNationalityList.current).filter((item): item is CatalogueItem => typeof item === "object" && "id" in item);
      const owner = rawArray.find((i) => i.id === select?.value);
      setOwnerNationality(owner);
    } else {
      setOwnerNationality(null);
    }
  };
  const mappingOccupation = (select: SelectOption | undefined) => {
    if (select) {
      const rawArray = Object.values(rawOccupationList.current).filter((item): item is CatalogueItem => typeof item === "object" && "id" in item);
      const owner = rawArray.find((i) => i.id === select?.value);
      setOwnerOccupation(owner);
    } else {
      setOwnerOccupation(null);
    }
  };
  const mappingMonthlyIncomeList = (select: SelectOption | undefined) => {
     if (select) {
      const rawArray = Object.values(rawMonthlyIncomeList.current).filter((item): item is CatalogueItem => typeof item === "object" && "id" in item);
      const owner = rawArray.find((i) => i.id === select?.value);
      setOwnerMonthlyIncome(owner);
    } else {
      setOwnerMonthlyIncome(null);
    }
  };

  function mergeWithChanges<T extends object>(original: T, update: Partial<T>): T {
  const result = { ...original };

  for (const key in update) {
    if (Object.prototype.hasOwnProperty.call(update, key)) {
      const originalValue = original[key];
      const updatedValue = update[key];

      if (
        updatedValue instanceof Date &&
        (typeof originalValue === "string" || originalValue === null || originalValue === undefined)
      ) {
        // แปลง Date เป็น string (ISO format หรือแค่ YYYY-MM-DD)
        (result as any)[key] = updatedValue.toISOString().split("T")[0]; // "2025-08-06"
      } else {
        (result as any)[key] = updatedValue;
      }
    }
  }

  return result;
}

  const submitButtonHandler: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    //set data to submit
    console.log("set data to submit")
    try {
    // 2. รวบรวมข้อมูลจาก state
    const customer:CustomerDataRequest = {
      customer_id: customerInfo?.customer_data?.customer.customer_id ?? 0,
      user_id: customerInfo?.customer_data?.customer.user_id ?? 0,
      full_name: Fullname,
      email: Email,
      mobile_no: MobileNo,
      nationality: Nationality?.value ? Nationality.value : 147,
      dob: dob.startDate   ? (() => { const date = new Date(dob.startDate);date.setUTCHours(0, 0, 0, 0);return date.toISOString();})()
  : null,
      gender: Gender,
      marital: Marital,
      residential: Residential,
      occupation: Occupation?.value ? Number(Occupation.value) : 0,
      income: MonthlyIncome?.value ? Number(MonthlyIncome.value) : 0,
      active: true,
      updated_by: 0,
      native_name: ""
    };
    
    const original = customerInfo?.customer_data?.customer;
    if (!original) {
       console.log("ไม่พบข้อมูลลูกค้าเดิม")
      setError("ไม่พบข้อมูลลูกค้าเดิม");
      setLoading(false);
      return;
    }
    let customer_address: CustomerAddressRequest[] = [];

    const contactAddressData:CustomerAddressRequest = {
      address_type: "contact",
      address: ContactAddress,
      sub_district: ContactSubDistrict,
      city: ContactCity,
      state: ContactState,
      zipcode: ContactZipcode,
      address_id: ContactAddressId,
      customer_id: customer.customer_id,
      company_address: "",
      company_name:""
    };
   
    const workAddressData:CustomerAddressRequest = {
      address_type: "work",
      address: "",
      sub_district: WorkSubDistrict,
      city: WorkCity,
      state: WorkState,
      zipcode: WorkZipcode,
      address_id: WorkAddressId,
      customer_id: customer.customer_id,
      company_address: WorkAddress,
      company_name: WorkCompanyName
    };
      customer_address.push( contactAddressData);
      customer_address.push( workAddressData);
  

   
    // // 3. ส่งข้อมูลไปที่ API
    const response = await axios.post("/api/customer/update-customer-info", {customer , customer_address});

    // console.log("บันทึกข้อมูลสำเร็จ:", response.data);

    // // หลังจากบันทึกสำเร็จ อาจจะเปลี่ยนเส้นทาง หรือแสดงข้อความสำเร็จ
    // router.push("/success-page");

  } catch (err: any) {
    // หากเกิดข้อผิดพลาด
    console.error("บันทึกข้อมูลไม่สำเร็จ:", err);
    setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    
  } finally {
    // ไม่ว่าจะสำเร็จหรือไม่ ให้หยุดสถานะโหลด
    setLoading(false);
  }
  };
  
  useEffect(() => {
    const getLoadData = async () => {
      try {
        initPage.current = true; // resOccupation,resMonthlyIncome
        const [resNationality, resOccupation, resMonthlyIncome] =
          await Promise.all([
            await axios.get(`/api/masconfig/get-catalogue`, {
              params: {
                config_key: "country",
              },
            }),
            await axios.get(`/api/masconfig/get-catalogue`, {
              params: {
                config_key: "occupation",
              },
            }),
            await axios.get(`/api/masconfig/get-catalogue`, {
              params: {
                config_key: "monthly_income",
              },
            }),
          ]);

        rawNationalityList.current = resNationality.data;
        const mapNationality: SelectOption[] = (
          Object.values(resNationality.data) as CatalogueItem[]
        ).map((item) => ({
          value: item.id, // แปลง id ที่เป็น number ให้เป็น string
          label: item.name_en,
        }));

        const NationalitySelected = mapNationality.find(
          (i: SelectOption) =>
            i.value === customerInfo?.customer_data?.customer?.nationality
        );
        setNationalityList(mapNationality);
        setNationality(NationalitySelected);
        mappingNationality(NationalitySelected);

        rawOccupationList.current = resOccupation.data;
        const mapOccupation: SelectOption[] = (
          Object.values(resOccupation.data) as CatalogueItem[]
        ).map((item) => ({
          value: item.id, // แปลง id ที่เป็น number ให้เป็น string
          label: item.name_en,
        }));

        const OccupationSelected = mapOccupation.find(
          (i: SelectOption) =>
            i.value ===
            customerInfo?.customer_data?.customer?.occupation
        );

        setOccupationList(mapOccupation);
        setOccupation(OccupationSelected);
        mappingOccupation(OccupationSelected);
        rawMonthlyIncomeList.current = resMonthlyIncome.data;
        const mapMonthlyIncome: SelectOption[] = (
          Object.values(resMonthlyIncome.data) as CatalogueItem[]
        ).map((item) => ({
          value: item.id, // แปลง id ที่เป็น number ให้เป็น string
          label: item.name_en,
        }));
        const MonthlyIncomeSelected = mapMonthlyIncome.find(
          (i: SelectOption) =>
            i.value === customerInfo?.customer_data?.customer?.income
        );

        setMonthlyIncomeList(mapMonthlyIncome);
        setMonthlyIncome(MonthlyIncomeSelected);
        mappingMonthlyIncomeList(MonthlyIncomeSelected);

        setLoadingOwnerNationality(false);
        setloadingOwnerOccupation(false);
        setLoadingOwnerMonthlyIncome(false);

      } catch (err: any) {
        console.log("catch err : ", err);
      } finally {
        setLoadingOwnerNationality(false);
      }
    };

    if (!initPage.current) {
      getLoadData();
    }
  }, []);

  useEffect(() => {
    const selfieDoc = customerInfo?.kyc_data.kyc_documents?.find((d) => d.document_info === "Selfie");
    setSelfieIMG(selfieDoc?.kyc_doc_id ?? null);
  }, []);

  return (
    <>
      <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-md mt-5">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">
            Customer Details
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="relative flex flex-col items-center">
            <div className="w-24 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
              {selfeIMG ? (
                <img
                  src={`/api/kyc/get-document?kyc-doc-id=${selfeIMG}`}
                  alt="doc"
                  className="w-20 h-20 object-contain cursor-pointer transition-transform"
                  style={{
                    transform: `rotate(${rotationAngles[selfeIMG] || 0}deg)`,
                  }}
                  onClick={() => openPopup(selfeIMG)}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <User className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-medium">IMG</p>
                  <p className="text-xxs">selfie</p>
                </div>
              )}
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs">
              Upload
            </button>
          </div>
          <div className=" rounded-md p-4">
            <div className="flex">
              <div className="p-0.5  w-48">
                <p className="text-gray-900 text-sm mb-1 mr-2">User ID :</p>
              </div>
              <div className="p-0.5 ">
                <p className="text-gray-900 text-sm mb-1 mr-2">
                  {customerInfo?.customer_data.customer.user_id}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="p-0.5  w-48">
                <p className="text-gray-900 text-sm mb-1 mr-2">
                  Mobile Number :
                </p>
              </div>
              <div className="p-0.5 ">
                <p className="text-gray-900 text-sm mb-1 mr-2">
                  {customerInfo?.customer_data.customer.mobile_no}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="p-0.5  w-48">
                <p className="text-gray-900 text-sm mb-1 mr-2">ID Type :</p>
              </div>
              <div className="p-0.5 ">
                <p className="text-gray-900 text-sm mb-1 mr-2">
                  {primaryDocs.map((doc) => {
                    return <span key={doc.kyc_doc_id}>{doc.doc_type}</span>;
                  })}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="p-0.5  w-48">
                <p className="text-gray-900 text-sm mb-1 mr-2">Nationality :</p>
              </div>
              <div className="p-0.5">
                <p className="text-gray-900 text-sm mb-1 mr-2">
                  {Nationality?.label}
                </p>
              </div>
            </div>
          </div>
          <div className="border border-gray-300 rounded-md bg-gray-100 p-4">
            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                KYC Status :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">{`${kyc?.kyc_status} `}</p>
            </div>
            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                KYC Step :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">{`${kyc?.step} `}</p>
            </div>
            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                Register Date :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">{`${kyc?.created_at} `}</p>
            </div>
            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                Operation Approve by :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">{`${kyc?.operation_approve_by} `}</p>
            </div>
            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                Operation Approve Date :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">{`${kyc?.operation_approve_at} `}</p>
            </div>

            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                KYC Approve Date :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">{`${kyc?.ict_approve_at} `}</p>
            </div>
          </div>
        </div>               
      </div>

      <form onSubmit={submitButtonHandler} id="customerForm">
          <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-md mt-5">
            <div className="flex items-center mb-4">
              <BookUser className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Personal Detail
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              <InputCustom
                name="Frist Name"
                title="Frist Name"
                type="text"
                placeholder="frist name"
                value={Fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />

              <InputCustom
                name="Mobile Name"
                title="Mobile Name"
                type="text"
                placeholder="mobile name"
                value={MobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                required
              />
              <InputCustom
                name="Email"
                title="Email Name"
                type="text"
                placeholder="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex flex-col md:flex-row mt-4">
                <div className="mb-2 md:mb-0 md:mr-4  mt-3 text-xs">DOB</div>
                <div className="date-box rounded-md relative w-full border border-[--border-color] py force-light-background">
                  <Datepicker
                    useRange={false}
                    asSingle={true}
                    displayFormat={"DD/MM/YYYY"}
                    placeholder="DOB"
                    inputClassName="rounded-md min-h-[42px] text-[--text-all] ss:text-[12px] xs:text-sm placeholder:pl-0  w-full"
                    value={dob}
                    onChange={(e) => handleChangeStartDate(e!.startDate)}
                    toggleIcon={() => false}
                    inputId="start_date"
                  />
                  <label
                    className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
                    htmlFor="start_date"
                  >
                    <IconCalendar className="text-[20px]" />
                  </label>
                </div>
              </div>
              <div className="flex flex-col md:flex-row mt-4">
                <div className="mb-2 md:mb-0 md:mr-3  mt-3 text-sm ml-1">
                  Gender
                </div>
                <label className="label justify-start cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    className="radio checked:bg-primary"
                    value={Gender}
                    checked={Gender === "M"}
                    onChange={() => setGender("M")}
                  />
                  <span className="label-text ml-2">Male</span>
                </label>
                <label className="label justify-start cursor-pointer ml-4">
                  <input
                    type="radio"
                    name="gender"
                    className="radio checked:bg-primary"
                    value={Gender}
                    checked={Gender === "F"}
                    onChange={() => setGender("F")}
                  />
                  <span className="label-text ml-2">Female</span>
                </label>
              </div>
              <div className="flex flex-col md:flex-row mt-4">
                <div className="mb-2 md:mb-0 md:mr-4  mt-3 text-sm ml-1">
                  Marital
                </div>
                <label className="label justify-start cursor-pointer">
                  <input
                    type="radio"
                    name="marital"
                    className="radio checked:bg-primary"
                    value={Marital}
                    checked={Marital === "M"}
                    onChange={() => setMarital("M")}
                  />
                  <span className="label-text ml-2">Yes</span>
                </label>
                <label className="label justify-start cursor-pointer ml-4">
                  <input
                    type="radio"
                    name="marital"
                    className="radio checked:bg-primary"
                    value={Marital}
                    checked={Marital === "S"}
                    onChange={() => setMarital("S")}
                  />
                  <span className="label-text ml-2">No</span>
                </label>
              </div>

              <div className="flex flex-col ">
                {" "}
                {/* Modified to flex-col */}
                <div className="mb-2 md:mb-0 md:mr-4 mt-3 text-xs">
                  Nationality
                </div>
                <div className="rounded-md relative w-full force-light-background">
                  {" "}
                  {/* Removed date-box */}
                  <Select
                    classNamePrefix="select-custom"
                    instanceId="Nationality"
                    placeholder="Nationality"
                    options={NationalityList}
                    defaultValue={Nationality}
                    value={Nationality}
                    onChange={(item) => {
                      setNationality(item as SelectOption);
                      mappingNationality(item as SelectOption);
                    }}
                    isLoading={LoadingOwnerNationality}
                  />
                </div>
              </div>
              <div className="flex flex-col ">
                <div className="mb-2 md:mb-0 md:mr-4 mt-3 text-xs">
                  Occupation
                </div>
                <div className="rounded-md relative w-full force-light-background">
                  <Select
                    classNamePrefix="select-custom"
                    instanceId="Occupation"
                    placeholder="Occupation"
                    options={OccupationList}
                    defaultValue={Occupation}
                    value={Occupation}
                    onChange={(item) => {
                      setOccupation(item as SelectOption);
                      mappingOccupation(item as SelectOption);
                    }}
                    isLoading={LoadingOwnerOccupation}
                  />
                </div>
              </div>
              <div className="flex flex-col ">
                <div className="mb-2 md:mb-0 md:mr-4 mt-3 text-xs">Income</div>
                <div className="rounded-md relative w-full force-light-background">
                  <Select
                    classNamePrefix="select-custom"
                    instanceId="MonthlyIncome"
                    placeholder="MonthlyIncome"
                    options={MonthlyIncomeList}
                    defaultValue={MonthlyIncome}
                    value={MonthlyIncome}
                    onChange={(item) => {
                      setMonthlyIncome(item as SelectOption);
                      mappingMonthlyIncomeList(item as SelectOption);
                    }}
                    isLoading={LoadingOwnerMonthlyIncome}
                  />
                </div>
              </div>
              <div className="flex flex-col ">
                <InputCustom
                  name="residential"
                  title="Resident Type"
                  type="text"
                  placeholder="residential"
                  value={Residential}
                  onChange={(e) => setResidential(e.target.value)}
                  required
                />
              </div>
              <InputCustom
                name="KYC level"
                title="KYC Level"
                type="text"
                placeholder="kyc level"
                value={KycLevel}
                readOnly
                disabled={true}
                onChange={(e) => setKycLevel(e.target.value)}
              />
              <InputCustom
                name="Kyc score"
                title="Kyc Score"
                type="text"
                placeholder="Kyc Score"
                readOnly
                disabled={true}
                value={KycScore}
                onChange={(e) => setKycScore(e.target.value)}
              />
              <InputCustom
                name="Kyc risk status"
                title="Kyc risk status"
                type="text"
                placeholder="Kyc risk status"
                readOnly
                disabled={true}
                value={KycRiskStatus}
                onChange={(e) => setKycRiskStatus(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-md mt-5">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Address Information
              </h2>
            </div>
            <div className="flex items-center justify-between text-lg ">
              <div>Word Detail</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              <InputCustom
                name="Company Name"
                title="company Name"
                type="text"
                placeholder="company name"
                value={WorkCompanyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <InputCustom
                name="Address"
                title="Address"
                type="text"
                placeholder="Address"
                value={WorkAddress}
                onChange={(e) => setWorkAddress(e.target.value)}
                required
              />
              <InputCustom
                name="SubDistrict"
                title="SubDistrict"
                type="text"
                placeholder="SubDistrict"
                value={WorkSubDistrict}
                onChange={(e) => setWorkSubDistrict(e.target.value)}
                required
              />
              <InputCustom
                name="City"
                title="City"
                type="text"
                placeholder="City"
                value={WorkCity}
                onChange={(e) => setWorkCity(e.target.value)}
                required
              />
              <InputCustom
                name="State"
                title="State"
                type="text"
                placeholder="State"
                value={WorkState}
                onChange={(e) => setWorkState(e.target.value)}
                required
              />
              <InputCustom
                name="Zipcode"
                title="Zipcode"
                type="text"
                placeholder="Zipcode"
                value={WorkZipcode}
                onChange={(e) => setWorkZipcode(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-lg">
              <div>Contact Detail</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              <InputCustom
                name="Address"
                title="Address"
                type="text"
                placeholder="Address"
                value={ContactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                required
              />
              <InputCustom
                name="SubDistrict"
                title="SubDistrict"
                type="text"
                placeholder="SubDistrict"
                value={ContactSubDistrict}
                onChange={(e) => setContactSubDistrict(e.target.value)}
                required
              />
              <InputCustom
                name="City"
                title="City"
                type="text"
                placeholder="City"
                value={ContactCity}
                onChange={(e) => setContactCity(e.target.value)}
                required
              />
              <InputCustom
                name="State"
                title="State"
                type="text"
                placeholder="State"
                value={ContactState}
                onChange={(e) => setContactState(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
              <InputCustom
                name="Zipcode"
                title="Zipcode"
                type="text"
                placeholder="Zipcode"
                value={ContactZipcode}
                onChange={(e) => setContactZipcode(e.target.value)}
                required
              />
            </div>
          </div>
        </form> 

      
   
      <DocumentTable
        documents={documents}
        nationality={Nationality?.value ?? 0}
        openPopup={openPopup}
        rotationAngles={rotationAngles}
        closePopup={closePopup}
        saveRotation={saveRotation}
        handleSaveDocument={handleSaveDocument}
        handleDeleteDocument={handleDeleteDocument}
      />
    

      <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-lg mt-5">
        {error !== "" ? (
          <p className="text-error text-center text-[16px]">{error}</p>
        ) : null}
        <div className="flex gap-4 items-center justify-end">
          <ButtonOutline
            className="btn btn-sm p-3 min-h-[38px] border-[--border-color] !text-gray-400 hover:!bg-opacity-10  hover:!border-[--border-color]"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </ButtonOutline>

          <ButtonFill
            className="btn btn-primary btn-sm p-3 min-h-[38px]"
            type="submit"
            form="customerForm"
          >
            {"Save"}
            {loading && <span className="ml-1 loading loading-spinner"></span>}
          </ButtonFill>

          <ButtonFill
            className="btn btn-secondary btn-sm p-3 min-h-[38px]"
            type="submit"
            form="customerForm"
          >
            {"Submit"}
            {loading && <span className="ml-1 loading loading-spinner"></span>}
          </ButtonFill>
        </div>
      </div>

      {popupImageUrl && (
        <ImagePopup
          imageUrl={popupImageUrl}
          onClose={closePopup}
          onSaveRotation={saveRotation}
          isLoading={isImageLoading}
        />
      )}
    </>
  );
};

export async function rotateImage(blob: Blob, rotation: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const angleInRadians = (rotation * Math.PI) / 180;

      if (rotation % 180 === 0) {
        canvas.width = img.width;
        canvas.height = img.height;
      } else {
        canvas.width = img.height;
        canvas.height = img.width;
      }

      if (!ctx) return reject("Canvas context not available");

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angleInRadians);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob(
        (rotatedBlob) => {
          if (rotatedBlob) resolve(rotatedBlob);
          else reject("Failed to create blob from canvas");
        },
        "image/jpeg",
        0.95
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

export default CustomerForm;
