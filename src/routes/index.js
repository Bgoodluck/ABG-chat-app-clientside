import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/Authentications/RegisterPage";
import CheckEmailPage from "../pages/Authentications/CheckEmailPage";
import CheckPasswordPage from "../pages/Authentications/CheckPasswordPage";
import Home from "../pages/Home/Home";
import MessagePage from "../components/Message/MessagePage";
import AuthLayouts from "../layout";
import ForgotPassword from "../pages/Authentications/ForgotPassword";
import Hero from "../components/Animamtion/Hero";
import UserProfile from "../components/Animamtion/UserProfile";
import AllUsersDetail from "../components/Animamtion/AllUsersDetail";


const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                path: "register",
                element: <AuthLayouts>
                          <RegisterPage/>
                         </AuthLayouts>
            },
            {
                path: "email",
                element: <AuthLayouts>
                            <CheckEmailPage/>
                         </AuthLayouts>
            },
            {
                path: "password",
                element: <AuthLayouts>
                          <CheckPasswordPage/>
                         </AuthLayouts>
            },
            {
                path: "forgot",
                element: <AuthLayouts>
                           <ForgotPassword/>
                         </AuthLayouts>
            },
            
            
            {
                path: "",
                element: <Home/>,
                children:[
                    {
                        path: ":userId",
                        element: <MessagePage/>
                    },
                    {
                        path: "message/:userId",  
                        element: <MessagePage/>
                    },
                    {
                        path: "allusers",
                        element: <AllUsersDetail/>
                    },
                    {
                        path: "hero",
                        element: <Hero/>
                    },
                    {
                        path: "userprofile/:userId",
                        element: <UserProfile/>
                    },
                ]
            }
        ]
    },
    
])

export default router;