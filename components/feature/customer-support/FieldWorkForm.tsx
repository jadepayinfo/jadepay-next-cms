import { CustomerSupportFieldInfo } from '@/model/customer-support';

interface Props {
  value: CustomerSupportFieldInfo;
  onChange: (field: keyof CustomerSupportFieldInfo, value: string) => void;
  disabled?: boolean;
  title?: string;
}

export default function FieldWorkForm({
  value,
  onChange,
  disabled = false,
  title = 'ข้อมูลจากหน้างาน',
}: Props) {
  return (
    <div className="space-y-3">
      {title && <h3 className="font-semibold text-base">{title}</h3>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">Name</span>
          </label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="ชื่อ-นามสกุล"
            value={value.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">Email</span>
          </label>
          <input
            type="email"
            className="input input-bordered input-sm w-full"
            placeholder="email@example.com"
            value={value.email}
            onChange={(e) => onChange('email', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">เบอร์โทร</span>
          </label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="เบอร์โทรศัพท์"
            value={value.mobileNo}
            onChange={(e) => onChange('mobileNo', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">Gender</span>
          </label>
          <div className="flex items-center gap-4 min-h-[2rem]">
            <label className="label cursor-pointer justify-start gap-2 py-0">
              <input
                type="radio"
                name="field-gender"
                className="radio radio-sm checked:bg-primary"
                checked={value.gender === 'M'}
                onChange={() => onChange('gender', 'M')}
                disabled={disabled}
              />
              <span className="label-text">Male</span>
            </label>
            <label className="label cursor-pointer justify-start gap-2 py-0">
              <input
                type="radio"
                name="field-gender"
                className="radio radio-sm checked:bg-primary"
                checked={value.gender === 'F'}
                onChange={() => onChange('gender', 'F')}
                disabled={disabled}
              />
              <span className="label-text">Female</span>
            </label>
          </div>
        </div>

        <div className="form-control">
          <label className="label py-0">
            <span className="label-text text-xs">Marital</span>
          </label>
          <div className="flex items-center gap-4 min-h-[2rem]">
            <label className="label cursor-pointer justify-start gap-2 py-0">
              <input
                type="radio"
                name="field-marital"
                className="radio radio-sm checked:bg-primary"
                checked={value.marital === 'Y'}
                onChange={() => onChange('marital', 'Y')}
                disabled={disabled}
              />
              <span className="label-text">Yes</span>
            </label>
            <label className="label cursor-pointer justify-start gap-2 py-0">
              <input
                type="radio"
                name="field-marital"
                className="radio radio-sm checked:bg-primary"
                checked={value.marital === 'N'}
                onChange={() => onChange('marital', 'N')}
                disabled={disabled}
              />
              <span className="label-text">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
