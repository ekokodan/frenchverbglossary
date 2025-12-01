import React, { useState } from 'react';
import { generateStoryScenario, generateIllustration, validateStoryAnswer, speakText } from '../services/geminiService';

interface StoryModeProps {
  verb: string;
  onClose: () => void;
}

const THEMES = [
  { id: 'fantasy', label: 'Fantasy', icon: '🏰', color: 'from-purple-500 to-indigo-600' },
  { id: 'scifi', label: 'Sci-Fi', icon: '🚀', color: 'from-blue-500 to-cyan-500' },
  { id: 'animals', label: 'Animals', icon: '🦁', color: 'from-orange-500 to-amber-500' },
  { id: 'superhero', label: 'Heroes', icon: '🦸', color: 'from-red-500 to-rose-600' },
  { id: 'sports', label: 'Sports', icon: '⚽', color: 'from-emerald-500 to-green-600' },
  { id: 'magic', label: 'Magic', icon: '✨', color: 'from-pink-500 to-fuchsia-600' },
];

export const StoryMode: React.FC<StoryModeProps> = ({ verb, onClose }) => {
  const [step, setStep] = useState<'theme-selection' | 'generating' | 'interactive'>('theme-selection');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scenario, setScenario] = useState<{hint: string, targetSentence: string} | null>(null);
  const [userSentence, setUserSentence] = useState("");
  const [feedback, setFeedback] = useState<{isCorrect: boolean, text: string} | null>(null);
  const [checking, setChecking] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  
  // Custom theme state
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [customThemeText, setCustomThemeText] = useState("");

  const startStory = async (themeLabel: string) => {
      setSelectedTheme(themeLabel);
      setStep('generating');
      setLoading(true);

      try {
        // 1. Get Text Scenario
        const scenData = await generateStoryScenario(verb, themeLabel);
        setScenario({ hint: scenData.hint, targetSentence: scenData.targetSentence });

        // 2. Generate Image
        const img = await generateIllustration(scenData.imagePrompt);
        setImageUrl(img);
        
        setLoading(false);
        setStep('interactive');
      } catch (e) {
        console.error(e);
        setLoading(false);
        // Error handling could go here, for now stick to loading state or close
      }
  };

  const handleCheck = async () => {
      if (!userSentence.trim() || !scenario) return;
      setChecking(true);
      const result = await validateStoryAnswer(verb, userSentence, scenario.targetSentence);
      setFeedback({ isCorrect: result.isCorrect, text: result.feedback });
      setChecking(false);

      if (result.isCorrect) {
          speakText("Excellent travail!");
      }
  };

  const reset = () => {
      setStep('theme-selection');
      setImageUrl(null);
      setScenario(null);
      setUserSentence("");
      setFeedback(null);
      setChecking(false);
      setSelectedTheme(null);
      setCustomInputOpen(false);
      setCustomThemeText("");
  }

  // Helper to get icon safely
  const getCurrentThemeIcon = () => {
      return THEMES.find(t => t.label === selectedTheme)?.icon || '🎨';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      
      {/* Container */}
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden text-white border border-slate-700 flex flex-col h-[85vh] relative">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* --- Theme Selection Screen --- */}
        {step === 'theme-selection' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                
                {customInputOpen ? (
                    <div className="w-full max-w-lg flex flex-col items-center animate-fade-in">
                         <div className="text-6xl mb-6">🎨</div>
                         <h2 className="text-3xl font-bold mb-6 text-white">Create Your Own World</h2>
                         <p className="text-slate-400 mb-6">Type any theme you can imagine!</p>
                         
                         <input 
                            type="text" 
                            value={customThemeText}
                            onChange={(e) => setCustomThemeText(e.target.value)}
                            placeholder="e.g. Cyberpunk Spiders, Underwater Tea Party..."
                            className="w-full bg-slate-800 text-white rounded-xl p-4 border-2 border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 text-xl mb-6 placeholder:text-slate-600 text-center font-bold"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && customThemeText.trim()) {
                                    startStory(customThemeText.trim());
                                }
                            }}
                        />
                        
                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={() => setCustomInputOpen(false)}
                                className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-600"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => {
                                    if (customThemeText.trim()) startStory(customThemeText.trim());
                                }}
                                disabled={!customThemeText.trim()}
                                className="flex-[2] px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Start Adventure 🚀
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                Choose Your Adventure
                            </h2>
                            <p className="text-xl text-slate-300">
                                How do you want to practice the verb <span className="font-bold text-yellow-400 uppercase">"{verb}"</span>?
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl overflow-y-auto max-h-[50vh] p-2">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => startStory(theme.label)}
                                    className={`
                                        group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
                                        bg-gradient-to-br ${theme.color}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                                        {theme.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white tracking-wide shadow-black drop-shadow-md">
                                        {theme.label}
                                    </h3>
                                </button>
                            ))}

                            {/* Custom Theme Button */}
                            <button
                                onClick={() => setCustomInputOpen(true)}
                                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-slate-800 border-2 border-dashed border-slate-600 hover:border-cyan-400 hover:bg-slate-750"
                            >
                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300 opacity-80 group-hover:opacity-100">
                                   🎨
                                </div>
                                <h3 className="text-2xl font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
                                    Custom
                                </h3>
                            </button>
                        </div>
                    </>
                )}
            </div>
        )}

        {/* --- Loading Screen --- */}
        {step === 'generating' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900">
                 <div className="relative w-32 h-32 mb-8">
                     <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
                     <div className="absolute inset-2 border-4 border-t-pink-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
                        {getCurrentThemeIcon()}
                     </div>
                 </div>
                 <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse">
                     Creating your {selectedTheme} story...
                 </h2>
                 <p className="text-slate-400 mt-4">Consulting the imagination engine...</p>
             </div>
        )}

        {/* --- Interactive Screen --- */}
        {step === 'interactive' && (
            <div className="flex flex-col md:flex-row h-full">
                {/* Left: Image Area */}
                <div className="w-full md:w-1/2 bg-black relative flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Story Scenario" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                    ) : (
                        <div className="text-red-400">Could not generate image.</div>
                    )}
                    
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                         <span className="text-xl">{getCurrentThemeIcon()}</span>
                         <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
                             Verb: <span className="text-yellow-400">{verb}</span>
                         </span>
                    </div>
                </div>

                {/* Right: Interaction Area */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-slate-900 overflow-y-auto">
                    
                    <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                        <h2 className="text-3xl font-extrabold mb-2 text-white">
                            Your Turn!
                        </h2>
                        <p className="text-slate-400 mb-6">Describe the scene using the correct verb form.</p>

                        {scenario && (
                            <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 p-5 rounded-2xl border border-slate-700 mb-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2 flex items-center gap-2">
                                    <span>💡</span> Mission Hint
                                </span>
                                <p className="text-lg md:text-xl italic text-slate-200 font-medium leading-relaxed">
                                    "{scenario.hint}"
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <textarea 
                                value={userSentence}
                                onChange={(e) => setUserSentence(e.target.value)}
                                placeholder="Ecrivez votre phrase ici..."
                                className="w-full bg-slate-800 text-white rounded-xl p-4 border-2 border-slate-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 focus:outline-none text-xl resize-none h-32 transition-all placeholder:text-slate-600"
                                disabled={checking || feedback?.isCorrect}
                            />
                            
                            {!feedback?.isCorrect && (
                                <button
                                    onClick={handleCheck}
                                    disabled={checking || !userSentence}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2
                                        ${checking ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'}
                                    `}
                                >
                                    {checking ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        <>Check My Sentence ✨</>
                                    )}
                                </button>
                            )}
                        </div>

                        {feedback && (
                            <div className={`mt-6 p-5 rounded-xl border animate-bounce-small ${feedback.isCorrect ? 'bg-green-900/20 border-green-500/40' : 'bg-red-900/20 border-red-500/40'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">{feedback.isCorrect ? "🎉" : "🤔"}</span>
                                    <h4 className={`font-bold text-xl ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                        {feedback.isCorrect ? "Magnifique!" : "Not quite!"}
                                    </h4>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{feedback.text}</p>
                                
                                {feedback.isCorrect && (
                                     <div className="mt-6 flex flex-wrap gap-4">
                                        <button 
                                            onClick={reset}
                                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
                                        >
                                            Choose New Theme
                                        </button>
                                        <button 
                                            onClick={onClose}
                                            className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            Done
                                        </button>
                                     </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};