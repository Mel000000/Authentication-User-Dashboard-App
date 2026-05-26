import { useEffect, useMemo} from 'react';
import { checkLoggedInUser } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import SharedPageContainer from '../components/pageContainer';
import Login from '../components/Login';

export default function LoginPage() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const res = checkLoggedInUser().then((result) => {
            if (result !== null) {
                navigate("/home");
            }
        });
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