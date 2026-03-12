/**
 * JULABA - Tantie Sagesse Voice Flow Orchestrator (Mode Local)
 * 
 * Version simplifiee sans backend
 */

import { aiIntentService, type IntentResult, type IntentResponse } from './aiIntentService';

// Types
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

// Audio Recorder (mode local)
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

      this.mediaRecorder.start(250);
    } catch (err) {
      console.error('Microphone error:', err);
      throw new Error('Impossible d\'acceder au micro.');
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

// Flow Orchestrator
export class TantieSagesseFlow {
  private recorder = new AudioRecorder();
  private onUpdate: FlowCallback;
  private aborted = false;

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

  async stopAndProcess(role: string, screen: string, userId?: string): Promise<void> {
    if (this.aborted) return;

    try {
      const audioBlob = await this.recorder.stop();

      if (audioBlob.size < 1000) {
        this.emit({
          step: 'error',
          error: 'Enregistrement trop court.'
        });
        return;
      }

      this.emit({ 
        step: 'error',
        error: 'Mode local - service de transcription non disponible'
      });

    } catch (err: any) {
      console.error('Flow error:', err);
      this.emit({
        step: 'error',
        error: err.message || 'Une erreur est survenue'
      });
    }
  }

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

      const errorMsg = 'Mode local - service IA non disponible';
      await speakFallback(errorMsg);

      this.emit({
        step: 'error',
        error: errorMsg,
      });

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

  abort(): void {
    this.aborted = true;
    this.recorder.cancel();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.emit({ step: 'idle' });
  }

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
