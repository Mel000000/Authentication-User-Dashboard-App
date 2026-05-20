import SharedPageContainer from '../components/pageContainer';
import ResetPasswordCard from "../components/ResetPassword";
import { use, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {


    return (
        <SharedPageContainer 
            showLinks={true}
            links={[
                { href: "/", text: "Back to Login" },
                { href: "/signup", text: "Create new Account?" }
            ]}
        >
            <ResetPasswordCard />
        </SharedPageContainer>
    );
}