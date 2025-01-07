import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef} from "react"
import { NavigateFunction, useNavigate } from "react-router"
import axios from "axios"
import useStore from "./customhooks/UseStore"
import { useAnimate } from "framer-motion"
import dogs from "../assets/images/dogs.png"





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



type groupType = {
    group_id: string,
    group_name: string,
    group_photo: string | null,
    last_message: groupMessageType,
} | null

type propType = {
    showMessageBox: () => void,
    group: groupType
}



const Group = ({showMessageBox, group}: propType) => {
    const [scope, animate] = useAnimate()
    const navigateToChat = useNavigate()
    const currentPath = useStore(state => state.currentPath)
    const imgRef = useRef<HTMLImageElement>(null!)
    const navigateToLogin = useNavigate(); 
    const showImage = useStore(state => state.showImage);
    const paraRef = useRef<HTMLParagraphElement>(null!)
    const {data: groupMessages, isSuccess} = useQuery({
        queryKey: ["messages", group?.group_id],
        queryFn: () => fetchFunc(`https://justchat-api.onrender.com/api/users/${group?.group_id}/get_user_and_group_msgs/`, navigateToLogin),
       // initialData: () => queryClient.getQueryData(["messages", friend.id]),
        refetchInterval: 2500,
        cacheTime: 0,
        staleTime: 0,
    });

    const navigateToMessageChatBox = () => {
    navigateToChat(`/home/group/${group?.group_id}`)
    showMessageBox();
    const groupProfile  = {
        group_id: group?.group_id as string | number,
        group_name: group?.group_name as string,
        group_photo: group?.group_photo ?? dogs,
        messages: groupMessages ? groupMessages : [],
    }
    
    useStore.setState({friendProfile: null, groupProfile, apiUrl: `https://justchat-api.onrender.com/api/users/${group?.group_id}/send_message_to_group/`});

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
        const {access} = JSON.parse(sessionStorage.getItem("userProfile")!);
        if (group?.group_id) {
            const messageWebsocket = new WebSocket(`wss://justchat-api.onrender.com/ws/groupchat/${group.group_id}/?access=${access}`);
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
                      if (message.group === group.group_id) {
                          console.log("is typing")
                          showIsTyping()
                      }
                  } else {
                    //const userProfile = JSON.parse(sessionStorage.getItem("userProfile")!);
                      //console.log(currentPath)
                      /*if (message.group === group.group_id && currentPath === `/home/group/${group.group_id}` && userProfile.id != message.sender.id) {
                          console.log("SENDER")
                          console.log(currentPath)
                          const updatedMessages: groupMessageType[]  = [...groupProfile?.messages!, message]
                          useStore.setState({groupProfile: {
                          group_id: group.group_id,
                          group_name: group.group_name,
                          group_photo: group.group_photo,
                          messages: updatedMessages,
                         }, friendProfile: null})
                         console.log("THIS IS UPDATE MESSAGES", updatedMessages)
                         scrollToLastMsg();
                      }*/
  
                  }
  
              }
          }
          messageWebsocket.onclose = () => {
          console.log("connection closed successfully")
          }
          //setMessageWebsocket(messageWebsocket)
          }
    }, [groupMessages])

    const displayImage = () => {
        showImage?.();
        const {image} = useStore.getState();
        image.src = imgRef.current.src;

    }

    useEffect(() => {
        if (isSuccess) {
            console.log("MY CURRENT PATH", currentPath)
            if (useStore.getState().currentPath === `/home/group/${group?.group_id}`)
            {
                useStore.setState({groupProfile: {
                    group_id: group?.group_id as string,
                    group_name: group?.group_name as string,
                    group_photo: group?.group_photo as string | null,
                    messages: groupMessages,
                }, friendProfile: null})
               navigateToMessageChatBox()
            }

            console.log(groupMessages)
        }        

    }, 
    [isSuccess, groupMessages])

  return (
    <div onClick={navigateToMessageChatBox} id={group?.group_id} className="w-[100%] ld:last:mb-[40px] last:mb-[80px] cursor-pointer h-[60px] border-b-[1px]  transform scale-95 flex justify-between items-center">
        <div className="w-[55%] h-[80%] flex justify-between items-center">
            <div className="w-[50px] h-[50px]  rounded-full  flex justify-center items-center">
            <img onClick={displayImage}  ref={imgRef} className="w-[40px] object-cover  h-[40px] rounded-full" src={group?.group_photo ?? dogs} alt="" />
            </div>

            <div className="w-[70%] h-[40px] pl-1 flex flex-col justify-center text-gray-700  items-start ">
                <h1 className="font-spaceMono tracking-tighter font-semibold truncate">{group?.group_name}</h1>
                <p ref={scope} className="text-[14px] hidden font-thin text-gray-800 italic">typing ...</p>
                <p ref={paraRef} className="font-muli w-[90%] text-gray-900 truncate text-[14px] font-thin">{ group?.last_message?.text}</p>
            </div>
        </div>
        <div className="w-[30%] relative h-[40px]">
            <p className="absolute top-0 right-0 text-gray-500 ld:tracking-tight md:tracking-wide text-[10px] font-thin ">{group?.last_message?.created_at}</p>
        </div>
    </div>
  )
}

export default Group;
