import { useEffect } from "react";
import "./App.css";
import AppRoutes from "./Routes/routes";
import useUserStore from "./Store/user.store";
import { io } from "socket.io-client";
import useGlobalStore from "./Store/global.store";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { getUser } from "./Services/user.api";

function App() {
  const { user, setUser } = useUserStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser }))
  );
  const setSocket = useGlobalStore((state) => state.setSocket);
  const  setFetchResult= useGlobalStore(state =>
      state.setFetchResult
  );
  useEffect(() => {
    if (!user) {
      getUser()
        .then((result) => {
          const [err, user] = result;
          if (err) {
            setFetchResult("error");
            return console.log(err);
          }
          setUser(user);
        })
        .catch((err) => {
          console.log("Error Occurred", err);
          setFetchResult("error");
        });
    }
  }, []);
  useEffect(() => {
    if (user) {
      const socket = io("http://localhost:3000", {
        reconnectionDelayMax: 10000,
        auth: {
          token: user.userName,
        },
        withCredentials: true,
      });
      setSocket(socket);
      socket.on("disconnect", () => {
        console.log("user Disconnected!!");
      });
      socket.on("acceptedFriendRequest",(userName)=>{
        toast.success(`${userName} accepted Your Request!!`)
      })
    }
  }, [user]);
  return <AppRoutes />;
}

export default App;
