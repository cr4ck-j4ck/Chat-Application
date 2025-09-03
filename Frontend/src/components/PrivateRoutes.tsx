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
  const { fetchResult, setFetchResult } = useGlobalStore(
    useShallow((state) => ({
      fetchResult: state.fetchResult,
      setFetchResult: state.setFetchResult,
    }))
  );
  const user = useUserStore((state) => state.user);
  useEffect(() => {
    setFetchResult("resting")
  }, [user]);

  if (user && fetchResult == "resting") {
    return <>{children}</>;
  } else if (fetchResult == "error") {
    console.log("navigate ho raha hai ");
    return <Navigate to={"/auth"} />;
  }
  return (
    <>
      <h1>Loading...</h1>
    </>
  );
};

export default PrivateRoutes;
