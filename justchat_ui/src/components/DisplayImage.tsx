import { useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import useStore from "./customhooks/UseStore";


const DisplayImage = () => {
    const imageContainerRef = useRef<HTMLDivElement>(null!);
    const imageRef = useRef<HTMLImageElement>(null!);

    const showImage = () => {
        imageContainerRef.current.classList.remove("hidden");
        imageContainerRef.current.classList.add("flex");
        console.log(imageRef.current ? imageRef.current : "IMAGEREF IS NULL");
        useStore.setState({image: imageRef.current});  
    }

    const hideImage = () => {
        imageRef.current.src = "";
        useStore.setState({image: null});
        imageContainerRef.current.classList.add('hidden');
        imageContainerRef.current.classList.remove("flex");
    }

    useEffect(() => {
        useStore.setState({showImage});
        
    }, [])

  return (
    <div ref={imageContainerRef} className="fixed hidden flex-col justify-start items-center  z-40 top-0 left-0 w-full h-full bg-gray-950">
        <div className="w-[100%] h-[8%]  flex justify-end items-center">
            <button onClick={hideImage} className="w-[50px] h-[50px]  flex justify-center items-center hover:bg-red-600 transition-all duration-300">
                <RxCross2 className="text-gray-50 text-[23px]" />
            </button>
        </div>
        <img ref={imageRef} className="h-[84%] md:object-fill object-contain" src="" alt="" />
    </div>
  )
}


export default DisplayImage;