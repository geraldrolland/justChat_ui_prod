import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { HiMagnifyingGlass } from "react-icons/hi2";
import "../style.css"
import Friend from "./Friend";
import { Outlet } from "react-router";
import React, { useEffect } from "react";
import UseRequest from "./customhooks/UseRequest";
import { useContext } from "react";
import { logoutContext } from "@/App";
import { MdOutlineGroups } from "react-icons/md";
import CreateGroup from "./CreateGroup";
import Group from "./Group";
import tigar from "../assets/images/tigar.png";
import useStore from "./customhooks/UseStore";
type hideContextType = {
  hideMessageBox: () => void,
}

type friendType = {
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

type groupType = {
  group_id: string,
  group_name: string,
  group_photo: string | null,
  last_message: groupMessageType, 
} | null
export const hideContext = React.createContext<hideContextType>(null!)
const Home = () => {
  const {mutate} = useContext(logoutContext)
  const response = UseRequest("https://justchat-api.onrender.com/api/users/get_friends/",  "friends");
  const {data: groups} = UseRequest("https://justchat-api.onrender.com/api/users/get_groups/",  "groups");
  const showMessgaeBox = () => {
    const messageBox = document.getElementById("message-box")
    messageBox?.classList.add("z-30")
    messageBox?.classList.remove("-z-10")
  }

  const hideMessageBox = () => {
    const messageBox = document.getElementById("message-box")
    messageBox?.classList.remove("z-30")
    messageBox?.classList.add("-z-10")
  }

  const logoutUser = () => {
    console.log("log out")
    mutate()
  }

  const showGroupBox = () => {
    useStore.getState().groupSectionRef.classList.remove("hidden")
    useStore.getState().groupSectionRef.classList.add("flex");
  }

  useEffect(() => {
    console.log("mounted")
    console.log("this response", response?.data)
    const userStatus = JSON.parse(sessionStorage.getItem("userProfile")!)
    const token = userStatus.access
    
    const isUserOnlineWebsocket = new WebSocket(`wss://justchat-api.onrender.com/ws/isuseronline/?access=${token}`)
    isUserOnlineWebsocket.onopen = () => {
      console.log("user connected succcessfully")
    }

    isUserOnlineWebsocket.onerror = () => {
      console.log("something went wrong")
    }

    isUserOnlineWebsocket.onclose = () => {
      console.log("user disconnected successfully")
    }
  }, [])
  return (
    <>
    <div className="lg:w-[1100px] w-screen   lg:shadow-md bg-opacity-50 backdrop-filter backdrop-blur-lg h-screen lg:h-[610px] flex justify-center items-center bg-[#BCF2F6] md:rounded-md">
   <div className="lg:w-[95%] lg:h-[95%] relative  w-[100%] h-[100%] flex justify-evenly items-center">
    <div className="lg:w-[70px] ld:w-[8%] ld:h-[100%] w-screen h-[70px] fixed z-20  right-0 ld:z-0 bottom-0 ld:static lg:rounded-[15px] lg:h-[100%] lg:shadow-md bg-purple-800 flex justify-between ld:flex-col items-center">
      
      <div className="ld:w-[100%] w-[100%] flex ld:flex-col justify-evenly  items-center h-[100%] ld:py-4 lg:h-[50%] md:justify-center  md:gap-6 ld:h-[55%] ">
        <img className="w-[40px] h-[40px] rounded-full filter lg:drop-shadow-md" src={tigar} alt="" />
        <div onClick={showGroupBox} className="w-[70px]  h-[70px] flex justify-center items-center">
        <MdOutlineGroups className="text-gray-300 text-[30px]" />
        </div>
        <div className="w-[70px] h-[70px] flex justify-center items-center">
        <IoChatbubbleEllipsesOutline className="text-gray-200 text-[30px]" />
        </div>
        <div className="w-[70px] h-[70px] flex justify-center items-center">
        <IoMdNotificationsOutline className="text-gray-200 text-[30px]" />
        </div>
        <div className="w-[70px] h-[70px] flex justify-center items-center">
        <IoSettingsOutline className="text-gray-200 text-[30px]" />
        </div>
        <div className="w-[70px] h-[70px] flex justify-center  ld:hidden items-center">
        <IoLogOutOutline onClick={logoutUser}  className="text-gray-200 text-[30px]" />
        </div>
      </div>
      <div onClick={logoutUser} className="w-[70px] h-[70px] hidden ld:flex justify-center   items-center">
        <IoLogOutOutline className="text-gray-200 text-[30px]" />
      </div>
    </div>
    <div className="lg:w-[350px] bg-[#ffff] ld:w-[38%] relative w-[100%] h-[100%]  lg:shadow-md lg:rounded-[15px] bg-500">
    <CreateGroup/>
      <div className="w-[100%]  absolute z-10 h-[45px] top-0 right-0  rounded-tr-[15px] rounded-tl-[15px] transform">
        <input className="w-[100%] h-[100%] focus:outline-none  pl-[50px] lg:rounded-tr-[15px] tracking-wide lg:rounded-[15px] font-arimo text-gray-800" placeholder="Search" type="text" />
        <div className="absolute top-0 left-2 w-[35px] flex justify-center items-center h-[100%]">
        <HiMagnifyingGlass className="text-gray-700 text-[25px]" />
        </div>
      </div>
      <div className="w-[100%] h-[95%] tab-container overflow-y-auto scroll-smooth">
        { response?.isSuccess ? 
        <div id="friends-container" className="flex flex-col w-[100%] pt-[55px] transition-all duration-300">
          {
            groups?.map((group: groupType) => <Group key={group?.group_id} group={group} showMessageBox={showMessgaeBox} />)
          }
          {
            response?.data?.map((friend: friendType)  => <Friend key={friend.id} friend={friend} showMessageBox={showMessgaeBox} />)
          }
        </div> : null
        }

      </div>
    </div>
    <div id="message-box" className="lg:w-[550px] lg:shadow-md ld:w-[54%] h-[100%] absolute -z-10 w-[100%]  top-0 right-0 ld:static ld:flex  lg:rounded-[15px] bg-[#ffff]">

      <hideContext.Provider value={{hideMessageBox}}>
      <Outlet/>
      </hideContext.Provider>

    </div>
   </div>
  </div>
  </>
  )
}

export default Home