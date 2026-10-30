import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { convertNameToArabic } from '@/lib/arabicTransliteration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // Baseline offline algorithmic result
    const offlineArabic = convertNameToArabic(name);

    // If Gemini API Key is configured, use Gemini 3.8 Flash for superior accuracy on nuances
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are an expert in Arabic linguistics and Islamic history.
Convert the following personal or historical name from Latin/English into authentic, standard Arabic script with correct spelling.
For example:
"abdallah rushdi" -> "عبد الله رشدي"
"salahuddin" -> "صلاح الدين الأيوبي"
"khalid ibn al-walid" -> "خالد بن الوليد"

Input Name: "${name}"

Return ONLY valid JSON in this exact structure without markdown blocks:
{"arabicName": "الاسم بالعربية", "pronunciation": "Phonetic guide"}`,
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.arabicName && typeof parsed.arabicName === 'string') {
          return NextResponse.json({
            success: true,
            arabicName: parsed.arabicName.trim(),
            pronunciation: parsed.pronunciation || '',
            source: 'ai',
          });
        }
      } catch {
        // Fall back to offline converter
      }
    }

    return NextResponse.json({
      success: true,
      arabicName: offlineArabic,
      source: 'rule-based',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
