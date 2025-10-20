import { FC } from "react";

const classes = {
  rounded: "rounded",
  padding: "py-2 pt-2.5 px-4",
  size: "",
  color: "text-white",
  bg: "bg-primary",
  hover: "",
  other: "flex justify-center cursor-pointer",
  fontSize: "text-sm",
};

export const buttonClasses = (overrides: string) => {
  const paramsClassesList = overrides
    .split(" ")
    .map((item) => item.split("-")[0]);
  return `${overrides} ${Object.entries(classes)
    .map(([_, val]) => val)
    .filter((c) => !paramsClassesList.includes(c.split("-")[0]))
    .reduce((a, b) => `${a} ${b}`)}`;
};

export type ButtonProps = {
  children?: React.ReactNode;
  onClick?: (e?: React.FormEvent) => void;
  rounded?: string;
  padding?: string;
  size?: string;
  color?: string;
  bg?: string;
  hover?: string;
  className?: string;
  fontSize?: string;
};

export const Button: FC<ButtonProps> = ({
  children = null,
  onClick = (e?: React.FormEvent) => {},
  rounded = classes.rounded,
  padding = classes.padding,
  size = classes.size,
  color = classes.color,
  bg = classes.bg,
  hover = classes.hover,
  className = "",
  fontSize = classes.fontSize,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${rounded} ${bg} ${color} ${padding} ${size} ${hover}  ${fontSize} ${className} flex justify-center cursor-pointer items-center`}
    >
      {children}
    </button>
  );
};
