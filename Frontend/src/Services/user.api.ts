import axios, { AxiosError } from "axios";
import type {
  IresponseUser,
  IfriendRequests,
  Ifriends,
} from "@/Store/user.store";
import type { IMessage } from "@/Store/communication.store";
const BackendURL = import.meta.env.VITE_BACKEND_URL;
interface IuserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function createUser(userData: IuserData) {
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
}): Promise<IresponseUser | Error> {
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

type IgetUser = [Error, null] | [null, IresponseUser];

export const getUser = async (): Promise<IgetUser> => {
  try {
    const res = await axios.get(`${BackendURL}/user/auth/status`, {
      withCredentials: true,
    });
    return [null, res.data];
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        // User is not authenticated - this is expected for new visitors
        return [new Error("UNAUTHENTICATED"), null];
      } else {
        // Other server errors
        return [new Error(err.response?.data || "Server error"), null];
      }
    } else {
      return [new Error("Network error"), null];
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
  userDataForRequests: IfriendRequests,friendUsername:string
): Promise<string> => {
  try {
    const res = await axios.post(
      `${BackendURL}/user/friendRequest`,
      { friendRequestsBody : userDataForRequests,friendUsername },
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

interface IfriendList {
  friendRequestList: IfriendRequests[] | undefined;
  friends: Ifriends[] | undefined;
}
export const fetchFriendList = async (): Promise<IfriendList | Error> => {
  const response = await axios.get(`${BackendURL}/user/friendList`, {
    withCredentials: true,
  });
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

export const removeFriend = async (id: string):Promise<string> => {
  try {
    const res = await axios.delete(
      `${BackendURL}/user/friends?friendId=${id.trim()}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    if(err instanceof AxiosError){
      return err.response?.data;
    }
    return "Error while Removing the Friend!!";
  }
};

import type { IConversation } from "@/Types/conversation.types";

export const fetchUserConversations = async (): Promise<IConversation[]> => {
  try {
    const res = await axios.get(`${BackendURL}/user/conversations`, {
      withCredentials: true
    });
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err.response?.data || "Failed to fetch conversations");
    }
    throw new Error("Failed to fetch conversations");
  }
};

export const fetchConversationMessages = async (conversationId: string): Promise<IMessage[]> => {
  try {
    const res = await axios.get(`${BackendURL}/user/conversations/${conversationId}/messages`, {
      withCredentials: true
    });
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err.response?.data || "Failed to fetch messages");
    }
    throw new Error("Failed to fetch messages");
  }
};

