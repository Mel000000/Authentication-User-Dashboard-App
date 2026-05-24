import SharedPageContainer from '../components/pageContainer';
import VerifyCard from "../components/VerifyCard";

export default function ForgotPasswordPage() {
    return (
        <SharedPageContainer 
            showLinks={true}
            links={[
                { href: "/", text: "Back to Login" },
                { href: "/signup", text: "Create new Account?" }
            ]}
        >
            <VerifyCard title="Forgot Password?" buttonText="Verify & Reset" />
        </SharedPageContainer>
    );
}