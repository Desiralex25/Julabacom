/**
 * JULABA - ElevenLabs Speech-to-Text (STT)
 * 
 * Convertit l'audio vocal en texte via l'API ElevenLabs Scribe.
 * Utilisé par Tantie Sagesse pour comprendre la voix de l'utilisateur.
 */

import type { Context } from "npm:hono";

/**
 * POST /tts/transcribe - Transcrire un fichier audio en texte
 * Body: multipart/form-data avec champ "audio" (blob audio)
 */
export async function transcribeAudio(c: Context) {
  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');

    if (!apiKey) {
      console.log('ELEVENLABS_API_KEY manquante - STT desactive');
      return c.json({
        error: 'Service de transcription vocale non configure',
        details: 'ELEVENLABS_API_KEY manquante'
      }, 503);
    }

    // Recuperer le body comme FormData
    const formData = await c.req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({
        error: 'Fichier audio requis (champ "audio" dans FormData)'
      }, 400);
    }

    console.log(`STT Request - Audio size: ${audioFile.size} bytes, type: ${audioFile.type}`);

    // Construire le FormData pour ElevenLabs
    const elevenLabsForm = new FormData();
    elevenLabsForm.append('audio', audioFile);
    elevenLabsForm.append('model_id', 'scribe_v1');
    elevenLabsForm.append('language_code', 'fra');

    // Appel API ElevenLabs Speech-to-Text
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elevenLabsForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`ElevenLabs STT error (${response.status}):`, errorText);

      // Si erreur ElevenLabs, essayer le fallback Whisper/OpenAI
      const openAiKey = Deno.env.get('OPENAI_API_KEY');
      if (openAiKey) {
        console.log('Tentative fallback OpenAI Whisper STT...');
        return await transcribeWithWhisper(c, audioFile, openAiKey);
      }

      return c.json({
        error: 'Erreur lors de la transcription audio',
        details: `ElevenLabs STT returned ${response.status}`,
        message: errorText
      }, response.status);
    }

    const data = await response.json();
    const transcribedText = data.text || '';

    console.log(`STT Success: "${transcribedText.substring(0, 100)}..."`);

    return c.json({
      success: true,
      text: transcribedText.trim(),
      language: data.language_code || 'fra',
      source: 'elevenlabs'
    });

  } catch (error) {
    console.log('STT error:', error);
    return c.json({
      error: 'Erreur serveur lors de la transcription audio',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
}

/**
 * Fallback: Transcription via OpenAI Whisper
 */
async function transcribeWithWhisper(c: Context, audioFile: File, apiKey: string) {
  try {
    const whisperForm = new FormData();
    whisperForm.append('file', audioFile);
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('language', 'fr');
    whisperForm.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Whisper STT error (${response.status}):`, errorText);
      return c.json({
        error: 'Erreur transcription audio (fallback Whisper)',
        details: errorText
      }, response.status);
    }

    const data = await response.json();
    console.log(`Whisper STT Success: "${data.text?.substring(0, 100)}..."`);

    return c.json({
      success: true,
      text: (data.text || '').trim(),
      language: 'fra',
      source: 'whisper'
    });

  } catch (error) {
    console.log('Whisper fallback error:', error);
    return c.json({
      error: 'Erreur transcription audio (Whisper)',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500);
  }
}
