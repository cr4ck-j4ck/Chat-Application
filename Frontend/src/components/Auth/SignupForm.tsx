// src/components/Auth/SignupForm.tsx
import { useForm } from "react-hook-form";
import { MessageCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { User, UserRoundPen } from "lucide-react";
import { signupSchema, type SignupFormData } from "./AuthSchema";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import { createUser, isUserNameAvalable } from "@/Services/user.api";
import { wrapAsync } from "@/Utility/WrapAsync";
import { useState } from "react";

interface SignupFormProps {
  onSignup: (data: SignupFormData) => void;
}

export default function SignupForm({ onSignup }: SignupFormProps) {
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userName: "",
      confirmPassword: "",
    },
  });
  const [isAvailable,setIsAvailable] = useState(false);
  const onSubmit = async (userData: SignupFormData) => {
    const parsedResult = signupSchema.safeParse(userData);
    if (parsedResult.success) {
      signupForm.reset();
      const [error] = await wrapAsync(createUser, userData);
      if (error) {
        console.log(error);
      } else {
        onSignup(userData);
      }
    } else {
      console.log("error Occurred");
    }
  };

  const checkUsername = async () => {
    signupForm.clearErrors();
    setIsAvailable(false);
    const response = await isUserNameAvalable(signupForm.getValues("userName"));
    if (!response) {
      signupForm.setError("userName", {
        type: "manual",
        message: "Username is already taken",
      });
    }else{
      setIsAvailable(true);
    }
  };
  const userName = signupForm.watch("userName", ""); 
  return (
    <form onSubmit={signupForm.handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex space-x-3">
        <div className="flex-1">
          <AuthInput
            id="signup-firstName"
            type="text"
            placeholder="First Name"
            icon={<User className="w-4 h-4" />}
            error={signupForm.formState.errors.firstName?.message}
            {...signupForm.register("firstName")}
          />
        </div>
        <div className="flex-1">
          <AuthInput
            id="signup-lastName"
            type="text"
            placeholder="Last Name"
            icon={<User className="w-4 h-4" />}
            error={signupForm.formState.errors.lastName?.message}
            {...signupForm.register("lastName")}
          />
        </div>
      </div>

      <AuthInput
        id="signup-username"
        type="text"
        placeholder="User Name"
        icon={<UserRoundPen className="w-4 h-4" />}
        error={signupForm.formState.errors.userName?.message}
        {...signupForm.register("userName")}
      />

      <button
        className={`
        text-sm
        h-10
        px-5
        border-2
        border-green-700
        text-green-700
        rounded-xl
        font-bold
        hover:bg-green-700
        hover:text-white
        transition
        duration-300
        ease-in-out
        focus:outline-none
        focus:ring-2
        focus:ring-green-400
        focus:ring-offset-2
        `}
        type="button"
        onClick={checkUsername}
        disabled={userName.length<5}
        style={{
          opacity:`${userName.length<5 ? "0.4":"1"}`
        }}
      >
        Check UserName
      </button>
        
          {isAvailable ? (<span className="text-green-800 ml-5 font-bold">Username is available!!</span>) : ""}

      <AuthInput
        id="signup-email"
        type="email"
        placeholder="Email"
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
        error={signupForm.formState.errors.email?.message}
        {...signupForm.register("email")}
      />
      <p className="text-xs text-muted-foreground">
        Only popular email providers are allowed (Gmail, Yahoo, Hotmail,
        Outlook, etc.)
      </p>

      <AuthPasswordInput
        id="signup-password"
        placeholder="Create a password"
        error={signupForm.formState.errors.password?.message}
        {...signupForm.register("password")}
      />
      <p className="text-xs text-muted-foreground">
        Password must be at least 8 characters with uppercase, lowercase, and
        number
      </p>

      <AuthPasswordInput
        id="signup-confirm-password"
        placeholder="Confirm your password"
        error={signupForm.formState.errors.confirmPassword?.message}
        {...signupForm.register("confirmPassword")}
      />

      <div className="text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Button variant="link" className="px-0 text-xs h-auto">
          Terms of Service
        </Button>{" "}
        and{" "}
        <Button variant="link" className="px-0 text-xs h-auto">
          Privacy Policy
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={signupForm.formState.isSubmitting}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        {signupForm.formState.isSubmitting
          ? "Creating Account..."
          : "Create Account"}
      </Button>
    </form>
  );
}
