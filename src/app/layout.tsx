"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import Sidebar from "@/components/Sidebar";
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
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
