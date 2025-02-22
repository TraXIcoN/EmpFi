"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <UserProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 transition-all duration-300 ease-in-out">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
