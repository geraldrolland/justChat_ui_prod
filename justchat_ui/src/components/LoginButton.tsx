import google_logo from "../assets/images/Logo-google-icon-PNG.png"

import { easeInOut, motion } from "framer-motion"

const onGoogleLoginSuccess = () => {
  const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

  const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  const params = {
    response_type: 'code',
    client_id: "647424373109-0cs76iiqksock5rg4pk5mblebeik91cm.apps.googleusercontent.com",
    redirect_uri: "http://localhost:8000/api/google/google_login/",
    prompt: 'select_account',
    access_type: 'offline',
    scope
  };

  const urlParams = new URLSearchParams(params).toString();
  window.location.href = `${GOOGLE_AUTH_URL}?${urlParams}`;
};

const LoginButton = () => {
  return <button className="md:w-[100%] w-[95%] md:ml-0 ml-[2.5%]  h-[50px] transform duration-300 shadow-md transition-all hover:scale-105 active:scale-95 rounded-md bg-gray-500 flex justify-center items-center mt-2 capitalize text-gray-100 font-poppins"  onClick={onGoogleLoginSuccess}>
    <div className="w-[15%] overflow-hidden h-[70%]  flex justify-end items-center pr-[3px]">
      <motion.img
      animate={{
        translateX: ["110%", "0"]
      }} 
      
      transition={{
        duration: 0.5,
        delay: 0.3,
        ease: easeInOut
      }}
       className="h-[100%]  filter drop-shadow-lg" src={google_logo} alt="" />
    </div>
    <div className="w-[25%] overflow-hidden h-[70%] flex justify-start items-center pl-[3px]">
      <motion.h1
      animate={{
        translateX: ["-110%", "0"]
      }} 

      transition={{
        duration: 0.5,
        delay: 0.3,
        ease: easeInOut
      }}
      className="text-gray-200 text-[18px]  tracking-wide font-arimo capitalize">google</motion.h1>
    </div>
  </button>
}

export default LoginButton