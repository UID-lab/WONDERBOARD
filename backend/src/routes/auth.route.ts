import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import {
  googleLoginCallback,
  loginController,
  logOutController,
  registerUserController,
} from "../controllers/auth.controller";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginController);

authRoutes.post("/logout", logOutController);

authRoutes.get("/google", (req, res, next) => {
  // Pass the state parameter to preserve returnUrl/invite info
  const state = req.query.state as string;
  const authenticateOptions: any = {
    scope: ["profile", "email"],
  };

  if (state) {
    authenticateOptions.state = state;
  }

  passport.authenticate("google", authenticateOptions)(req, res, next);
});

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  googleLoginCallback
);

export default authRoutes;
