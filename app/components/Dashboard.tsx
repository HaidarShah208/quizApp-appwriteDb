'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const sidebarOptions = [
  { label: 'Tournaments', path: '/' },
  { label: 'Fun quiz list' },
  { label: 'Trivia Fun Quiz' },
  { label: 'Personality Fun Quiz' },
  { label: 'Arbitrage quiz', path: '/arbitrageQuiz' },
  { label: 'Personality quiz' },
  { label: 'Prize quiz', path: '/prizeQuiz' },
];

function Sidebar({ activeIndex, handleOptionClick }: { activeIndex: number, handleOptionClick: (idx: number) => void }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col py-8 px-4 sticky left-0 top-0 h-auto z-10">
      <div className="text-2xl font-bold mb-8 text-red-600 flex items-center gap-2">
        <span>Sy!</span>
        <span className="text-black font-normal">Dashboard Testing</span>
      </div>
      <nav className="flex flex-col gap-2">
        {sidebarOptions.map((option, idx) => (
          <button
            key={option.label}
            className={`text-left px-6 py-3 rounded-full transition-all duration-300 font-medium text-base ${
              activeIndex === idx
                ? 'bg-[#DC3414] text-white shadow-md' 
                : 'text-gray-700 hover:bg-red-100'
            }`}
            onClick={() => handleOptionClick(idx)}
          >
            {option.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function getActiveIndexFromPath(pathname: string): number {
  const index = sidebarOptions.findIndex(option => option.path === pathname);
  return index !== -1 ? index : 0;
}

export default function Dashboard() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(getActiveIndexFromPath(pathname));
  const router = useRouter();
  
  useEffect(() => {
    const index = getActiveIndexFromPath(pathname);
    setActiveIndex(index);
  }, [pathname]);

  const handleOptionClick = (idx: number) => {
    setActiveIndex(idx);
    
    if (sidebarOptions[idx].path) {
      setTimeout(() => {
        router.push(sidebarOptions[idx].path || '/');
      }, 10);
    }
  };

  const isPrizeQuizPage = pathname === '/prizeQuiz';
  const isArbitrageQuizPage = pathname === '/arbitrageQuiz';
  
  if (isPrizeQuizPage || isArbitrageQuizPage) {
    return <Sidebar activeIndex={activeIndex} handleOptionClick={handleOptionClick} />;
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar activeIndex={activeIndex} handleOptionClick={handleOptionClick} />
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
            {activeIndex === 5 && (
              <h1 className="text-3xl bg-[#DC3414] font-bold p-4">Personality quiz</h1>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 