import Header from "@/components/Header";
import { GameProvider } from '@/context/GameContext';
import "./globals.css";

export const metadata = {
    title: "Csupaszív kalandok: A Homokhátság Hősei",
    description: "Interaktív történetmesélő játék",
};

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
            <body className="antialiased min-h-screen bg-fixed text-[#FDF5E6] bg-[radial-gradient(circle_at_center,#3e2723_0%,#2f3640_100%)]">
                <GameProvider>
                    <Header />
                    <main className="pb-16 lg:pb-0">
                        {children}
                    </main>
                </GameProvider>
            </body>
        </html>
    );
}
