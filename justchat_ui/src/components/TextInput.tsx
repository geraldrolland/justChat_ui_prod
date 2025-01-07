import { TiMicrophone } from "react-icons/ti";
import { IoSendSharp } from "react-icons/io5";
import React, {useEffect, useRef} from "react"
import "../style.css"
import { CiFaceSmile } from "react-icons/ci";
import { CiCamera } from "react-icons/ci";
import { GiPaperClip } from "react-icons/gi";
import useStore from "./customhooks/UseStore";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import 'blob-polyfill';
import { useNavigate } from "react-router";
import { GiCancel } from "react-icons/gi";
import { motion } from "framer-motion";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type propType ={
  boxRef: HTMLDivElement,

}

type  userStatusType = {
  id: string | number,
  username: string,
  email: string,
  profile_image: string | null,
  access: string,
  refresh: string,
}

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

const fetchFunc = async (url: string, data: messageType,  navigateToLogin: any) => {
  console.log("errror in userequest")
  try {
      const userStatus: userStatusType = JSON.parse(sessionStorage.getItem("userProfile")!);
      let config = {
          headers: { Authorization: "Bearer " + userStatus.access },
      };
      const response = await axios.post(url, data,  config);
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
                      const retryResponse = await axios.post(url, data, config);
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

const TextInput = ({boxRef}: propType) => {

  const textAreaRef = useRef<HTMLTextAreaElement>(null!)

  const [message, setMessage] = useState<messageType>({
    text: "",
    message_id: "",
    created_at: "",
    audio: null,
    image: null,
    video: null,
    file: null,
    sender: 0,
    receipient: 0,
    is_receipient_online: false,
  })

  const sendRef = useRef<HTMLButtonElement>(null!)
  const imgRef = useRef<HTMLImageElement>(null!)
  const fileRef = useRef<HTMLInputElement>(null!)
  const mediaBoxRef = useRef<HTMLDivElement>(null!)
  const buttonRef = useRef<HTMLButtonElement>(null!)
  const micRef = useRef<HTMLButtonElement>(null!)
  const smileCamRef = useRef<HTMLDivElement>(null!)
  const friendProfile = useStore(state => state.friendProfile)!
  const groupProfile = useStore(state => state.groupProfile)!
  const scrollToLastMsg = useStore(state => state.scrollToLastMsg!)
  const navigateToLogin = useNavigate()
  const messageWebsocket = useStore(state => state.messageWebsocket)
  const fileNameRef = useRef<HTMLDivElement>(null!);
  const iFrameRef = useRef<HTMLEmbedElement>(null!);
  const videoRef = useRef<HTMLVideoElement>(null!);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const textInputRef = useRef<HTMLDivElement>(null!);
  const recordRef = useRef<HTMLButtonElement>(null!);
  const recordViewRef = useRef<HTMLDivElement>(null!);
  const [apiUrl, setApiUrl] = useState("");


  const sendMessage = useMutation({
    mutationFn: () => fetchFunc(apiUrl, message, navigateToLogin),
    onMutate: () => {
      if (friendProfile) {
        const msg = {
          message_id: crypto.randomUUID(),
          text: message.text,
          created_at: "sending ...",
          audio: message.audio,
          image: message.image,
          video: message.video,
          file: message.file,
          sender: message.sender,
          receipient: message.receipient,
          is_receipient_online: false,
        }
  
        setMessage({...message, created_at: new Date().toLocaleString(), message_id: msg.message_id});
        console.log("this is the push message ", msg)
        console.log("this is the sent message", message)
        const messages = [...friendProfile?.messages!, msg]
        useStore.setState({friendProfile: {friend_id: friendProfile?.friend_id, username: friendProfile?.username, profile_image: friendProfile?.profile_image, is_online: friendProfile?.is_online!, last_date_online: friendProfile?.last_date_online!, messages: messages}})
        console.log("message", msg)
        scrollToLastMsg();
        textAreaRef.current.value = "";
        textAreaRef.current.style.height = "auto"
      } else {
        const userProfile: userStatusType = JSON.parse(sessionStorage.getItem("userProfile")!)
        const groupMsg = {
          message_id: crypto.randomUUID(),
          text: message.text,
          created_at: "sending ...",
          audio: message.audio,
          image: message.image,
          video: message.video,
          file: message.file,

          group: null,
          sender: {
            id: userProfile.id as number,
            username: userProfile.username,
            profile_image: userProfile.profile_image,
          }
        }
  
        setMessage({...message, created_at: new Date().toLocaleString(), message_id: groupMsg.message_id});
        console.log("this is the push message ", groupMsg)
        console.log("this is the sent message", message)
        const messages = [...groupProfile.messages!, groupMsg]
        useStore.setState({groupProfile: {group_id: groupProfile.group_id, group_name: groupProfile.group_name, group_photo: groupProfile.group_photo, messages: messages}})
        console.log("message", groupMsg)
        scrollToLastMsg();
        textAreaRef.current.value = "";
        textAreaRef.current.style.height = "auto"
      }

    },

    onSuccess: (data) => {
      if (friendProfile) {
        console.log("it returned", data)
        let updatedMessages = friendProfile?.messages?.filter(msg => msg.message_id !== data.message_id)
        updatedMessages?.push(data)
        console.log("THIS IS THE RETURNED DATA ", data)
        useStore.setState({friendProfile: { 
          friend_id: friendProfile?.friend_id,
          username: friendProfile?.username,
          profile_image: friendProfile?.profile_image,
          is_online: friendProfile.is_online,
          last_date_online: friendProfile.last_date_online,
          messages: updatedMessages ? updatedMessages : [],
        } 
      }
    ) 
      } else {
        console.log("it returned", data)
        let updatedMessages = groupProfile?.messages?.filter(msg => msg.message_id !== data.message_id)
        updatedMessages?.push(data)
        console.log("THIS IS THE RETURNED DATA ", data)
        useStore.setState({groupProfile: { 
          group_id: groupProfile?.group_id,
          group_name: groupProfile?.group_name,
          group_photo: groupProfile?.group_photo,
          messages: updatedMessages ? updatedMessages : [],
        }})
      }

      resetMessage();
    },

    onError: (error) => {
      console.log("error", error);
    }
  })


  const resetMessage = () => {
    setMessage({...message, text:"", audio: null, file: null, image: null, video: null})

  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
        sendRef.current?.click();
        console.log("This is the Enter key");
        e.preventDefault(); // Prevents a new line from being added
    }
};

  const expandInputHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.offsetHeight)

    e.target.style.height = "auto"
    if (e.target.scrollHeight > 120 || e.target.scrollHeight === 120) {
      boxRef.style.height = "120px"
      e.target.style.height = "120px"
    }

    if (e.target.scrollHeight > 45 && e.target.scrollHeight < 120) {
      console.log("scroll height", e.target.scrollHeight )
      //boxRef.style.height = `${e.target.scrollHeight}px`
      e.target.style.height = `${e.target.scrollHeight}px`
    }

    if (e.target.value.trim() !== "") {
      const userProfile = JSON.parse(sessionStorage.getItem("userProfile")!)
      const typing = JSON.stringify({isTyping: true, sender: userProfile.id, receipient: friendProfile?.friend_id })
      if (messageWebsocket?.OPEN === 1) {
        messageWebsocket?.send(typing)
        console.log("this is the typing message", typing)
      }
      micRef.current.classList.remove("flex")
      micRef.current.classList.add("hidden")
      sendRef.current.classList.remove("hidden")
      sendRef.current.classList.add("flex")
      smileCamRef.current.classList.add("translate-x-[35px]")
      smileCamRef.current.classList.remove("translate-x-[0]")
    } else {
      micRef.current.classList.add("flex")
      micRef.current.classList.remove("hidden")
      sendRef.current.classList.add("hidden")
      sendRef.current.classList.remove("flex")
      smileCamRef.current.classList.remove("translate-x-[35px]")
      smileCamRef.current.classList.add("translate-x-[0]")
    }
    setMessage({...message, text: e.target.value})

  }

  const sendmsg = () => {
    if (message.text.trim() !== "" || audioRef.current.src != "" || imgRef.current.src != "" || iFrameRef.current.src != "") {
      console.log("THIS IS THE FILE STRING", message.file);
      hideMediaBox();
      showInputTextBox();
      sendMessage.mutate();
    }
  }

  const displayDialog = () => {
    buttonRef.current.click();
  }

  const hideMediaBox = () => {
    mediaBoxRef.current.classList.add("hidden");
    mediaBoxRef.current.classList.remove("flex");
  }

  const uploadFile = () => {
    fileRef.current.click();

  }

  const selectMediaFile  = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("THIS IS THE FILE", e.target.files);
    const fileExtensionList  =  [
      "pdf",  // PDF files
      "txt",  // Text files
      "doc",  // Microsoft Word (older versions)
      "docx", // Microsoft Word (newer versions)
      "rtf",  // Rich Text Format
      "odt",  // OpenDocument Text
      "xls",  // Microsoft Excel (older versions)
      "xlsx", // Microsoft Excel (newer versions)
      "csv",  // Comma-Separated Values
      "ppt",  // Microsoft PowerPoint (older versions)
      "pptx"  // Microsoft PowerPoint (newer versions)
    ]

    const imgExtensionList = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "tiff",
      "svg",
      "ico",
      "heic",
      "heif",
      "PNG",
      "JPG",
    ]

    const videoExtensionList = [
      "mp4",
      "mkv",
      "avi",
      "mov",
      "wmv",
      "flv",
      "webm",
      "mpeg",
      "mpg",
      "3gp",
      "ogg",
      "MP4",
    ]



    const mediaRefList = [
      iFrameRef.current,
      imgRef.current,
      videoRef.current,
      audioRef.current,
    ];
    showMediaBox();
    hideInputTextBox();

    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files![0].name;
      const fileExtension = fileName.split(".").pop()!;
      console.log("FILE EXTENSION", fileExtension);
      const file = e.target.files[0];
      console.log("errror", fileName);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (fileExtensionList.includes(fileExtension)) {
          const blockRefList = mediaRefList.filter(ref => ref !== iFrameRef.current);
          blockRefList.forEach(ref => {
            ref.src = "";
            ref.style.display = "none";
          })
          iFrameRef.current.style.display = "block";
          iFrameRef.current.src = e.target?.result as string;
          setMessage({...message, file: fileName + "+" + e.target?.result as string , video: null, image: null, audio: null});
          console.log("RESULT", e.target?.result);

        } else if (imgExtensionList.includes(fileExtension)) {
          const blockRefList = mediaRefList.filter(ref => ref !== imgRef.current);
          blockRefList.forEach(ref => {
            ref.src = "";
            ref.style.display = "none";
          })
          imgRef.current.style.display = "block";
          imgRef.current.src = e.target?.result as string;
          setMessage({...message, image: e.target?.result as string, file: null, audio: null, video: null})
          console.log("img STRING", e.target?.result);
        } else if (videoExtensionList.includes(fileExtension)) {
          const blockRefList = mediaRefList.filter(ref => ref !== videoRef.current);
          blockRefList.forEach(ref => {
            ref.src = "";
            ref.style.display = "none";
          })
          console.log("ERROR ME");
          const fileUrl = window.URL.createObjectURL(file as unknown as globalThis.Blob);
          console.log('fileUrl', fileUrl);
          videoRef.current.style.display = "block";
          videoRef.current.src = fileUrl;
        } else {
          const blockRefList = mediaRefList.filter(ref => ref !== audioRef.current);
          blockRefList.forEach(ref => {
            ref.src = "";
            ref.style.display = "none";
          })
          audioRef.current.style.display = "block";
          audioRef.current.src = e.target?.result as string;
          setMessage({...message, audio: e.target?.result as string, file: null, video: null, image: null});
        }
        fileNameRef.current.textContent = fileName;
      }
      reader.readAsDataURL(file);
    }
  }

  const hideInputTextBox = () => {
    textInputRef.current.classList.add("hidden");
    textInputRef.current.classList.remove("flex");
    sendRef.current.classList.add("hidden");
    sendRef.current.classList.remove("flex");
    micRef.current.classList.add("hidden");
    micRef.current.classList.remove("flex");
  }


  const showInputTextBox = () => {
    textInputRef.current.classList.add("flex");
    textInputRef.current.classList.remove("hidden");
    sendRef.current.classList.add("flex");
    sendRef.current.classList.remove("hidden");
    micRef.current.classList.add("flex");
    micRef.current.classList.remove("hidden");
  }

  
  const showMediaBox = () => {
    mediaBoxRef.current.classList.remove("hidden");
    mediaBoxRef.current.classList.add("flex");
    document.body.style.overflow = "hidden";
  }


  const showRecordView = () => {
    hideInputTextBox();
    recordViewRef.current.classList.remove("hidden");
    recordViewRef.current.classList.add('flex');
    recordRef.current.classList.add("flex");
    recordRef.current.classList.remove("hidden");
  }

  const hideRecordView = () => {
    recordViewRef.current.classList.remove("flex");
    recordViewRef.current.classList.add('hidden');
    recordRef.current.classList.add("hidden");
    recordRef.current.classList.remove("flex");
    showInputTextBox();
  }

  const stopAudioRecord = () => {
    showMediaBox();
    hideRecordView();
    hideInputTextBox();
    const {recordStream} = useStore.getState();
    recordStream?.stop();

  }

  const startAudioRecord = () => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      }).then((audioStream) => {
        showRecordView();
        const recordStream = new MediaRecorder(audioStream);
        useStore.setState({recordStream});
        recordStream.start();
        recordStream.onstop = () => {
          hideRecordView();
          showMediaBox();
          hideInputTextBox();
          
        }

        recordStream.ondataavailable = (e) => {
          if (e.data.size > 0) {
            const recordBlob = new Blob([e.data], {type: 'audio/webm'});
            const reader = new FileReader();
            reader.onload = (e) => {
              audioRef.current.style.display = "block";
              audioRef.current.src = e.target?.result as string;
              setMessage({...message, audio: e.target?.result as string});
              console.log("AUDIO STRING", e.target?.result);
            }

            reader.readAsDataURL(recordBlob);
          } else {
            console.log("NOTHING WAS RECORDED");
          }

        }

        recordStream.onerror = (err) => {
          console.log(err);
        }

      }).catch(err => {
        console.log(err);
      })
    }
  }

  useEffect(() => {
    const userProfile: userStatusType = JSON.parse(sessionStorage.getItem("userProfile")!)
    if (friendProfile) {
      setMessage({...message, sender: userProfile.id as number, receipient: friendProfile?.friend_id})
    }

    console.log("THIS IS THE CURRENT ROUTE", useStore.getState().apiUrl as string);
    setApiUrl(useStore.getState().apiUrl as string);
  }, [useStore.getState().apiUrl])




  return (
    <>
    <div className="ld:w-[100%] w-[100%] md:w-[90%] md:left-[5%] ld:left-0  flex bottom-0  bg-[#ffff] lg:rounded-b-[15px]  absolute    items-center z-10">

      <div ref={mediaBoxRef} className="w-[320px] shadow-md hidden  bg-gray-300  justify-between items-center ld:left-[115px] gap-y-2  absolute  -top-[350px] flex-col rounded-[10px]">
        <button onClick={() => displayDialog()} className="absolute w-[20px] text-[20px] -right-1 -top-1 h-[20px] bg-gray-900 rounded-full">
        <GiCancel className=" text-red-600" />
        </button>

        <div className="w-[100%]   flex justify-center items-center  rounded-[10px] bg-slate-800"  >
          <img style={{
            display: "none",
          }} ref={imgRef} className="w-[45%] object-contain rounded-[5px] h-[180px]" alt="" />
          <embed style={{
            display: "none",
          }} ref={iFrameRef} className="w-[45%] tab-container  rounded-[5px] h-[180px]" src=""></embed>
          <video ref={videoRef} style={{
            display: "none",
          }} className="w-[100%] hidden  border rounded-[5px] h-[180px]" controls ></video>
          <audio ref={audioRef} style={{
            display: "none",
          }} className="w-[80%] my-2  rounded-none h-[35px]" controls>
          </audio>
        </div>
        <small ref={fileNameRef} className="w-[70%] truncate text-center text-gray-900 font-roboto"></small>
        <div className="w-[100%] h-[45px]  rounded-b-[10px] relative flex justify-evenly items-center">
          <div className="w-[80%] h-[100%] ">
          <CiFaceSmile className="text-gray-700 ml-1 text-[25px] absolute mt-2"/>
            <textarea value={message.text} onChange={(e) => setMessage({...message, text: e.target.value})} className="resize-none focus:outline-none tab-container text-gray-800 rounded-md bg-blue-100 w-[100%] px-8 h-[95%]" name="" id=""></textarea>
          </div>
          <button onClick={sendmsg} className="w-[40px] bg-purple-600 h-[90%] rounded-md flex justify-center items-center ">
          <IoSendSharp className="text-gray-50 text-[23px]" />
          </button>
        </div>
      </div>

      <div ref={recordViewRef} className="lg:w-[85%] hidden  w-[80%] md:w-[85%] lg:ml-[15px] relative  ml-[10px] rounded-md  bg-red-400   justify-center items-center  h-[50px] mb-[2px] py-1 overflow-hidden  ">
        <motion.p
        animate={{
          opacity: [0.2, 0.4, 0.6, 0.8, 1]
        }}

        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="font-arimo tracking-wide text-gray-700 italic text-[18px]">Recording ...</motion.p>
      </div>

      <div ref={textInputRef} className="lg:w-[85%]  w-[80%] md:w-[85%] lg:ml-[15px] relative  ml-[10px] flex rounded-md py-1 overflow-hidden  ">
        <input  onChange={(e) => selectMediaFile(e)} ref={fileRef} type="file" className="absolute -z-10 mt-1" />
        <button onClick={uploadFile} className="absolute left-0 bottom-[14px] w-[30px] h-[30px] pt-1  justify-end pl-1 items-center">
          <GiPaperClip className="text-gray-700 text-[25px]" />
        </button>

        <textarea ref={textAreaRef} onKeyDown={(e) => handleKeyDown(e)} onChange={(e) => expandInputHeight(e)} className="w-[100%] tab-container text-gray-700 rounded-md resize-none pr-8 focus:outline-none bg-blue-100  pl-10  " cols={1} name="" id="" placeholder="enter message"></textarea>
        <div ref={smileCamRef} className="absolute right-0 bottom-[14px] w-[70px] h-[30px] flex transform transition-all duration-300 justify-center items-center">
          <div className="w-[50%] h-[100%] flex justify-center items-center">
            <CiFaceSmile className="text-gray-700 text-[25px]" />
          </div>
          <div className="w-[50%] h-[100%] flex justify-center items-center">
            <CiCamera className="text-gray-700 text-[25px]" />
          </div>
        </div>
      </div>
      <button onClick={sendmsg} ref={sendRef} className="absolute hidden lg:right-[15px] right-[10px] rounded-md w-[45px]  justify-center items-center bottom-[5px] h-[45px] transform transition-all duration-500 active:scale-95 bg-purple-700">
        <IoSendSharp className="text-gray-50 text-[25px]" />
      </button>
      <button ref={micRef} onClick={startAudioRecord} className="absolute flex right-[10px] rounded-md lg:right-[15px] w-[45px]  justify-center items-center bottom-[5px] h-[45px] transform transition-all duration-500 active:scale-95 bg-purple-700">
        <TiMicrophone className="text-gray-50 text-[25px]" />
      </button>
      <button onClick={stopAudioRecord} ref={recordRef} className="absolute  hidden right-[10px] rounded-md lg:right-[15px] w-[45px]  justify-center items-center bottom-[5px] h-[45px] transform transition-all duration-500 active:scale-95 bg-gray-900">
        <motion.button
        animate={{
          opacity: [0.2, 0.4, 0.6, 0.8, 1]
        }}

        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",

        }}
         className="w-[23px] bg-red-600 h-[23px] rounded-md">
          
        </motion.button>
        <TiMicrophone className="absolute top-[1px] right-0 text-red-400 text-[13px]" />
      </button>
    </div>

    <AlertDialog>
    <AlertDialogTrigger asChild>
        <button ref={buttonRef}></button>
      </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard unsent message?</AlertDialogTitle>
      <AlertDialogDescription>
        Your message, including attached media will not be sent if you leave this screen.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel className="bg-red-50 hover:text-red-700 transition-all duration-150 hover:bg-red-100 hover:scale-105 transform border-none text-red-800" onClick={() => {
        hideMediaBox();
        showInputTextBox();
        }}>Discard</AlertDialogCancel>
      <AlertDialogAction className="text-pink-50 transition-all duration-150 border-none hover:scale-105 bg-gray-600">Return to media</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

    </>
  )
}

export default TextInput