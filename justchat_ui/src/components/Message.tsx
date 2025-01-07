
import { useEffect} from "react"
import { useRef } from "react"
import { FiDownload } from "react-icons/fi";
import useStore from "./customhooks/UseStore";
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

type propType = {
  message: messageType
}

type  userStatusType = {
  id: string | number,
  username: string,
  email: string,
  profile_image: string | null,
  access: string,
  refresh: string,
}

const Message = ({message}: propType) => {
    const textBoxRef  = useRef<HTMLDivElement>(null!)
    const greyDotRef  = useRef<HTMLDivElement>(null!)
    const purpleDotRef  = useRef<HTMLDivElement>(null!)
    const textContainerRef = useRef<HTMLDivElement>(null!)
    const textParaRef = useRef<HTMLParagraphElement>(null!)
    const ParaRef = useRef<HTMLParagraphElement>(null!)
    const fileRef = useRef<HTMLDivElement>(null!);
    const audioRef = useRef<HTMLAudioElement>(null!);
    const imgRef = useRef<HTMLImageElement>(null!);
    const embedRef = useRef<HTMLEmbedElement>(null!);
    const fileNameRef = useRef<HTMLDivElement>(null!);
    const nameContainerRef = useRef<HTMLDivElement>(null!);
    const showImage = useStore((state) => state.showImage);


    const downloadFile = (): void => {
      const a = document.createElement("a");
      a.href = embedRef.current?.src;
      a.download = fileNameRef.current?.textContent as string;
      a.click();
    }

    const displayImage = () => {
      if(showImage) {
        showImage();
        const st = useStore.getState();
        st.image.src = imgRef.current?.src;
        console.log("THIS IS MY IMAGE", imgRef.current?.src);
      }
    }

    useEffect(() => {
      const userProfile: userStatusType = JSON.parse(sessionStorage.getItem("userProfile")!) 
      if (textContainerRef.current.scrollWidth > textContainerRef.current.clientWidth) {
        console.log("THIS IS THE SCROLL WIDTH", textContainerRef.current.scrollWidth )
        console.log("THIS IS THE CLIENT WIDTH", textContainerRef.current.clientWidth );
        textParaRef.current?.classList.add("w-[100%]")

      } else {
        textParaRef.current?.classList.remove("w-[100%]")
        textParaRef.current?.classList.remove("py-2")
        textParaRef.current?.classList.add("py-1")
      }

      console.log("this is the sender id", message.sender)
      console.log("this is the user id", userProfile.id)

      if (userProfile.id === message.sender) {
        textBoxRef.current.classList.remove("justify-start")
        textBoxRef.current.classList.add("justify-end")
        greyDotRef.current.classList.add("hidden")
        textParaRef.current?.classList.add("self-end")
        ParaRef.current.classList.add("justify-end")
        ParaRef.current.classList.remove("justify-start")
        ParaRef.current.classList.remove("left-[4px]")
        ParaRef.current.classList.add("right-[4px]")
        textParaRef.current?.classList.remove("bg-slate-200")
        textParaRef.current?.classList.add("bg-purple-600")
        textParaRef.current?.classList.remove("text-gray-700")
        textParaRef.current?.classList.add("text-white");
        if (message.is_receipient_online === false) {
          purpleDotRef.current?.classList.remove("hidden");
          purpleDotRef.current?.classList.remove("bg-purple-500")
          purpleDotRef.current?.classList.add("border-purple-500")
          purpleDotRef.current?.classList.add("border")
        } else {
          purpleDotRef.current?.classList.add("text-gray-100")
          purpleDotRef.current?.classList.remove("border-purple-500")
          purpleDotRef.current?.classList.remove("border")     
        }
      } else {
        imgRef.current?.classList.remove("self-end")
        audioRef.current?.classList.remove("self-end");
        audioRef.current?.classList.remove("bg-purple-600");
        audioRef.current?.classList.add("bg-gray-300");
        fileRef.current?.classList.remove("self-end");
        fileRef.current?.classList.add("self-start");
        ParaRef.current.classList.remove("self-end");
        fileNameRef.current?.classList.remove("text-gray-100");
        fileNameRef.current?.classList.add("text-gray-700");
        nameContainerRef.current?.classList.add("bg-gray-300");
        nameContainerRef.current?.classList.remove("bg-purple-600");
        purpleDotRef.current.classList.add("hidden")

      }
    }, [message.is_receipient_online])

    useEffect(() => {
      if (message.file)
      {
        const stringArr = message.file.split("+");
        const fileName = stringArr[0];
        const fileBlob = message.file.replace(fileName + "+", "");
        console.log("THIS IS THE BLOB", fileBlob);
        embedRef.current.src = fileBlob;
        fileNameRef.current.textContent = fileName;
      }
    }, [])

  return (
<div ref={textBoxRef} className="w-[100%] md:px-0 px-2 mt-6  flex ld:px-4 justify-start items-center ">

  <div ref={textContainerRef}  className="md:w-[65%]  lg:w-[55%] w-[75%] relative  flex rounded-md justify-start flex-col  items-start">
  {
    message.file ? <div ref={fileRef} className="self-end w-[200px] h-[140px] overflow-hidden flex justify-center shadow-md items-center bg-gray-900 relative rounded-md p-2 ">
      <div ref={nameContainerRef} className="absolute flex justify-center items-start pt-1 w-[100%] h-[45px] bottom-0 bg-purple-600 rounded-t-[5px]">
        <small ref={fileNameRef} className="w-[65%] text-[11px] h-8 break-words truncate  text-center leading-tight text-gray-100 text-wrap"></small>
        <FiDownload onClick={downloadFile} className="text-gray-50 cursor-pointer text-[20px] absolute bottom-2 left-1 "/>
      </div>
      <embed ref={embedRef} type="application/pdf" className="w-[120px] h-[120px] self-end" ></embed></div> : null
  }

  {
    message.image ? <img onClick={displayImage} ref={imgRef} className="w-[120px] cursor-pointer  h-[120px] self-end rounded-md" src={message.image} alt="" /> : null
  }
  {
    message.audio ? <audio ref={audioRef} className="w-[200px]  self-end h-[40px] rounded-md bg-purple-600 p-2" src={message.audio} controls></audio> : null
  }
  {
    message.text ? <p ref={textParaRef} className="text-wrap shadow-md px-2  rounded-md py-2  flex break-words text-[14px]   md:text-[15px] bg-slate-200 text-gray-700 font-noto">{message.text}
    </p> : null
  }

    <div ref={ParaRef} className="w-[110px] self-end justify-start px-3 items-center  h-[15px]  mt-[2px] bottom-0 flex left-[4px]">
      <div ref={greyDotRef} className="  -mt-3 -ml-3 w-[10px] bg-slate-200 h-[10px] rounded-full"></div>
      <p  className="font-thin text-gray-700 text-[8px]">{message.created_at}</p>
      <div ref={purpleDotRef} className=" -mt-3 -mr-3 w-[10px] bg-purple-500 h-[10px] rounded-full "></div>
    </div>
  </div>
</div>
  )
}

export default Message