"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useUserStore from "@/Store/user.store";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomAlert from "@/components/CustomAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createUser, loginUser } from "@/Services/user.api";
import { wrapAsync } from "@/Utility/WrapAsync";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const allowedDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "yandex.com",
  "mail.com",
];

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
const customMesssages = [
  "BOOM! Your account's live—welcome to the wild side! 🚀",
  "Account created! Get ready to rock the universe! 🌌",
  "Holy moly, you're in! Let's make some epic chaos! 🎉",
  "BAM! Account activated—time to unleash your awesomeness! 💥",
  "You're officially one of us! Let's go bananas! 🍌🔥"
]
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    lastName: z
      .string().optional(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => {
        const domain = email.split("@")[1]?.toLowerCase();
        return domain && allowedDomains.includes(domain);
      }, `Please use a popular email provider (${allowedDomains.slice(0, 4).join(", ")}, etc.)`),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const [showSuccessMessage , setShowSuccessMessage] = useState(false);
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onLoginSubmit = async (data: LoginFormData) => {
    if(loginSchema.safeParse(data).success){
      const res = await loginUser(data);
      console.log("res ----",res)
    }
  };
  
  const onSignupSubmit = async (userData: SignupFormData) => {
    const parsedResult = signupSchema.safeParse(userData);
    if (parsedResult.success) {
      signupForm.reset();
      const [error, data] = await wrapAsync(createUser, userData);
      if (error) {
        console.log(error);
      } else {
        setUser(data);
        setShowSuccessMessage(true);
        setTimeout(()=>{
          setShowSuccessMessage(false);
        },7000)
      }
    } else {
      console.log("error Occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/abstract-chat-bubbles-pattern.png')] opacity-5"></div>
      {
        showSuccessMessage ? <CustomAlert message={customMesssages[Math.floor(Math.random() * customMesssages.length)]} variant="success" title="Account created!!"/> : ""
      }
      <div className="relative w-full max-w-md">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Gufta-Gu
            </h1>
          </div>
          <Badge variant="secondary" className="mb-2">
            Join the Conversation
          </Badge>
          <p className="text-muted-foreground">
            Connect with people who share your interests
          </p>
        </div>

        {/* Auth Tabs */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="login"
                className="cursor-pointer text-sm font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="cursor-pointer text-sm font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in to continue your conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className={`pl-10 ${
                          loginForm.formState.errors.email
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>{loginForm.formState.errors.email.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`pl-10 pr-10 ${
                          loginForm.formState.errors.password
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        {...loginForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {loginForm.formState.errors.password.message}
                        </span>
                      </div>
                    )}
                  </div>
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
                    {loginForm.formState.isSubmitting
                      ? "Signing In..."
                      : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" size="lg">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" size="lg">
                    <svg
                      className="mr-2 h-4 w-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center">
                  Create Account
                </CardTitle>
                <CardDescription className="text-center">
                  Join thousands of people connecting on Gufta-Gu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-4"
                >
                  <div className="flex space-x-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-firstName"
                          type="text"
                          placeholder="Enter your First Name"
                          className={`pl-10 ${
                            signupForm.formState.errors.firstName
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }`}
                          {...signupForm.register("firstName")}
                        />
                      </div>
                      {signupForm.formState.errors.firstName && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            {signupForm.formState.errors.firstName.message}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 ">
                      <Label htmlFor="signup-lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-lastName"
                          type="text"
                          placeholder="Enter your Last name"
                          className={`pl-10 ${
                            signupForm.formState.errors.lastName
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }`}
                          {...signupForm.register("lastName")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className={`pl-10 ${
                          signupForm.formState.errors.email
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        {...signupForm.register("email")}
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>{signupForm.formState.errors.email.message}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Only popular email providers are allowed (Gmail, Yahoo,
                      Hotmail, Outlook, etc.)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className={`pl-10 pr-10 ${
                          signupForm.formState.errors.password
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        {...signupForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {signupForm.formState.errors.password.message}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters with uppercase,
                      lowercase, and number
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={`pl-10 pr-10 ${
                          signupForm.formState.errors.confirmPassword
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        {...signupForm.register("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {signupForm.formState.errors.confirmPassword && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {signupForm.formState.errors.confirmPassword.message}
                        </span>
                      </div>
                    )}
                  </div>
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" size="lg">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" size="lg">
                    <svg
                      className="mr-2 h-4 w-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            © 2024 Gufta-Gu. Made with ❤️ for bringing people together.
          </p>
        </div>
      </div>
    </div>
  );
}
