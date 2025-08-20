import { InputHTMLAttributes, useRef } from "react";
import { IconImage } from "../icon";

// Step 1: Define the interface for Props with default values
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconSize?: string;
}

const InputFileImage: React.FC<Props> = (props) => {
  // Step 2: Use the props in the component
  const { label, iconSize = "48px", ...inputProps } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="relative w-full border border-[--border-color] rounded-md p-2 cursor-pointer"
      style={props.style}
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex justify-between items-center gap-4">
        <label
          className="text-gray-400 font-light"
        >
          {label}
        </label>
        <IconImage
          className={`text-[${iconSize}] text-gray-300 icon`}
        />
      </div>
      <input
        className="hidden"
        type="file"
        accept={props.accept}
        ref={inputRef}
        {...inputProps}
      />
    </div>
  );
};

export default InputFileImage;
