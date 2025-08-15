import { useEffect, useRef, useState } from "react";
import InputCustom from "@/components/input/input"; // path ตามของคุณ
import axios from "axios";
import { CatalogueItem } from "@/model/catalogueItem";
import { getDateTimeNow, unixToDateString } from "@/lib/time";
import Datepicker, {
  DateRangeType,
  DateType,
} from "react-tailwindcss-datepicker";
import { IconCalendar } from "@/components/icon";
import { KycDocument } from "@/model/kyc";
import { FileText ,FilePlus2} from "lucide-react";

type SelectOption = {
  value: number;
  label: string;
};

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

interface Props {
  index: number;
  doc: KycDocument & { rotationAngle?: number | null | undefined };
  idNoRefs: React.MutableRefObject<Record<string, HTMLInputElement>>;
  issueDateRefs: React.MutableRefObject<Record<string, HTMLInputElement>>;
  expireDateRefs: React.MutableRefObject<Record<string, HTMLInputElement>>;
  country: string;
  documentRole: string;
  openPopup: () => void;
  handleSaveDocument: (doc: KycDocument, rotation: number) => void;
  handleDeleteDocument: (doc: KycDocument) => void;
  previewUrl?: string;
}

const DocumentRow: React.FC<Props> = ({
  index,
  doc,
  idNoRefs,
  issueDateRefs,
  expireDateRefs,
  country,
  openPopup,
  handleSaveDocument,
  handleDeleteDocument,
  previewUrl
}) => {
  const idInputRef = useRef<HTMLInputElement>(null);
  const issueDateRef = useRef<HTMLInputElement>(null);
  const expireDateRef = useRef<HTMLInputElement>(null);
  

 
  const getCountryCode = (country: string): string => {
    switch (country) {
      case "MMR":
        return "mm";
      case "THA":
        return "th";
      default:
        return "mm";
    }
  };

  // สร้าง state สำหรับ select ควบคุมค่า (optional ถ้าต้องการ controlled component)
  const [docRole, setDocRole] = useState(() => {
    const initial = doc.document_info || "";
    return (
      initial.toLowerCase().replace(/ /g, "_") + "_" + getCountryCode(country)
    );
  });
  const [docType, setDocType] = useState(doc.doctype_id);
  const [docIdNo, setDocIdNo] = useState(doc.document_no ?? "");
  const [ictId, setICTID] = useState(doc.ict_mapping_id ?? 0);
  // Date
  const dateIssuedString = doc.issued_date ?? "";
  const dateExpiredString = doc.expired_date ?? "";
  const dateIssued = new Date(dateIssuedString);
  const dateExpired = new Date(dateExpiredString);
  const [issuedDate, setIssuedDate] = useState<DateRangeType>(
    initStartDate(dateIssued.getTime() / 1000)
  );
  const [expiredDate, setExpiredDate] = useState<DateRangeType>(
    initStartDate(dateExpired.getTime() / 1000)
  );

  // DDL
  const [position, setPosition] = useState(doc.position || "");
  const [docOptions, setDocOptions] = useState<SelectOption[]>([]);
  const [ICTMappintOptions, setICTMappingOptions] = useState<SelectOption[]>(
    []
  );
  const mappedCountry = getCountryCode(country);

  const getLoadOption = async () => {
    const [resPrimary, resSecondary, resAdditional, respICTMapping] =
      await Promise.all([
        await axios.get(`/api/masconfig/get-catalogue`, {
          params: {
            config_key: "primary_document_" + mappedCountry,
          },
        }),
        await axios.get(`/api/masconfig/get-catalogue`, {
          params: {
            config_key: "secondary_document_" + mappedCountry,
          },
        }),
        await axios.get(`/api/masconfig/get-catalogue`, {
          params: {
            config_key: "additional_document_" + mappedCountry,
          },
        }),
        await axios.get(`/api/masconfig/get-catalogue`, {
          params: {
            config_key: "ict_mapping",
          },
        }),
      ]);

    const mapPrimary: SelectOption[] = (
      Object.values(resPrimary.data).filter(Boolean) as CatalogueItem[]
    )
      .filter((item) => item?.id && item?.name_en)
      .map((item) => ({ value: item.id, label: item.name_en }));
    const mapSecondary: SelectOption[] = (
      Object.values(resSecondary.data).filter(Boolean) as CatalogueItem[]
    )
      .filter((item) => item?.id && item?.name_en)
      .map((item) => ({ value: item.id, label: item.name_en }));
    const mapAdditional: SelectOption[] = (
      Object.values(resAdditional.data).filter(Boolean) as CatalogueItem[]
    )
      .filter((item) => item?.id && item?.name_en)
      .map((item) => ({ value: item.id, label: item.name_en }));
    const mapICTMapping: SelectOption[] = (
      Object.values(respICTMapping.data).filter(Boolean) as CatalogueItem[]
    )
      .filter((item) => item?.id && item?.name_en)
      .map((item) => ({ value: item.id, label: item.name_en }));

    if (docRole.includes("primary")) {
      setDocOptions(mapPrimary);
    } else if (docRole.includes("secondary")) {
      setDocOptions(mapSecondary);
    } else {
      setDocOptions(mapAdditional);
    }

    setICTMappingOptions(mapICTMapping);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocRole(e.target.value);
  };

  const handleChangeIssuedDate = (value: DateType) => {
    let date = new Date(issuedDate.startDate!);
    const hour = date.getHours();
    const min = date.getMinutes();
    // set new date with old time
    let newDate = new Date(value!);
    newDate.setHours(hour, min);
    setIssuedDate({
      startDate: newDate,
      endDate: newDate,
    });
  };

  const handleChangeExporedDate = (value: DateType) => {
    let date = new Date(expiredDate.startDate!);
    const hour = date.getHours();
    const min = date.getMinutes();
    // set new date with old time
    let newDate = new Date(value!);
    newDate.setHours(hour, min);
    setExpiredDate({
      startDate: newDate,
      endDate: newDate,
    });
  };

  const formatDate = (date: Date | null | undefined): string | null => {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  };

  const onSave = (action: string ) => {
    const updated: KycDocument = {
      ...doc,
      doctype_id: docType,
      document_info:docRole,
      position,
      document_no: docIdNo,
      issued_date: formatDate(issuedDate.startDate),
      expired_date: formatDate(expiredDate.startDate),
      ict_mapping_id: ictId ,
      action :action
    };
    handleSaveDocument(updated, doc.rotationAngle ?? 0);
  };

  useEffect(() => {
    if (idInputRef.current) {
      idNoRefs.current[doc.kyc_doc_id] = idInputRef.current;
    }
    if (issueDateRef.current) {
      issueDateRefs.current[doc.kyc_doc_id] = issueDateRef.current;
    }
    if (expireDateRef.current) {
      expireDateRefs.current[doc.kyc_doc_id] = expireDateRef.current;
    }
    getLoadOption();
  }, []);
  
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-2 px-3">{index + 1}</td>
      <td className="py-2 px-3">
       {previewUrl ? (
    <img
      src={previewUrl}
      alt="preview"
      className="w-20 h-20 object-contain cursor-pointer transition-transform"
      style={{ transform: `rotate(${doc.rotationAngle ?? 0}deg)` }}
      onClick={openPopup}
    />
  ) : doc.kyc_doc_id != 0 ? (
    <img
      src={`/api/kyc/get-document?kyc-doc-id=${doc.kyc_doc_id}`}
      alt="doc"
      className="w-20 h-20 object-contain cursor-pointer transition-transform"
      style={{ transform: `rotate(${doc.rotationAngle ?? 0}deg)` }}
      onClick={openPopup}
    />
  ) : (
    <div
      className="text-center text-gray-500 cursor-pointer"
      onClick={openPopup}
    >
      <FileText className="w-6 h-6 mx-auto mb-1" />
      <p className="text-xs font-medium">IMG</p>
      <p className="text-xxs">Document</p>
    </div>
  )}     
        
      </td>

      {/* Document Role as dropdown */}
      <td className="py-2 px-3 w-xl">
        <select
          className="select select-ui w-full "
          value={docRole}
          onChange={handleChange}
        >
          <option value="" disabled>
            Document Role
          </option>
          <option value={"primary_document_" + mappedCountry}>Primary</option>
          <option value={"secondary_document_" + mappedCountry}>
            Secondary
          </option>
          <option value={"additional_document_" + mappedCountry}>
            Additional
          </option>
        </select>
      </td>
      {/* Document Type as dropdown */}
      <td className="py-2 px-3 ">
        <select
          className="select select-ui w-full"
          value={docType === 0 ? "" : String(docType)}
          onChange={(e) => setDocType(Number(e.target.value))}
        >
          <option value="" disabled>
            Document Type
          </option>
          {docOptions?.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </td>
      {/* Position as dropdown */}
      <td className="py-2 px-3">
        <select
          className="select select-ui w-full"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          <option value="" disabled>
            Position
          </option>
          <option value="FRONT">FRONT</option>
          <option value="BACK">BACK</option>
        </select>
      </td>

      {/* Document No. as InputCustom */}
      <td className="py-2 px-3 w-24">
        <InputCustom
          name="Document No"
          title="Document No"
          type="text"
          placeholder="document no"
          value={docIdNo}
          onChange={(e) => setDocIdNo(e.target.value)}
          required
          noWrapperMargin
        />
      </td>

      {/* Issued Date */}
      <td className="py-2 px-3  relative ">
        <div className="date-box relative w-full flex items-center border border-[--border-color] py force-light-background">
          <Datepicker
            useRange={false}
            asSingle={true}
            displayFormat={"DD/MM/YYYY"}
            placeholder="DOB"
            inputClassName="w-full border border-[--border-color] rounded-md px-2 py-1"
            value={issuedDate}
            onChange={(e) => handleChangeIssuedDate(e!.startDate)}
            toggleIcon={() => false}
            inputId={`doc_issue_date_${doc.kyc_doc_id}`}
          />
          <label
            className="absolute right-2 cursor-pointer"
            htmlFor={`doc_issue_date_${doc.kyc_doc_id}`}
          >
            <IconCalendar className="text-[20px]" />
          </label>
        </div>
      </td>

      {/* Expired Date */}
      <td className="py-2 px-3 relative">
        <div className="date-box  relative w-full flex items-center  border border-[--border-color] py force-light-background">
          <Datepicker
            useRange={false}
            asSingle={true}
            displayFormat={"DD/MM/YYYY"}
            placeholder="DOB"
            inputClassName="w-full border border-[--border-color] rounded-md px-2 py-1"
            value={expiredDate}
            onChange={(e) => handleChangeExporedDate(e!.startDate)}
            toggleIcon={() => false}
            inputId={`doc_expired_date_${doc.kyc_doc_id}`}
          />
          <label
            className="absolute right-2 cursor-pointer"
            htmlFor={`doc_expired_date_${doc.kyc_doc_id}`}
          >
            <IconCalendar className="text-[20px]" />
          </label>
        </div>
      </td>
      {/* ICT as dropdown */}
      <td className="py-2 px-3">
        <select
          className="select select-ui w-full"
         value={ictId === 0 ? "" : String(ictId)}
          onChange={(e) => setICTID(Number(e.target.value))}
        >
          <option value="" disabled>
            ICT Mapping
          </option>
          {ICTMappintOptions?.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </td>
      {/* Status */}
      <td className="py-2 px-3">
        <span className={`badge badge-success" : "badge-error"} badge-xs`}>
          {doc.active}
        </span>
      </td>

      <td className="py-2 px-3">
        <div className="flex gap-2 flex-nowrap">
          <button className="btn btn-xs btn-success" onClick={() =>onSave("save")}>
            Save
          </button>
          <button className="btn btn-xs btn-success" onClick={() =>onSave("approve")}>
            Approve
          </button>
          <button
            className="btn btn-xs btn-error"
            onClick={() => handleDeleteDocument(doc)}
          >
            reject
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;
