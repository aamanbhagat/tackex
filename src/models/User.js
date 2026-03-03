import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    age: { type: Number, required: true },
    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'moderate' },
    goals: {
        calories: { type: Number, default: 2000 },
        protein: { type: Number, default: 50 },
        carbs: { type: Number, default: 250 },
        fat: { type: Number, default: 65 },
        water: { type: Number, default: 3 },
        sleep: { type: Number, default: 8 },
        steps: { type: Number, default: 10000 },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
