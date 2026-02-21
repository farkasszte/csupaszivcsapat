'use client';

import { RiBookLine, RiExternalLinkLine } from '@remixicon/react';

const LINKS = [
    {
        label: 'Európai szalakóta',
        desc: 'Coracias garrulus',
        url: 'https://hu.wikipedia.org/wiki/Eur%C3%B3pai_szalak%C3%B3ta',
    },
    {
        label: 'Ürge',
        desc: 'Spermophilus citellus',
        url: 'https://hu.wikipedia.org/wiki/%C3%9Crge',
    },
    {
        label: 'Túzok',
        desc: 'Otis tarda',
        url: 'https://hu.wikipedia.org/wiki/T%C3%BAzok',
    },
];

export default function GameLibrary() {
    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase tracking-widest px-1 mb-1">
                <RiBookLine size={12} />
                Enciklopédia
            </div>

            {LINKS.map((link) => (
                <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/20 hover:border-zinc-600/40 rounded-xl transition-all group"
                >
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">
                            {link.label}
                        </div>
                        <div className="text-xs text-zinc-600 mt-0.5 italic">
                            {link.desc}
                        </div>
                    </div>
                    <RiExternalLinkLine
                        size={14}
                        className="shrink-0 text-zinc-600 group-hover:text-amber-400 transition-colors"
                    />
                </a>
            ))}
        </div>
    );
}
