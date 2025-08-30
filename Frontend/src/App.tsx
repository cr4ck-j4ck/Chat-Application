import "./App.css";
import AppRoutes from "./Routes/routes";
import useUserStore from "./Store/user.store";
import { io } from "socket.io-client";

function App() {
  const user = useUserStore((state) => state.user);
  if (user) {
    const socket = io("http://localhost:3000", {
      reconnectionDelayMax: 10000,
      auth: {
        token:user.userName
      },
    });
  }
  return <AppRoutes />;
}

export default App;
