import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const protect = catchAsync(async (req, res, next) => {
  let token = null;

  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in!", 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    // BLOCK inactive users
    if (currentUser.active === false) {
      return next(
        new AppError(
          "This user is no longer active. Please contact support.",
          401
        )
      );
    }
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
