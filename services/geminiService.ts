import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VerbData, Tense, Pronoun, QuizQuestion, StoryScenario } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Cache to prevent re-fetching the same verb data
const verbCache: Record<string, VerbData> = {};

export const fetchVerbConjugation = async (verb: string, tense: Tense): Promise<VerbData> => {
  const cacheKey = `${verb.toLowerCase()}-${tense}`;
  if (verbCache[cacheKey]) {
    return verbCache[cacheKey];
  }

  const prompt = `
    Conjugate the French verb "${verb}" in the "${tense}" tense.
    Provide the English translation of the verb.
    Choose a single fun emoji that represents this action.
    Provide a simple example sentence in French using this verb in this tense.
    Provide conjugations for: Je, Tu, Il/Elle, Nous, Vous, Ils/Elles.
    Ensure "Il/Elle" and "Ils/Elles" treat the pronoun as a single string key.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verb: { type: Type.STRING },
            tense: { type: Type.STRING },
            translation: { type: Type.STRING },
            emoji: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            conjugations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pronoun: { type: Type.STRING },
                  conjugation: { type: Type.STRING },
                  pronunciationKey: { type: Type.STRING, description: "A simple phonetic pronunciation guide for kids" }
                },
                required: ["pronoun", "conjugation"]
              }
            }
          },
          required: ["verb", "tense", "translation", "emoji", "conjugations"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}") as any;
    
    // Map string response to our strict types
    const typedData: VerbData = {
      verb: data.verb,
      tense: tense, // Ensure we use the requested tense enum
      translation: data.translation,
      emoji: data.emoji,
      exampleSentence: data.exampleSentence || `Je ${data.verb} ...`,
      conjugations: data.conjugations.map((c: any) => ({
        pronoun: mapStringToPronoun(c.pronoun),
        conjugation: c.conjugation,
        pronunciationKey: c.pronunciationKey
      }))
    };

    verbCache[cacheKey] = typedData;
    return typedData;

  } catch (error) {
    console.error("Gemini fetch error:", error);
    // Fallback if API fails
    return {
      verb,
      tense,
      translation: "Error loading",
      emoji: "❓",
      exampleSentence: "Error...",
      conjugations: []
    };
  }
};

const mapStringToPronoun = (str: string): Pronoun => {
  // Simple heuristic mapping
  if (str.toLowerCase().includes("je") || str.toLowerCase().includes("j'")) return Pronoun.JE;
  if (str.toLowerCase().includes("tu")) return Pronoun.TU;
  if (str.toLowerCase().includes("nous")) return Pronoun.NOUS;
  if (str.toLowerCase().includes("vous")) return Pronoun.VOUS;
  if (str.toLowerCase().includes("ils") || str.toLowerCase().includes("elles")) return Pronoun.ILS_ELLES;
  return Pronoun.IL_ELLE;
};

const QUIZ_PRONOUNS = ["Je", "Tu", "Il", "Elle", "Nous", "Vous", "Ils", "Elles"];

export const generateQuizQuestion = async (verb: string, tense: Tense): Promise<QuizQuestion> => {
  // Randomly select a pronoun to ensure we test different subjects each time
  const targetPronoun = QUIZ_PRONOUNS[Math.floor(Math.random() * QUIZ_PRONOUNS.length)];

  const prompt = `
    Create a multiple-choice fill-in-the-blank question for the French verb "${verb}" in "${tense}" tense. 
    The sentence MUST specifically use the subject pronoun "${targetPronoun}" (or a proper name/noun that is equivalent to it).
    Target audience: children. 
    Return JSON.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "The sentence with the verb replaced by _______" },
                correctAnswer: { type: Type.STRING },
                translation: { type: Type.STRING },
                options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Array of 4 options, one is correct"
                }
            }
        }
    }
  });
  
  return JSON.parse(response.text || "{}") as QuizQuestion;
};

// --- Story Mode Logic ---

const STORY_PRONOUNS = ["Je", "Tu", "Il", "Elle", "Nous", "Vous", "Ils", "Elles"];

export const generateStoryScenario = async (verb: string, theme: string): Promise<StoryScenario> => {
  // Randomly select a pronoun to ensure diversity in practice
  const targetPronoun = STORY_PRONOUNS[Math.floor(Math.random() * STORY_PRONOUNS.length)];

  const prompt = `
    Generate a creative, funny, and child-friendly scenario to practice the French verb "${verb}" specifically using the subject pronoun "${targetPronoun}".
    
    The theme of the scenario must be: "${theme}".

    1. Provide a detailed image description (prompt) for an AI image generator. The image should visually represent the subject doing the action, matching the "${theme}" theme.
       - If the pronoun is "Je" or "Tu", describe a specific character (e.g. a wizard, a robot, an animal) matching the theme that the student is roleplaying or talking to.
       - If the pronoun is "Nous", "Vous", "Ils", or "Elles", describe a GROUP of characters doing the action together.
       
    2. Provide a simple French sentence that describes this image using "${targetPronoun}" and the verb "${verb}".
    
    3. Provide a hint in English that helps the student know which pronoun to use.
       - Example for "Nous": "Imagine you and your alien friends are doing this... (Use 'Nous')"
       - Example for "Il": "Describe what the robot is doing... (Use 'Il')"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          imagePrompt: { type: Type.STRING },
          targetSentence: { type: Type.STRING },
          hint: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}") as StoryScenario;
};

export const generateIllustration = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt + " 3D render style, cute, colorful, high quality, pixar style, bright lighting" }] },
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
  } catch (e) {
      console.error("Image Gen Error", e);
      return null;
  }
};

export const validateStoryAnswer = async (verb: string, userSentence: string, targetSentence: string): Promise<{isCorrect: boolean, feedback: string}> => {
    const prompt = `
        The student was asked to write a sentence for the verb "${verb}".
        Target meaning/structure: "${targetSentence}".
        Student wrote: "${userSentence}".
        
        Is the student's sentence grammatically correct in French and does it use the verb "${verb}" correctly? 
        It doesn't have to match the target sentence exactly, as long as it describes the action well and uses the correct conjugation.
        
        Return JSON with isCorrect boolean and a short feedback message in English for a child.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isCorrect: { type: Type.BOOLEAN },
                    feedback: { type: Type.STRING }
                }
            }
        }
    });

    return JSON.parse(response.text || "{}");
}

// --- TTS Logic ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const speakText = async (text: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
              },
            },
          });
          
          const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          const outputNode = outputAudioContext.createGain();
          outputNode.connect(outputAudioContext.destination);

          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          
          if (!base64Audio) return;

          const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputAudioContext,
            24000,
            1,
          );
          
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputNode);
          source.start();

    } catch (e) {
        console.error("TTS Error", e);
    }
}