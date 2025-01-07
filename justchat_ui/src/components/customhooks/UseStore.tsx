import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type messageType = {
  text: string,
  message_id: string,
  created_at: string,
  audio: string | null,
  image: string | null,
  video: string | null,
  file: string | null,
  sender?: number | string,
  receipient?: string | number,
  is_receipient_online: boolean,

}


type groupMessageType = {
  message_id: string | null,
  image: string | null,
  video: string | null,
  audio: string | null,
  text: string | null,
  file: string | null,
  group: string | null,
  created_at: string | null,
  sender: {
    id: number,
    username: string
    profile_image: string | null,
  } | null
}


type groupProfileType = {
  group_id: string | number,
  group_name: string,
  group_photo: string | null,
  messages: groupMessageType[] | null,
}

type friendProfileType = {
  friend_id: string | undefined,
  username: string | undefined,
  profile_image: string | undefined,
  is_online: boolean,
  last_date_online: string | null,
  messages: messageType[] | null, 
}

type stateType = {
    currentPath: string | null,
    messageWebsocket: null | WebSocket,
    isPasswordChanged: boolean,
    friendProfile: friendProfileType | null,
    groupProfile: groupProfileType | null,
    image: any | null,
    recordStream: MediaRecorder | null,
    apiUrl: string | null,
    groupSectionRef: any | null,
    showImage: (() => void) | null,
    scrollToLastMsg: (() => void) | null,
    setFriendProfile: (profile: friendProfileType) => void,
    setScrollToLastMsg: (func: () => void) => void,
    setMessageWebsocket: (socket: WebSocket) => void,
    changePasswordChangeStatus: (status: boolean) => void,

  }
  
  const useStore = create<stateType>()(immer((set) => ({
    currentPath: null,
    messageWebsocket: null,
    isPasswordChanged: false,
    image: null,
    showImage: null,
    recordStream: null,
    apiUrl: null,
    groupSectionRef: null,
    scrollToLastMsg: null as (() => void) | null,
    friendProfile: null as friendProfileType | null,
    groupProfile: null as groupProfileType | null,
    setScrollToLastMsg: (func) => set((state: stateType) => {state.scrollToLastMsg = func}),
    setFriendProfile: (profile: friendProfileType) => set((state: stateType) => {state.friendProfile = profile}),

    setMessageWebsocket: (socket: WebSocket) =>  set((state: stateType) => {
      state.messageWebsocket = socket
    }),

    changePasswordChangeStatus: (status: boolean) => set((state: stateType) => {
      state.isPasswordChanged = status
    }),
  

  })));
  
  export default useStore;