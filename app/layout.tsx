import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { WMSUserProvider } from "@/shared/context/WMSUserContext";

export const metadata: Metadata = {
  title: "FR3SH WMS — Warehouse Management System",
  description: "FR3SH internal warehouse & godown management platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WMSUserProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#333",
                border: "1px solid #e0e0e0",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
              error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
            }}
          />
        </WMSUserProvider>
      </body>
    </html>
  );
}
