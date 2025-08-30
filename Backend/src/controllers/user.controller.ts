import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function createUser(req: Request, res: Response) {
  console.log("Requestt recieved", req.body);
  if (req.body && req.body.userData.email) {
    const { email, password, firstName, lastName, userName } = req.body.userData;
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
        userName
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
    return res.status(400).send("User not Exists!!");
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
    { userId: existingUser._id ,userName:existingUser.userName},
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
export async function sendUser(req: Request, res: Response) {}

export async function verifyUser(req: Request, res: Response) {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login");
    }
    const isVerified = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    if (!isVerified) {
      res.status(503).send("Error Occurred!! While verifying your Code");
    }
    req.user = { userId: isVerified.userId };
    return res.send("verifying..");
  } catch (err) {
    console.log("kya kar rha hai be error aa gayi catch karliya..", err);
    return res.status(500).send("Lode lag gaye");
  }
}

export async function checkUniqueUsername(req: Request, res: Response) {
  const { userName } = req.query;
  if(!userName){
    return res.status(400).send("UserName required!!");
  }
  const existingUserWithUsername = await User.findOne({userName});
  console.log("UserName dekh existingUser se",existingUserWithUsername);
  if(!existingUserWithUsername){
    return res.send(true)
  }
  res.send(false);
}
