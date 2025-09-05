import { create } from "zustand";
export interface IfriendRequests {
  firstName: string;
  lastName: string;
  userName: string;
  _id: string;
}

export interface Ifriends extends IfriendRequests {
  avatar?: string;
  isOnline: boolean;
  isPinned: boolean;
  isMuted: boolean;
  type: "Personal";
  lastMessage?: string;
  unreadCount: number;
  timestamp: string;
}
export interface IresponseUser {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  avatar: string;
  provider: string;
  status: string;
  blockedUsers: [];
  chats: [];
  socketId: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  friendsRequests: IfriendRequests[];
  friends: Ifriends[];
}

interface IuserStore {
  user: IresponseUser | null;
  setUser: (toUpdate: IresponseUser) => void;
  setFriends: (toUpdate: Ifriends | Ifriends[]) => void;
  addFriendRequests: (toUpdate: IfriendRequests) => void;
  removeFriendRequests: (toUpdate: string) => void;
}

const useUserStore = create<IuserStore>((set, get) => ({
  user: null,
  setUser(toUpdate) {
    set({ user: toUpdate });
  },
  setFriends: function (toUpdate) {
    const user = get().user;
    if (user) {
      set({
        user: {
          ...user,
          friends:
            toUpdate instanceof Array ? toUpdate : [...user.friends, toUpdate],
        },
      });
    }
  },
  addFriendRequests(toUpdate) {
    set((state) => {
      if (state.user) {
        return {
          user: {
            ...state.user,
            friendsRequests: [...state.user.friendsRequests, toUpdate], // Add toUpdate to the array
          },
        };
      } else {
        return state;
      }
    });
  },
  removeFriendRequests(toUpdate){
    set(state => {
      if(state.user){
        return {user:{...state.user,friendsRequests:state.user.friendsRequests.filter(el => el._id!=toUpdate)}}
      }else{
        return state;
      }
    })
  }
}));

export default useUserStore;
