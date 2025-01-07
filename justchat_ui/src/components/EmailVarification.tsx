import { NavLink } from "react-router-dom"
import Logo from "./Logo";
import { useEffect, useRef } from "react";


const EmailVarification = () => {
  const emailRef = useRef<null | HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])
  return (
    <div className="lg:w-[700px] w-screen  lg:shadow-md bg-opacity-50 backdrop-filter backdrop-blur-lg h-screen lg:h-[610px] bg-[#BCF2F6] md:rounded-md pt-4">
    <div className="md:w-[80%] w-[100%] pl-2 pr-2 h-[35px]  mx-auto flex justify-between items-center">
      <Logo/>
      <h1 className="font-roboto text-gray-800"> Have an account? <NavLink className={"text-green-400 capitalize font-semibold"} to={"/log-in"} >Log In</NavLink></h1>
    </div>
    <div className="md:w-[55%] flex flex-col md:items-center w-[100%] h-[80%] mt-8  mx-auto ">
      <h1 className="lg:text-[30px] md:text-[35px] text-[30px] ml-2 md:ml-0  capitalize text-gray-900  text-wrap md:w-[400px] w-[350px] flex md:text-center md:justify-center items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-500 font-bold font-noto">Hi, forgot your  password, enter your email to get an otp</h1>
      <input ref={emailRef} placeholder="Enter Your Email Here ..." maxLength={82} type="text" className="w-[100%] min-h-[50px] md:rounded-md bg-gray-[#FFFFFF]  focus:outline-none font-poppins mt-4 pl-2 text-gray-500" />
      <button className="md:w-[100%] w-[95%] md:ml-0 ml-[2.5%]  min-h-[50px] transform duration-300 transition-all hover:scale-105 active:scale-95 rounded-md bg-green-500 mt-4 capitalize text-gray-100 font-poppins">reset password</button>
    </div>
  </div>
  )
}

export default EmailVarification
