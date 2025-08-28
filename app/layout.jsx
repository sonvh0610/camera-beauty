import Provider from "./provider";
import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "@/libs/socket-context";

import "./globals.css";

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
            <Toaster />
            {children}
          </Provider>
        </SocketProvider>
      </body>
    </html>
  );
}
