import { Routes, Route } from "react-router-dom";
import WelcomePage from "@/Pages/Welcome";
import AuthPage from "@/Pages/Auth";
import ChatPage from "@/Pages/Chat";
import PrivateRoutes from "@/components/PrivateRoutes";
import DashboardPage from "@/Pages/Dashboard";
import { Navigate } from "react-router-dom";
import useUserStore from "@/Store/user.store";

export default function AppRoutes(){
    const user = useUserStore((state) => state.user);
    
    return (
        <Routes>
            <Route path="/" element={
                user ? <Navigate to="/chat" replace /> : <WelcomePage/>
            }/>
            <Route path="/auth" element={<AuthPage/>}/>
            <Route path="/chat" element={<PrivateRoutes>
                <ChatPage></ChatPage>
                </PrivateRoutes>}/>
            <Route path="/profile" element={<PrivateRoutes>
                <DashboardPage></DashboardPage>
                </PrivateRoutes>}/>
        </Routes>
    )
}