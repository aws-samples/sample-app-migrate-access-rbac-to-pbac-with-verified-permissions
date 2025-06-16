import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AddPasskey() {
  const { data: session } = useSession();
  const router = useRouter();
  console.log("Session: ", session);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await fetch('/api/passkey-url');
        const data = await response.json();
        const passkey_url = data.passkey_url;
        console.log("Passkey URL: ", passkey_url);
        router.push(passkey_url);
      } catch (error) {
        console.error("Error during redirect:", error);
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <>
      <h1>Redirecting...</h1>
    </>
  );
}