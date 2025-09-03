// src/components/Auth/LoginForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "./AuthSchema";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import type { UseFormReturn } from "react-hook-form";
interface LoginFormProps {
  onLogin: (data: LoginFormData, loginForm : UseFormReturn<LoginFormData>) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
//  I want to pass loginForm to the function onLogin , I passed the data but I am not able to mention the type of the second argument 
  return (
    <form onSubmit={loginForm.handleSubmit((data)=> {onLogin(data,loginForm)})} className="space-y-4">
      <AuthInput
        id="login-email"
        type="email"
        placeholder="Enter your Email"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        }
        error={loginForm.formState.errors.email?.message}
        {...loginForm.register("email")}
      />
      
      <AuthPasswordInput
        id="login-password"
        placeholder="Password"
        error={loginForm.formState.errors.password?.message}
        {...loginForm.register("password")}
      />
      
      <div className="flex items-center justify-between">
        <Button variant="link" className="px-0 text-sm">
          Forgot password?
        </Button>
      </div>
      
      <Button
        type="submit"
        className={`w-full ${
          loginForm.formState.isSubmitting ? "" : "cursor-pointer"
        }`}
        size="lg"
        disabled={loginForm.formState.isSubmitting}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        {loginForm.formState.isSubmitting ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}