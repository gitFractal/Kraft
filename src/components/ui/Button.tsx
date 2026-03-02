import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gray-900 text-white hover:bg-gray-800 dim:bg-gray-100 dim:text-gray-900 dim:hover:bg-gray-200 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200": variant === "default",
            "bg-transparent text-gray-900 dim:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dim:hover:bg-[#3d3d3d] dark:hover:bg-[#242424]": variant === "outline" || variant === "ghost",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 dim:bg-[#3d3d3d] dim:text-gray-100 dim:hover:bg-[#4d4d4d] dark:bg-[#242424] dark:text-gray-100 dark:hover:bg-[#343434]": variant === "secondary",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-8 text-lg": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
