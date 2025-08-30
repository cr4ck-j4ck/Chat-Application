import axios,{AxiosError} from "axios";
import { type Iuser } from "@/Store/user.store";
const BackendURL = import.meta.env.VITE_BACKEND_URL;
interface IuserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function createUser(userData: IuserData) {
  console.log("passed Content is ",userData)
  const res = await axios.post(
    `${BackendURL}/user/signup`,
    {
      userData
    },
    { withCredentials: true }
  );
  return res.data;
}
export async function loginUser(userData:{email:string,password:string}):Promise<Iuser>{
  const res = await axios.post(`${BackendURL}/user/login`,{userData},{withCredentials:true});
  return res.data;
}

type IgetUser = [Error, null] | [null, Iuser];

export const getUser = async ():Promise<IgetUser> => {
  try {
    const res = await axios.get(`${BackendURL}/user/auth/status`, {
      withCredentials: true,
    });
    return [null,res.data];
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 401) {
      return [new Error(err.response.data),null];
    } else {
      return [new Error("Error Occurred "),null]
    }
  }
};

export const isUserNameAvalable = async(userName:string):Promise<boolean> => {
  const res = await axios.get(`${BackendURL}/user/isUsername?userName=${userName}`);
  return res.data;
}