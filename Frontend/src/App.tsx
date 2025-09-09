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
import useCommunicationStore from "./Store/communication.store";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { user, setUser } = useUserStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser }))
  );
  const setSocket = useGlobalStore((state) => state.setSocket);
  const addDirectConversation = useCommunicationStore(state => state.addDirectConversations);
  const setFetchResult = useGlobalStore((state) => state.setFetchResult);
  useEffect(() => {
    if (!user) {
      setFetchResult("processing");
      getUser()
        .then((result) => {
          const [err, user] = result;
          if (err) {
            if (err.message === "UNAUTHENTICATED") {
              // User is not logged in - this is normal, not an error
              setFetchResult("success");
              console.log("User not authenticated - redirecting to login");
            } else {
              // Actual error occurred
              setFetchResult("error");
              console.error("Error fetching user:", err);
            }
            return;
          }
          setUser(user);
          setFetchResult("success");
        })
        .catch((err) => {
          console.error("Unexpected error occurred:", err);
          setFetchResult("error");
        });
    } else {
      // User is already authenticated
      setFetchResult("resting");
    }
  }, [setUser, setFetchResult, user]);
  useEffect(() => {
    if (user) {
      const socket = io(import.meta.env.VITE_BACKEND_URL, {
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 5,
        timeout: 20000,
        withCredentials: true,
      });
      
      setSocket(socket);
      
      // Handle socket connection events
      socket.on("connect", () => {
        console.log("✅ Connected to server with socket ID:", socket.id);
      });
      
      socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from server:", reason);
        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          socket.connect();
        }
      });
      
      socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error);
        toast.error("Failed to connect to server");
      });
      
      socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
      });
      
      // Handle friend request acceptance
      socket.on("acceptedFriendRequest", (userName) => {
        toast.success(`${userName} accepted your friend request!`);
      });
      
      // Handle new messages
      socket.on("receive_message", (data: any) => {
        const normalized = {
          _id: data._id || String(Math.random()),
          conversationId: data.conversationId || "",
          senderId: data.senderId,
          content: data.content,
          type: (data.type as "text" | "image" | "file" | "system") || "text",
          createdAt: data.timestamp || new Date().toISOString(),
        };
        useCommunicationStore.getState().appendMessage(normalized);
      });
      
      // Handle new conversations
      socket.on("new_conversation", (data: IdirectChat) => {
        addDirectConversation(data);
      });
      
      // Fetch conversations from server
      import("./Services/user.api").then(({ fetchUserConversations }) => {
        fetchUserConversations()
          .then((data) => {
            if (data && data.length > 0) {
              const directConvos = data.filter(c => c.type === "direct");
              if (directConvos.length > 0) {
                useCommunicationStore.getState().setDirectConversations(directConvos as any);
              }
            }
          })
          .catch((err) => {
            console.error("Failed to fetch conversations:", err);
            toast.error("Could not load conversations");
          });
      });
      
      // Cleanup on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [user, setSocket, addDirectConversation]);

  const fetchResult = useGlobalStore((state) => state.fetchResult);

  if (fetchResult === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your chat..." />
      </div>
    );
  }

  if (fetchResult === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to load application</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your data. Please refresh the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
