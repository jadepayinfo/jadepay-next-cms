import {
  COMPANY_ADMIN,
  COMPANY_PLATFORM_ADMIN,
  COMPANY_PLATFORM_STAFF,
  ROOT
} from '@/lib/constant';
import { StaffInfoType } from '@/model/staff_info';
import { Token } from '@/model/token';
import { wallet_token } from '@/model/wallet';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Select, { Props as PropsSelect } from 'react-select';
import uniqBy from 'lodash/uniqBy';

type SelectOption = {
  value: string;
  label: string;
};

export interface EventWalletChange extends wallet_token {
  token?: Token[];
}

interface WalletSelectType extends PropsSelect {
  staff?: StaffInfoType;
  company_id?: string;
  platform_id?: string;
  selected_id?: string;
  select_token_id?:number;
  onSelectChange?: (data: EventWalletChange) => void;
}

const WalletSelect = ({
  placeholder,
  staff,
  company_id = '',
  platform_id = '',
  selected_id = '',
  onSelectChange
}: WalletSelectType) => {
  const initComponent = useRef<boolean>(false);

  const [walletRawList, setWalletRawList] = useState<wallet_token[]>();

  const [walletList, setWalletList] = useState<SelectOption[]>();
  const [wallet, setWallet] = useState<SelectOption | undefined | null>();

  const [loadingWallet, setLoadingWallet] = useState(true);

  const tokenRawData = useRef<Token[]>([]);

  useEffect(() => {
    const getLoadData = async () => {
      try {
        let params: any = {};

        if (staff?.company_id) {
          params.company_id = staff?.company_id;
        }

        if (staff?.platform_id) {
          params.platform_id = staff?.platform_id;
        }

        let resWallet = await axios.get<any>(`/api/wallet/partnerlist`, {
          params
        });

        const resToken = await axios.get(`/api/wallet/token`);
        tokenRawData.current = resToken.data.data;

        const dataWallet: wallet_token[] = resWallet.data.data;
        

        if (selected_id) {
          const findSelect = dataWallet.find((i) => i.owner_id === selected_id);
          const selectOption = {
            value: findSelect?.id,
            label: findSelect?.owner_id
          } as SelectOption;

          mappingPartnerByOwnerId(staff, dataWallet);
          setWalletRawList(dataWallet);
          onUpdate(selectOption,dataWallet);
        }
        else{
          mappingPartnerByOwnerId(staff, dataWallet);
          setWalletRawList(dataWallet);
        }

        setLoadingWallet(false);
      } catch (err: any) {
      } finally {
        setLoadingWallet(false);
      }
    };

    if (!initComponent.current && staff) {
      initComponent.current = true;
      getLoadData();
    }
  }, [staff, selected_id, company_id, platform_id, loadingWallet]);




  const getOption = (platform: wallet_token[]) => {
    const datMappingOption = platform?.map((i: wallet_token) => ({
      value: i?.id,
      label: i?.owner_id
    })) as SelectOption[];
    return datMappingOption;
  };

  const onChange = async (item: SelectOption | null) => {
    setWallet(item as SelectOption);
    const formData: wallet_token | undefined = walletRawList?.find(
      (i) => i?.id === item?.value
    );

    if (onSelectChange) {
      let eventData: any = {};
      if (item) {
        eventData = {
          ...formData,
          token: getTokenWithOwnerId(item , walletRawList)
        };
      } else {
        eventData = null;
      }
      onSelectChange(eventData);
    }
  };

  const onUpdate = async (item: SelectOption | null , walletData: wallet_token[] | undefined) => {
    setWallet(item as SelectOption);
    const formData: wallet_token | undefined = walletData?.find(
      (i) => i?.id === item?.value
    );
    
    if (onSelectChange) {
      let eventData: any = {};
      if (item) {
        eventData = {
          ...formData,
          token: getTokenWithOwnerId(item, walletData)
        };
      } else {
        eventData = null;
      }
      console.log('eventData',eventData)
      onSelectChange(eventData);
      
    }
  };

  const getTokenWithOwnerId = (item: SelectOption | null, walletData:wallet_token[] | undefined) => {
    const findTokenList = walletData?.filter(
      (i) => i.owner_id === item?.label
    );
    const tokenIdList = findTokenList?.map((i) => i.token_id);
    const tokenListSymbol = tokenRawData.current.filter((i) =>
      tokenIdList?.includes(i?.id)
    );
    return tokenListSymbol;
  };

  const mappingPartnerByOwnerId = (
    staffData: StaffInfoType | undefined,
    allWallet: wallet_token[]
  ) => {
    const level = staffData?.role?.level;
    const walletListData = uniqBy(allWallet, 'owner_id');
    let optionsWallet;
    if (level === ROOT) {
      optionsWallet = getOption(walletListData);
    } else if (level === COMPANY_ADMIN) {
      const data = walletListData.filter((i) =>
        i?.owner_id.includes(staffData?.company_id!)
      );
      optionsWallet = getOption(data);
    } else if (
      level === COMPANY_PLATFORM_ADMIN ||
      level === COMPANY_PLATFORM_STAFF
    ) {
      const data = walletListData.filter(
        (i) => i?.owner_id === staffData?.platform_id
      );
      optionsWallet = getOption(data);
    }
    setWalletList(optionsWallet);
  };

  return (
    <>
      <Select
        classNamePrefix="select-custom"
        instanceId="wallet_id"
        placeholder={placeholder}
        options={walletList}
        defaultValue={wallet}
        value={wallet}
        onChange={(item) => onChange(item)}
        required
        isClearable
        isLoading={loadingWallet}
      />
    </>
  );
};
export default WalletSelect;
