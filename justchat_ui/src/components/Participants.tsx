import { IoMdCheckmark } from "react-icons/io";
import dog from "../assets/images/dog_avatar.png"
import { useEffect, useRef } from "react";



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


type ParticipantsPropType = {
    friend: friendType, 
}


type GroupType = {
    name: string,
    image: string | null,
    participants: friendType[],
}


const Participants = ({friend}: ParticipantsPropType) => {
    const markRef = useRef<HTMLButtonElement>(null!);
    const imgRef = useRef<HTMLImageElement>(null!);

    const selectOrUnselectParticipant = () => {
        if (markRef.current.classList.contains("hidden")) {
            try {
                const groupStr = localStorage.getItem('group');
                const group: GroupType = JSON.parse(groupStr as string);
                group.participants.push(friend);
                localStorage.setItem("group", JSON.stringify(group));
                
            } catch(err) {
                const group: GroupType = {
                    name: "",
                    image: null,
                    participants: [],
                }
                group.participants.push(friend);
                localStorage.setItem("group", JSON.stringify(group));
            } finally {
                markRef.current.classList.remove('hidden');
                markRef.current.classList.add('flex');
            }
        } else {
            const group: GroupType = JSON.parse(localStorage.getItem("group")!)
            const newParticiants = group.participants.filter(participant => participant.id !== friend.id);
            group.participants = newParticiants;
            localStorage.setItem("group", JSON.stringify(group));
            markRef.current.classList.add('hidden');
            markRef.current.classList.remove('flex');
        }
    }

    useEffect(() => {
        if (friend.is_online) {
            imgRef.current.classList.add("border-green-500");
            imgRef.current.classList.add("border");
        } else {
            imgRef.current.classList.add("filter");
            imgRef.current.classList.add("grayscale");
        }
        return () => {
            markRef.current.classList.add("hidden");
            markRef.current.classList.remove("flex");
        }
    }, [])
  return (
    <div id={friend.id} onClick={selectOrUnselectParticipant} className="w-[100%] cursor-pointer h-[45px] flex justify-between items-center pr-2  rounded-md px-1">
        <div className="w-[80%] flex items-center h-[100%]">
            <img ref={imgRef} className="w-[40px]  object-cover h-[40px] rounded-full" src={friend.profile_image ?? dog} alt="" />
            <p className="w-[140px] text-[14px] truncate font-poppins ml-1 text-gray-900">{friend.username}</p>
        </div>
        <div className="w-[23px] h-[23px]  rounded-md bg-gray-400">
        <button ref={markRef} className="w-[23px] hidden h-[23px] justify-center items-center rounded-md bg-[#399918]">
            <IoMdCheckmark className="text-white" />
        </button>
        </div>

    </div>
  )
}

export  default Participants;