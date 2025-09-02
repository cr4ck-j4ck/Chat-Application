import useUserStore from "@/Store/user.store";
import useGlobalStore from "@/Store/global.store";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const fetchResult = useGlobalStore(state => state.fetchResult);
  const  user = useUserStore(state => state.user  )
  
  if (user && fetchResult == "resting") {
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
