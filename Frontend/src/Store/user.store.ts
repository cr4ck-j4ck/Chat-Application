import { create } from "zustand";

export interface Iuser {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
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
