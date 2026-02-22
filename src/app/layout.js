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
            <body className="antialiased bg-zinc-950 text-orange-50/90">
                <GameProvider>
                    <Header />
                    <main className="pb-16 lg:pb-0 lg:pt-16">
                        {children}
                    </main>
                </GameProvider>
            </body>
        </html>
    );
}
