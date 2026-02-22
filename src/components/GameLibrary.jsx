'use client';

import { useGame } from '../context/GameContext';
import { RiBookLine, RiExternalLinkLine, RiUser3Line, RiMapPin2Line, RiQuestionMark } from '@remixicon/react';
import { getColorFilterStyle } from './StoryEngine';

const EXTERNAL_LINKS = [
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
    const { project, discoveredComponents, colorFilter, getAssetUrl } = useGame();
    const components = discoveredComponents
        ? [...new Set(discoveredComponents)].map(id => ({ ...project.components[id], id })).filter(c => c.name)
        : [];
    const filterStyle = getColorFilterStyle(colorFilter);

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* 1. DISCOVERED ENTRIES SECTION */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest px-1">
                    Felfedezett bejegyzések ({components.length})
                </div>

                {components.length === 0 ? (
                    <div className="bg-zinc-800/20 border border-white/5 rounded-xl p-6 text-center">
                        <RiQuestionMark size={24} className="text-zinc-700 mx-auto mb-2" />
                        <div className="text-xs text-zinc-600 italic">Még nincs felfedezett bejegyzés.</div>
                    </div>
                ) : (
                    <div className="grid gap-2.5">
                        {components.map((comp) => {
                            const coverUrl = comp.assets?.cover?.id ? getAssetUrl(comp.assets.cover.id) : null;
                            const isCharacter = comp.name.toLowerCase().includes('crusader') || comp.name.toLowerCase().includes('uncle');

                            const descriptionAttr = Object.values(project.attributes).find(
                                attr => attr.cId === comp.id && (attr.name.toLowerCase() === 'description' || attr.name.toLowerCase() === 'info')
                            );

                            return (
                                <div
                                    key={comp.id}
                                    className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-white/5 hover:border-amber-600/20 rounded-xl overflow-hidden transition-all duration-300"
                                >
                                    <div className="flex gap-3 p-2.5">
                                        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center relative">
                                            {coverUrl ? (
                                                <img
                                                    src={coverUrl}
                                                    alt={comp.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    style={{ filter: filterStyle }}
                                                />
                                            ) : (
                                                isCharacter ? <RiUser3Line size={18} className="text-zinc-700" /> : <RiMapPin2Line size={18} className="text-zinc-700" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-xs font-bold text-amber-100 group-hover:text-amber-50 transition-colors truncate">
                                                {comp.name}
                                            </h4>
                                            {descriptionAttr && (
                                                <div
                                                    className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: descriptionAttr.value.data }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 2. EXTERNAL LINKS SECTION */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest px-1">
                    <RiBookLine size={10} />
                    Ajánlott olvasmányok
                </div>

                <div className="grid gap-2">
                    {EXTERNAL_LINKS.map((link) => (
                        <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/20 hover:border-zinc-600/40 rounded-xl transition-all group"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">
                                    {link.label}
                                </div>
                                <div className="text-[10px] text-zinc-600 mt-0.5 italic">
                                    {link.desc}
                                </div>
                            </div>
                            <RiExternalLinkLine
                                size={12}
                                className="shrink-0 text-zinc-600 group-hover:text-amber-400 transition-colors"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

