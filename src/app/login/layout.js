import Login from "./page";
import { GoogleOAuthProvider } from "@react-oauth/google";


export const metadata = {
};

const LoginLayout = () => {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''} >
            <Login />
        </GoogleOAuthProvider>
    );
};

export default LoginLayout;
