import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
});

const InvestmentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
});

const FinanceEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    income: { type: Number, default: 0 },
    incomeSource: { type: String, default: '' },
    expenses: [ExpenseSchema],
    investments: [InvestmentSchema],
    savings: { type: Number, default: 0 },
    aiSuggestion: { type: String, default: '' },
    savedAt: { type: Date, default: Date.now },
});

export default mongoose.models.FinanceEntry || mongoose.model('FinanceEntry', FinanceEntrySchema);
