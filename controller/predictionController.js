import Prediction from "../model/predictionModel.js";
import factory from "../controller/handlerFactory.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const test = (req, res) => {
  res.json({ message: "Prediction route is working" });
};

export const freePrediction = catchAsync(async (req, res, next) => {
  // Get only free predictions + all past premium ones
  const predictions = await Prediction.find({
    $or: [
      { type: "free" }, // Always visible
      { type: "premium", status: "past" }, // Premium past = visible
    ],
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: predictions.length,
    data: { predictions },
  });
});

// ✅ Get all predictions with rules applied
export const getAllPredictions = catchAsync(async (req, res, next) => {
  let filter = {
    $or: [
      { type: "free" }, // Free predictions always visible
      { type: "premium", status: "past" }, // Past premium visible to all
    ],
  };

  // If user is approved → include current premium predictions too
  if (req.user && req.user.approved) {
    filter = {}; // Approved users can see everything
  }

  const predictions = await Prediction.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: predictions.length,
    data: { predictions },
  });
});

// ✅ Get single prediction with rules applied
export const getPrediction = catchAsync(async (req, res, next) => {
  const prediction = await Prediction.findById(req.params.id);

  if (!prediction) {
    return next(new AppError("No prediction found with that ID", 404));
  }

  // If prediction is free → always allow
  if (prediction.type === "free") {
    return res.status(200).json({
      status: "success",
      data: { prediction },
    });
  }

  // If premium + past → allow everyone
  if (prediction.type === "premium" && prediction.status === "past") {
    return res.status(200).json({
      status: "success",
      data: { prediction },
    });
  }

  // If premium + current → only allow approved users
  if (prediction.type === "premium" && prediction.status === "current") {
    if (!req.user || !req.user.approved) {
      return next(
        new AppError("You are not approved to view this prediction", 403)
      );
    }
    return res.status(200).json({
      status: "success",
      data: { prediction },
    });
  }
});

// ✅ Create prediction (Admin only)
export const createPrediction = factory.createOne(Prediction);

// ✅ Update prediction (Admin only)
export const updatePrediction = factory.updateOne(Prediction);

// ✅ Delete prediction (Admin only)
export const deletePrediction = factory.deleteOne(Prediction);

// ✅ Update result (Admin only)
export const updateResult = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { result } = req.body;

  // Validate result value against enum
  if (!["pending", "correct", "wrong"].includes(result)) {
    return next(new AppError("Invalid result value", 400));
  }

  const prediction = await Prediction.findByIdAndUpdate(
    id,
    { result },
    { new: true, runValidators: true }
  );

  if (!prediction) {
    return next(new AppError("No prediction found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { prediction },
  });
});
