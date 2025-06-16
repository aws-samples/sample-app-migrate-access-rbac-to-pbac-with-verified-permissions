import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function singleLogout() {
    const { data: session } = useSession();
    const router = useRouter();
    console.log("Session: ", session);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout-url');
            const data = await response.json();
            const logout_url = data.logout_url;
            console.log("Logout URL: ", logout_url);

            await signOut({ redirect: false });
            router.push(logout_url);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    if (session) {
        handleLogout();
        return (
            <>
                <h1>Logging Out...</h1>
            </>
        );
    }

    return (
        <>
            <h1>Not Logged In</h1>
        </>
    );
}