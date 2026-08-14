"use client";
import { useEffect } from "react";
import { Screen, Wordmark } from "./component";
import { embeddedSignup } from "@/app/api/whatsapp";
import { redirectRoute } from "@/app/api/google";

const SignUp = () => {
       
  const handleRediarct = async ()=>{
    return await redirectRoute()
  }
  // useEffect(() => {
  //   if(window.FB){
  //     console.log("FB already loaded, initializing...");
  //     console.log("here si meat id", process.env.NEXT_PUBLIC_META_APP_ID)
  //     window.FB.init({
  //       appId: process.env.NEXT_PUBLIC_META_APP_ID!,
  //       autoLogAppEvents: true,
  //       xfbml: true,
  //       version: "v20.0"
  //     })

  //   }else{
  //        console.log("Elsse FB already loaded, initializing...");
  //     console.log("Else here si meat id", process.env.NEXT_PUBLIC_META_APP_ID)
  //     window.fbAsyncInit = function () {
  //     window.FB.init({
  //       appId: process.env.NEXT_PUBLIC_META_APP_ID!,
  //       autoLogAppEvents: true,
  //       xfbml: true,
  //       version: "v20.0"
  //     })
  //   };
  //   }
    
  //   (function (d, s, id) {
  //     if (d.getElementById(id)) return;
  //     const js = d.createElement(s) as HTMLScriptElement;
  //     js.id = id;
  //     js.src = "https://connect.facebook.net/en_US/sdk.js" as string;
  //     d.getElementsByTagName("head")[0].appendChild(js);

  //   })(document, "script", "facebook-jssdk");
  // }, []);

  // useEffect(() => {
  //   const handler = (event: MessageEvent) => {
  //     if (!event.origin.endsWith("facebook.com")) return;
  //     try {
  //       const data = JSON.parse(event.data);
  //       console.log("Received message from Facebook:", data);
  //       if (data.type === 'WA_EMBEDDED_SIGNUP') {
  //         // Handle the embedded signup event
  //         window.__waSession = data.data;
  //         console.log("Embedded signup session data:", window.__waSession);
  //       }
  //     } catch { }
  //   }
  //   window.addEventListener("message", handler);
  //   return () => window.removeEventListener("message", handler);
  // }, [])

  // function launchWhatsAppSignup() {
  //   window.FB.login((response: any) => {
  //     const handleResponse = async () => {
  //       if (response.authResponse) {
  //         const code = response.authResponse?.code;
  //         if (!code) {
  //           console.error("Authorization code nahi mila!");
  //           return;
  //         }
  //         console.log("Auth code mil gaya:", code);
  //         console.log("WhatsApp Session data:", window.__waSession);

  //         try {
  //           await embeddedSignup({ 
  //             code, 
  //             session: window.__waSession || response.authResponse 
  //           });
  //           console.log("Backend successfully trigger ho gaya!");
  //         } catch (err) {
  //           console.error("Backend API call fail ho gayi:", err);
  //         }

  //       }else {
  //         console.error("User cancelled login or did not fully authorize.");
  //       }
  //     }
  //     handleResponse();

  //   },
  //     {
  //       config_id: process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID,
  //       response_type: "code",
  //       override_default_response_type: true,
  //       extras: { sessionInfoVersion: '3' },
  //     }
  //   )
  // }

  return (
    <Screen>
      <a 
        href="/subscription" 
        className="absolute top-8 right-8 z-10 text-sm font-medium text-muted transition-colors hover:text-primary hover:underline"
      >
        View Plans
      </a>
      <div className="mt-10">
        <Wordmark size="lg" />
      </div>

      {/* Heading */}
      <div className="mt-16 text-center">
        <h2 className="text-[clamp(28px,8vw,36px)] font-semibold text-ink">
          Create your account
        </h2>
        <p className="mt-2 text-base text-muted">Sign up to continue</p>
      </div>

      {/* Buttons card */}
      <div className="shine-edges mt-8 flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
        {/* Continue with Google */}
        <button onClick={handleRediarct} className="shine-edges flex h-14 w-full items-center justify-center gap-3 rounded-full bg-white text-base font-semibold text-[#1A1A1A] shadow-glow-white transition-transform active:scale-[0.98]">

          <GoogleIcon />
          Continue with Google
        </button>

        {/* Continue with WhatsApp */}
        {/* <button
          onClick={launchWhatsAppSignup}
          disabled
          className="shine-edges flex h-14 w-full items-center justify-center gap-3 rounded-full bg-whatsapp text-base font-semibold text-white shadow-glow-green transition-transform active:scale-[0.98]">
          <WhatsAppIcon />
          Continue with WhatsApp
        </button> */}

        {/* Continue with Hotmail */}
        <button className="shine-edges flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#0072C6] text-base font-semibold text-white shadow-glow-blue transition-transform active:scale-[0.98]">
          <HotmailIcon />
          Continue with Hotmail
        </button>


        {/* Bottom link — mt-auto se neeche chala jaata hai */}
        <p className="mt-10 pb-4 text-center text-[15px] text-muted">
          Already have an account?{" "}
          <a
            href="/signin"
            className="font-semibold text-primary underline [text-shadow:0_0_24px_rgba(124,92,252,0.55)]"
          >
            Sign in
          </a>
        </p>
      </div>
    </Screen>
  )
}

export default SignUp;

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// function WhatsAppIcon() {
//   return (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
//       <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.9 7.9 0 0 0-6.86 11.85L4 20l4.25-1.11a7.9 7.9 0 0 0 3.78.96h.01A7.9 7.9 0 0 0 17.6 6.32zM12.05 18.5a6.56 6.56 0 0 1-3.34-.92l-.24-.14-2.48.65.66-2.42-.16-.25a6.56 6.56 0 1 1 5.56 3.08zm3.6-4.92c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.51.64-.62.77-.11.13-.23.15-.43.05a5.4 5.4 0 0 1-2.69-2.35c-.2-.35.2-.32.58-1.08.06-.13.03-.24-.02-.34-.05-.1-.44-1.07-.6-1.46-.16-.38-.32-.33-.44-.34h-.38c-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63s.7 1.89.8 2.02c.1.13 1.38 2.11 3.35 2.96.47.2.83.32 1.11.41.47.15.9.13 1.23.08.38-.06 1.17-.48 1.33-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23z" />
//     </svg>
//   );
// }
function HotmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path 
        d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
}