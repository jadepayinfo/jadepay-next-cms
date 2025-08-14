import { cn } from "@/lib/css";
import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  bgWhite?: boolean;
  children: React.ReactNode;
}

const ButtonOutline: React.FC<Props> = (props) => {
  const { size = "sm", bgWhite, children, ...buttonProps } = props;
  const buttonSize = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  return (
    <button
    {...buttonProps}
      className={cn('btn btn-outline btn-primary normal-case', buttonSize[size], props.className) }
    >
      {children}
    </button>
  );
};
export default ButtonOutline;
