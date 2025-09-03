import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { IpopulatedUser } from "../Types/interface.";

export async function createUser(req: Request, res: Response) {
  if (req.body && req.body.userData.email) {
    const { email, password, firstName, lastName, userName } =
      req.body.userData;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).send("User Already Exists!!.. You have to login");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = (
      await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userName,
      })
    ).toObject();
    const { password: pwd, ...filteredUser } = newUser;
    res.json(filteredUser);
    // const newUser = await User.create({
    //   email,
    // })
  } else {
    res.status(200).send("Please provide Data Correctly!!");
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body.userData;
  if (!req.body && !email && !password) {
    return res
      .status(400)
      .send("Please provide Sufficient Data to start your query!");
  }
  console.log(email, password);
  const existingUser = await User.findOne({ email: email });
  if (!existingUser) {
    return res.status(400).send("User Not Exists with this Email !!");
  }
  if (!existingUser.password) {
    return res
      .status(400)
      .send("It seems like you've not created any password!!");
  }
  const comparisonResult = await bcrypt.compare(
    password,
    existingUser.password
  );
  if (!comparisonResult) {
    return res.status(401).send("Wrong password!");
  }
  const token = jwt.sign(
    { userId: existingUser._id, userName: existingUser.userName },
    process.env.JWT_SECRET!,
    { expiresIn: "6d" }
  );
  const refreshToken = jwt.sign(
    { userId: existingUser._id },
    process.env.JWT_SECRET!,
    { expiresIn: "15d" }
  );
  res.cookie("token", token, { httpOnly: true, maxAge: 1000 * 60 * 60 });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  });
  res.send("User Loggined Successfully!!");
}

export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login");
    }
    const isVerified = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      userName: string;
    };
    if (!isVerified) {
      res.status(503).send("Error Occurred!! While verifying your Code");
    }
    const existingUser = await User.findById(isVerified.userId).lean();
    if (!existingUser) {
      return res.status(401).send("User Doesn't Exists");
    }
    if (req.originalUrl === "/user/auth/status") {
      const { password, ...responseObject } = existingUser;
      return res.json(responseObject);
    }
    req.user = { userId: isVerified.userId, userName: isVerified.userName };
    next();
  } catch (err) {
    console.log(
      "kya kar rha hai be error aa gayi catch karliya.. lekin yeh catch hua hai cathc mein",
      err
    );
    return res.status(500).send("lag gaye");
  }
}

export async function checkUniqueUsername(req: Request, res: Response) {
  const { userName } = req.query;
  if (!userName) {
    return res.status(400).send("UserName required!!");
  }
  const existingUserWithUsername = await User.findOne({ userName });
  console.log("UserName dekh existingUser se", existingUserWithUsername);
  if (!existingUserWithUsername) {
    return res.send(true);
  }
  res.send(false);
}

export async function addUserNameToFriendList(req: Request, res: Response) {
  const { toUserName } = req.body;
  if (!toUserName) {
    return res.status(400).send("Please provide Enough Data!");
  }

  const requestSentToTheUser = await User.findOneAndUpdate(
    { userName: toUserName },
    { $addToSet: { friendsRequests: req.user.userId } }, // prevents duplicates
    { new: true }
  );
  if (!requestSentToTheUser) {
    return res.status(400).send("User Doesn't Exists!!");
  }
  const io = req.app.get("io") as Server;
  io.to(toUserName).emit("receivedRequest", req.user.userName);
  res.send("Request Sent");
}

export async function friendsData(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(400).send("Please Login First!!");
  }
  const friendListData = await User.findById(user.userId, { _id: false })
    .populate<{ friendsRequests: IpopulatedUser[] }>({
      path: "friendsRequests",
      select: "firstName lastName userName avatar",
    })
    .populate<{ friends: IpopulatedUser[] }>({
      path: "friends",
      select: "firstName lastName userName avatar",
    })
    .lean();
  res.json({
    friendRequestList: friendListData?.friendsRequests,
    friends: friendListData?.friends,
  });
}

export async function acceptFriendRequest(req: Request, res: Response) {
  try {
    const { userId: acceptedFriendId } = req.body;

    if (!acceptedFriendId) {
      return res.status(400).send("Please provide the user ID!");
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { friendsRequests: acceptedFriendId },
      $push: { friends: acceptedFriendId },
    });
    const updatedRequestUser= await User.findByIdAndUpdate(acceptedFriendId, {
      $addToSet: { friends: req.user.userId }      
    },{new:true}).lean();
    if (updatedRequestUser) {
      const responseJson = {
        firstName:updatedRequestUser.firstName,
        lastName:updatedRequestUser.lastName,
        userName:updatedRequestUser.userName,
        _id:updatedRequestUser._id,
        online:updatedRequestUser.status
      }
      const socket = req.app.get("io") as Server;
      socket
        .to(updatedRequestUser.userName)
        .emit("acceptedFriendRequest", req.user.userName);
      return res.status(200).json(responseJson);
    }
    res.status(500).send("Some Error Ocurred!!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
}

export async function rejectFriendRequest(req: Request, res: Response) {
  const { userId: requestedFriendId } = req.query;
  await User.findByIdAndUpdate(req.user.userId, {
    $pull: { friendsRequests: requestedFriendId },
  });
  res.send("Rejected SuccessFully!!");
}

export async function removeFriend(req: Request, res: Response) {
  const { friendId } = req.query;
  if (!friendId) {
    return res
      .status(403)
      .send("Please Provide the Friend ID you want to remove");
  }
  const removerFriend = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $pull: { friends: friendId },
    },
    { new: true }
  );
  const removedFriend = await User.findByIdAndUpdate(
    friendId,
    {
      $pull: { friends: req.user.userId },
    },
    { new: true }
  );
  console.log("ho gaye remove!!");
  console.log(removerFriend);
  console.log(removedFriend);
  res.send("Friend Removed SuccessFully!!");
}
