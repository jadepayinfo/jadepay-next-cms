import { IconClose } from "@/components/icon";
import { ReactNode } from "react";
import Select,  {
  ClassNamesConfig,
  SelectComponentsConfig,
  StylesConfig,
  components,
} from "react-select";
import { default as ReactSelectMulti} from 'react-select';


export const customMultiValueClassName: ClassNamesConfig = {
  control: () => '!bg-transparent',
  option: () => "!bg-white !text-[--text]",
  multiValue: () => "!bg-[--bg-breadcrumbs] flex-row-reverse",
  multiValueLabel: () => "!text-primary !pl-0 !pr-2",
  multiValueRemove: () =>
    "!bg-[--bg-breadcrumbs] text-primary hover:!text-white",
};

