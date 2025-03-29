import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Language name mapping for common languages
const languageNames: Record<string, string> = {
  'en': 'English',
  'fr': 'French',
  'es': 'Spanish',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  'ms': 'Malay',
  'fa': 'Persian',
  'he': 'Hebrew',
  'pl': 'Polish',
  'cs': 'Czech',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'hu': 'Hungarian',
  'el': 'Greek',
  'ro': 'Romanian',
  'uk': 'Ukrainian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sr': 'Serbian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'et': 'Estonian',
};

// Define proper types for Whisper API responses
interface WhisperDetectionResponse {
  language: string;
  text: string;
  words?: WhisperWord[];
}

interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

interface WhisperTranslationResponse {
  text: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const shouldTranslate = formData.get('translate') === 'true';
    const detectOnly = formData.get('detectOnly') === 'true';
    const providedLanguage = formData.get('detectedLanguage') as string | null;

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert the blob to a File object that OpenAI's API can handle
    const file = new File([audioFile], 'audio.wav', { 
      type: audioFile.type || 'audio/wav'
    });

    // If we're only detecting the language, use a smaller model call
    if (detectOnly) {
      try {
        // Use transcriptions endpoint with language detection
        const detection = await openai.audio.transcriptions.create({
          file: file,
          model: 'whisper-1',
          response_format: 'verbose_json',
          // Let Whisper detect the language automatically by not specifying a language
        });

        const detectedLanguage = (detection as WhisperDetectionResponse).language || 'en';
        const detectedLanguageName = languageNames[detectedLanguage.toLowerCase()] || detectedLanguage;

        return NextResponse.json({
          detectedLanguage: detectedLanguage,
          detectedLanguageName: detectedLanguageName,
          success: true
        });
      } catch (error) {
        console.error('Language detection error:', error);
        return NextResponse.json({
          detectedLanguage: 'en',
          detectedLanguageName: 'English (fallback)',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    let transcription;
    let language = providedLanguage || 'en';
    
    if (shouldTranslate) {
      // Use translations endpoint for non-English audio
      // This will automatically translate to English
      transcription = await openai.audio.translations.create({
        file: file,
        model: 'whisper-1',
        response_format: 'json'
      });
      
      language = 'en'; // The translation is always to English
    } else {
      // Use transcriptions endpoint for audio in its original language
      transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        // Use detected language if provided, otherwise let Whisper auto-detect
        ...(providedLanguage ? { language: providedLanguage } : {}),
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });
      
      // Get the detected language from the response
      language = (transcription as WhisperDetectionResponse).language || language;
    }

    // Process the response to create word timings
    // Note: Word timings are only available for transcriptions, not translations
    const wordTimings = !shouldTranslate ? (transcription as WhisperDetectionResponse).words?.map((word: WhisperWord) => ({
      word: word.word,
      start: word.start,
      end: word.end
    })) : [];

    // Return both the full transcript and word timings
    return NextResponse.json({
      transcript: shouldTranslate 
        ? (transcription as WhisperTranslationResponse).text 
        : (transcription as WhisperDetectionResponse).text,
      wordTimings: wordTimings,
      isTranslated: shouldTranslate,
      language: language,
      languageName: languageNames[language.toLowerCase()] || language
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 