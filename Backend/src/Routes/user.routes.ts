import express from "express"
import { wrapAsyncRouteHandler } from "../Utility/wrapAsync";
import { createUser,loginUser, verifyUser } from "../controllers/user.controller";
const router = express.Router();

router.post("/signup",wrapAsyncRouteHandler(createUser));
router.post("/login",wrapAsyncRouteHandler(loginUser));
router.get("/auth/status",verifyUser,wrapAsyncRouteHandler(loginUser));

export default router;