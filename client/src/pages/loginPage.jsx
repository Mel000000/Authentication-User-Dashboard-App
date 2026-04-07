import SharedPageContainer from '../components/pageContainer';
import Login from '../components/Login';

export default function LoginPage() {
    return (
        <SharedPageContainer 
            showLinks={true}
            links={[
                { href: "/forgot-password", text: "Forgot Password?" },
                { href: "/signup", text: "Create new Account?" }
            ]}
        >
            <Login />
        </SharedPageContainer>
    );
}