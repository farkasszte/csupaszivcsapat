'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserMenu() {
    const [user, setUser] = useState(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
                Belépés
            </Link>
        )
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Link
                    href="/profile"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                    Profilom
                </Link>
                <span className="text-xs text-gray-500 hidden md:inline">
                    ({user.email})
                </span>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-700 hover:bg-red-900/40 hover:text-red-400 text-white rounded-lg transition-all text-sm font-medium border border-gray-600 hover:border-red-800"
                >
                    Kilépés
                </button>
            </div>
        </div>
    )
}
