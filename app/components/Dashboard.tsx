'use client';
import React, { useState } from 'react';
import ArbitrageQuiz from './arbitrageQuiz/ArbitrageQuiz';

const sidebarOptions = [
  { label: 'Tournaments' },
  { label: 'Fun quiz list' },
  { label: 'Trivia Fun Quiz' },
  { label: 'Personality Fun Quiz' },
  { label: 'Arbitrage quiz' },
  { label: 'Personality quiz' },
];

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex min-h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col py-8 px-4 sticky left-0 top-0 h-auto z-10">
        <div className="text-2xl font-bold mb-8 text-red-600 flex items-center gap-2">
          <span>Sy!</span>
          <span className="text-black font-normal">Dashboard Testing</span>
        </div>
        <nav className="flex flex-col gap-2">
          {sidebarOptions.map((option, idx) => (
            <button
              key={option.label}
              className={`text-left px-6 py-3 rounded-full transition-all font-medium text-base ${
                activeIndex === idx
                  ? 'bg-[#DC3414] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-red-100'
              }`}
              onClick={() => setActiveIndex(idx)}
            >
              {option.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-x-auto">
        <div className="min-h-screen p-8">
          <div className="w-full min-w-fit bg-white rounded-lg shadow">
            {activeIndex === 0 && (
              <h1 className="text-3xl bg-[#DC3414] font-bold p-4">Tournaments</h1>
            )}
            {activeIndex === 1 && (
              <h1 className="text-3xl bg-[#DC3414] font-bold p-4">Fun quiz list</h1>
            )}
            {activeIndex === 2 && (
              <h1 className="text-3xl bg-[#DC3414] font-bold p-4">Trivia Fun Quiz</h1>
            )}
            {activeIndex === 3 && (
              <h1 className="text-3xl bg-[#DC3414] font-bold p-4">Personality Fun Quiz</h1>
            )}
            {activeIndex === 4 && <ArbitrageQuiz />}
            {activeIndex === 5 && (
              <h1 className="text-3xl bg-[#DC3414] font-bold p-4">Personality quiz</h1>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 