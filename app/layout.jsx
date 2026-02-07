import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata = {
    title: "Octalve Suite",
    description: "Streamline project delivery from creation to completion",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
