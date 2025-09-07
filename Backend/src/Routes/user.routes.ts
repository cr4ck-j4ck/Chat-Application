import express from "express";
import { wrapAsyncRouteHandler } from "../Utility/wrapAsync";
import {
  createUser,
  loginUser,
  verifyUser,
  checkUniqueUsername,
  acceptFriendRequest,
  addUserNameToFriendList,
  friendsData,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  getUserConversations,
  getConversationMessages,
} from "../controllers/user.controller";
const router = express.Router();

router.post("/signup", wrapAsyncRouteHandler(createUser));
router.post("/login", wrapAsyncRouteHandler(loginUser));
router.get("/auth/status", verifyUser);
router.get("/isUsername", wrapAsyncRouteHandler(checkUniqueUsername));
router.get("/search", verifyUser, wrapAsyncRouteHandler(searchUsers));
router.get("/conversations", verifyUser, wrapAsyncRouteHandler(getUserConversations));
router.get("/conversations/:id/messages", verifyUser, wrapAsyncRouteHandler(getConversationMessages));
router
  .route("/friendRequest")
  .post(verifyUser, wrapAsyncRouteHandler(addUserNameToFriendList))
  .delete(verifyUser, wrapAsyncRouteHandler(rejectFriendRequest));
router.get("/friendList", verifyUser, wrapAsyncRouteHandler(friendsData));
router
  .route("/acceptFriendRequest")
  .post(verifyUser, wrapAsyncRouteHandler(acceptFriendRequest));
export default router;
router.delete("/friends",verifyUser,wrapAsyncRouteHandler(removeFriend))