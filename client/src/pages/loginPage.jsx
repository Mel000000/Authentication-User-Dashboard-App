import { useEffect, useMemo, useState} from 'react';
import { getCurrentUser} from '../api/userApi';
import {checkLoggedInUser} from "../utils/authUtils.js"
import { useNavigate } from 'react-router-dom';
import SharedPageContainer from '../components/pageContainer';
import Login from '../components/Login';

export default function LoginPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false)

     useEffect(() => {
        const fetchUser = async () => {
            try {
                //const userData = await getCurrentUser();
                const userData = await checkLoggedInUser();
                if (userData){
                    navigate('/home');
                }
            } catch (err) {
                console.error('Auth error:', err);
            }
        };

        fetchUser();
    }, []);

    return (
        <SharedPageContainer 
            showLinks={true}
            links={[
                { href: "/forgot-password", text: "Forgot Password?"},
                { href: "/signup", text: "Create new Account?" }
            ]}
        >
            <Login />
        </SharedPageContainer>
    );
}