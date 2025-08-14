import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button: React.FC<Props> = (props) => {
  const { size = "sm", children, ...buttonProps } = props;
  const buttonSize = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  return (
    <button
      className={`btn text-white normal-case ${buttonSize[size]}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
};
export default Button;
