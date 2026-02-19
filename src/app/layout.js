import UserMenu from "@/components/Auth/UserMenu";
import "./globals.css";

export const metadata = {
    title: "Csupaszív Csapat",
    description: "A Choose Your Own Path Adventure",
};

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
            <body className="antialiased bg-gray-900 text-gray-100">
                <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 p-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Csupaszív Csapat
                        </h1>
                        <UserMenu />
                    </div>
                </header>
                <main className="pt-16 min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
