import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DietEntry from '@/models/DietEntry';
import FinanceEntry from '@/models/FinanceEntry';
import DailySummary from '@/models/DailySummary';

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

async function callGrok(messages) {
    const models = ['grok-4-1-fast-non-reasoning'];
    let lastError = '';

    for (const model of models) {
        try {
            const response = await fetch(GROK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROK_API_KEY}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: 800,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`Grok API error with model ${model}:`, response.status, err);
                lastError = `${response.status}: ${err}`;
                continue;
            }

            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            }
            lastError = 'Invalid response structure from Grok API';
        } catch (err) {
            console.error(`Grok fetch error with model ${model}:`, err);
            lastError = err.message;
        }
    }

    throw new Error(`Grok API failed: ${lastError}`);
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { type, userId, date, context } = body;

        let systemPrompt = '';
        let userPrompt = '';
        let saveTarget = null;

        switch (type) {
            case 'diet_meal': {
                systemPrompt = `You are a professional nutritionist AI assistant. Analyze the meal data provided and give concise, actionable suggestions for the next meal. Consider micro-nutrients, vitamins, and overall balance. Keep response under 150 words. Use bullet points.`;
                userPrompt = `User profile: ${JSON.stringify(context.userProfile)}
Current meal: ${JSON.stringify(context.meal)}
Today's totals so far: ${JSON.stringify(context.dayTotals)}
Daily goals: ${JSON.stringify(context.goals)}

Analyze this meal and suggest what to eat next to balance nutrition. Consider missing vitamins and minerals.`;
                break;
            }

            case 'diet_day': {
                systemPrompt = `You are a professional nutritionist AI. Provide a comprehensive end-of-day diet summary with a health score, what was good, what was missing, and specific suggestions for tomorrow. Keep response under 200 words.`;
                userPrompt = `User profile: ${JSON.stringify(context.userProfile)}
Today's meals: ${JSON.stringify(context.meals)}
Today's totals: ${JSON.stringify(context.dayTotals)}
Daily goals: ${JSON.stringify(context.goals)}

Give a comprehensive end-of-day diet review with score, strengths, gaps, and tomorrow's recommendations.`;

                saveTarget = { model: 'DietEntry', field: 'aiDaySuggestion' };
                break;
            }

            case 'finance': {
                systemPrompt = `You are a financial advisor AI. Analyze daily spending and provide brief, actionable financial advice. Keep response under 150 words. Use bullet points.`;
                userPrompt = `User's financial data for today:
Income: ₹${context.income}
Expenses: ${JSON.stringify(context.expenses)}
Investments: ${JSON.stringify(context.investments)}
Savings: ₹${context.savings}

Monthly data so far: ${JSON.stringify(context.monthlyData)}

Provide brief financial analysis and suggestions.`;

                saveTarget = { model: 'FinanceEntry', field: 'aiSuggestion' };
                break;
            }

            case 'daily_summary': {
                systemPrompt = `You are a holistic wellness AI coach. Provide a comprehensive daily summary covering habits, nutrition, finances, sleep, and overall health. Give a score out of 100 and specific improvement tips. Keep response under 250 words.`;
                userPrompt = `User profile: ${JSON.stringify(context.userProfile)}
Date: ${date}
Habits: ${context.habitsCompleted}/${context.habitsTotal} completed
Diet totals: ${JSON.stringify(context.dietTotals)}
Diet goals: ${JSON.stringify(context.goals)}
Finance: Income ₹${context.income}, Expenses ₹${context.expenses}, Invested ₹${context.investments}
Sleep: ${context.sleepHours} hours (${context.wakeUpTime} - ${context.bedTime})
Water: ${context.waterIntake}L

Give a comprehensive daily review with score, highlights, areas to improve, and tomorrow's priorities.`;

                saveTarget = { model: 'DailySummary', field: 'aiFeedback' };
                break;
            }

            case 'habit': {
                systemPrompt = `You are a habit coach AI. Analyze habit completion patterns and provide motivational, actionable advice. Keep response under 150 words.`;
                userPrompt = `User's habits and completion data:
${JSON.stringify(context.habits)}

Current streaks and patterns. Provide motivation and suggestions for improvement.`;
                break;
            }

            default:
                return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 });
        }

        const aiResponse = await callGrok([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ]);

        // Save the AI response to the database
        if (saveTarget) {
            switch (saveTarget.model) {
                case 'DietEntry': {
                    await DietEntry.findOneAndUpdate(
                        { userId, date },
                        { [saveTarget.field]: aiResponse },
                        { upsert: false }
                    );
                    break;
                }
                case 'FinanceEntry': {
                    await FinanceEntry.findOneAndUpdate(
                        { userId, date },
                        { [saveTarget.field]: aiResponse },
                        { upsert: false }
                    );
                    break;
                }
                case 'DailySummary': {
                    await DailySummary.findOneAndUpdate(
                        { userId, date },
                        { [saveTarget.field]: aiResponse },
                        { upsert: false }
                    );
                    break;
                }
            }
        }

        return NextResponse.json({ suggestion: aiResponse });
    } catch (error) {
        console.error('AI suggestion error:', error);
        const isCredits = error.message && (error.message.includes('credit') || error.message.includes('spending limit') || error.message.includes('402') || error.message.includes('429'));
        return NextResponse.json({
            error: isCredits
                ? 'AI API credits exhausted. Please add credits to your xAI account.'
                : error.message,
            suggestion: isCredits
                ? '⚠️ AI credits have been exhausted. Please top up your xAI API account at console.x.ai to continue receiving AI suggestions.'
                : null
        }, { status: isCredits ? 402 : 500 });
    }
}
