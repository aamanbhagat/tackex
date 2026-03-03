import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    icon: { type: String, default: '✅' },
    color: { type: String, default: '#6C63FF' },
    frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
    customDays: [{ type: Number }], // 0-6 for Sun-Sat
    completions: [{
        date: { type: String, required: true }, // YYYY-MM-DD format
        completed: { type: Boolean, default: false },
        time: { type: String }, // HH:mm
    }],
    streak: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
