import { useQuery } from "@tanstack/react-query"
import dog from "../assets/images/dog_avatar.png"
import { useEffect, useRef} from "react"
import { NavigateFunction, useNavigate } from "react-router"
import axios from "axios"
import useStore from "./customhooks/UseStore"
import { useAnimate } from "framer-motion"


type messageType = {
    text: string,
    message_id: string,
    created_at: string,
    audio: string | null,
    image: string | null,
    video: string | null,
    file: string | null,
    sender?: number | number,
    receipient?: string | number,
    is_receipient_online: boolean,
  
  }



type  userStatusType = {
    id: string | number,
    username: string,
    email: string,
    profile_image: string | null,
    access: string,
    refresh: string,
}

const fetchFunc = async (url: string, navigateToLogin: NavigateFunction) => {
    console.log("errror in userequest")
    try {
        const userStatus: userStatusType = JSON.parse(sessionStorage.getItem("userProfile")!);
        let config = {
            headers: { Authorization: "Bearer " + userStatus.access },
        };
        const response = await axios.get(url, config);
        if (response.status === 200 || response.status === 201) {
            console.log("url", url)
            return response.data;
        }
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            const userStatus: userStatusType = JSON.parse(sessionStorage.getItem("userProfile")!);
            if (userStatus && userStatus.refresh) {
                try {
                    const refreshResponse = await axios.post("https://justchat-api.onrender.com/token-refresh/", { refresh: userStatus.refresh });
                    if (refreshResponse.status === 200) {
                        userStatus.access = refreshResponse.data.access;
                        sessionStorage.setItem("userProfile", JSON.stringify(userStatus));
                        const config = {
                            headers: { Authorization: "Bearer " + userStatus.access },
                        };
                        const retryResponse = await axios.get(url, config);
                        if (retryResponse.status === 200) {
                            return retryResponse.data;
                        } else {
                            throw new Error ("failed to refresh token")
                        }
                    }
                } catch {
                    navigateToLogin("/log-in/");
                    throw new Error("Failed to refresh token.");
                }
            }
        } else {
            throw new Error("Request failed.");
        }
    }
};

type propType = {
    showMessageBox: () => void,
    friend: {
        id: string | undefined,
        username: string,
        profile_image: string | undefined,
        is_online: boolean,
        last_date_online: string,
        last_message: {
            message_id: string | number,
            sender_username: string,
            sender_id: string | number,
            image: string | null,
            video: string | null,
            audio: string | null,
            text: string | null,
            created_at: string | null,
            is_receipient_online: string | null
        } | null
    } 
}



const Friend = ({showMessageBox, friend}: propType) => {
    const [scope, animate] = useAnimate()
    const navigateToChat = useNavigate()
    const setMessageWebsocket = useStore(state => state.setMessageWebsocket)
    const currentPath = useStore(state => state.currentPath)
    const imgRef = useRef<HTMLImageElement>(null!)
    const navigateToLogin = useNavigate();
    const friendProfile = useStore(state => state.friendProfile) 
    const setFriendProfile = useStore(state => state.setFriendProfile)
    const scrollToLastMsg = useStore(state => state.scrollToLastMsg)!
    const paraRef = useRef<HTMLParagraphElement>(null!)
    const {data: messages, isSuccess} = useQuery({
        queryKey: ["messages", friend.id],
        queryFn: () => fetchFunc(`https://justchat-api.onrender.com/api/users/${friend.id}/get_user_and_frnd_msgs/`, navigateToLogin),
       // initialData: () => queryClient.getQueryData(["messages", friend.id]),
        refetchInterval: 2500,
        cacheTime: 0,
        staleTime: 0,
    });

    const navigateToMessageChatBox = () => {
    navigateToChat(`/home/friend/${friend.id}`)
    showMessageBox()
    const profile  = {
        friend_id: friend.id,
        username: friend.username,
        profile_image: friend.profile_image ? friend.profile_image : dog,
        is_online: friend.is_online,
        last_date_online: friend.last_date_online ? friend.last_date_online : null,
        messages: messages ? messages : [],
    }
    useStore.setState({groupProfile: null, apiUrl: `https://justchat-api.onrender.com/api/users/${friend.id}/send_message_to_friend/`});
    setFriendProfile(profile)
    console.log("PROFILE MESSAGES", profile.messages)
    }

    const showIsTyping = () => {
        paraRef.current.classList.add("hidden")
        scope.current.classList.remove("hidden")
        animate(scope.current, {
            opacity: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            transition: {
                duration: 5,
                easeIn: "easeIn"
            }
        })
        setTimeout(() => {
            paraRef.current.classList.remove("hidden")
            scope.current.classList.add("hidden")
        }, 5000)
    }

    useEffect(() => {
        const userStatus = JSON.parse(sessionStorage.getItem("userProfile")!)
        const access = userStatus.access
        if (friend.profile_image === null) {
            if (friend.is_online === true) {
                imgRef.current.classList.remove("filter")
                imgRef.current.classList.remove("grayscale")
                imgRef.current.classList.add("filter")
                imgRef.current.classList.add("drop-shadow-md")
            } 
            else {
                imgRef.current.classList.remove("filter")
                imgRef.current.classList.remove("drop-shadow-md")
                imgRef.current.classList.add("filter")
                imgRef.current.classList.add("grayscale")
            }
        }


        if (friend.id) {
          const messageWebsocket = new WebSocket(`wss://justchat-api.onrender.com/ws/chat/${friend.id}/?access=${access}`);
          messageWebsocket.onopen = () => {
          console.log("connected successfully")
          }
    
          messageWebsocket.onerror = () => {
            console.log("something went wrong")
          }
      
          messageWebsocket.onmessage = (e) => {
            console.log("message", e.data)
            const message = JSON.parse(e.data)
            if (message) {
                if (Object.getOwnPropertyDescriptor(message, "isTyping")) {
                    if (message.sender === friend.id) {
                        console.log("is typing")
                        showIsTyping()
                    }
                } else {
                    console.log(currentPath)
                    if (message.sender === friend.id && currentPath === `/home/friend/${friend.id}`) {
                        console.log("SENDER")
                        console.log(currentPath)
                        const updatedMessages: messageType[]  = [...friendProfile?.messages!, message]
                        useStore.setState({friendProfile: {
                        friend_id: friend.id,
                        username: friend.username,
                        profile_image: friend.profile_image,
                        is_online: friend.is_online,
                        last_date_online: friend.last_date_online,
                        messages: updatedMessages,
                       }, groupProfile: null})
                       console.log("THIS IS UPDATE MESSAGES", updatedMessages)
                       scrollToLastMsg();
                    }

                }
            }
        }
        messageWebsocket.onclose = () => {
        console.log("connection closed successfully")
        }
        setMessageWebsocket(messageWebsocket)
        }
        console.log("username and id ", friend.username, friend.id)
    }, [friend.is_online, messages])

    useEffect(() => {
        if (isSuccess) {
            console.log("MY CURRENT PATH", currentPath)
            if (useStore.getState().currentPath === `/home/friend/${friend.id}`)
            {
                useStore.setState({friendProfile: {
                    friend_id: friend.id,
                    username: friend.username,
                    profile_image: friend.profile_image,
                    is_online: friend.is_online,
                    last_date_online: friend.last_date_online,
                    messages: messages,

                }, groupProfile: null })
               navigateToMessageChatBox()
            }

            console.log(messages)
        }        

    }, 
    [isSuccess, friend.is_online, messages])

  return (
    <div onClick={navigateToMessageChatBox} id={friend.id} className="w-[100%] ld:last:mb-[40px] last:mb-[80px] cursor-pointer h-[60px] border-b-[1px]  transform scale-95 flex justify-between items-center">
        <div className="w-[55%] h-[80%] flex justify-between items-center">
            <div style={{
                outlineColor:friend.is_online ? "#06D001" : "#F4F6FF"
            }} className="w-[50px] h-[50px] outline  outline-[1px] rounded-full  flex justify-center items-center">
            <img ref={imgRef} className="w-[40px]  h-[40px] rounded-full" src={friend?.profile_image ? friend.profile_image : dog} alt="" />
            </div>

            <div className="w-[70%] h-[40px] pl-1 flex flex-col justify-center text-gray-700  items-start ">
                <h1 className="font-spaceMono tracking-tighter font-semibold truncate">{friend.username}</h1>
                <p ref={scope} className="text-[14px] hidden font-thin text-gray-800 italic">typing ...</p>
                <p ref={paraRef} className="font-muli w-[90%] text-gray-900 truncate text-[14px] font-thin">{friend.last_message?.text}</p>
            </div>
        </div>
        <div className="w-[30%] relative h-[40px]">
            <p className="absolute top-0 right-0 text-gray-500 ld:tracking-tight md:tracking-wide text-[10px] font-thin ">{friend.last_message?.created_at}</p>
        </div>
    </div>
  )
}

export default Friend
