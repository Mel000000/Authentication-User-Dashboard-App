import SharedPageContainer from '../components/pageContainer';
import ReqResetCard from "../components/ReqResetCard";

export default function ForgotPasswordPage() {
    return (
        <SharedPageContainer 
            showLinks={true}
            links={[
                { href: "/", text: "Back to Login" },
                { href: "/signup", text: "Create new Account?" }
            ]}
        >
            <ReqResetCard />
        </SharedPageContainer>
    );
}