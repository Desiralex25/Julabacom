/**
 * JULABA - Tantie Sagesse Voice Flow Orchestrator
 * 
 * Pipeline complet:
 * 1. Enregistrement micro (MediaRecorder)
 * 2. Audio -> ElevenLabs STT -> Texte
 * 3. Texte -> OpenAI Intent Engine -> Action + Message
 * 4. Message -> ElevenLabs TTS -> Audio reponse
 * 5. Lecture audio a l'utilisateur
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import { aiIntentService, type IntentResult, type IntentResponse } from './aiIntentService';

// ---- TYPES ----

export type FlowStep =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'thinking'
  | 'executing'
  | 'speaking'
  | 'done'
  | 'error';

export interface FlowState {
  step: FlowStep;
  transcribedText: string;
  intentResult: IntentResponse | null;
  responseMessage: string;
  actionPath: string;
  error: string;
}

export type FlowCallback = (state: FlowState) => void;

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

// ---- AUDIO RECORDER ----

class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Preferer webm/opus pour la compatibilite
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Chunks toutes les 250ms
    } catch (err) {
      console.error('Microphone error:', err);
      throw new Error('Impossible d\'acceder au micro. Verifie les permissions.');
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('Pas d\'enregistrement en cours'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// ---- STT SERVICE ----

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  // Determiner l'extension correcte selon le type
  const ext = audioBlob.type.includes('webm') ? 'webm' : 'mp4';
  formData.append('audio', audioBlob, `recording.${ext}`);

  const response = await fetch(`${BASE_URL}/api/stt/transcribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    console.error('STT error:', data);
    throw new Error(data.error || 'Erreur de transcription');
  }

  return data.text;
}

// ---- TTS SERVICE ----

async function textToSpeech(text: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/tts/speak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({
      text,
      voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte - voix feminine francaise
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Erreur de synthese vocale');
  }

  return data.audio; // base64
}

function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Erreur lecture audio'));
    audio.play().catch(reject);
  });
}

// Fallback Web Speech API
function speakFallback(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// ---- FLOW ORCHESTRATOR ----

export class TantieSagesseFlow {
  private recorder = new AudioRecorder();
  private onUpdate: FlowCallback;
  private aborted = false;
  private currentAudio: HTMLAudioElement | null = null;

  private state: FlowState = {
    step: 'idle',
    transcribedText: '',
    intentResult: null,
    responseMessage: '',
    actionPath: '',
    error: '',
  };

  constructor(onUpdate: FlowCallback) {
    this.onUpdate = onUpdate;
  }

  private emit(partial: Partial<FlowState>) {
    this.state = { ...this.state, ...partial };
    this.onUpdate(this.state);
  }

  // ---- STEP 1: Enregistrement ----

  async startRecording(): Promise<void> {
    this.aborted = false;
    this.emit({
      step: 'recording',
      transcribedText: '',
      intentResult: null,
      responseMessage: '',
      actionPath: '',
      error: '',
    });

    try {
      await this.recorder.start();
    } catch (err: any) {
      this.emit({ step: 'error', error: err.message });
    }
  }

  // ---- STEP 2-5: Stop + Pipeline complet ----

  async stopAndProcess(role: string, screen: string, userId?: string): Promise<void> {
    if (this.aborted) return;

    try {
      // Stop recording
      const audioBlob = await this.recorder.stop();

      if (audioBlob.size < 1000) {
        this.emit({
          step: 'error',
          error: 'Enregistrement trop court. Parle un peu plus longtemps.'
        });
        return;
      }

      // Step 2: Transcription STT
      this.emit({ step: 'transcribing' });
      const text = await transcribeAudio(audioBlob);

      if (!text || text.trim().length === 0) {
        this.emit({
          step: 'error',
          error: 'Je n\'ai pas entendu ce que tu as dit. Essaye encore.'
        });
        return;
      }

      this.emit({ transcribedText: text });

      // Continue with text processing
      await this.processText(text, role, screen, userId);

    } catch (err: any) {
      console.error('Flow error:', err);
      this.emit({
        step: 'error',
        error: err.message || 'Une erreur est survenue'
      });
    }
  }

  // ---- Process text (used by both voice and keyboard modes) ----

  async processText(text: string, role: string, screen: string, userId?: string): Promise<void> {
    if (this.aborted) return;

    try {
      this.emit({
        step: 'thinking',
        transcribedText: text,
        intentResult: null,
        responseMessage: '',
        actionPath: '',
        error: '',
      });

      // Step 3: OpenAI Intent Detection
      const intentResult: IntentResult = await aiIntentService.interpret({
        message: text,
        role,
        screen,
        userId,
      });

      if (this.aborted) return;

      if (!intentResult.success || !intentResult.result) {
        const errorMsg = intentResult.error
          ? aiIntentService.getErrorMessage(intentResult.error)
          : 'Je n\'ai pas compris. Reformule ta demande.';

        this.emit({
          step: 'error',
          error: errorMsg,
        });
        return;
      }

      const result = intentResult.result;
      const actionPath = aiIntentService.mapIntentToAction(result.intent, role);

      this.emit({
        step: 'executing',
        intentResult: result,
        responseMessage: result.message,
        actionPath,
      });

      // Step 4: TTS - Generer la reponse audio
      this.emit({ step: 'speaking' });

      try {
        const audioBase64 = await textToSpeech(result.message);
        if (!this.aborted) {
          await playBase64Audio(audioBase64);
        }
      } catch (ttsErr) {
        console.warn('TTS ElevenLabs failed, using fallback:', ttsErr);
        if (!this.aborted) {
          await speakFallback(result.message);
        }
      }

      if (!this.aborted) {
        this.emit({ step: 'done' });
      }

    } catch (err: any) {
      console.error('Process text error:', err);
      if (!this.aborted) {
        this.emit({
          step: 'error',
          error: err.message || 'Erreur pendant le traitement'
        });
      }
    }
  }

  // ---- ABORT ----

  abort(): void {
    this.aborted = true;
    this.recorder.cancel();
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.emit({ step: 'idle' });
  }

  // ---- RESET ----

  reset(): void {
    this.abort();
    this.state = {
      step: 'idle',
      transcribedText: '',
      intentResult: null,
      responseMessage: '',
      actionPath: '',
      error: '',
    };
    this.onUpdate(this.state);
  }

  get isRecording(): boolean {
    return this.recorder.isRecording;
  }

  get currentState(): FlowState {
    return { ...this.state };
  }
}
