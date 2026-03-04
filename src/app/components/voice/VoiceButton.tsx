import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../contexts/AppContext';

interface VoiceButtonProps {
  onVoiceCommand?: (command: string) => void;
}

export function VoiceButton({ onVoiceCommand }: VoiceButtonProps) {
  const { voiceEnabled, speak, roleColor } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const startListening = () => {
    if (!voiceEnabled) return;

    // Web Speech API for voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.lang = 'fr-FR';
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        speak('Je t\'écoute');
      };

      recognitionInstance.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        if (onVoiceCommand) {
          onVoiceCommand(command);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.start();
      setRecognition(recognitionInstance);
    } else {
      // Fallback: simulate voice interaction
      setIsListening(true);
      speak('Fonction vocale en mode démo');
      setTimeout(() => setIsListening(false), 2000);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  return (
    <>
      {/* Voice Button - Floating */}
      <motion.button
        onClick={isListening ? stopListening : startListening}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
        style={{ backgroundColor: roleColor }}
        whileTap={{ scale: 0.9 }}
        animate={isListening ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            `0 0 0 0 ${roleColor}40`,
            `0 0 0 10px ${roleColor}00`,
            `0 0 0 0 ${roleColor}40`,
          ],
        } : {}}
        transition={{
          repeat: isListening ? Infinity : 0,
          duration: 1.5,
        }}
      >
        <Mic className="w-7 h-7 text-white" />
      </motion.button>

      {/* Voice Overlay when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={stopListening}
          >
            <div className="text-center">
              <motion.div
                className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${roleColor}20` }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
              >
                <Mic className="w-16 h-16" style={{ color: roleColor }} />
              </motion.div>

              {/* Sound Wave Animation */}
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: roleColor }}
                    animate={{
                      height: [20, 40, 20],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              <p className="text-white text-xl font-semibold">Tantie Sagesse t'écoute...</p>
              <p className="text-white/70 mt-2">Parle maintenant</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
