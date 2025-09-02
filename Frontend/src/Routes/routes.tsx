import { Routes, Route } from "react-router-dom";
import WelcomePage from "@/Pages/Welcome";
import AuthPage from "@/Pages/Auth";
import ChatPage from "@/Pages/Chat";
import PrivateRoutes from "@/components/PrivateRoutes";
import DashboardPage from "@/Pages/Dashboard";

export default function AppRoutes(){
    return (
        <Routes>
            <Route path="/" element={<WelcomePage/>}/>
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