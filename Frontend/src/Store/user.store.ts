import { create } from "zustand";

export interface Iuser {
  userName:string
  firstName: string;
  lastName: string;
  email: string;
}

interface IuserStore {
  user: Iuser | null;
  setUser: (toUpdate: Iuser) => void;
}

const useUserStore = create<IuserStore>((set) => ({
  user:null,
  setUser(toUpdate) {
    set({ user: toUpdate });
  },
}));

export default useUserStore;
