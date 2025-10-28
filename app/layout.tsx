import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import QueryProvider from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HealthCoach - Track Your Nutrition",
  description: "AI-powered food logging and nutrition tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
        
        {/* Wallavi Chat Widget */}
        <Script
          id="wallavi-chat"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (!window.wallavi || window.wallavi("getState") !== "initialized") {
                  window.wallavi = (...arguments) => {
                    if (!window.wallavi.q) {
                      window.wallavi.q = []
                    }
                    window.wallavi.q.push(arguments)
                  };
                  window.wallavi = new Proxy(window.wallavi, {
                    get(target, prop) {
                      if (prop === "q") {
                        return target.q
                      }
                      return (...args) => target(prop, ...args)
                    }
                  })
                }
                const onLoad = async function () {
                  const script = document.createElement("script");
                  script.src = "https://app.wallavi.com/embed.min.js";
                  script.id = "94a69f41-fcd1-42f8-86bf-9a882cd904cb";
                  script.domain = "app.wallavi.com";
                  
                  // Setup auth after Wallavi loads
                  script.onload = async function() {
                    try {
                      // Import Amplify auth dynamically
                      const { fetchAuthSession } = await import('@aws-amplify/auth');
                      const session = await fetchAuthSession();
                      const token = session.tokens?.idToken?.toString();
                      
                      if (token && window.wallavi) {
                        window.wallavi.identify({
                          user_metadata: {
                            _authorizations_HealthCoachAPI: {
                              type: "bearer",
                              in: "header",
                              name: "Authorization",
                              isActive: true,
                              value: "Bearer " + token
                            }
                          }
                        });
                        console.log("✅ Wallavi authenticated with Cognito token");
                      }
                    } catch (error) {
                      console.error("⚠️ Wallavi auth error:", error);
                    }
                  };
                  
                  document.body.appendChild(script);
                };
                if (document.readyState === "complete") {
                  onLoad()
                } else {
                  window.addEventListener("load", onLoad)
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
