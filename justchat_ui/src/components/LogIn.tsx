import { NavLink, useNavigate } from "react-router-dom"
import { FiEye } from "react-icons/fi";
import LoginButton from "./LoginButton";
import Logo from "./Logo";
import { useEffect, useRef, useState} from "react";
import axios from "axios";

type userLoginInputType = {
  email: string,
  password: string,
}

const LogIn = () => {

  const [userLoginInput, setUserLoginInput] = useState<userLoginInputType>({
    email: "",
    password: "",
  })

  const buttonRef = useRef<HTMLButtonElement>(null!)

  const emailRef = useRef<HTMLInputElement>(null!)
  const passwordRef = useRef<HTMLInputElement>(null!) 
  const [isDisbale, setIsDisable] = useState(false)
  const [isWrongEmailOrPassword, setIsWrongEmailOrPassword] = useState(false)
  const navigateToHome = useNavigate()




  const validateUserdetails = () => {
    setIsWrongEmailOrPassword(false)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRef.current?.value.trim() !== "" && passwordRef.current?.value.trim() !== "" && emailRegex.test(emailRef.current?.value) === true) {
      console.log("wo")
      setIsDisable(false)
      buttonRef.current?.classList.remove("bg-green-300")
      buttonRef.current?.classList.add("bg-green-500")
      return true
    } else {
      buttonRef.current?.classList.add("bg-green-300")
      buttonRef.current?.classList.remove("bg-green-500")
      setIsDisable(true)
      return false
    }
  }

  const handleUserLogin = () => {
    if (validateUserdetails() === true) {
      buttonRef.current?.classList.add("bg-green-300")
      buttonRef.current?.classList.remove("bg-green-500")
      setIsDisable(true)
      console.log("error")
      axios.post("https://justchat-api.onrender.com/api/users/login_user/", userLoginInput)
      .then((response) => {
        if (response.status === 200) {
          sessionStorage.setItem("userProfile", JSON.stringify(response.data))
          navigateToHome("/home")
        } else {
          console.log(response.status)
        }
      })
      .catch(error => {
        if (error.response.status === 404 || error.response.status === 400) {
          buttonRef.current?.classList.remove("bg-green-300")
          buttonRef.current?.classList.add("bg-green-500")
          setIsWrongEmailOrPassword(true)
          setIsDisable(false)
        }
      })
    }
  }
  useEffect(() => {
    emailRef.current?.focus()
  }, [])




  return (
    <div className="lg:w-[700px] w-screen  lg:shadow-md bg-opacity-50 backdrop-filter backdrop-blur-lg h-screen lg:h-[610px]  bg-[#BCF2F6] md:rounded-md pt-4">
      <div className="md:w-[80%] w-[100%] pl-2 pr-2 h-[35px]  mx-auto flex justify-between items-center">
        <Logo/>
        <h1 className="font-roboto text-gray-800"> Don't have an account? <NavLink className={"text-green-400 capitalize font-semibold"} to={"/sign-up"} >Sign Up</NavLink></h1>
      </div>
      <div className="md:w-[55%] flex flex-col md:items-center w-[100%] h-[80%] mt-2  mx-auto ">
        <h1 className="lg:text-[30px] md:text-[35px] text-[30px] ml-2 md:ml-0  capitalize text-gray-900  text-wrap w-[350px] flex md:text-center justify-center items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-500 font-bold font-noto">Welcome, Sign In to get Started</h1>
        {
          isWrongEmailOrPassword ? <small className="block mx-auto text-red-600 font-noto capitalize">wrong email or password</small> : null
        }
        <input value={userLoginInput.email} onChange={(e) => {
          setUserLoginInput({...userLoginInput, email: e.target.value})
          validateUserdetails()
        }} ref={emailRef} placeholder="Email" maxLength={82} type="text" className="w-[100%] min-h-[50px] md:rounded-md bg-gray-[#FFFFFF]  focus:outline-none font-poppins mt-4 pl-2  text-gray-500" />
        <div className="w-[100%] min-h-[50px] relative mt-4 md:rounded-md flex justify-center items-center">
          <input
          value={userLoginInput.password} onChange={(e) => {
            setUserLoginInput({...userLoginInput, password: e.target.value})
            validateUserdetails()
          }} 
           ref={passwordRef} className="w-[100%] focus:outline-none h-[100%] text-gray-500 pl-2 font-poppins bg-gray-[#FFFFFF]   md:rounded-md" type="text" placeholder="Password" />
          <div className="w-[40px] h-[100%] z-10  absolute right-0 top-0 flex justify-center items-center">
          <FiEye className="text-gray-400 text-[18px]" />
          </div>
        </div>
        <div className="md:w-[100%] ml-[2.5%] md:ml-0 w-[95%] min-h-[50px] flex justify-between items-center">
          <NavLink to={"/forgot-password"} className="text-muli block mt-3 italic text-red-400">Recover password</NavLink>
        </div>
        <button ref={buttonRef} onClick={() => handleUserLogin()} disabled={isDisbale} className="md:w-[100%] w-[95%] md:ml-0 ml-[2.5%]  min-h-[50px] transform duration-300 transition-all hover:scale-105 active:scale-95 rounded-md bg-green-300 mt-4 capitalize text-gray-100 font-poppins">Sign in</button>
        <div className="md:w-[100%] w-[95%] md:ml-0 ml-[2.5%]  mt-2 h-[30px] flex justify-between items-center"><div className="w-[30%] h-[1px] border-[1px]"></div><h1 className="text-gray-800 font-muli">Or sign in with</h1>
        <div className="w-[30%] h-[1px] border-[1px]"></div>
        </div>
        <LoginButton/>
      </div>
    </div>
  )
}


export default LogIn