import { NavLink, useNavigate } from "react-router-dom"
import Logo from "./Logo";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import axios from "axios";


export const OtpVarification = () => {
  const naviagateToHome = useNavigate()
  const inputRef = useRef<null | HTMLInputElement>(null)
  const minRef = useRef<HTMLSpanElement>(null!)
  const secRef = useRef<HTMLSpanElement>(null!)
  const [isResendOtp, setisResendOtp] = useState(false)
  const [isIncorrectOtpCode, setisIncorrectotpCode] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [isDisbale, setIsDisable] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null!)
  const validateInput = useCallback(() => {
    if (otpCode.length === 5) {
      setIsDisable(false)
      buttonRef.current.classList.remove("bg-green-300")
      buttonRef.current.classList.add("bg-green-500")
      return true
    }
    setIsDisable(true)
    buttonRef.current.classList.remove("bg-green-500")
    buttonRef.current.classList.add("bg-green-300")
    return false
  }, [otpCode])

  const resendOtpCode = () => {
    const userDetails = JSON.parse(sessionStorage.getItem("userDetails")!)
    setisResendOtp(false)
    if (userDetails) {
      axios.post("http://127.0.0.1:8000/api/users/verify_email/", {email: userDetails.email})
      .catch((error) => {
        console.log(error)
      })
    }
  }


  

  const verifyOtpcode = () => {
    if (validateInput()) {
      setisIncorrectotpCode(false)
      setIsDisable(true)
      buttonRef.current.classList.remove("bg-green-500")
      buttonRef.current.classList.add("bg-green-300")
      const userDetails: {username: string, email: string, password: string}  = JSON.parse(sessionStorage.getItem("userDetails")!)
      axios.post("http://127.0.0.1:8000/api/users/verify_otp/", {otpCode, email: userDetails.email})
      .then(response => {
        if (response.status === 200) {
          const userDetails = JSON.parse(sessionStorage.getItem("userDetails")!)
          if (userDetails) {
            axios.post("http://127.0.0.1:8000/api/users/create_user/", userDetails)
            .then(response => {
              if (response.status === 201) {
                sessionStorage.setItem("userProfile", JSON.stringify(response.data))
                sessionStorage.removeItem("userDetails")
                naviagateToHome("/home")
              }
            })
            .catch(error => {
              console.log(error)
            })
          }
        }
      })
      .catch(error => {
        if (error.response.status === 406) {
          setisIncorrectotpCode(true)
        }
        setIsDisable(false)
        buttonRef.current.classList.remove("bg-green-300")
        buttonRef.current.classList.add("bg-green-500")
      })
    }
  }
  useEffect(() => {
    if (sessionStorage.getItem("isFirstRefresh")) {
      //navigateToPreviousPage(-1)
    } else {
      sessionStorage.setItem("isFirstRefresh", "true")
    }
  }, [])
  useEffect(() => {
    inputRef.current?.focus()

    const endTimeInterval = setInterval(() => {
      if (isResendOtp === false) {
        if (parseInt(secRef.current.innerHTML) > 1) {
          secRef.current.innerHTML =  parseInt(secRef.current.innerHTML) <=10 ? "0" +  (parseInt(secRef.current.innerHTML) - 1) : "" + (parseInt(secRef.current.innerHTML) - 1)
          return
        }
        else if (parseInt(minRef.current.innerHTML) > 0) {
          secRef.current.innerHTML = "59"
          minRef.current.innerHTML = "0"
          return
        }
        setisResendOtp(true)

      }
    }, 1000)

    return () => {
      clearInterval(endTimeInterval)
    }

  }, [isResendOtp])
  return (
    <div className="lg:w-[700px] w-screen  bg-[#BCF2F6]  lg:shadow-md bg-opacity-50 backdrop-filter backdrop-blur-lg h-screen lg:h-[610px]  md:rounded-md pt-4">
    <div className="md:w-[80%] w-[100%] pl-2 pr-2 h-[35px]  mx-auto flex justify-between items-center">
      <Logo/>
      <h1 className="font-roboto text-gray-800"> Have an account? <NavLink className={"text-green-400 capitalize font-semibold"} to={"/log-in"} >Log In</NavLink></h1>
    </div>
    <div className="md:w-[55%] flex flex-col md:items-center w-[100%] h-[80%] mt-8  mx-auto ">
      <h1 className="lg:text-[30px] md:text-[35px] text-[30px] ml-2 md:ml-0   text-gray-900  text-wrap md:w-[400px] w-[350px]  md:text-center  text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-500 font-bold font-noto">Hi, we sent an otp code to your email <span className="text-[20px] inline-block w-[270px] truncate">geraldrolland@gmail.com </span>
      </h1>
      {
        isIncorrectOtpCode ?
        <small className="text-red-600 font-muli mx-auto">Incorrect Otp Code</small> : null
      }
      <h1 className="text-gray-800 font-poppins text-[14px] mt-4  self-center">enter the 5 digits otp code sent to your email</h1>
      <div className="w-[100%] h-[60px]  flex justify-center items-center proportional-nums mt-2 font-roboto text-[18px]">
      <InputOTP value={otpCode} onComplete={validateInput}  ref={inputRef} onChange={(value) => {
        setOtpCode(value)
        validateInput()
        }} maxLength={5}>
      <InputOTPGroup>
      <InputOTPSlot  className="w-[50px] h-[50px] rounded-[25px] focus:outline-blue-500 bg-white border-none shadow-sm text-gray-800 focus:outline" index={0} />
      </InputOTPGroup>
      <InputOTPGroup>
      <InputOTPSlot  className="w-[50px] bg-white border-none text-gray-800 shadow-sm  h-[50px] rounded-[25px]" index={1} />
      </InputOTPGroup>
      <InputOTPGroup>
      <InputOTPSlot  className="w-[50px] h-[50px] text-gray-800 bg-white border-none shadow-sm  rounded-[25px]" index={2} />
      </InputOTPGroup>
      <InputOTPGroup>
      <InputOTPSlot  className="w-[50px] bg-white border-none text-gray-800 shadow-sm  h-[50px] rounded-[25px]" index={3} />
      </InputOTPGroup>
      <InputOTPGroup>
      <InputOTPSlot  className="w-[50px] bg-white border-none shadow-sm text-gray-800  h-[50px] rounded-[25px]" index={4} />
      </InputOTPGroup>
      </InputOTP>
      </div>

      <button onClick={verifyOtpcode} ref={buttonRef} disabled={isDisbale} className="md:w-[100%] w-[95%] md:ml-0 ml-[2.5%]  min-h-[50px] transform bg-green-300 duration-300 transition-all hover:scale-105 active:scale-95 rounded-md  mt-4 capitalize text-gray-100 font-poppins">verify code</button>
      <h1 className="text-[16px] self-center font-poppins text-gray-700 mt-6">Didn't receive otp code ? {
        !isResendOtp ? <span className="text-red-600">Resend</span> : <span className="text-blue-600 cursor-pointer" onClick={() => {resendOtpCode()}}>Resend</span> 
        }  { !isResendOtp ? <span className="text-red-600">In</span> : null} <span className="text-red-600 proportional-nums font-oswald">{!isResendOtp ? <span ref={minRef}>1</span> : null} { !isResendOtp ? ":" : null} {!isResendOtp ? <span ref={secRef}>59</span> : null}</span></h1>
    </div>
  </div>
  )
}

export default OtpVarification
