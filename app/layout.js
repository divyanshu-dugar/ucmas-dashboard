import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "UCMAS Dashboard",
  description: "Parent & Instructor Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
