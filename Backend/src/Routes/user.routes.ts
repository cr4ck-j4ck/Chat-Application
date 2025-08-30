import express from "express"
import { wrapAsyncRouteHandler } from "../Utility/wrapAsync";
import { createUser,loginUser, verifyUser, checkUniqueUsername } from "../controllers/user.controller";
const router = express.Router();

router.post("/signup",wrapAsyncRouteHandler(createUser));
router.post("/login",wrapAsyncRouteHandler(loginUser));
router.get("/auth/status",verifyUser,wrapAsyncRouteHandler(loginUser));
router.get("/isUsername",wrapAsyncRouteHandler(checkUniqueUsername))
export default router;