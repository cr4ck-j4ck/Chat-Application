import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomAlert from "@/components/CustomAlert";
import AuthHeader from "@/components/Auth/AuthHeader";
import LoginForm from "@/components/Auth/LoginForm";
import SignupForm from "@/components/Auth/SignupForm";
import SocialLoginButtons from "@/components/Auth/SocialLoginButton";
import useUserStore from "@/Store/user.store";
import { useShallow } from "zustand/react/shallow";
import type {
  LoginFormData,
  SignupFormData,
} from "@/components/Auth/AuthSchema";
import { loginUser } from "@/Services/user.api";

const customMesssages = [
  "BOOM! Your account's live—welcome to the wild side! 🚀",
  "Account created! Get ready to rock the universe! 🌌",
  "Holy moly, you're in! Let's make some epic chaos! 🎉",
  "BAM! Account activated—time to unleash your awesomeness! 💥",
  "You're officially one of us! Let's go bananas! 🍌🔥",
];

export default function AuthPage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const {setUser ,user}= useUserStore(useShallow((state) => ({setUser : state.setUser,user:state.user})));
  const navigate = useNavigate();
  useEffect(()=>{
    if(user){
      navigate("/chat");
    }
  },[user]);
  const handleLogin = async (data: LoginFormData) => {
    const response = await loginUser(data);
    if (response) {
      setUser(response);
      navigate("/chat");
    }
  };

  const handleSignup = async () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 7000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/abstract-chat-bubbles-pattern.png')] opacity-5"></div>
      {showSuccessMessage && (
        <CustomAlert
          message={
            customMesssages[Math.floor(Math.random() * customMesssages.length)]
          }
          variant="success"
          title="Account created!!"
        />
      )}

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
        <AuthHeader />

        {/* Auth Card */}
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
                <LoginForm onLogin={handleLogin} />
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

                <SocialLoginButtons />
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
                <SignupForm onSignup={handleSignup} />

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

                <SocialLoginButtons />
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
