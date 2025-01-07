import "../style.css";
import { CiCamera } from "react-icons/ci";
import Participants from "./Participants";
import UseRequest from "./customhooks/UseRequest";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import useStore from "./customhooks/UseStore";

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

type  userStatusType = {
    id: string | number,
    username: string,
    email: string,
    profile_image: string | null,
    access: string,
    refresh: string,
}

const fetchFunc = async (url: string, data: GroupType) => {
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
                    const refreshResponse = await axios.post("http://127.0.0.1:8000/token-refresh/", { refresh: userStatus.refresh });
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
                    throw new Error("Failed to refresh token.");
                }
            }
        } else {
            throw new Error("Request failed.");
        }
    }
  };
  

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

type GroupType = {
    name: string,
    image: string | null,
    participants: friendType[],
}


const CreateGroup = () => {

    const groupSectionRef = useRef<HTMLDivElement>(null!);
    const inputRef = useRef<HTMLInputElement>(null!);
    const createButtonRef = useRef<HTMLButtonElement>(null!); 

    const [isGroupNameProvided, setIsGroupNameProvided] = useState(null as boolean | null)
    const [isParticipantSelected, setIsParticipantSelected] = useState(null as boolean | null);
    const groupPhotoRef = useRef<HTMLImageElement>(null!);
    const placeHolderRef = useRef<HTMLDivElement>(null!);
    const groupPhotoDisplayRef = useRef<HTMLDivElement>(null!);
    const buttonRef = useRef<HTMLButtonElement>(null!);
    const [group, setGroup] = useState<GroupType>({
        name: "",
        image: null,
        participants: [],
    })

    const postGroup = useMutation({
        mutationFn: () =>  fetchFunc("http://127.0.0.1:8000/api/users/create_group/", group),
        onMutate: () => {
            createButtonRef.current.disabled = true;
            createButtonRef.current.textContent = "Creating ...";
            createButtonRef.current.classList.remove("bg-purple-600");
            createButtonRef.current.classList.add("bg-purple-300");

            
        },

        onSuccess: () => {
            createButtonRef.current.disabled = false;
            createButtonRef.current.textContent = "Create";
            createButtonRef.current.classList.remove("bg-purple-300");
            createButtonRef.current.classList.add("bg-purple-600");
            hideCreateGroupBox();
        },
        onError: (error) => {
            console.log(error);
        }
    })


    const {data: friends, isError, isLoading} = UseRequest("http://127.0.0.1:8000/api/users/get_friends/",  "friends");

    const createGroup = () => {
        if (validateGroup()) {
            const newGroup: GroupType = JSON.parse(localStorage.getItem("group")!);
            setGroup({...group, participants: newGroup.participants});
            console.log("THIS IS THE GROUP NAME", group.name);
            postGroup.mutate();
        }

    }


    const validateGroup = () => {
        if (inputRef.current.value.trim() !== "") {
            setIsGroupNameProvided(true);
            try {
                const group: GroupType = JSON.parse(localStorage.getItem("group")!);
                if (group.participants.length !== 0) {
                    setIsParticipantSelected(true);
                    return true;
                } else {
                    setIsParticipantSelected(false);
                }
                return false;
                
            } catch (error) {
                setIsParticipantSelected(false)
                return false;
            }
            
        } else {
            setIsGroupNameProvided(false);
            return false;
        }
    }


    const uploadGroupPhoto = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.click();
        fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files![0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                groupPhotoDisplayRef.current.classList.remove("hidden");
                groupPhotoDisplayRef.current.classList.add("flex");
                placeHolderRef.current.classList.add("hidden");
                placeHolderRef.current.classList.remove("flex");
                groupPhotoRef.current.src = e.target?.result as string;
                setGroup({...group, image: e.target?.result as string});
            }
        }
    }

    const showDialog = () => {
        buttonRef.current.click();
    }

    const hideCreateGroupBox = () => {
        inputRef.current.value = "";
        groupPhotoRef.current.src = "";
        setGroup({image: null, name: "", participants: []});
        localStorage.removeItem("group");
        groupPhotoDisplayRef.current.classList.remove('flex');
        groupPhotoDisplayRef.current.classList.add("hidden");
        placeHolderRef.current.classList.remove("hidden");
        placeHolderRef.current.classList.add("flex");
        groupSectionRef.current.classList.add("hidden");
    }


    useEffect(() => {
        try {
            localStorage.removeItem("group");
        } catch (error) {
            console.log(error);
        }
        useStore.setState({groupSectionRef: groupSectionRef.current});
    }, [])

  return (
    <>
    <div ref={groupSectionRef} className="fixed hidden  lg:mt-0 lg:ml-0 md:ml-[25%] ld:ml-[20%] md:mt-[25%] z-30 border-purple-600 border rounded-tr-md  md:w-[380px] lg:w-[300px] ld:w-[480px] w-screen  justify-center items-center rounded-br-md shadow-md md:h-[580px] lg:h-[550px] ld:h-[700px] h-screen backdrop-filter lg:bg-transparent bg-[#ffff] backdrop-blur-lg">
        <div className="w-[95%] h-[95%] rounded-md relative">
            <h1 className="text-purple-700 font-bold font-arimo  text-[23px]">New Group</h1>
            <div className="w-[100%] flex justify-between items-center flex-col h-[150px]">
                <div className="w-[100%] h-[60px] flex items-center  ">
                    <div onClick={uploadGroupPhoto} ref={groupPhotoDisplayRef} className="w-[45px] hidden cursor-pointer group  opacity-50 backdrop-filter hover:backdrop-blur-md h-[45px] rounded-full    relative justify-center border items-center">
                        <img className="rounded-full w-[100%] h-[100%] object-cover" ref={groupPhotoRef} src="" alt="" />
                        <div className="w-[100%] group-hover:flex hidden  h-[100%] absolute  justify-center items-center rounded-full">
                        <CiCamera className=" text-[24px] text-purple-500" />
                        </div>
                    </div>
                    <div onClick={uploadGroupPhoto} ref={placeHolderRef} className="w-[45px]  bg-purple-500 opacity-50 backdrop-filter backdrop-blur-md h-[45px] rounded-full flex justify-center items-center">
                        <CiCamera className="text-gray-950 text-[24px]" />
                    </div>
                    <h1 className="text-gray-600 font-poppins ml-3">
                        Add Group Photo
                    </h1>
                </div>
                {
                    isGroupNameProvided === false ? <small className="text-red-500 font-muli">Group name is not provide</small> : isParticipantSelected === false ? <small className="text-red-500 font-muli">No participant is selected</small> : null
                }
                <div className="w-[100%] h-[60px] flex justify-between  flex-col">
                    <p className="font-poppins text-gray-600 text-[14px]">Provide a group name</p>
                    <input value={group.name} ref={inputRef} onChange={(e) => setGroup({...group, name: e.target.value})} className="w-[100%] h-[45px] md:h-[35px] focus:outline-none px-3 border rounded-md " type="text" />
                </div>
            </div>
            <h1 className="text-gray-600 font-poppins mt-2">Friends</h1>
            <div className="w-[100%] overflow-y-scroll tab-container md:h-[250px] lg:h-[250px] ld:h-[350px] h-[350px]">
                {
                    isLoading ? <div className="w-[100%] h-[100%]  flex justify-center items-center">
                        <div className="w-[40px] h-[40px]  rounded-full border-4 border-l-purple-500 animate-spin duration-300"></div>
                    </div> : null
                }
                <div className="flex w-[100%] flex-col space-y-2">
                    {
                        isError ? <h1 className="text-red-700">Something went wrong</h1>  : friends?.map((friend: friendType) => <Participants key={friend.id} friend={friend} />)
                    }
                    </div>
            </div>
            <div className="w-[100%] h-[40px] flex justify-between items-center absolute bottom-0 left-0">
                <button onClick={createGroup} ref={createButtonRef} className="w-[40%] rounded-md bg-purple-600 text-gray-100 h-[40px] font-poppins shadow-md">Create</button>
                <button onClick={showDialog} className="w-[40%] rounded-md bg-red-600 text-gray-100 h-[40px] font-poppins shadow-md">Cancel</button> 
            </div>
        </div>
    </div>
  <AlertDialog>
    <AlertDialogTrigger asChild>
        <button ref={buttonRef} ></button>
      </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard changes?</AlertDialogTitle>
      <AlertDialogDescription>
        Your current action to create a group will not be sent if you leave this screen.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={hideCreateGroupBox} className="bg-red-50 hover:text-red-700 transition-all duration-150 hover:bg-red-100 hover:scale-105 transform border-none text-red-800">Discard</AlertDialogCancel>
      <AlertDialogAction className="text-pink-50 transition-all duration-150 border-none hover:scale-105 bg-gray-600">Return to screen</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </>
  )
}

export default CreateGroup;