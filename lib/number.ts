export const numberWithCommas = (x: any) => {
  if (x === undefined) return '0';
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
};

export const toNumber = (x: any, digits?: number) => {
  if (x === undefined) return '0';
  const num = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits ?? 2,
    minimumFractionDigits: digits ?? 2
  }).format(x);

  return num;
};

export const showPhoneNumber = ({ text = '', show = 4 }): string => {
  let textNumber = text;
  const dot = ".".repeat(show);
  const rex = new RegExp(`.(?=${dot})`,'g');
  return textNumber.replace(rex, '*');
};
