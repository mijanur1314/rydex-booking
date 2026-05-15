import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/initUser";
import Provider from "@/Provider";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "RYDEX - Smart Vehicle Booking Platform",
  description: "RYDEX ek modern multi-vendor vehicle booking platform hai jahan users aasaani se cars, bikes aur commercial vehicles book kar sakte hain. Secure login, verified owners aur transparent pricing ke saath RYDEX mobility ko simple aur reliable banata hai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-white w-full min-h-screen"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
<Provider>
        <StoreProvider>
          <InitUser/>
        {children}
        </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
