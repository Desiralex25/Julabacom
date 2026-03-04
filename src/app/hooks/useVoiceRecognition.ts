import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface VoiceRecognitionResult {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceRecognition({
  lang = 'fr-FR',
  continuous = false,
  interimResults = false,
  onResult,
  onEnd,
  onError,
}: VoiceRecognitionOptions = {}): VoiceRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = lang;
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = interimResults;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          
          setTranscript(transcriptResult);
          
          if (onResult) {
            onResult(transcriptResult);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          const errorMessage = `Erreur de reconnaissance vocale: ${event.error}`;
          setError(errorMessage);
          setIsListening(false);
          
          if (onError) {
            onError(errorMessage);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          
          if (onEnd) {
            onEnd();
          }
        };
      } else {
        setIsSupported(false);
        setError('La reconnaissance vocale n\'est pas supportée par ce navigateur');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, continuous, interimResults, onResult, onEnd, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setError('Impossible de démarrer la reconnaissance vocale');
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
