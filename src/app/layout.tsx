"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <html lang="en" className="w-full h-full">
      <body
        className={`min-h-screen w-full m-0 p-0 ${
          isHomePage
            ? "bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900"
            : "bg-black"
        }`}
      >
        <UserProvider>
          {isHomePage ? (
            <div className="min-h-screen w-full relative overflow-hidden">
              {/* Animated wave background */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-30">
                  {/* Wave effects remain the same */}
                </div>
              </div>
              {/* Content */}
              <div className="relative z-10 w-full">{children}</div>
            </div>
          ) : (
            <SidebarProvider>
              <div className="flex min-h-screen bg-black">
                <Sidebar className="fixed left-0 top-0 h-screen bg-black/80 backdrop-blur-md text-white z-[9999] shadow-xl" />
                <main className="flex-1 transition-all duration-300 ease-in-out bg-black">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          )}
        </UserProvider>
      </body>
    </html>
  );
}
