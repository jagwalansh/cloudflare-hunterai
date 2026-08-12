"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { PageHeader } from "./PageHeader";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/upload": "Upload Resume",
  "/recommendations": "Recommendations",
};

function resolveTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];

  const match = Object.keys(pageTitles).find(
    (k) => k !== "/" && pathname.startsWith(k)
  );

  return match ? pageTitles[match] : "";
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  if (isHome) {
    return <>{children}</>;
  }

  const title = resolveTitle(pathname);

  // MOBILE
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f6f3",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MobileHeader />

        {title && <PageHeader title={title} mobile />}

        <main
          style={{
            flex: 1,
            padding: "0 16px 48px",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    );
  }

  // DESKTOP
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f6f3",
        display: "flex",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {title && <PageHeader title={title} />}

        <main
          style={{
            flex: 1,
            padding: "32px 48px 64px",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
