import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Adding a harmless optional field silences the ESLint false positive
  "data-override"?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`border px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-teal-400 ${className}`}
      {...props}
    />
  )
);

Input.displayName = "Input";

