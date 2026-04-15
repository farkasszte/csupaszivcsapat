'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { RiBookLine, RiExternalLinkLine, RiUser3Line, RiMapPin2Line, RiQuestionMark, RiArrowDownSLine, RiSearchLine, RiCloseLine, RiPlayCircleLine } from '@remixicon/react';
import { getColorFilterStyle } from './StoryEngine';
import locationsData from '../data/locations.json';

export default function GameLibrary() {
    const { project, discoveredComponents, colorFilter, getAssetUrl, setShowMap, setSelectedMapLocation } = useGame();
    const [csvCategories, setCsvCategories] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

    const toggleItem = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        Promise.all([
            fetch('/gerinces_allatok.csv').then(res => res.text()),
            fetch('/telepulesek.csv').then(res => res.text()),
            fetch('/termeszetvedelmi_teruletek.csv').then(res => res.text()),
            fetch('/tanosvenyek.csv').then(res => res.text())
        ])
            .then(([allatokText, telepulesekText, teruletekText, tanosvenyekText]) => {
                const allatokLines = allatokText.split('\n').filter(line => line.trim() !== '');
                const allatokData = allatokLines.slice(1).map(line => {
                    const [kategoria, nev, latinNev, vedett, statusz, ertek, link] = line.split(',');
                    return {
                        kategoria: kategoria?.trim(),
                        nev: nev?.trim(),
                        latinNev: latinNev?.trim(),
                        vedett: vedett?.trim(),
                        statusz: statusz?.trim(),
                        ertekString: (ertek?.trim() && ertek?.trim() !== '0') ? `Eszmei érték: ${parseInt(ertek.trim()).toLocaleString('hu-HU')} Ft` : null,
                        link: link?.trim(),
                        isTelepules: false,
                        isTerulet: false,
                        isTanosveny: false
                    };
                }).filter(item => item.kategoria && item.nev && item.kategoria !== 'Kategória');

                const telepusLines = telepulesekText.split('\n').filter(line => line.trim() !== '');
                const telepulesekData = telepusLines.slice(1).map(line => {
                    const [telepules, varmegye, rang, lakossag, link] = line.split(',');
                    return {
                        kategoria: 'Települések',
                        nev: telepules?.trim(),
                        latinNev: varmegye?.trim() ? `${varmegye.trim()} vármegye` : null,
                        vedett: rang?.trim(), // Reuse field for "Rang"
                        statusz: null,
                        ertekString: lakossag?.trim() ? `Lakosság: ${parseInt(lakossag.trim()).toLocaleString('hu-HU')} fő` : null,
                        link: link?.trim(),
                        isTelepules: true,
                        isTerulet: false,
                        isTanosveny: false
                    };
                }).filter(item => item.nev && item.nev !== 'Település');

                const teruletekLines = teruletekText.split('\n').filter(line => line.trim() !== '');
                const teruletekData = teruletekLines.slice(1).map(line => {
                    const [besorolas, nev, terulet, link] = line.split(',');
                    return {
                        kategoria: 'Természetvédelmi területek',
                        nev: nev?.trim(),
                        latinNev: null,
                        vedett: besorolas?.trim(),
                        statusz: null,
                        ertekString: terulet?.trim() ? `Terület: ${parseInt(terulet.trim()).toLocaleString('hu-HU')} hektár` : null,
                        link: link?.trim(),
                        isTelepules: false,
                        isTerulet: true,
                        isTanosveny: false
                    };
                }).filter(item => item.nev && item.nev !== 'Terület neve');

                const tanosvenyekLines = tanosvenyekText.split('\n').filter(line => line.trim() !== '');
                const tanosvenyekData = tanosvenyekLines.slice(1).map(line => {
                    const [nev, telepules, hossz, link] = line.split(',');
                    return {
                        kategoria: 'Tanösvények',
                        nev: nev?.trim(),
                        latinNev: telepules?.trim(), // Show település info here
                        vedett: null,
                        statusz: null,
                        ertekString: hossz?.trim() ? `Hossz: ${hossz.trim()} km` : null,
                        link: link?.trim(),
                        isTelepules: false,
                        isTerulet: false,
                        isTanosveny: true
                    };
                }).filter(item => item.nev && item.nev !== 'Tanösvény neve');

                const allData = [...allatokData, ...telepulesekData, ...teruletekData, ...tanosvenyekData];

                const grouped = allData.reduce((acc, curr) => {
                    if (!acc[curr.kategoria]) {
                        acc[curr.kategoria] = [];
                    }
                    acc[curr.kategoria].push(curr);
                    return acc;
                }, {});

                setCsvCategories(grouped);
            })
            .catch(err => console.error("Error fetching recommended readings:", err));
    }, []);

    const toggleCategory = (category) => {
        setExpandedCategories(prev => {
            const isExpanding = !prev[category];
            if (isExpanding) {
                setTimeout(() => {
                    const el = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
            return {
                ...prev,
                [category]: isExpanding
            };
        });
    };

    const discoveredComponentsData = discoveredComponents
        ? [...new Set(discoveredComponents)].map(id => ({ ...project.components[id], id })).filter(c => c.name)
        : [];

    const components = [
        ...discoveredComponentsData,
        ...locationsData.map(loc => ({
            id: loc.id,
            name: loc.name,
            _isStaticLocation: true,
            description: loc.description
        }))
    ];
    const filterStyle = getColorFilterStyle(colorFilter);

    // Szűrési logika
    const filteredCategories = Object.entries(csvCategories).reduce((acc, [category, items]) => {
        if (!searchQuery.trim()) {
            acc[category] = items;
            return acc;
        }

        const query = searchQuery.toLowerCase();
        const filteredItems = items.filter(item => {
            const matchNev = item.nev?.toLowerCase().includes(query);
            const matchLatinNev = item.latinNev?.toLowerCase().includes(query);
            const matchVedett = item.vedett?.toLowerCase().includes(query);
            return matchNev || matchLatinNev || matchVedett;
        });

        if (filteredItems.length > 0) {
            acc[category] = filteredItems;
        }
        return acc;
    }, {});

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* 1. DISCOVERED ENTRIES SECTION */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[#4F7942] font-bold uppercase tracking-widest px-1">
                    Helyszínek ({components.length})
                </div>

                {components.length === 0 ? (
                    <div className="bg-zinc-800/20 border border-white/5 rounded-xl p-6 text-center">
                        <RiQuestionMark size={24} className="text-white mx-auto mb-2" />
                        <div className="text-xs text-white italic">Még nincsenek felfedezett helyszínek.</div>
                    </div>
                ) : (
                    <div className="grid gap-2.5">
                        {components.map((comp) => {
                            const coverUrl = comp.assets?.cover?.id ? getAssetUrl(comp.assets.cover.id) : null;
                            const isCharacter = comp.name.toLowerCase().includes('crusader') || comp.name.toLowerCase().includes('uncle');

                            const descriptionAttr = Object.values(project.attributes).find(
                                attr => attr.cId === comp.id && (attr.name.toLowerCase() === 'description' || attr.name.toLowerCase() === 'info')
                            );

                            const videoAttr = Object.values(project.attributes).find(
                                attr => attr.cId === comp.id && (attr.name.toLowerCase() === 'videourl' || attr.name.toLowerCase() === 'video')
                            );
                            let videoUrl = null;
                            if (videoAttr) {
                                videoUrl = videoAttr.value?.data ? videoAttr.value.data.replace(/<[^>]*>?/gm, '').trim() : null;
                            }

                            return (
                                <div
                                    key={comp.id}
                                    onClick={() => {
                                        if (videoUrl) setActiveVideoUrl(videoUrl);
                                        toggleItem(comp.id);
                                    }}
                                    className={`group bg-zinc-800/30 hover:bg-zinc-800/50 border border-white/5 hover:border-amber-600/20 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer`}
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
                                            ) : videoUrl ? (
                                                <RiPlayCircleLine size={24} className="text-white group-hover:text-white transition-colors opacity-80" />
                                            ) : isCharacter ? (
                                                <RiUser3Line size={18} className="text-white" />
                                            ) : (
                                                <div 
                                                    className={`w-full h-full flex items-center justify-center transition-colors ${comp.position ? 'hover:bg-zinc-800 cursor-pointer' : ''}`}
                                                    onClick={(e) => {
                                                        if (comp.position) {
                                                            e.stopPropagation();
                                                            setSelectedMapLocation({ lat: comp.position[0], lng: comp.position[1], id: comp.id });
                                                            setShowMap(true);
                                                        }
                                                    }}
                                                    title={comp.position ? "Mutasd a térképen" : ""}
                                                >
                                                    <RiMapPin2Line size={18} className="text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-xs font-bold text-white group-hover:text-white transition-colors truncate">
                                                {comp.name}
                                            </h4>
                                            {(comp._isStaticLocation ? comp.description : descriptionAttr?.value?.data) && (
                                                <div
                                                    className={`text-[10px] text-white mt-0.5 leading-relaxed transition-all duration-300 ${expandedItems[comp.id] ? '' : 'line-clamp-1'}`}
                                                    dangerouslySetInnerHTML={{ __html: comp._isStaticLocation ? comp.description : descriptionAttr.value.data }}
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
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#4F7942] font-bold uppercase tracking-widest">
                        <RiBookLine size={10} />
                        Homokhátsági természeti enciklopédia
                    </div>
                </div>

                {/* Keresőmező */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <RiSearchLine size={16} className="text-white" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Keresés faj, település, kategória alapján"
                        className="w-full bg-zinc-800/40 border border-zinc-700/50 hover:border-amber-600/30 focus:border-white/40 rounded-xl py-2.5 pl-9 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all text-ellipsis"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white hover:text-white transition-colors"
                        >
                            <RiCloseLine size={16} />
                        </button>
                    )}
                </div>

                <div className="grid gap-2">
                    {Object.keys(filteredCategories).length === 0 ? (
                        <div className="text-xs text-white italic text-center py-4">Nincs találat a keresésre.</div>
                    ) : (
                        Object.entries(filteredCategories).map(([category, items]) => {
                            const isExpanded = searchQuery.trim() !== '' || expandedCategories[category];
                            return (
                                <div key={category} id={`category-${category.replace(/\s+/g, '-')}`} className="flex flex-col gap-1">
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/20 rounded-xl transition-all group"
                                    >
                                        <span className="text-xs font-semibold text-white group-hover:text-white transition-colors">
                                            {category} ({items.length})
                                        </span>
                                        <RiArrowDownSLine
                                            size={16}
                                            className={`text-white group-hover:text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {isExpanded && (
                                        <div className="grid gap-1 pl-4 pr-1 py-1 mt-1 border-l-2 border-zinc-800/50 ml-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {items.map((link, idx) => (
                                                <a
                                                    key={`${category}-${idx}`}
                                                    href={link.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 px-4 py-2 bg-zinc-800/20 hover:bg-zinc-800/50 rounded-lg transition-all group border border-transparent hover:border-zinc-700/50"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-semibold text-white group-hover:text-white transition-colors leading-tight flex items-center gap-2">
                                                            {link.nev}
                                                            {link.isTelepules && link.vedett && (
                                                                <span className="px-1.5 py-0.5 rounded-sm bg-blue-900/40 text-blue-400 text-[9px] uppercase tracking-wider border border-blue-800/30">
                                                                    {link.vedett}
                                                                </span>
                                                            )}
                                                            {link.isTerulet && link.vedett && (
                                                                <span className="px-1.5 py-0.5 rounded-sm bg-teal-900/40 text-teal-400 text-[9px] uppercase tracking-wider border border-teal-800/30">
                                                                    {link.vedett}
                                                                </span>
                                                            )}
                                                            {!link.isTelepules && !link.isTerulet && !link.isTanosveny && (link.vedett === 'Védett' || link.vedett === 'Fokozottan védett' || link.vedett === 'Igen') && (
                                                                <span className="px-1.5 py-0.5 rounded-sm bg-emerald-900/40 text-white text-[9px] uppercase tracking-wider border border-emerald-800/30">
                                                                    {link.vedett === 'Igen' ? 'Védett' : link.vedett}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {link.latinNev && (
                                                            <div className="text-[10px] text-white mt-0.5 italic leading-tight">
                                                                {link.latinNev}
                                                            </div>
                                                        )}
                                                        <div className="text-[10px] text-white mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                                                            {!link.isTelepules && !link.isTerulet && !link.isTanosveny && link.statusz && link.statusz !== 'Nem fenyegetett' && (
                                                                <span className="text-white flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-red-500/50"></div>
                                                                    {link.statusz}
                                                                </span>
                                                            )}
                                                            {link.ertekString && (
                                                                <span className="text-white flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>
                                                                    {link.ertekString}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <RiExternalLinkLine
                                                        size={12}
                                                        className="shrink-0 text-white group-hover:text-white transition-colors"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* VIDEO PLAYER OVERLAY */}
            {activeVideoUrl && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <button
                        onClick={() => setActiveVideoUrl(null)}
                        className="fixed top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-zinc-800/50 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors z-110 border border-white/10"
                    >
                        <RiCloseLine size={24} />
                    </button>

                    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                        <video
                            src={activeVideoUrl}
                            autoPlay
                            controls
                            playsInline
                            className="bg-black object-contain origin-center transition-transform duration-500 shadow-2xl landscape:w-full landscape:h-full portrait:w-[100vh] portrait:h-[100vw] portrait:max-w-none portrait:rotate-90 sm:portrait:w-full sm:portrait:h-full sm:portrait:rotate-0"
                            onEnded={() => setActiveVideoUrl(null)}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
