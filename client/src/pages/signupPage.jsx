import { useEffect } from 'react';
import { checkLoggedInUser } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import SharedPageContainer from '../components/pageContainer';
import Signup from "../components/Signup";

export default function SignupPage() {
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
                { href: "/", text: "Already have an account? Sign In" }
            ]}
        >
            <Signup />
        </SharedPageContainer>
    );
}