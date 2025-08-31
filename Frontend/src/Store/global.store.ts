import { Socket } from "socket.io-client";
import { create } from "zustand";

export interface IglobalStore {
  socket:Socket | null,
  setSocket: (toUpdate : Socket|null)=> void;
}

const useGlobalStore = create<IglobalStore>((set) => ({
  socket : null,
  setSocket(toUpdate) {
    set({socket:toUpdate});
  },
}));

export default useGlobalStore;
