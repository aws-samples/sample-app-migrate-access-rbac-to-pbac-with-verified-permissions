import { SessionProvider } from "next-auth/react";
import "../styles/custom.css";
import '../styles/global.css';
import "../styles/Home.module.css";


export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}