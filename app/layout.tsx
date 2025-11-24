import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import QueryProvider from "@/components/QueryProvider";
import WallaviAuth from "@/components/WallaviAuth";
import RealtimeProvider from "@/components/RealtimeProvider";

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
              <RealtimeProvider>
                {children}
              </RealtimeProvider>
              {/* Wallavi Auth - handles token authentication */}
              <WallaviAuth />
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
                const onLoad = function () {
                  const script = document.createElement("script");
                  script.src = "https://app.wallavi.com/embed.min.js";
                  script.id = "94a69f41-fcd1-42f8-86bf-9a882cd904cb";
                  script.domain = "app.wallavi.com";
                  document.body.appendChild(script)
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
