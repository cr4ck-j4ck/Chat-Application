import { useEffect } from "react";
import "./App.css";
import AppRoutes from "./Routes/routes";
import useUserStore from "./Store/user.store";
import { io } from "socket.io-client";
import useGlobalStore from "./Store/global.store";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { getUser } from "./Services/user.api";
import { type IdirectChat  } from "./components/Chat/ChatItem";
import useCommunicationStore from "./Store/communcation.store";

function App() {
  const { user, setUser } = useUserStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser }))
  );
  const setSocket = useGlobalStore((state) => state.setSocket);
  const addDirectConversation = useCommunicationStore(state => state.addDirectConversations);
  const setFetchResult = useGlobalStore((state) => state.setFetchResult);
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
      const socket = io(import.meta.env.VITE_BACKEND_URL, {
        reconnectionDelayMax: 10000,
        auth: {
          token: user.userName,
        },
        withCredentials: true,
      });
      setSocket(socket);
      // hydrate conversations from server
      import("./Services/user.api").then(({ fetchUserConversations }) => {
        fetchUserConversations()
          .then((data) => {
            if (data.directConversations?.length) {
              useCommunicationStore.getState().setDirectConversations(data.directConversations);
            }
            // groups could be added similarly when implemented
          })
          .catch((err) => {
            console.error("Failed to fetch conversations:", err);
            toast.error("Could not load conversations");
          });
      });
      socket.on("disconnect", () => {
        console.log("user Disconnected!!");
      });
      socket.on("acceptedFriendRequest", (userName) => {
        toast.success(`${userName} accepted Your Request!!`);
      });
      interface Idata {
        _id: string;
        senderId: string;
        content: string;
        timestamp?: string;
        type?: string;
        receiverId?: string;
        senderUsername?: string;
        conversationId?: string;
      }
      socket.on("receive_message", (data: Idata) => {
        // notify
        if (data.senderUsername) toast.info(`${data.senderUsername} sent you message`);
        const normalized = {
          _id: data._id || String(Math.random()),
          conversationId: data.conversationId || "",
          senderId: data.senderId,
          content: data.content,
          type: (data.type as "text" | "image" | "file" | "system") || "text",
          timestamp: data.timestamp || new Date().toISOString(),
        };
        useCommunicationStore.getState().setMessages(normalized);
      });
      socket.on("new_conversation", (data: IdirectChat) => {
        addDirectConversation(data);
      });
    }
  }, [user, setSocket, addDirectConversation]);
  return <AppRoutes />;
}

export default App;
