'use client'

import { useRouter } from 'next/navigation'
import ProfileView from '@/components/ProfileView'

export default function ProfilePage() {
    const router = useRouter()

    return (
        <div
            className="relative min-h-screen bg-[#1a331c] text-white p-4 pb-12 flex items-center justify-center cursor-pointer"
            onClick={() => router.back()}
        >
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div
                className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden cursor-default text-zinc-950"
                onClick={e => e.stopPropagation()}
            >
                <ProfileView />
            </div>
        </div>
    )
}
