import { InputHTMLAttributes, useRef } from "react";
import { IconImage, IconImport } from "../icon";
import ButtonOutline from "../buttons/button_outline";

// Step 1: Define the interface for Props with default values
interface Props extends InputHTMLAttributes<HTMLInputElement> {}

const InputFileCSV: React.FC<Props> = (props) => {
  // Step 2: Use the props in the component
  const { ...inputProps } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <ButtonOutline size="md" type="button" onClick={() => inputRef.current?.click()}>
        <IconImport className={`text-[24px]`} />
        Import CSV
      </ButtonOutline>
      <input
        className="hidden"
        type="file"
        accept=".csv"
        ref={inputRef}
        {...inputProps}
      />
    </>
  );
};

export default InputFileCSV;
