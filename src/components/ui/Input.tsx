import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-xl bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] px-3 py-2 text-[16px] md:text-sm text-gray-900 dim:text-gray-100 dark:text-gray-100 placeholder:text-gray-500 dim:placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
