import { NavLink, useNavigate } from "react-router-dom"
import { FiEye } from "react-icons/fi";
import axios from "axios";
import Logo from "./Logo";
import { useEffect, useRef, useState} from "react";
import LoginButton from "./LoginButton";
import { FiEyeOff } from "react-icons/fi";

type userDetailType = {
  username: string,
  email: string,
  password: string,
}

const SignUp = () => {
  const emailRef = useRef<HTMLInputElement>(null!)
  const passwordRef = useRef<HTMLInputElement>(null!)
  const signUpButtonRef = useRef<HTMLButtonElement>(null!)
  const usernameRef = useRef<HTMLInputElement>(null!)
  const hideRef = useRef<null | HTMLDivElement>(null)
  const viewRef = useRef<null | HTMLDivElement>(null)
  const [userDetails, setUserDetails] = useState<userDetailType>({
    username: "",
    email: "",
    password: "",
  })
  const [isDisbale, setIsDisable] = useState(true)
  const navigateToEmailVerfication = useNavigate()
  const [isShowPassword, setIsShowOrHidePassword] = useState(true)
  const [isEmailAlreadyExists, setIsEmailAlreadyExists] = useState(false)

  const validateUserdetails = () => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (usernameRef.current?.value.trim() !== "" && emailRegex.test(emailRef.current.value) === true && passwordRegex.test(passwordRef.current.value) === true) {
      signUpButtonRef.current?.classList.remove("bg-green-300")
      signUpButtonRef.current?.classList.add("bg-green-500")
      setIsDisable(false)
      setIsEmailAlreadyExists(false)
      return true
    }
    signUpButtonRef.current?.classList.add("bg-green-300")
    signUpButtonRef.current?.classList.remove("bg-green-500")
    setIsDisable(true)
    setIsEmailAlreadyExists(false)
    return false
  }

  const handleSignUp = () => {
    if(validateUserdetails()) {
      console.log("error")
      signUpButtonRef.current?.classList.remove("bg-green-500")
      signUpButtonRef.current?.classList.add("bg-green-300")
      setIsDisable(true)
      axios.post("https://justchat-api.onrender.com/api/users/verify_email/", {email: userDetails.email})
      .then((response) => {
        if (response.status === 200) {
          setIsDisable(false)
          sessionStorage.setItem("userDetails", JSON.stringify(userDetails))
          signUpButtonRef.current?.classList.remove("bg-green-300")
          signUpButtonRef.current?.classList.add("bg-green-500")
          navigateToEmailVerfication("/otp-verification")
        }
      })
      .catch((error) => {
        setIsDisable(false)
        signUpButtonRef.current?.classList.remove("bg-green-300")
        signUpButtonRef.current?.classList.add("bg-green-500")
        if (error.response.status === 400) {
          setIsEmailAlreadyExists(true)
        }
        console.log(error)
      })
    }
  }

  const hideOrViewPassword = () => {
    if (isShowPassword === true) {
      hideRef.current?.classList.remove("flex")
      hideRef.current?.classList.add("hidden")
      viewRef.current?.classList.remove("hidden")
      viewRef.current?.classList.add("flex")
      passwordRef.current.type = "password"
      setIsShowOrHidePassword(false)
    } else {
      hideRef.current?.classList.add("flex")
      hideRef.current?.classList.remove("hidden")
      viewRef.current?.classList.add("hidden")
      viewRef.current?.classList.remove("flex")
      passwordRef.current.type = "text"
      setIsShowOrHidePassword(true)
    }
  }

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])


  return (
    <div className="lg:w-[700px] w-screen  lg:shadow-md bg-opacity-50 backdrop-filter backdrop-blur-lg h-screen lg:h-[610px] bg-[#BCF2F6] md:rounded-md pt-4">
      <div className="md:w-[80%] w-[100%] pl-2 pr-2 h-[35px]  mx-auto flex justify-between items-center">
        <Logo/>
        <h1 className="font-roboto text-gray-800"> have an account? <NavLink className={"text-green-400 capitalize font-semibold"} to={"/log-in"} >log in</NavLink></h1>
      </div>
      <div className="md:w-[55%] w-[100%] flex flex-col md:items-center  h-[86%] mt-8  mx-auto ">
        <h1 className="lg:text-[30px] md:text-[35px] text-[30px] ml-2 md:ml-0  capitalize text-gray-900  text-wrap w-[350px] flex md:text-center justify-center items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-500 font-bold font-noto">Hi, Sign Up to get Started</h1>
        { isEmailAlreadyExists ?
          <small className="font-muli text-red-500 mx-auto md:tracking-wide">Email Already Exists</small> : null
        }
        <input value={userDetails.username} onChange={(e) => {
          setUserDetails({...userDetails, username: e.target.value})
          validateUserdetails()
          }} ref={usernameRef} placeholder="Username" maxLength={36} type="text" className="w-[100%] min-h-[50px] md:rounded-md bg-gray-[#FFFFFF] focus:outline-none font-poppins mt-4 pl-2 text-gray-500" />
        <input ref={emailRef} value={userDetails.email} onChange={(e) => {
          setUserDetails({...userDetails, email: e.target.value})
          validateUserdetails()
          }} placeholder="Email" maxLength={36} type="text" className="w-[100%] min-h-[50px] md:rounded-md bg-gray-[#FFFFFF] focus:outline-none font-poppins mt-4 pl-2 text-gray-500" />
        <div className="w-[100%] min-h-[50px] relative mt-4 md:rounded-md flex justify-center items-center">
          <input maxLength={36} ref={passwordRef} value={userDetails.password} onChange={(e) => {
            setUserDetails({...userDetails, password: e.target.value})
            validateUserdetails()
            }} className="w-[100%] focus:outline-none h-[100%] text-gray-500 pl-2 font-poppins  bg-gray-[#FFFFFF] md:rounded-md" type="text" placeholder="Password" />
          <div onClick={hideOrViewPassword} ref={viewRef} className="w-[40px] cursor-pointer h-[100%]  z-10  absolute right-0 top-0 hidden justify-center items-center">
          <FiEye className="text-gray-400 text-[18px]" />
          </div>
          <div onClick={hideOrViewPassword} ref={hideRef} className="w-[40px] h-[100%]  z-10  absolute right-0 cursor-pointer top-0 justify-center flex items-center">
          <FiEyeOff className="text-gray-400 text-[18px]" />
          </div>
        </div>
        <button onClick={handleSignUp} ref={signUpButtonRef} disabled={isDisbale} className="md:w-[100%] w-[95%] ml-[2.5%] md:ml-0  min-h-[50px] transform duration-300 transition-all hover:scale-105 active:scale-95 rounded-md bg-green-300 mt-4 capitalize text-gray-100 font-poppins">Sign Up</button>
        <div className="md:w-[100%] w-[95%] md:ml-0 ml-[2.5%] mt-2 h-[30px] flex justify-between items-center"><div className="w-[30%] h-[1px] border-[1px]"></div><h1 className="text-gray-800 font-muli">Or sign up with</h1>
        <div className="w-[30%] h-[1px] border-[1px]"></div>
        </div>
        <LoginButton/>
      </div>
    </div>
  )
}

export default SignUp