import { FC, FormEventHandler, useEffect, useRef, useState } from "react";
import {
  CustomerAddressRequest,
  CustomerDataRequest,
  CustomerInfo,
} from "@/model/customer";
import DocumentTable from "./DocumentTable";
import { useRouter } from "next/router";
import { getDateTimeNow, unixToDateString } from "@/lib/time";
import { CatalogueItem } from "@/model/catalogueItem";
import Datepicker, {
  DateRangeType,
  DateType,
} from "react-tailwindcss-datepicker";
import axios from "axios";
import { User, FileText, BookUser, MapPin } from "lucide-react";
import InputCustom from "@/components/input/input";
import { IconCalendar } from "@/components/icon";
import Select from "react-select";
import { ButtonFill, ButtonOutline } from "@/components/buttons";
import ImagePopup from "./ImagePopup";
import { KycDocument } from "@/model/kyc";
import AlertSBD from "@/components/share/modal/alert_sbd";
import dayjs from "dayjs";
import MutiAreaInput from "@/components/input/muti_area_input";
import TextareaCustom from "@/components/input/textarea";
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
type ResidentialOption = {
  value: string;
  label: string;
};
const residentialTypeOption: ResidentialOption[] = [
  {
    value: "Tourist",
    label: "Tourist",
  },
  {
    value: "Resident",
    label: "Resident",
  },
  {
    value: "Workpermit",
    label: "Workpermit",
  },
];
const CustomerForm: FC<Props> = ({ customerInfo }) => {
  const router = useRouter();
  const initPage = useRef<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isDocumentActionLoading, setIsDocumentActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  // Selfie Image
  const [selfeIMG, setSelfieIMG] = useState<KycDocument | undefined | null>(
    undefined
  );
  const [selfeDoc, setSelfieDOC] = useState<KycDocument | undefined | null>(
    undefined
  );
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

  const [Residential, setResidential] = useState<
    ResidentialOption | undefined | null
  >(
    residentialTypeOption.find(
      (i) => i?.value == customerInfo?.customer_data?.customer?.residential
    )
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
  const [KycRemark, setKycRemark] = useState(
    customerInfo?.kyc_data.kyc_data.remark ?? ""
  );

  // DDL Nationality
  const [NationalityList, setNationalityList] = useState<SelectOption[]>([]);
  const [Nationality, setNationality] = useState<SelectOption>();
  const [LoadingOwnerNationality, setLoadingOwnerNationality] = useState(false);
  const rawNationalityList = useRef<CatalogueItem[]>([]);
  const [ownerNationality, setOwnerNationality] =
    useState<CatalogueItem | null>();
  // DDL Occupation
  const [OccupationList, setOccupationList] = useState<SelectOption[]>([]);
  const [Occupation, setOccupation] = useState<SelectOption>();
  const [LoadingOwnerOccupation, setloadingOwnerOccupation] = useState(false);
  const rawOccupationList = useRef<CatalogueItem[]>([]);
  const [ownerOccupation, setOwnerOccupation] =
    useState<CatalogueItem | null>();

  const [otherOccupation, setOtherOccupation] = useState(
    customerInfo?.customer_data?.customer?.other_occupation ?? ""
  );

  // DDL MonthlyIncome
  const [MonthlyIncomeList, setMonthlyIncomeList] = useState<SelectOption[]>(
    []
  );
  const [MonthlyIncome, setMonthlyIncome] = useState<SelectOption>();
  const [LoadingOwnerMonthlyIncome, setLoadingOwnerMonthlyIncome] =
    useState(false);
  const rawMonthlyIncomeList = useRef<CatalogueItem[]>([]);
  const [ownerMonthlyIncome, setOwnerMonthlyIncome] =
    useState<CatalogueItem | null>();

  //DOB
  const dateDOBString = customerInfo?.customer_data?.customer?.dob ?? "";
  const dateDOB = new Date(dateDOBString);
  const [dob, setDOB] = useState<DateRangeType>(
    initStartDate(dateDOB.getTime() / 1000)
  );
  //Address
  const objaddress = customerInfo?.customer_data?.customer_address;
  const objContractaddress = objaddress?.find(
    (i) => i?.address_type === "contact"
  );
  const objWorkctaddress = objaddress?.find((i) => i?.address_type === "work");
  const ContactAddressId = objContractaddress?.address_id ?? 0;
  const [ContactAddress, setContactAddress] = useState(
    objContractaddress?.address ?? ""
  );
  const [ContactSubDistrict, setContactSubDistrict] = useState(
    objContractaddress?.sub_district ?? ""
  );
  const [ContactCity, setContactCity] = useState(
    objContractaddress?.city ?? ""
  );
  const [ContactState, setContactState] = useState(
    objContractaddress?.state ?? ""
  );
  const [ContactZipcode, setContactZipcode] = useState(
    objContractaddress?.zipcode ?? ""
  );

  const WorkAddressId = objWorkctaddress?.address_id ?? 0;
  const [WorkCompanyName, setCompanyName] = useState(
    objWorkctaddress?.company_name ?? ""
  );
  const [WorkAddress, setWorkAddress] = useState(
    objWorkctaddress?.company_address ?? ""
  );
  const [WorkSubDistrict, setWorkSubDistrict] = useState(
    objWorkctaddress?.sub_district ?? ""
  );
  const [WorkCity, setWorkCity] = useState(objWorkctaddress?.city ?? "");
  const [WorkState, setWorkState] = useState(objWorkctaddress?.state ?? "");
  const [WorkZipcode, setWorkZipcode] = useState(
    objWorkctaddress?.zipcode ?? ""
  );

  //docement
  const [documents, setDocuments] = useState<KycDocument[]>(
    customerInfo?.kyc_data.kyc_documents ?? []
  );
  const primaryDocs = documents.filter((doc) =>
    doc.document_info?.toLowerCase().includes("primary")
  );

  // kyc data
  const [kyc, setKyc] = useState(customerInfo?.kyc_data.kyc_data ?? null);
  // popup open image
  const [popupImageUrl, setPopupImageUrl] = useState<string | null>(null);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [popupKycDocument, setPopupKycDocument] = useState<KycDocument | undefined>(undefined);
 const [rotationAngles, setRotationAngles] = useState<Record<number, number>>(
    {}
  );
  const [savedRotationAngles, setSavedRotationAngles] = useState<Record<number, number>>({});

  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [previewFiles, setPreviewFiles] = useState<Record<number, File>>({});
  const [imageTimestamps, setImageTimestamps] = useState<Record<number, number>>({});
  const openPopup = async (doc: KycDocument) => {
    setIsImageLoading(true);
    try {
      let url: string | null = null;
      if (previewUrls[doc.kyc_doc_id]) {
        url = previewUrls[doc.kyc_doc_id];
      } else if (doc.kyc_doc_id <= 0) {
        url = null;
      } else {
        const resp = await fetch(`/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}`);
        if (!resp.ok) throw new Error("Cannot fetch image");
        const blob = await resp.blob();
        url = URL.createObjectURL(blob);
      }

      setPopupImageUrl(url);
      setPopupKycDocument(doc)
      setCurrentDocId(doc.kyc_doc_id);
      setIsPopupOpen(true);
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
    setIsPopupOpen(false);
  };

    // บันทึกมุมการหมุนจาก popup (ยังไม่อัปโหลดไฟล์)
  const saveRotation = async (rotation: number) => {
    if (currentDocId === null) return;
    // rotation ที่ได้มาคือมุมสะสมจาก popup แล้ว (เริ่มจาก savedRotationAngles)
    setRotationAngles((prev) => ({
      ...prev,
      [currentDocId]: rotation,
    }));
  };

  const handleUploadFromPopup = (file: File) => {
    const url = URL.createObjectURL(file);
    if (currentDocId !== null) {
      setPreviewUrls((prev) => ({
        ...prev,
        [currentDocId]: url,
      }));

      setPreviewFiles((prev) => ({
        ...prev,
        [currentDocId]: file,
      }));
    }
  };

  const handleSaveDocument = async (
    doc: KycDocument,
    rotation: number,
    action?: string,
    remark?: string
  ) => {
    setIsDocumentActionLoading(true);
    const originalKycDocId = doc.kyc_doc_id;
    const docIndex = (doc as any)._docIndex ?? -1; // รับ index ที่ส่งมาจาก DocumentRow
    try {
      // 1. เตรียมไฟล์สำหรับอัปโหลด
      let fileToUpload: File;
      let optimisticPreviewUrl: string | null = null;

      if (previewFiles[doc.kyc_doc_id]) {
        // ใช้ไฟล์ที่เลือกใหม่
        const originalFile = previewFiles[doc.kyc_doc_id];
        let blob =
          rotation === 0
            ? originalFile
            : await rotateImage(originalFile, rotation);

        // Resize รูปภาพก่อน upload
        blob = await resizeImage(blob);

        fileToUpload = new File([blob], originalFile.name, {
          type: originalFile.type,
        });
        // สร้าง preview URL สำหรับ optimistic update
        optimisticPreviewUrl = URL.createObjectURL(blob);
      } else {
        // ดึงจาก backend พร้อมหมุนตามมุมใหม่ที่หมุนเพิ่ม (ไม่ใช่มุมสะสม)
        const currentRotation = rotationAngles[doc.kyc_doc_id] ?? 0;
        const previousSavedRotation = savedRotationAngles[doc.kyc_doc_id] ?? 0;
        const newRotationOnly = currentRotation - previousSavedRotation;

        const resp = await axios.get(
          `/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}`,
          {
            responseType: "blob", // สำคัญ! ต้องระบุเป็น blob
          }
        );
        let blob = resp.data;
        blob = newRotationOnly === 0 ? blob : await rotateImage(blob, newRotationOnly);

        // Resize รูปภาพก่อน upload
        blob = await resizeImage(blob);

        fileToUpload = new File(
          [blob],
          `document_${doc.kyc_doc_id}.jpg`,
          { type: "image/jpeg" }
        );
        // สร้าง preview URL สำหรับ optimistic update
        optimisticPreviewUrl = URL.createObjectURL(blob);
      }
      if (fileToUpload.size === 0) {
        alert("โปรดเลือกไฟล์เอกสาร");
        return;
      }

      // Optimistic Update - แสดงรูปที่หมุนแล้วทันทีก่อนอัปโหลด
      if (optimisticPreviewUrl) {
        // ล้าง URL เก่าก่อน (ถ้ามี) เพื่อป้องกัน memory leak
        const oldUrl = previewUrls[doc.kyc_doc_id];
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        // อัปเดต UI ทันทีโดยการ batch state updates
        setPreviewUrls((prev) => ({
          ...prev,
          [doc.kyc_doc_id]: optimisticPreviewUrl,
        }));
        setRotationAngles((prev) => {
          const newAngles = { ...prev };
          delete newAngles[doc.kyc_doc_id];
          return newAngles;
        });
        setSavedRotationAngles((prev) => {
          const newAngles = { ...prev };
          delete newAngles[doc.kyc_doc_id];
          return newAngles;
        });
      }

      // 2. กำหนดค่า action และ remark
      const finalAction = action || doc.action || "save";
      const finalRemark = remark || doc.remark || "";

      // 3. สร้าง FormData
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("kyc_doc_id", doc.kyc_doc_id.toString());
      formData.append("config_id", doc.doctype_id.toString());
      formData.append("position", doc.position);
      formData.append("action", finalAction);
      formData.append("remark", finalRemark);

      // เพิ่ม optional fields
      if (doc.document_no) formData.append("document_no", doc.document_no);
      if (doc.issue_country)
        formData.append("issue_country", doc.issue_country);
      if (doc.issued_date) formData.append("issued_date", doc.issued_date);
      if (doc.expired_date) formData.append("expired_date", doc.expired_date);
      if (doc.ict_mapping_id)
        formData.append("ict_mapping", doc.ict_mapping_id.toString());
      if (doc.user_id) formData.append("user_id", doc.user_id.toString());
      if (doc.status) formData.append("status", doc.status.toString());
      // 4. อัปโหลดไป API

      const response = await axios.post("/api/kyc/save-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newKycDocId = response.data.Body.data.kyc_doc_id;
      // กำหนด final kyc_doc_id ที่จะใช้ (ใช้ค่าใหม่ถ้ามี ไม่เช่นนั้นใช้ค่าเดิม)
      const finalKycDocId = newKycDocId || doc.kyc_doc_id;

      // อัปเดต kyc_doc_id ใน documents state (รองรับทั้ง 0 และ temporary ID ที่เป็น negative)
      if (originalKycDocId <= 0 && newKycDocId && docIndex !== -1) {
        setDocuments((prev) => {
          const updated = [...prev];
          // อัปเดตด้วย index โดยตรง
          updated[docIndex] = { ...updated[docIndex], kyc_doc_id: newKycDocId };
          return updated;
        });

        // อัปเดต doc object ให้มีค่า kyc_doc_id ใหม่
        doc.kyc_doc_id = newKycDocId;
      }

      // ล้างค่า preview files โดยใช้ kyc_doc_id เดิมก่อน (ถ้ามีการเปลี่ยน key)
      setPreviewFiles((prev) => {
        const newFiles = { ...prev };
        // ลบทั้ง old key (0) และ new key (ถ้าเปลี่ยน)
        delete newFiles[0];
        delete newFiles[finalKycDocId];
        return newFiles;
      });

      // อัปเดต timestamp สำหรับกรณีที่ต้องโหลดจาก backend ใหม่ในอนาคต
      const timestamp = new Date().getTime();
      setImageTimestamps((prev) => ({
        ...prev,
        [finalKycDocId]: timestamp,
      }));

      alert("อัปโหลดเอกสารสำเร็จ");
    } catch (error) {
      alert("อัปโหลดเอกสารล้มเหลว");
    } finally {
      setIsDocumentActionLoading(false);
    }
  };

  const handleDeleteDocument = (doc: KycDocument) => {};

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
      const rawArray = Object.values(rawNationalityList.current).filter(
        (item): item is CatalogueItem =>
          typeof item === "object" && "id" in item
      );
      const owner = rawArray.find((i) => i.id === select?.value);
      setOwnerNationality(owner);
    } else {
      setOwnerNationality(null);
    }
  };

  const mappingOccupation = (select: SelectOption | undefined) => {
    if (select) {
      const rawArray = Object.values(rawOccupationList.current).filter(
        (item): item is CatalogueItem =>
          typeof item === "object" && "id" in item
      );
      const owner = rawArray.find((i) => i.id === select?.value);
      setOwnerOccupation(owner);
    } else {
      setOwnerOccupation(null);
    }
  };

  const mappingMonthlyIncomeList = (select: SelectOption | undefined) => {
    if (select) {
      const rawArray = Object.values(rawMonthlyIncomeList.current).filter(
        (item): item is CatalogueItem =>
          typeof item === "object" && "id" in item
      );
      const owner = rawArray.find((i) => i.id === select?.value);
      setOwnerMonthlyIncome(owner);
    } else {
      setOwnerMonthlyIncome(null);
    }
  };

  const submitButtonHandler: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    //set data to submit
    try {
      // 2. รวบรวมข้อมูลจาก state
      const customer: CustomerDataRequest = {
        customer_id: customerInfo?.customer_data?.customer.customer_id ?? 0,
        user_id: customerInfo?.customer_data?.customer.user_id ?? 0,
        full_name: Fullname,
        email: Email,
        mobile_no: MobileNo,
        nationality: Nationality?.value ? Nationality.value : 147,
        dob: dob.startDate
          ? (() => {
              const date = new Date(dob.startDate);
              date.setUTCHours(0, 0, 0, 0);
              return date.toISOString();
            })()
          : null,
        gender: Gender,
        marital: Marital,
        residential: Residential?.value || "",
        occupation: Occupation?.value ? Number(Occupation.value) : 0,
        income: MonthlyIncome?.value ? Number(MonthlyIncome.value) : 0,
        active: true,
        updated_by: 0,
        native_name: "",
        other_occupation: otherOccupation,
      };

      if (Occupation?.label?.toLowerCase().includes("other")) {
        if (otherOccupation === "") {
          AlertSBD.fire({
            icon: "error",
            titleText: "Please specify other occupation. ",
            text: "Error ",
            showConfirmButton: false,
          });
          return;
        }
      }

      const original = customerInfo?.customer_data?.customer;
      if (!original) {
        setError("ไม่พบข้อมูลลูกค้าเดิม");
        setLoading(false);
        return;
      }
      let customer_address: CustomerAddressRequest[] = [];

      const contactAddressData: CustomerAddressRequest = {
        address_type: "contact",
        address: ContactAddress,
        sub_district: ContactSubDistrict,
        city: ContactCity,
        state: ContactState,
        zipcode: ContactZipcode,
        address_id: ContactAddressId,
        customer_id: customer.customer_id,
        company_address: "",
        company_name: "",
      };

      const workAddressData: CustomerAddressRequest = {
        address_type: "work",
        address: "",
        sub_district: WorkSubDistrict,
        city: WorkCity,
        state: WorkState,
        zipcode: WorkZipcode,
        address_id: WorkAddressId,
        customer_id: customer.customer_id,
        company_address: WorkAddress,
        company_name: WorkCompanyName,
      };
      customer_address.push(contactAddressData);
      customer_address.push(workAddressData);

      // // 3. ส่งข้อมูลไปที่ API
      const response = await axios.post("/api/customer/update-customer-info", {
        customer,
        customer_address,
        kyc_action: "save",
        kyc_remark: KycRemark,
      });

      AlertSBD.fire({
        icon: "success",
        titleText: "Successfully!",
        text: `Your changes have been saved successfully.`,
        showConfirmButton: false,
      });
    } catch (err: any) {
      // หากเกิดข้อผิดพลาด

      const redirectUrl = "&redirect=/login";
      router.push(
        `/error?message=${encodeURIComponent("Authentication error ")}${redirectUrl}`
      );
    } finally {
      // ไม่ว่าจะสำเร็จหรือไม่ ให้หยุดสถานะโหลด
      setLoading(false);
    }
  };

  const addNewDocument = () => {
    // สร้าง temporary ID ที่ unique สำหรับ document ใหม่ (ใช้ negative number เพื่อไม่ซ้ำกับ ID จริง)
    // ใช้เฉพาะ milliseconds ส่วนท้ายเพื่อไม่เกินขอบเขต int4 (-2,147,483,648 ถึง 2,147,483,647)
    const tempId = -(Date.now() % 2147483647);

    setDocuments((prev) => [
      ...prev,
      {
        kyc_doc_id: tempId,
        kyc_id: customerInfo?.kyc_data.kyc_data.kyc_id,
        doc_type: "selfie",
        document_no: "",
        position: "",
        issued_date: null,
        expired_date: null,
        document_info: "selfie",
        url: "",
        action: "request",
        user_id: customerInfo?.customer_data.customer.user_id,
        rotationAngle: 0,
        doctype_id: 0,
        ict_mapping_id: 0,
      } as KycDocument,
    ]);
  };

  // เพิ่ม handlers ใหม่ใน CustomerForm component
  // 1. Handler สำหรับ Approve
  const handleApproveDocument = async (req: KycDocument) => {
     setIsDocumentActionLoading(true);
    try {
      const response = await axios.post("/api/kyc/set-action-document", {
        kyc_doc_id: req.kyc_doc_id,
        kyc_id: customerInfo?.kyc_data.kyc_data.kyc_id,
        action: "approved",
        customer_id: req.user_id,
        remark: req.remark,
      });
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.kyc_doc_id === req.kyc_doc_id
            ? {
                ...doc,
                action_status: "Approved",
                remark: "อนุมัติเอกสาร",
                active: false,
                status: "approved",
              }
            : doc
        )
      );
      // อัปเดต documents state หรือ refetch
      alert("อนุมัติเอกสารสำเร็จ");
      // อาจจะต้อง refetch documents หรือ update state
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "อนุมัติเอกสารไม่สำเร็จ";
        alert(errorMessage);
      } else {
        alert("อนุมัติเอกสารไม่สำเร็จ");
      }
    }
    finally {
      setIsDocumentActionLoading(false);
    }
  };

  // 2. Handler สำหรับ Reject
  const handleRejectDocument = async (
    document: KycDocument,
    reason: string
  ) => {
    try {
      if (document.kyc_doc_id === 0) {
        setDocuments((prev) => {
          const index = prev.indexOf(document);
          if (index > -1) {
            const newDocs = [...prev];
            newDocs.splice(index, 1);
            return newDocs;
          }
          return prev;
        });
        alert("ลบเอกสารสำเร็จ");
        return;
      }

      if (document.kyc_doc_id != 0) {
        const response = await axios.post("/api/kyc/set-action-document", {
          kyc_doc_id: document.kyc_doc_id,
          kyc_id: customerInfo?.kyc_data.kyc_data.kyc_id,
          action: "reject",
          customer_id: document.user_id,
          remark: reason,
        });
      }

      // อัปเดต documents state
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.kyc_doc_id === document.kyc_doc_id
            ? {
                ...doc,
                action_status: "Rejected",
                remark: "ยกเลิกเอกสาร : " + reason,
                active: false,
                status: "reject",
              }
            : doc
        )
      );
      alert("ปฏิเสธเอกสารสำเร็จ");
    } catch (error) {
      alert("ปฏิเสธเอกสารไม่สำเร็จ");
    }
  };

  // 3. Handler สำหรับ Inactive
  const handleInactiveDocument = async (
    document: KycDocument,
    reason: string
  ) => {
    try {
      const response = await axios.post("/api/kyc/set-action-document", {
        kyc_doc_id: document.kyc_doc_id,
        kyc_id: customerInfo?.kyc_data.kyc_data.kyc_id,
        action: "inactive",
        customer_id: document.user_id,
        remark: reason,
      });

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.kyc_doc_id === document.kyc_doc_id
            ? {
                ...doc,
                action_status: "Inactive",
                remark: reason,
                active: false,
              }
            : doc
        )
      );
      alert("ทำให้เอกสารไม่ใช้งานสำเร็จ");
    } catch (error) {
      alert("ทำให้เอกสารไม่ใช้งานไม่สำเร็จ");
    }
  };

  // 4. Handler สำหรับ Reactivate
  const handleReactivateDocument = async (document: KycDocument) => {
    try {
      const response = await axios.post("/api/kyc/set-action-document", {
        kyc_doc_id: document.kyc_doc_id,
        kyc_id: customerInfo?.kyc_data.kyc_data.kyc_id,
        action: "review",
        customer_id: document.user_id,
        remark: document.remark,
      });

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.kyc_doc_id === document.kyc_doc_id
            ? { ...doc, action_status: "Review", remark: null, active: true }
            : doc
        )
      );
      alert("เปิดใช้งานเอกสารใหม่สำเร็จ");
    } catch (error) {
      alert("เปิดใช้งานเอกสารใหม่ไม่สำเร็จ");
    }
  };

  // 5. Handler สำหรับ Required (ใหม่!)
  const handleRequiredDocument = async (
    document: KycDocument,
    reason: string
  ) => {
    try {
      const response = await axios.post("/api/kyc/set-action-document", {
        kyc_id: document.kyc_id,
        customer_id: document.user_id,
        doctype_id: document.doctype_id,
        doc_type: document.doc_type,
        position: document.position,
        document_no: document.document_no,
        document_info: document.document_info,
        action: "required",
        ict_mapping_id: document.ict_mapping_id,
        remark: reason,
      });

      const newKycDocId = response.data.kyc_doc_id;

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.kyc_doc_id === document.kyc_doc_id
            ? {
                ...doc,
                kyc_doc_id: newKycDocId,
                action_status: "Required",
                remark: "ขอเอกสารเพิ่มเติม : " + reason,
                status: "required",
              }
            : doc
        )
      );

      alert("ส่งคำขอเอกสารเพิ่มเติมสำเร็จ");
    } catch (error) {
      alert("ส่งคำขอเอกสารเพิ่มเติมไม่สำเร็จ");
    }
  };

  const handleCancel = () => {
    router.replace("/customer");
  };

  const handleApproveCustomer = async () => {
    // set up document
    try {
      const customer: CustomerDataRequest = {
        customer_id: customerInfo?.customer_data?.customer.customer_id ?? 0,
        user_id: customerInfo?.customer_data?.customer.user_id ?? 0,
        full_name: Fullname,
        email: Email,
        mobile_no: MobileNo,
        nationality: Nationality?.value ? Nationality.value : 147,
        dob: dob.startDate
          ? (() => {
              const date = new Date(dob.startDate);
              date.setUTCHours(0, 0, 0, 0);
              return date.toISOString();
            })()
          : null,
        gender: Gender,
        marital: Marital,
        residential: Residential?.value || "",
        occupation: Occupation?.value ? Number(Occupation.value) : 0,
        income: MonthlyIncome?.value ? Number(MonthlyIncome.value) : 0,
        active: true,
        updated_by: 0,
        native_name: "",
        other_occupation: otherOccupation,
      };

      if (Occupation?.label?.toLowerCase().includes("other")) {
        if (otherOccupation === "") {
          AlertSBD.fire({
            icon: "error",
            titleText: "Please specify other occupation. ",
            text: "Error ",
            showConfirmButton: false,
          });
          return;
        }
      }

      const original = customerInfo?.customer_data?.customer;
      if (!original) {
        setError("ไม่พบข้อมูลลูกค้าเดิม");
        setLoading(false);
        return;
      }
      let customer_address: CustomerAddressRequest[] = [];

      const contactAddressData: CustomerAddressRequest = {
        address_type: "contact",
        address: ContactAddress,
        sub_district: ContactSubDistrict,
        city: ContactCity,
        state: ContactState,
        zipcode: ContactZipcode,
        address_id: ContactAddressId,
        customer_id: customer.customer_id,
        company_address: "",
        company_name: "",
      };

      const workAddressData: CustomerAddressRequest = {
        address_type: "work",
        address: "",
        sub_district: WorkSubDistrict,
        city: WorkCity,
        state: WorkState,
        zipcode: WorkZipcode,
        address_id: WorkAddressId,
        customer_id: customer.customer_id,
        company_address: WorkAddress,
        company_name: WorkCompanyName,
      };
      customer_address.push(contactAddressData);
      customer_address.push(workAddressData);
      
      const allApproved = documents.every((doc) => doc.status === "approved"||doc.status === "reject");
      if (!allApproved) {       
        //setError("เอกสารยังอนุมัติไม่เรียบร้อย");
        alert("เอกสารยังอนุมัติไม่เรียบร้อย");
        setLoading(false);
        return;
      }
      const approvedCount = documents.filter((doc) => doc.status != "approved"&& doc.status != "reject").length;
      if( approvedCount >0){
        alert("ไม่มีเอกสารที่อนุมัติ");
        setLoading(false);
        return;
      }
      const response = await axios.post("/api/customer/update-customer-info", {
        customer,
        customer_address,
        kyc_action: "approved",
        kyc_remark: KycRemark,
      });

      AlertSBD.fire({
        icon: "success",
        titleText: "Successfully!",
        text: `Approve customer information`,
        showConfirmButton: false,
      }).then(() => {
        router.replace("/customer");
      });
      return;
    } catch (err: any) {
      // หากเกิดข้อผิดพลาด

      const redirectUrl = "&redirect=/login";
      router.push(
        `/error?message=${encodeURIComponent("Authentication error ")}${redirectUrl}`
      );
    } finally {
      // ไม่ว่าจะสำเร็จหรือไม่ ให้หยุดสถานะโหลด
      setLoading(false);
    }
  };

  //checked
  const [useSameAddress, setUseSameAddress] = useState(false);
  const handleUseSameAddress = (checked: boolean) => {
    setUseSameAddress(checked);

    if (checked) {
      // Copy ข้อมูลจาก Work ไป Contact
      setContactAddress(WorkAddress);
      setContactSubDistrict(WorkSubDistrict);
      setContactCity(WorkCity);
      setContactState(WorkState);
      setContactZipcode(WorkZipcode);
    } else {
      // Clear Contact Address เมื่อ uncheck
      setContactAddress("");
      setContactSubDistrict("");
      setContactCity("");
      setContactState("");
      setContactZipcode("");
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
            i.value === customerInfo?.customer_data?.customer?.occupation
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
      } finally {
        setLoadingOwnerNationality(false);
      }
    };

    if (!initPage.current) {
      getLoadData();
    }
  }, []);

  useEffect(() => {
    const selfieDoc = customerInfo?.kyc_data.kyc_documents?.find(
      (d) => d.document_info === "Selfie"
    );
    setSelfieIMG(selfieDoc ?? null);
    setSelfieDOC(selfieDoc);
  }, []);

  useEffect(() => {
    const kycStatus = customerInfo?.kyc_data?.kyc_data?.kyc_status;
    if (
      kycStatus === "Approved by Jadepay" ||
      kycStatus === "duplicate" ||
      kycStatus === "Waiting for ICT Approval" ||
      kycStatus === "KYC Complete"
    ) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
  }, [customerInfo]);

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
            <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
              {previewUrls[selfeIMG?.kyc_doc_id ?? 0] ? (
                // กรณีมี preview image (ไฟล์ที่เลือกใหม่)
                <img
                  src={previewUrls[selfeIMG?.kyc_doc_id ?? 0]}
                  alt="selfie preview"
                  className="w-32 h-32 object-contain cursor-pointer transition-transform mx-auto"
                  style={{
                    transform: `rotate(${rotationAngles[selfeIMG?.kyc_doc_id ?? 0] ?? 0}deg)`,
                  }}
                  onClick={() => selfeIMG && openPopup(selfeIMG)}
                />
              ) : selfeIMG && selfeIMG?.kyc_doc_id > 0 ? (
                // กรณีมี selfie ใน database แล้ว
                <img
                  src={`/api/kyc/get-document?kyc-doc-id=${selfeIMG?.kyc_doc_id}${imageTimestamps[selfeIMG.kyc_doc_id] ? `&t=${imageTimestamps[selfeIMG.kyc_doc_id]}` : ''}`}
                  alt="selfie"
                  className="w-32 h-32 object-contain cursor-pointer transition-transform mx-auto"
                  style={{
                    transform: `rotate(${rotationAngles[selfeIMG.kyc_doc_id] ?? savedRotationAngles[selfeIMG.kyc_doc_id] ?? 0}deg)`,
                  }}
                  onClick={() => openPopup(selfeIMG)}
                />
              ) : (
                // กรณียังไม่มี selfie (placeholder)
                <div className="text-center text-gray-500">
                  <User className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-medium">IMG</p>
                  <p className="text-xxs">selfie</p>
                </div>
              )}
            </div>
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
              <p className="text-gray-900 text-sm mb-1 mr-2">
                {kyc?.created_at
                  ? dayjs(kyc.created_at).utc().format("DD/MM/YYYY")
                  : ""}
              </p>
            </div>
            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                Operation Approve by :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">
                {kyc?.operation_approve_by === 0
                  ? ""
                  : (kyc?.operation_approve_by ?? "")}
              </p>
            </div>
            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                Operation Approve Date :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">
                {kyc?.operation_approve_at
                  ? dayjs(kyc.operation_approve_at).utc().format("DD/MM/YYYY")
                  : ""}
              </p>
            </div>

            <div className="flex items-baseline">
              <label className="block text-sm font-medium text-gray-600 mb-1 mr-2">
                KYC Approve Date :
              </label>
              <p className="text-gray-900 text-sm mb-1 mr-2">
                {kyc?.ict_approve_at
                  ? dayjs(kyc.ict_approve_at).utc().format("DD/MM/YYYY")
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
      <fieldset disabled={isFormDisabled}>
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
                name="Full Name"
                title="Full Name"
                type="text"
                placeholder="Full name"
                value={Fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />

              <InputCustom
                name="Mobile No"
                title="Mobile No"
                type="text"
                placeholder="mobile no"
                value={MobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                readOnly
                disabled={true}
              />
              <InputCustom
                name="Email"
                title="Email"
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
                    checked={Marital === "Y"}
                    onChange={() => setMarital("Y")}
                  />
                  <span className="label-text ml-2">Yes</span>
                </label>
                <label className="label justify-start cursor-pointer ml-4">
                  <input
                    type="radio"
                    name="marital"
                    className="radio checked:bg-primary"
                    value={Marital}
                    checked={Marital === "N"}
                    onChange={() => setMarital("N")}
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

              {/* Updated Occupation Section */}
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
                      // ถ้าไม่ใช่ Other ให้ clear otherOccupation
                      const isOther = item?.label
                        ?.toLowerCase()
                        .includes("other");
                      if (!isOther) {
                        setOtherOccupation("");
                      }
                    }}
                    isLoading={LoadingOwnerOccupation}
                  />
                </div>
              </div>

              {/* Other Occupation Field - เพิ่มใหม่ */}
              {Occupation?.label?.toLowerCase().includes("other") && (
                <div className="flex flex-col mt-3">
                  <InputCustom
                    name="otherOccupation"
                    title="Other Occupation"
                    type="text"
                    placeholder="Please specify your occupation"
                    value={otherOccupation}
                    onChange={(e) => setOtherOccupation(e.target.value)}
                  />
                </div>
              )}

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
                <div className="mb-2 md:mb-0 md:mr-4 mt-3 text-xs">
                  Resident Type
                </div>
                <div className="rounded-md relative w-full force-light-background">
                  <Select
                    className="mt-1"
                    classNamePrefix="select-custom"
                    instanceId="level-control"
                    placeholder={
                      <div tw="flex items-center gap-2">
                        <span>Residential Type</span>
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                    }
                    options={residentialTypeOption}
                    defaultValue={Residential}
                    value={Residential}
                    onChange={(item) => setResidential(item)}
                  />
                </div>
              </div>
              <div className="flex flex-col mt-4">
                <InputCustom
                  name="KYC score"
                  title="KYC Score"
                  type="text"
                  placeholder="KYC Score"
                  readOnly
                  disabled={true}
                  value={KycScore}
                  onChange={(e) => setKycScore(e.target.value)}
                />
              </div>
              <div className="flex flex-col mt-4">
                <InputCustom
                  name="KYC risk status"
                  title="KYC risk status"
                  type="text"
                  placeholder="KYC risk status"
                  readOnly
                  disabled={true}
                  value={KycRiskStatus}
                  onChange={(e) => setKycRiskStatus(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              <TextareaCustom
                title="Remark"
                name="Deal Details"
                value={KycRemark}
                onChange={(e) => setKycRemark(e.target.value)}
                rows={KycRemark ? 6 : 4}
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
              <div>Work Detail</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              <InputCustom
                name="Company Name"
                title="Company Name"
                type="text"
                placeholder="Company name"
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
            <input
              type="checkbox"
              checked={useSameAddress}
              onChange={(e) => handleUseSameAddress(e.target.checked)}
            />
            <span className="label-text ml-2 ">
              Use the same information as work address
            </span>
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

        <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-lg mt-5">
          {error !== "" ? (
            <p className="text-error text-center text-[16px]">{error}</p>
          ) : null}
          <div className="flex gap-4 items-center justify-end">
            <ButtonFill
              className="btn btn-primary btn-sm p-3 min-h-[38px]"
              type="submit"
              form="customerForm"
            >
              {"Save Customer info"}
              {loading && (
                <span className="ml-1 loading loading-spinner"></span>
              )}
            </ButtonFill>
          </div>
        </div>

        <DocumentTable
          documents={documents}
          openPopup={openPopup}
          rotationAngles={rotationAngles}
          savedRotationAngles={savedRotationAngles}
          previewUrls={previewUrls}
          imageTimestamps={imageTimestamps}
          country=""
          closePopup={closePopup}
          saveRotation={saveRotation}
          handleSaveDocument={handleSaveDocument}
          handleDeleteDocument={handleDeleteDocument}
          handleAddDocument={addNewDocument}
          // เพิ่ม handlers ใหม่
          handleApproveDocument={handleApproveDocument}
          handleRejectDocument={handleRejectDocument}
          handleInactiveDocument={handleInactiveDocument}
          handleReactivateDocument={handleReactivateDocument}
          handleRequiredDocument={handleRequiredDocument}
        />
      </fieldset>
      <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-lg mt-5">
        {error !== "" ? (
          <p className="text-error text-center text-[16px]">{error}</p>
        ) : null}
        <div className="flex gap-4 items-center justify-end">
          <ButtonOutline
            className="btn btn-sm p-3 min-h-[38px] border-[--border-color] !text-gray-400 hover:!bg-opacity-10  hover:!border-[--border-color]"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </ButtonOutline>
          {!isFormDisabled && (
            <ButtonFill
              className="btn btn-secondary btn-sm p-3 min-h-[38px]"
              type="button"
              onClick={handleApproveCustomer}
            >
              {"Approved"}
              {loading && (
                <span className="ml-1 loading loading-spinner"></span>
              )}
            </ButtonFill>
          )}
        </div>
      </div>
      

      {isPopupOpen && (
        <ImagePopup
          imageUrl={popupImageUrl || ""}
          onClose={closePopup}
          onSaveRotation={saveRotation}
          onUpload={handleUploadFromPopup}
          isLoading={isImageLoading}
          document={popupKycDocument}
          initialRotation={currentDocId !== null ? (savedRotationAngles[currentDocId] ?? 0) : 0}
        />
      )}

      {isDocumentActionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-xl">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-gray-700 font-medium"></p>
          </div>
        </div>
      )}
    </>
  );
};

export async function resizeImage(
  blob: Blob,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  maxSizeMB: number = 1
): Promise<Blob> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // ถ้ารูปมีขนาดไม่เกิน 1 MB อยู่แล้ว ให้ return ต้นฉบับ
  if (blob.size <= maxSizeBytes) {
    return blob;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      let width = img.width;
      let height = img.height;

      // คำนวณขนาดใหม่โดยรักษา aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas context not available");

      ctx.drawImage(img, 0, 0, width, height);

      // ลด quality แบบ dynamic จนกว่าจะได้ขนาดไม่เกิน maxSizeMB
      let quality = 0.9;
      let resizedBlob: Blob | null = null;

      const tryCompress = (q: number): Promise<Blob | null> => {
        return new Promise((resolveCompress) => {
          canvas.toBlob(
            (blob) => {
              resolveCompress(blob);
            },
            "image/jpeg",
            q
          );
        });
      };

      // ลองลด quality ทีละ 0.1 จนกว่าจะได้ขนาดที่ต้องการ
      while (quality > 0.1) {
        resizedBlob = await tryCompress(quality);
        if (resizedBlob && resizedBlob.size <= maxSizeBytes) {
          break;
        }
        quality -= 0.1;
      }

      // ถ้ายังใหญ่เกินไป ให้ลดขนาดภาพลง
      if (resizedBlob && resizedBlob.size > maxSizeBytes) {
        const scaleFactor = Math.sqrt(maxSizeBytes / resizedBlob.size);
        canvas.width = Math.floor(width * scaleFactor);
        canvas.height = Math.floor(height * scaleFactor);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resizedBlob = await tryCompress(0.8);
      }

      if (resizedBlob) resolve(resizedBlob);
      else reject("Failed to create blob from canvas");
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

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
