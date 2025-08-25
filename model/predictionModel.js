import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema({
  match: {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
  },
  prediction: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 100 },
  type: { type: String, enum: ["free", "premium"], default: "free" }, // free or premium
  result: {
    type: String,
    enum: ["pending", "correct", "wrong"],
    default: "pending",
  },
  status: { type: String, enum: ["past", "current"], default: "current" }, // past = historical, current = needs approval for premium
  createdAt: { type: Date, default: Date.now },
});

const Prediction = mongoose.model("Prediction", PredictionSchema);

export default Prediction;
