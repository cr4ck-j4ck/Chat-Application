import useUserStore from "@/Store/user.store";
import { useShallow } from "zustand/react/shallow";
import { getUser } from "@/Services/user.api";
import { useState } from "react";
import { Navigate } from "react-router-dom";

type Tfetch = "error" | "success" | "processing.." | "resting..";

const PrivateRoutes = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const { user, setUser } = useUserStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser }))
  )
  const [fetchResult, setFetchResult] = useState<Tfetch>("resting..");
  if (!user) {
    getUser()
      .then((result) => {
        const [err, user] = result;
        if (err) {
            setFetchResult("error");
            return console.log(err);
        }
        setUser(user!);
      })
      .catch((err) => {
        console.log("Error Occurred", err);
        setFetchResult("error");
      })
  }
  if (user && fetchResult == "resting..") {
    return <>{children}</>;
  }else if(fetchResult == "error"){
    return <Navigate to={"/auth"}/>
  }
  return (
    <>
    <h1>Loading...</h1>
    </>
  )

};

export default PrivateRoutes;
