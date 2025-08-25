import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/apiFeatures.js";

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: { data: doc },
    });
  });

export const getOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // If there's a populate option
    if (options.populate) {
      query = query.populate(options.populate);
    }

    // If there's a select option
    if (options.select) {
      query = query.select(options.select);
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
  });

export const getAll = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    // Allow filtering by a specific tour if tourId exists in params
    if (req.params.tourId) {
      filter.tour = req.params.tourId;
    }

    let query = Model.find(filter);

    // Apply select fields if provided
    if (options.select) {
      query = query.select(options.select);
    }

    // Apply populate if provided
    if (options.populate) {
      query = query.populate(options.populate);
    }

    // Apply API features: filtering, sorting, limiting fields, pagination
    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

export default {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
};
