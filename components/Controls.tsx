import React, { useState } from 'react';
import { SUGGESTED_VERBS, Tense } from '../types';

interface ControlsProps {
  currentVerb: string;
  currentTense: Tense;
  onVerbChange: (v: string) => void;
  onTenseChange: (t: Tense) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  currentVerb,
  currentTense,
  onVerbChange,
  onTenseChange,
}) => {
  const [inputValue, setInputValue] = useState(currentVerb);

  const handleSubmitVerb = (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
          onVerbChange(inputValue.trim().toLowerCase());
      }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-4 z-20 relative">
      <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-6 border border-indigo-500/30 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Verb Selection */}
        <div className="flex flex-col w-full md:w-5/12">
          <label className="text-xs font-bold text-cyan-400 uppercase mb-2 tracking-wider flex items-center gap-2">
            <span>✨</span> Type any Action
          </label>
          <form onSubmit={handleSubmitVerb} className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              list="verb-suggestions"
              placeholder="e.g. danser, voler..."
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border-2 border-slate-600 focus:border-pink-500 focus:outline-none font-bold text-lg transition-colors shadow-inner"
            />
            <datalist id="verb-suggestions">
                {SUGGESTED_VERBS.map(v => <option key={v} value={v} />)}
            </datalist>
            <button 
                type="submit"
                className="absolute right-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg p-2 transition-colors"
            >
                ➜
            </button>
          </form>
        </div>

        {/* Tense Selection */}
        <div className="flex flex-col w-full md:w-7/12">
           <label className="text-xs font-bold text-cyan-400 uppercase mb-2 tracking-wider flex items-center gap-2">
                <span>⏳</span> Select Timeframe
           </label>
           <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-600 overflow-x-auto custom-scrollbar">
             {Object.values(Tense).map((tense) => (
               <button
                 key={tense}
                 onClick={() => onTenseChange(tense)}
                 className={`
                    flex-1 py-3 px-4 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300
                    ${currentTense === tense 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform scale-105' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'}
                 `}
               >
                 {tense}
               </button>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};