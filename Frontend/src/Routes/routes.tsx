import { Routes, Route } from "react-router-dom";
import WelcomePage from "@/Pages/Welcome";
import AuthPage from "@/Pages/Auth";
import ChatPage from "@/Pages/Chat";
import PrivateRoutes from "@/components/PrivateRoutes";
export default function AppRoutes(){
    return (
        <Routes>
            <Route path="/" element={<WelcomePage/>}/>
            <Route path="/auth" element={<AuthPage/>}/>
            <Route path="/dashboard" element={<PrivateRoutes>
                <ChatPage></ChatPage>
                </PrivateRoutes>}/>
        </Routes>
    )
}