// src/components/Auth/AuthInput.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface AuthInputProps {
  id: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
  name:string;
  [key: string]: unknown;
}

export default function AuthInput({
  id,
  placeholder,
  icon,
  onChange,
  error,
  className = "",
  ...rest
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{placeholder}</Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          id={id}
          placeholder={placeholder}
          className={`pl-10 ${className} ${
            error ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
          onChange={onChange}
          {...rest}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}