import Provider from "./provider";
import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "@/libs/socket-context";

import "./globals.css";
import { Suspense } from "react";

export const metadata = {
  title: "Camera Image",
  description: "Camera Image",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SocketProvider>
          <Provider>
            <Suspense>
              <Toaster />
              {children}
            </Suspense>
          </Provider>
        </SocketProvider>
      </body>
    </html>
  );
}
