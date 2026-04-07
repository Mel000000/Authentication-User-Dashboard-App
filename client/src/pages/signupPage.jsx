import SharedPageContainer from '../components/pageContainer';
import Signup from "../components/Signup";

export default function SignupPage() {
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