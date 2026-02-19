
import "./globals.css";

export const metadata = {
    title: "Arcweave Adventure",
    description: "A Choose Your Own Path Adventure",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
