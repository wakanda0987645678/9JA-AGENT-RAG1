
import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "NOUN AI ASST.",
  description: "Your intelligent academic companion for research, learning, and problem-solving.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        
        <main>
          {children}
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
