import { Platform } from '@/model/company';
import { PlatformItem } from '@/model/platform';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';

type SelectOption = {
  value: string;
  label: string;
};

const PlatformSelect = ({
  company_id = '',
  platform_id = '',
  selected_id = '',
  onSelectChange
}: {
  company_id?: string;
  platform_id?: string;
  selected_id?: string;
  onSelectChange?: (data: PlatformItem | undefined) => void;
}) => {
  const initComponent = useRef<boolean>(false);

  const [platformRawList, setPlatformRawList] = useState<PlatformItem[]>();
  const [platformList, setPlatformList] = useState<SelectOption[]>();
  const [platform, setPlatform] = useState<SelectOption | undefined | null>();

  const [loadingPlatform, setLoadingPlatform] = useState(true);

  useEffect(() => {
    const getLoadData = async () => {
      try {
        let params: any = {};

        if (company_id) {
          params.company_id = company_id;
        }

        if (platform_id) {
          params.platform_id = platform_id;
        }

        let resPlatform = await axios.get<any>(`/api/platform/list`, {
          params
        });

        const dataPlatform: PlatformItem[] = resPlatform.data.data;
        const optionsPlatform = getOption(dataPlatform);

        if (selected_id) {
          const selectedPlatform = optionsPlatform.find(
            (i) => i?.value === selected_id
          ) as SelectOption;
          onPlatformUpdate(selectedPlatform, dataPlatform);
        }

        //   setPlatform(findPlatform);
        setPlatformRawList(dataPlatform);
        setPlatformList(optionsPlatform);
        setLoadingPlatform(false);
      } catch (err: any) {
        setLoadingPlatform(false);
      } finally {
        setLoadingPlatform(false);
      }
    };

    if (!initComponent.current) {
      getLoadData();
    }
  }, [company_id, platform_id, loadingPlatform]);

  const getOption = (platform: Platform[]) => {
    const datMappingOption = platform?.map((i: PlatformItem) => ({
      value: i?.id,
      label: i?.name
    })) as SelectOption[];
    return datMappingOption;
  };

  const onPlatformChange = async (item: SelectOption | null) => {
    setPlatform(item as SelectOption);
    if (onSelectChange) {
      const platformData = platformRawList?.find((i) => i?.id === item?.value);
      onSelectChange(platformData);
    }
  };

  const onPlatformUpdate = async (
    item: SelectOption | null,
    platformRawList: PlatformItem[] | undefined
  ) => {
    setPlatform(item as SelectOption);
    if (onSelectChange) {
      const platformData = platformRawList?.find((i) => i?.id === item?.value);
      onSelectChange(platformData);
    }
  };

  return (
    <>
      <Select
        classNamePrefix="select-custom"
        instanceId="platform_id"
        placeholder="All Platform"
        options={platformList}
        defaultValue={platform}
        value={platform}
        onChange={(item) => onPlatformChange(item)}
        required
        isClearable
        isLoading={loadingPlatform}
      />
    </>
  );
};
export default PlatformSelect;
