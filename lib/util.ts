import {
  ConfigOptions,
  generateCsv,
  mkConfig,
  download as downloadFile
} from 'export-to-csv';

// Function to download data to a file
export const download = (data: BlobPart, filename: string, type: string) => {
  const file = new window.Blob([data], { type });
  // if (window.navigator.msSaveOrOpenBlob)
  //   // IE10+
  //   window.navigator.msSaveOrOpenBlob(file, filename);
  // else {
  // Others
  const a = document.createElement('a'),
    url = window.URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
  // }
};

export const uniqueArray = <T extends string | number | symbol>(
  list: Array<T>
): Array<T> => {
  const map: Record<T, number> = {} as Record<T, number>;
  const newList = [] as Array<T>;

  for (let index = 0; index < list?.length; index++) {
    const element = list[index];
    if (map[element] == null) {
      newList.push(element);
      map[element] = 1;
    }
  }

  return newList;
};

export const downLoadFileCsv = ({
  data,
  opts = {}
}: {
  data: any;
  opts: ConfigOptions;
}) => {
  const csvConfig = mkConfig({
    ...opts
  });
  const csv = generateCsv(csvConfig)(data);
  downloadFile(csvConfig)(csv);
};

export const generatePassword = (length?: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = length ?? 8;
  let counter = 0;
  let result = "";
  while (counter < charactersLength) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
    counter += 1;
  }

  return result;
}

export const formatPhoneNumber = (phoneNumber?: string) => {
  if (phoneNumber != undefined) {
    // Remove non-numeric characters from the phone number
    const numericPhoneNumber = phoneNumber?.replace(/\D/g, '');

    // Format the numeric phone number as "09-999-9999"
    const formattedPhoneNumber = numericPhoneNumber.replace(
      /(\d{2})(\d{3})(\d{4})/,
      '$1-$2-$3'
    );

    return formattedPhoneNumber;
  }
};