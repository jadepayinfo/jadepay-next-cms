import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/css";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  title: string;
  prefixIcon?: JSX.Element;
  suffixIcon?: JSX.Element;
  inputValidation?: "error" | "success" | "warning";
  helperText?: string;
  textLeftButton?: string;
  textRightButton?: string;
  isReadOnly?: boolean;
  hidden?: boolean;
  noWrapperMargin?: boolean;
}

const InputCustom = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    title,
    hidden,
    prefixIcon,
    suffixIcon,
    inputValidation,
    helperText,
    textLeftButton,
    textRightButton,
    isReadOnly,
    noWrapperMargin = false, 
    ...inputProps
  } = props;

  let inputClassCustom = "";
  let labelClassCustom = "";
  let helperTextCustom = "";

  if (prefixIcon && !hidden) {
    inputClassCustom += " pl-12";
    labelClassCustom += " peer-placeholder-shown:pl-9 peer-focus:pl-0";
  }

  if (suffixIcon) {
    inputClassCustom += " pr-12";
    labelClassCustom += " after:pr-9 peer-focus:pr-0";
  }

  switch (inputValidation) {
    case "error":
      inputClassCustom +=
        " border-error placeholder-shown:border-error placeholder-shown:border-t-error focus:border-error";
      labelClassCustom +=
        " before:border-error after:border-tl-error after:border-t-error after:border-l-error after:border-r-error peer-focus:text-error peer-focus:before:!border-error peer-focus:after:!border-error text-error";
      helperTextCustom += " text-error";
      break;
    case "success":
      inputClassCustom +=
        " border-success placeholder-shown:border-success placeholder-shown:border-t-success focus:border-success";
      labelClassCustom +=
        " before:border-success after:border-tl-success after:border-t-success after:border-l-success after:border-r-success peer-focus:text-success peer-focus:before:!border-success peer-focus:after:!border-success text-success";
      helperTextCustom += " text-success";
      break;
    case "warning":
      inputClassCustom +=
        " border-warning placeholder-shown:border-warning placeholder-shown:border-t-warning focus:border-warning";
      labelClassCustom +=
        " before:border-warning after:border-tl-warning after:border-t-warning after:border-l-warning after:border-r-warning peer-focus:text-warning peer-focus:before:!border-warning peer-focus:after:!border-warning text-warning";
      helperTextCustom += " text-warning";
      break;
    default:
      inputClassCustom +=
        " border-[--border-color] placeholder-shown:border-[--border-color] placeholder-shown:border-t-[--border-color] focus:border-primary";
      labelClassCustom +=
        " before:border-[--border-color] after:border-tl-[--border-color] after:border-t-[--border-color] after:border-l-[--border-color] after:border-r-[--border-color] peer-focus:text-primary peer-focus:before:!border-primary peer-focus:after:!border-primary";
      break;
  }

  if (!hidden) {
    inputClassCustom +=
      " border-t-transparent focus:border-t-transparent [&:not(focus)]:placeholder:opacity-0 disabled:[&:not(:placeholder-shown)]:border-t-transparent";
  }

  if (isReadOnly) {
    inputClassCustom +=
      " border-primary focus:border-t-primary [&:not(focus)]:placeholder:opacity-100 disabled:[&:not(:placeholder-shown)]:border-t-primary";
  }

  let inputContent = (
    <>
      {textLeftButton ? (
        <div className="btn btn-outline border-[--border-color] hover:!bg-primary hover:!border-primary min-h-[42px] h-[42px] mt-4 join-item rounded-l-lg">
          {textLeftButton}
        </div>
      ) : null}
      <div
        className={cn(
          noWrapperMargin ? "relative" : "relative mt-4",
          (textRightButton || textLeftButton) && "grow"
        )}
      >
        {prefixIcon && !hidden && (
          <div className="!absolute top-1/2 left-3 grid h-3/4 w-8 -translate-y-2/4 place-items-center cursor-pointer">
            {prefixIcon}
          </div>
        )}
        <input
          {...inputProps}
          ref={ref}
          className={cn(
            `peer w-full !border [&:not(disabled)]:bg-transparent px-3 py-2.5 text-sm
             outline-none transition-all
             placeholder-shown:border
             focus:border focus:outline-0 focus:placeholder:opacity-100
             focus:ring-0
             disabled:input-disabled disabled:border-[--border-color]
             rounded-md`,
            inputClassCustom,
            textRightButton && textLeftButton && "!rounded-none",
            textLeftButton && "!rounded-l-none",
            textRightButton && "!rounded-r-none",
            inputProps.className
          )}
        />

        {!hidden && !isReadOnly && (
          <label
            className={cn(
              `before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-xs font-normal leading-tight
               transition-all
               before:mt-[6px] before:mr-2 before:box-border before:block before:h-1.5 before:w-2.5
               before:border-t before:border-l
               after:mt-[6px] after:ml-2 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow
               after:border-t after:border-r
               peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75]
               peer-placeholder-shown:before:border-transparent
               peer-placeholder-shown:after:border-transparent
               peer-focus:text-xs
               peer-focus:leading-tight peer-focus:before:border-t peer-focus:before:border-l
               peer-focus:after:border-t
               peer-focus:after:border-r
               before:rounded-tl-md
               after:rounded-tr-md`,
              labelClassCustom,
              textRightButton &&
                textLeftButton &&
                "before:!rounded-tl-none after:!rounded-tr-none",
              textLeftButton && "before:!rounded-tl-none",
              textRightButton && "after:!rounded-tr-none"
            )}
          >
            <span className="overflow-hidden">{title}</span>{" "}
            {inputProps.required && (
              <label className="text-red-500 ml-1">*</label>
            )}
          </label>
        )}

        {suffixIcon && (
          <div className="!absolute top-1/2 right-3 grid h-3/4 w-8 -translate-y-2/4 place-items-center cursor-pointer">
            {suffixIcon}
          </div>
        )}
      </div>

      {textRightButton ? (
        <div className="btn btn-outline border-[--border-color] hover:!bg-primary hover:!border-primary min-h-[42px] h-[42px] mt-4 join-item rounded-r-lg">
          {textRightButton}
        </div>
      ) : null}
    </>
  );

  let divWrapButton = inputContent;

  if (textRightButton || textLeftButton) {
    divWrapButton = <div className="join">{inputContent}</div>;
  }

  return (
    <>
      {divWrapButton}
      {helperText && !hidden && (
        <div
          className={`px-3 py-1 text-sm outline-none transition-all ${helperTextCustom}`}
        >
          {helperText}
        </div>
      )}
    </>
  );
});

export default InputCustom;
