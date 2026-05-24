import SharedPageContainer from '../components/pageContainer';
import VerifyCard from "../components/VerifyCard";

export default function VerifyEmailPage() {
    return (
        <SharedPageContainer 
            showLinks={true}
            links={[
                { href: "/", text: "Back to Login" },
                { href: "/signup", text: "Create new Account?" }
            ]}
        >
            <VerifyCard title="Verify Email" buttonText="Verify" />
        </SharedPageContainer>
    );
}