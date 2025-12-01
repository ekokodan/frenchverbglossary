import React, { useState, useEffect } from 'react';
import { Tense, SUGGESTED_VERBS, VerbData } from './types';
import { fetchVerbConjugation, speakText } from './services/geminiService';
import { VerbSpace } from './components/VerbSpace';
import { Controls } from './components/Controls';
import { QuizMode } from './components/QuizMode';
import { StoryMode } from './components/StoryMode';

const App: React.FC = () => {
  const [currentVerb, setCurrentVerb] = useState<string>(SUGGESTED_VERBS[0]);
  const [currentTense, setCurrentTense] = useState<Tense>(Tense.PRESENT);
  const [verbData, setVerbData] = useState<VerbData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pronounIndex, setPronounIndex] = useState<number>(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      const data = await fetchVerbConjugation(currentVerb, currentTense);
      if (isMounted) {
        setVerbData(data);
        setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentVerb, currentTense]);

  const handleNextPronoun = () => {
    setPronounIndex((prev) => (prev + 1) % 6);
  };

  const handlePrevPronoun = () => {
    setPronounIndex((prev) => (prev - 1 + 6) % 6);
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden">
      {/* Background stars handled by CSS in index.html, adding some overlay here */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/80 via-indigo-900/50 to-slate-900/80 pointer-events-none z-0" />
      
      {/* Header */}
      <header className="w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-center z-20 gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse-slow">
                🌌
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300">
                    French Verb Galaxy
                </h1>
                <p className="text-xs text-indigo-300 tracking-widest uppercase">Interactive Learning Console</p>
            </div>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => setStoryOpen(true)}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-white shadow-lg transition-transform transform hover:scale-105 active:scale-95 overflow-hidden ring-2 ring-emerald-400/30"
            >
                <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
                    <span>🎨</span> Story Mode
                </span>
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
            </button>

            <button 
                onClick={() => setQuizOpen(true)}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-bold text-white shadow-lg transition-transform transform hover:scale-105 active:scale-95 overflow-hidden ring-2 ring-pink-400/30"
            >
                <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
                    <span>🎮</span> Quiz Mode
                </span>
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl flex flex-col items-center justify-start relative z-10">
        
        {/* The 3D Stage */}
        <VerbSpace 
            data={verbData} 
            loading={loading}
            selectedPronounIndex={pronounIndex}
            onPronounSelect={setPronounIndex}
        />

        {/* Example Sentence Bar - Positioned in flow below the 3D space */}
        <div className="w-full max-w-3xl px-4 mt-8 mb-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden group pointer-events-auto hover:bg-black/60 transition-colors">
                 {/* Decorative glow */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70" />
                 
                 <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/> Incoming Transmission
                 </h3>
                 {loading ? (
                    <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse mx-auto" />
                 ) : (
                    <p className="text-xl md:text-3xl text-white font-medium italic cursor-pointer hover:text-cyan-300 transition-colors drop-shadow-lg"
                       onClick={() => verbData && speakText(verbData.exampleSentence)}
                    >
                        "{verbData?.exampleSentence}" 🔊
                    </p>
                 )}
            </div>
        </div>

        {/* Navigation Arrows for Mobile */}
        <div className="flex md:hidden gap-12 mt-4 z-20">
            <button onClick={handlePrevPronoun} className="bg-white/10 border border-white/20 text-white p-4 rounded-full backdrop-blur active:bg-white/20 shadow-lg">
                ←
            </button>
            <button onClick={handleNextPronoun} className="bg-white/10 border border-white/20 text-white p-4 rounded-full backdrop-blur active:bg-white/20 shadow-lg">
                →
            </button>
        </div>

      </main>

      {/* Footer Controls */}
      <footer className="w-full z-20 pb-4 md:pb-8 pt-4">
        <Controls 
            currentVerb={currentVerb}
            currentTense={currentTense}
            onVerbChange={setCurrentVerb}
            onTenseChange={setCurrentTense}
        />
      </footer>

      {/* Modals */}
      {quizOpen && (
          <QuizMode 
            verb={currentVerb} 
            tense={currentTense} 
            onClose={() => setQuizOpen(false)} 
          />
      )}

      {storyOpen && (
          <StoryMode 
            verb={currentVerb} 
            onClose={() => setStoryOpen(false)} 
          />
      )}

    </div>
  );
};

export default App;