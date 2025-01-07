import { useEffect, useRef } from "react";
import { easeIn, motion } from "framer-motion";
import signup from "../assets/images/justchat_signup_page.png"
import login from "../assets/images/login_page_section.png";
import privatechat from "../assets/images/private_chat_page.png";
import groupchat from "../assets/images/grroup_chat_page.png";
import creategroup from "../assets/images/create_group_section.png";
import chat from"../assets/images/chat.png";
import twitter from "../assets/images/twitter.png";
import telegram from "../assets/images/telegram.png";
import facebook from "../assets/images/facebook.png";
import gmail from "../assets/images/gmail.png"
import { useNavigate } from "react-router";

const LandingPage = () => {
    const navigateToLogin = useNavigate();
    const navigateToSignUp = useNavigate();
    const paraRef = useRef<HTMLParagraphElement>(null!);
    useEffect(() => {
        let index = 0;
        document.body.classList.remove("flex");
        const text = [
            "Turn messages into memories with justChat.",
            "Redefine how you stay connected - start chatting today!",
            "Turn messages into memories with justChat.",
            "Simple, seamless, and secure - the future of messaging.",
            "Connect. Share. Chat. Your conversations, reimagined!",
            "Where conversations feel personal, yet powerful."
        ]
        const close = setInterval(() => {
            if (index === text.length) {
                index = 0;
            }
            paraRef.current.textContent = text[index];
            index++
        }, 5000);

        return () => {
            document.body.classList.add("flex");
            clearInterval(close);
        }
    }, [])
  return (
    <>
    <div className="w-screen h-[50px] sticky top-0 right-0 z-20 backdrop-filter backdrop-blur-md flex justify-between bg-opacity-25 items-center px-4 md:px-10">
        <h1 className="text-transparent text-[25px] md:text-[30px] bg-clip-text bg-gradient-to-r from-purple-500  font-bold to-amber-400 font-arimo">justChat</h1>
        <div className="w-[175px] md:w-[220px] flex justify-between items-center h-[45px] ">
            <button onClick={() => navigateToSignUp("/sign-up")} className="md:w-[100px] w-[80px] h-[85%] md:h-[100%] rounded-md hover:shadow-md hover:bg-transparent hover:border transition-all duration-500 hover:border-purple-600 hover:text-purple-600 bg-purple-600 font-poppins tracking-tight capitalize text-gray-50">sign up</button>
            <button onClick={() => navigateToLogin("/log-in")} className="md:w-[100px] h-[85%] md:h-[100%] w-[80px] rounded-md hover:shadow-md hover:bg-purple-600 transition-all duration-500 border border-purple-600 font-poppins tracking-tight capitalize hover:text-gray-50 text-purple-600">Log In</button>
        </div>
    </div>
    <div className="w-screen relative h-[300px] md:h-[595px] group   mt-3  overflow-hidden">
    <motion.div
    animate={{
        translateX: ["0%", "0%", "0%", "-20%", "-20%", "-20%", "-40%", "-40%", "-40%", "-60%", "-60%", "-60%",  "-80%", "-80%", "-80%", "-60%", "-60%", "-60%", "-40%", "-40%", "-40%",  "-20%",  "-20%",  "-20%", "0%", "0%", "0%"]
    }}

    transition={{
        duration: 30,
        ease: easeIn,
        repeat: Infinity,
    }}
     className="w-[500%] flex justify-center items-center h-[100%]">
            <img className="w-[20%] shadow-md object-contain md:object-none h-[100%]" src={signup} alt="" />
            <img className="w-[20%] h-[100%] shadow-md object-contain md:object-none" src={login} alt="" />
            <img className="w-[20%] h-[100%] shadow-md object-contain md:object-none" src={privatechat} alt="" />
            <img className="w-[20%] h-[100%] shadow-md object-contain md:object-none" src={groupchat} alt="" />
            <img className="w-[20%] shadow-md h-[100%] object-contain md:object-none" src={creategroup} alt="" />
        </motion.div>
    </div>
    <div className="w-screen mt-14 mb-2 flex justify-evenly items-center flex-wrap">
        <img className="md:w-[350px] md:h-[350px] h-[300px] w-[300px] rounded-full" src={chat} alt="" />
        <p ref={paraRef} className="md:w-[350px] font-poppins text-[30px] md:text-[35px] mt-14 mb-14 text-purple-500 w-[300px] text-wrap"></p>
    </div>
    <div className="w-screen  flex mt-14 justify-center items-center flex-wrap py-4 bg-gray-900">
        <div className="h-[200px] rounded-md flex flex-col space-y-3 justify-center items-center w-[100%] md:w-[70%] border">
            <h1 className="font-roboto text-gray-50 tracking-wide text-[30px] capitalize">contact</h1>
            <div className="w-[100%] flex items-center justify-center space-x-10">
                <img className="w-[50px] h-[50px] " src={gmail} alt="" />
                <img className="w-[50px] h-[50px] " src={facebook} alt="" />
                <img className="w-[50px] h-[50px] " src={twitter} alt="" />
                <img className="w-[50px] h-[50px] " src={telegram} alt="" />
            </div>
        </div>
    </div>
    </>
  )
}

export default LandingPage;