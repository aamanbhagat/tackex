import mongoose from 'mongoose';

const DailySummarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    habitsCompleted: { type: Number, default: 0 },
    habitsTotal: { type: Number, default: 0 },
    caloriesConsumed: { type: Number, default: 0 },
    proteinConsumed: { type: Number, default: 0 },
    carbsConsumed: { type: Number, default: 0 },
    fatConsumed: { type: Number, default: 0 },
    waterIntake: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    wakeUpTime: { type: String, default: '' },
    bedTime: { type: String, default: '' },
    incomeTotal: { type: Number, default: 0 },
    expenseTotal: { type: Number, default: 0 },
    investmentTotal: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 }, // 0-100
    aiFeedback: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DailySummary || mongoose.model('DailySummary', DailySummarySchema);
