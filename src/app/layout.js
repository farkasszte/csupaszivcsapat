import UserMenu from "@/components/Auth/UserMenu";
import { GameProvider } from '@/context/GameContext';
import "./globals.css";

export const metadata = {
    title: "Csupaszív Kaland",
    description: "Interaktív történetmesélő játék",
};

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
            <body className="antialiased bg-gray-900 text-gray-100">
                <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Csupaszív Kaland
                    </h1>
                    <UserMenu />
                </header>
                <GameProvider>
                    <main className="pt-16">
                        {children}
                    </main>
                </GameProvider>
            </body>
        </html>
    );
}
