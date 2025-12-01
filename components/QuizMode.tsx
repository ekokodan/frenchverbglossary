import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { generateQuizQuestion, speakText } from '../services/geminiService';

interface QuizModeProps {
  verb: string;
  tense: string;
  onClose: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ verb, tense, onClose }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const q = await generateQuizQuestion(verb, tense as any);
      if (mounted) {
        setQuestion(q);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [verb, tense]);

  const handleOptionClick = (option: string) => {
    if (selectedOption || !question) return; // Prevent double click
    setSelectedOption(option);
    
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
       speakText("Bravo!");
    } else {
       speakText("Essayez encore."); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white flex justify-between items-center">
            <h3 className="text-2xl font-bold flex items-center gap-2">
                <span>🚀</span> Mission Practice
            </h3>
            <button 
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
                ✕
            </button>
        </div>

        <div className="p-8 min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-indigo-500 animate-pulse">Consulting the Galaxy Brain...</p>
            </div>
          ) : question ? (
            <div className="space-y-6">
                
                {/* Question Area */}
                <div className="text-center">
                    <p className="text-slate-500 text-sm mb-2">{question.translation}</p>
                    <h4 className="text-2xl font-bold text-slate-800">
                        {question.question.split('_______').map((part, i, arr) => (
                            <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className="inline-block min-w-[80px] border-b-4 border-indigo-300 mx-2 text-indigo-600">
                                        {selectedOption || "?"}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </h4>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            disabled={!!selectedOption}
                            className={`
                                p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105
                                ${selectedOption === opt 
                                    ? (isCorrect ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200')
                                    : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 shadow-md hover:shadow-lg'
                                }
                                ${selectedOption && opt === question.correctAnswer ? 'bg-green-500 text-white ring-4 ring-green-200' : ''}
                            `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Feedback */}
                {selectedOption && (
                    <div className={`text-center p-3 rounded-lg font-bold animate-bounce ${isCorrect ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {isCorrect ? "✨ Excellent! Tres bien! ✨" : "Oops! Keep trying!"}
                    </div>
                )}
            </div>
          ) : (
            <div className="text-center text-red-500">Failed to load mission.</div>
          )}
        </div>
        
        {selectedOption && (
             <div className="p-4 bg-slate-50 border-t flex justify-end">
                 <button 
                    onClick={() => {
                        setLoading(true);
                        setQuestion(null);
                        setSelectedOption(null);
                        setIsCorrect(null);
                        // Reload
                        generateQuizQuestion(verb, tense as any).then(q => {
                            setQuestion(q);
                            setLoading(false);
                        });
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                 >
                    Next Mission →
                 </button>
             </div>
        )}

      </div>
    </div>
  );
};