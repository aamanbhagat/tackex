import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: String, default: '1 serving' },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    vitamins: {
        A: { type: Number, default: 0 },
        B1: { type: Number, default: 0 },
        B2: { type: Number, default: 0 },
        B3: { type: Number, default: 0 },
        B6: { type: Number, default: 0 },
        B12: { type: Number, default: 0 },
        C: { type: Number, default: 0 },
        D: { type: Number, default: 0 },
        E: { type: Number, default: 0 },
        K: { type: Number, default: 0 },
    },
    minerals: {
        iron: { type: Number, default: 0 },
        calcium: { type: Number, default: 0 },
        zinc: { type: Number, default: 0 },
        magnesium: { type: Number, default: 0 },
        potassium: { type: Number, default: 0 },
        sodium: { type: Number, default: 0 },
    },
});

const MealSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Breakfast, Lunch, Dinner, Snack
    time: { type: String }, // HH:mm
    foods: [FoodItemSchema],
    aiSuggestion: { type: String, default: '' },
});

const DietEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    meals: [MealSchema],
    waterIntake: { type: Number, default: 0 }, // liters
    totals: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
    },
    aiDaySuggestion: { type: String, default: '' },
    savedAt: { type: Date, default: Date.now },
    isDayFinalized: { type: Boolean, default: false },
});

export default mongoose.models.DietEntry || mongoose.model('DietEntry', DietEntrySchema);
