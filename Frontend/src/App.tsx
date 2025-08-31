import { useEffect } from "react";
import "./App.css";
import AppRoutes from "./Routes/routes";
import useUserStore from "./Store/user.store";
import { io } from "socket.io-client";
import useGlobalStore from "./Store/global.store";
import { toast } from "sonner";

function App() {
  const user = useUserStore((state) => state.user);
  const setSocket = useGlobalStore(state => state.setSocket)

  useEffect(()=>{
    if (user) {
    const socket = io("http://localhost:3000", {
      reconnectionDelayMax: 10000,
      auth: {
        token:user.userName
      },
      withCredentials:true
    });
    setSocket(socket);
    socket.on("receivedRequest",(userName)=>{
      console.log("you got request from ",userName);
      toast(`You Got Request from ${userName}`);
    })
    socket.on('disconnect', () => {console.log("user Disconnected!!")});

  }
}, [user, setSocket]);
  return <AppRoutes />;
}

export default App;
