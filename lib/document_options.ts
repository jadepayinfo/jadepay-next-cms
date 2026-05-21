import { CatalogueItem } from '@/model/catalogueItem';

export type SelectOption = {
  value: number;
  label: string;
};

export type DocumentGlobalOptions = {
  primary: SelectOption[];
  secondary: SelectOption[];
  additional: SelectOption[];
  selfie: SelectOption[];
};

export const getCountryCode = (country: string): string => {
  switch (country.toUpperCase()) {
    case 'MMR':
    case 'MM':
      return 'mm';
    case 'THA':
    case 'TH':
      return 'th';
    default:
      return '';
  }
};

export const getDocumentOptions = (
  docRole: string,
  globalOptions: DocumentGlobalOptions
): SelectOption[] => {
  if (docRole.includes('primary')) return globalOptions.primary;
  if (docRole.includes('secondary')) return globalOptions.secondary;
  if (docRole.includes('additional')) return globalOptions.additional;
  if (docRole.includes('selfie')) return globalOptions.selfie;
  return [];
};

export const mapCatalogueToOptions = (data: unknown): SelectOption[] =>
  (Object.values(data as Record<string, unknown>).filter(Boolean) as CatalogueItem[])
    .filter((item) => item?.id && item?.name_en)
    .map((item) => ({ value: item.id, label: item.name_en }));
