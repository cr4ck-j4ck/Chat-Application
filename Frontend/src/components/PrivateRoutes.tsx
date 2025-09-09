import useUserStore from "@/Store/user.store";
import useGlobalStore from "@/Store/global.store";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
const PrivateRoutes = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const { fetchResult } = useGlobalStore(
    useShallow((state) => ({
      fetchResult: state.fetchResult
    }))
  );
  const user = useUserStore((state) => state.user);

  // Don't interfere with fetchResult - let App.tsx handle it
  if (user && (fetchResult === "success" || fetchResult === "resting")) {
    return <>{children}</>;
  } else if (fetchResult === "error") {
    console.log("Error occurred, redirecting to auth");
    return <Navigate to={"/auth"} />;
  } else if ((fetchResult === "success" || fetchResult === "resting") && !user) {
    // User is not authenticated, redirect to login
    console.log("User not authenticated, redirecting to auth");
    return <Navigate to={"/auth"} />;
  }
  
  // Show loading while processing
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default PrivateRoutes;
