import { Socket } from "socket.io-client";
import { create } from "zustand";
type Tfetch = "error" | "success" | "processing" | "resting";
export interface IglobalStore {
  socket:Socket | null,
  fetchResult:Tfetch;
  setFetchResult:(toUpdate:Tfetch)=> void;
  setSocket: (toUpdate : Socket|null)=> void;
}

const useGlobalStore = create<IglobalStore>((set) => ({
  socket : null,
  fetchResult:"resting",
  setFetchResult(toUpdate){
    set({fetchResult:toUpdate})
  },
  setSocket(toUpdate) {
    set({socket:toUpdate});
  }
})
)

export default useGlobalStore;
