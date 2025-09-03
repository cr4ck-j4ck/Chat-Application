import axios, { AxiosError } from "axios";
import { type Iuser } from "@/Store/user.store";
const BackendURL = import.meta.env.VITE_BACKEND_URL;
interface IuserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function createUser(userData: IuserData) {
  console.log("passed Content is ", userData);
  const res = await axios.post(
    `${BackendURL}/user/signup`,
    {
      userData,
    },
    { withCredentials: true }
  );
  return res.data;
}
export async function loginUser(userData: {
  email: string;
  password: string;
}): Promise<Iuser | Error> {
  try {
    const res = await axios.post(
      `${BackendURL}/user/login`,
      { userData },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      console.log(err);
      return new Error(err.response?.data);
    }
    return new Error("Something went wrong!!");
  }
}

type IgetUser = [Error, null] | [null, Iuser];

export const getUser = async (): Promise<IgetUser> => {
  try {
    const res = await axios.get(`${BackendURL}/user/auth/status`, {
      withCredentials: true,
    });
    return [null, res.data];
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 401) {
      return [new Error(err.response.data), null];
    } else {
      return [new Error("Error Occurred "), null];
    }
  }
};

export const isUserNameAvalable = async (
  userName: string
): Promise<boolean> => {
  const res = await axios.get(
    `${BackendURL}/user/isUsername?userName=${userName}`
  );
  return res.data;
};

export const sendFriendRequest = async (
  toUserName: string
): Promise<string> => {
  try {
    const res = await axios.post(
      `${BackendURL}/user/friendRequest`,
      { toUserName },
      { withCredentials: true }
    );
    if (res.data === "Request Sent") {
      return res.data;
    }
    return "Some error Occurred!";
  } catch (err) {
    if (err instanceof AxiosError) {
      return err.response?.data;
    }
    console.log(err);
    return "Some Error Occurred While Sending the Friend Request";
  }
};
export interface IfriendRequests {
  firstName: string;
  lastName: string;
  userName: string;
  _id: string;
}

export interface Ifriends extends IfriendRequests {
  online: boolean;
}

interface IfriendList {
  friendRequestList: IfriendRequests[] | undefined;
  friends: Ifriends[] | undefined;
}
export const fetchFriendList = async (): Promise<IfriendList | Error> => {
  const response = await axios.get(`${BackendURL}/user/friendList`, {
    withCredentials: true,
  });
  console.log("yeh Response aaya hai ", response.data);
  if (response.data) {
    return response.data;
  }
  return new Error("Some Error occurred");
};

export const acceptFriendRequest = async (id: string): Promise<Ifriends> => {
  const res = await axios.post(
    `${BackendURL}/user/acceptFriendRequest`,
    {
      userId: id,
    },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const rejectFriendRequest = async (id: string) => {
  const res = await axios.delete(
    `${BackendURL}/user/friendRequest?userId=${id.trim()}`,
    { withCredentials: true }
  );
  return res.data;
};

export const removeFriend = async (id: string) => {
  const res = await axios.delete(
    `${BackendURL}/user/friends?friendId=${id.trim()}`,
    { withCredentials: true }
  );
  return res.data;
};
