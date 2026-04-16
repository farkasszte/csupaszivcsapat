'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import {
    RiSeedlingLine,
    RiMapPin2Line,
    RiStarLine,
    RiPlayLine,
    RiArrowRightSLine
} from '@remixicon/react';

const STORY_BOARDS = [
    {
        id: 'a1d6536d-5104-440a-bfc1-c5189026a510',
        title: 'Kezdő próbálkozás',
        description: 'Egy rövid bevezető a Homokhátság világába.',
        icon: RiSeedlingLine,
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        id: '630fdb8a-48d6-473e-9974-2460f7eb2b41',
        title: '1. történet',
        description: 'A szomjas puszta segélykiáltása. Segíts a vadvilágnak megtalálni az éltető vizet.',
        icon: RiMapPin2Line,
        color: 'bg-amber-50 text-amber-600',
    },
    {
        id: '6a9aecfe-b7aa-46ba-8946-6a61882f883c',
        title: '2. történet',
        description: 'Újabb kihívások a dűnék között. Kutasd fel a rejtett forrásokat.',
        icon: RiStarLine,
        color: 'bg-blue-50 text-blue-600',
    },
    {
        id: 'f571e9b2-4ab3-42ee-8f86-5091ca1aa981',
        title: '3. történet',
        description: 'A kaland folytatódik. Tedd próbára tudásod a legnehezebb terepen.',
        icon: RiPlayLine,
        color: 'bg-rose-50 text-rose-600',
    }
];

export function StorySelection() {
    const { startStory } = useGame();

    return (
        <div className="fixed inset-0 z-100 bg-[#4F7942]/10 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-700">
            <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 lg:p-10 text-center bg-linear-to-b from-[#4F7942]/5 to-transparent border-b border-[#4F7942]/10">
                    <h2 className="text-3xl lg:text-4xl font-black text-[#4F7942] mb-3 tracking-tight">
                        Csupaszív kalandok
                    </h2>
                    <p className="text-[#4F7942]/70 font-medium">
                        Válaszd ki, melyik történettel szeretnél kezdeni!
                    </p>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        {STORY_BOARDS.map((story) => {
                            const Icon = story.icon;
                            return (
                                <button
                                    key={story.id}
                                    onClick={() => startStory(story.id)}
                                    className="group relative flex flex-col text-left p-6 rounded-2xl border border-transparent bg-white shadow-sm hover:shadow-xl hover:border-[#4F7942]/20 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                                >
                                    {/* Abstract background shape */}
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${story.color.split(' ')[0]}`} />

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`p-3 rounded-xl ${story.color} transition-transform duration-300 group-hover:scale-110`}>
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 group-hover:text-[#4F7942]">
                                            {story.title}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-zinc-600 leading-relaxed mb-6 flex-1">
                                        {story.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-bold text-[#4F7942] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                        <span>Kaland indítása</span>
                                        <RiArrowRightSLine size={18} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer info */}
                <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-center">
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
                        A Homokhátság Hősei • Interaktív Kalandjáték
                    </p>
                </div>
            </div>
        </div>
    );
}
