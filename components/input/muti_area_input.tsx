import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import TextareaCustom from './textarea';

type MutiAreaInputType = {
  title: string;
  data: string[];
  label?: string;
  placeholder?: string;
  separate?: string;
  onDataChange?: (data: string[]) => void;
};

const MutiAreaInput = ({
  title,
  data,
  placeholder = '0XXXXXXXXX, 0XXXXXXXXX, ...',
  separate = ',',
  onDataChange
}: MutiAreaInputType) => {
  const [dataString, setDataString] = useState<string>();

  const dataMapping = useRef<string[]>([]);
  const lastText = useRef<string>('');

  useEffect(() => {
    dataMapping.current = data;
    setDataString(data.join(', '));
  }, [data]);

  const onChangeTextFilter = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const dataCurrent = e.target.value
      .split(separate)
      .map((t) => t.trim())
      .filter((t) => t !== '');

    dataMapping.current = dataCurrent;
    setDataString(text);

    // FireEvent data change
    if (onDataChange && lastText.current === '') {
      onDataChange(dataCurrent);
    }
  };

  const onkeyDownText = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === separate || e.key === ' ') {
      lastText.current = e.key;
    } else {
      lastText.current = '';
    }
  };

  return (
    <>
      <TextareaCustom
        title={title}
        // className="min-h-[9rem] w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
        placeholder={placeholder}
        value={dataString}
        onChange={onChangeTextFilter}
        onKeyDown={onkeyDownText}
      />
    </>
  );
};

export default MutiAreaInput;
