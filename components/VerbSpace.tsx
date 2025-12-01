import React, { useEffect, useState, useRef } from 'react';
import { VerbData, Pronoun } from '../types';
import { speakText } from '../services/geminiService';

interface VerbSpaceProps {
  data: VerbData | null;
  selectedPronounIndex: number;
  onPronounSelect: (index: number) => void;
  loading: boolean;
}

const PRONOUN_ORDER = [
  Pronoun.JE,
  Pronoun.TU,
  Pronoun.IL_ELLE,
  Pronoun.NOUS,
  Pronoun.VOUS,
  Pronoun.ILS_ELLES
];

export const VerbSpace: React.FC<VerbSpaceProps> = ({ data, selectedPronounIndex, onPronounSelect, loading }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // 6 sides in a hexagon = 60 degrees per slice
    setRotation(selectedPronounIndex * -60);
  }, [selectedPronounIndex]);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text);
  };

  const getConjugationForPronoun = (p: Pronoun) => {
    return data?.conjugations.find(c => c.pronoun === p);
  };

  // Determine geometry
  const radius = 320; 
  
  return (
    <div className="relative w-full h-[650px] flex flex-col items-center justify-start overflow-visible pt-10">
        
      {/* Central Interactive Core (The Sun) - Moved further up */}
      <div className="z-20 flex flex-col items-center justify-center h-[120px] mb-12">
         {loading ? (
             <div className="text-6xl animate-spin">⏳</div>
         ) : (
             <div className="text-center animate-bounce-slow">
                 <div className="text-8xl filter drop-shadow-[0_0_30px_rgba(255,255,0,0.5)] transform hover:scale-110 transition-transform duration-300 pointer-events-auto cursor-pointer"
                      title={data?.translation}
                      onClick={(e) => data && handleSpeak(e, data.verb)}
                 >
                    {data?.emoji}
                 </div>
                 <h2 className="text-3xl font-extrabold text-white mt-4 drop-shadow-md tracking-wider">
                    {data?.verb.toUpperCase()}
                 </h2>
                 <span className="text-cyan-300 text-sm font-bold uppercase bg-slate-800/50 px-3 py-1 rounded-full border border-cyan-500/30">
                    {data?.translation}
                 </span>
             </div>
         )}
      </div>

      {/* 3D Carousel Container */}
      <div className="relative w-full flex-1 flex items-start justify-center perspective-1000 mt-10">
        <div 
          className="relative w-[300px] h-[200px] transform-style-3d transition-transform duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          style={{ transform: `rotateX(-10deg) rotateY(${rotation}deg)` }}
        >
          {!loading && PRONOUN_ORDER.map((pronoun, index) => {
            const conj = getConjugationForPronoun(pronoun);
            const isActive = index === selectedPronounIndex;
            
            return (
              <div
                key={pronoun}
                onClick={() => onPronounSelect(index)}
                className={`
                  absolute top-0 left-0 w-full h-[280px]
                  rounded-3xl backdrop-blur-xl backface-hidden
                  flex flex-col items-center justify-center
                  cursor-pointer transition-all duration-300 border-2
                  ${isActive 
                    ? 'border-yellow-400 bg-indigo-900/90 shadow-[0_0_50px_rgba(250,204,21,0.3)] scale-105 z-50' 
                    : 'border-white/10 bg-slate-800/60 opacity-60 hover:opacity-100 hover:border-cyan-400/50'}
                `}
                style={{
                  transform: `rotateY(${index * 60}deg) translateZ(${radius}px)`
                }}
              >
                <div className="text-center p-4 w-full">
                  <div className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 ${isActive ? 'text-yellow-300 border-yellow-300/30' : 'text-gray-400 border-gray-600'}`}>
                    {pronoun}
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    {conj ? (
                        <>
                            <div className="text-2xl font-extrabold text-white break-words w-full px-2">
                                <span className="text-cyan-300">{conj.conjugation}</span>
                            </div>
                            
                            {conj.pronunciationKey && (
                                <p className="text-xs text-slate-400 font-mono italic">/{conj.pronunciationKey}/</p>
                            )}

                            {isActive && (
                                <button 
                                    onClick={(e) => handleSpeak(e, `${pronoun} ${conj.conjugation}`)}
                                    className="mt-6 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full p-3 transition-all shadow-lg hover:scale-110 active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                </button>
                            )}
                        </>
                    ) : '...'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Floor Orbit effect */}
        <div className="absolute top-[30%] w-[600px] h-[600px] border border-white/5 rounded-full transform -rotate-x-90 pointer-events-none" />
        <div className="absolute top-[30%] w-[400px] h-[400px] border border-cyan-500/10 rounded-full transform -rotate-x-90 pointer-events-none" />

      </div>
    </div>
  );
};