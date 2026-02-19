
import { GameProvider } from '@/context/GameContext';
import { StoryEngine } from '@/components/StoryEngine';

export default function Home() {
    return (
        <GameProvider>
            <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 bg-[url('/cover/cover.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
                <div className="absolute inset-0 bg-black/70 z-0"></div>
                <div className="relative z-10 w-full max-w-4xl">
                    <StoryEngine />
                </div>
            </div>
        </GameProvider>
    );
}
