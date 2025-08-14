import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DateType } from 'react-tailwindcss-datepicker';

dayjs.extend(utc);

export const getDate = (date: string, format?:string) => {
  return dayjs.utc(date).format(format ?? 'YYYY/MM/DD');
};
export const getTime = (date: string) => {
  return dayjs.utc(date).format('HH:mm');
};

export const getDateAndTime = (date: string) => {
  const day = dayjs.utc(date).format('DD/MM/YYYY');
  const time = dayjs(date).format('HH.mm');
  const bookingDate = `วันที่ ${day} เวลา ${time}`;
  return bookingDate;
};

export const getDateTH = (date: string) => {
  const strToDate = new Date(date);
  const result = strToDate.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return result;
};

export const toISOString = (inputString: string) => {
  // Split the input string into date and time parts
  const [datePart, timePart] = inputString.split(' ');
  // Extract day, month, and year from the date part
  const [day, month, year] = datePart.split('-').map(Number);
  // Extract hours and minutes from the time part
  const [hours, minutes] = timePart.split(':').map(Number);
  // Create a new Date object with the provided date and time in local time
  const dateTime = new Date(year, month - 1, day, hours, minutes);
  // Convert the local time to UTC and format it as an ISO string
  const dateTimeISOString = dateTime.toISOString();
  return dateTimeISOString;
};

export const dateToUnix = (dataDate: string | DateType) => {
  // data like "2023/11/18"
  const date = new Date(dataDate!);

  const unixTimestamp = Math.floor(date.getTime() / 1000);
  return unixTimestamp;
};

export const unixToDateString = (
  unix: number,
  utc?: boolean,
  format?: string
) => {
  var date = new Date(unix * 1000);
  if (!format) {
    format = 'YYYY-MM-DD HH:mm:ss';
  }
  let day;
  if (utc) {
    day = dayjs.utc(date).format(format);
  } else {
    day = dayjs(date).format(format);
  }
  return day;
};

export const getDateTimeNow = (utc?: boolean, format?: string) => {
  var date = new Date();
  if (!format) {
    format = 'YYYY-MM-DD HH:mm:ss';
  }
  let day;
  if (utc) {
    day = dayjs.utc(date).format(format);
  } else {
    day = dayjs(date).format(format);
  }
  return day;
};

export const getDateTimeFull = (dataDate: string | DateType,utc?: boolean) => {
  const format = 'YYYY-MM-DD HH:mm:ss';
  let day;
  if (utc) {
    day = dayjs.utc(dataDate).format(format);
  } else {
    day = dayjs(dataDate).format(format);
  }
  return day;
};

export const toUnixTime = (dataDate: string | DateType | null | undefined) => {
  console.log("🚀 ~ file: time.ts:99 ~ toUnixTime ~ dataDate:", dataDate)
  if(dataDate === null || dataDate === '' || dataDate === undefined ){
    return 0;
  }
  
  return dayjs.utc(dataDate).unix();
}

export const toUnixTimeStartDay = (dataDate: string | DateType | null | undefined) => {
  if(dataDate === null || dataDate === '' || dataDate === undefined ){
    return 0;
  }

  const convertDate = new Date(dataDate!)
  convertDate.setHours(0, 0, 0)
  return dayjs.utc(convertDate).unix();
}

export const toUnixTimeEndDay = (dataDate: string | DateType | null | undefined) => {
  if(dataDate === null || dataDate === '' || dataDate === undefined ){
    return 0;
  }

  const convertDate = new Date(dataDate!)
  convertDate.setHours(23, 59, 59)
  return dayjs.utc(convertDate).unix();
}
