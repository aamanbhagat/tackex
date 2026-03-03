import { NextResponse } from 'next/server';

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function POST(request) {
    try {
        const { foodName, weight } = await request.json();

        if (!foodName) {
            return NextResponse.json({ error: 'Food name is required' }, { status: 400 });
        }

        const prompt = `You are a precise nutrition database. For the food "${foodName}" with a serving of ${weight || '100'}g, provide the EXACT nutritional values in JSON format ONLY. No explanation, no text, just valid JSON:

{
  "name": "${foodName} (${weight || 100}g)",
  "quantity": "${weight || 100}g",
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>,
  "fiber": <number in grams>,
  "sugar": <number in grams>,
  "vitamins": {
    "A": <number in mcg>,
    "B1": <number in mg>,
    "B2": <number in mg>,
    "B3": <number in mg>,
    "B6": <number in mg>,
    "B12": <number in mcg>,
    "C": <number in mg>,
    "D": <number in mcg>,
    "E": <number in mg>,
    "K": <number in mcg>
  },
  "minerals": {
    "iron": <number in mg>,
    "calcium": <number in mg>,
    "zinc": <number in mg>,
    "magnesium": <number in mg>,
    "potassium": <number in mg>,
    "sodium": <number in mg>
  }
}

Use accurate USDA/standard nutrition data. Return ONLY the JSON object, nothing else.`;

        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'grok-4-1-fast-non-reasoning',
                messages: [
                    { role: 'system', content: 'You are a nutrition database API. Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 500,
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Grok nutrition API error:', response.status, errText);
            const isCredits = errText.includes('credit') || errText.includes('spending limit') || response.status === 402 || response.status === 429;
            return NextResponse.json({
                error: isCredits
                    ? 'AI API credits exhausted. Please add credits to your xAI account or try again later.'
                    : `API error: ${response.status}`
            }, { status: isCredits ? 402 : 500 });
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean up markdown code blocks if present
        content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

        try {
            const nutrition = JSON.parse(content);
            return NextResponse.json({ nutrition });
        } catch (parseErr) {
            console.error('Failed to parse AI nutrition response:', content);
            return NextResponse.json({
                nutrition: {
                    name: `${foodName} (${weight || 100}g)`,
                    quantity: `${weight || 100}g`,
                    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
                    vitamins: { A: 0, B1: 0, B2: 0, B3: 0, B6: 0, B12: 0, C: 0, D: 0, E: 0, K: 0 },
                    minerals: { iron: 0, calcium: 0, zinc: 0, magnesium: 0, potassium: 0, sodium: 0 },
                },
                warning: 'Could not parse nutrition data, using empty values',
            });
        }
    } catch (error) {
        console.error('Nutrition lookup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
