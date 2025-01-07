import './App.css'
import { Route, Routes, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import SignUp from './components/SignUp'
import LogIn from './components/LogIn'
import EmailVarification from './components/EmailVarification'
import OtpVarification from './components/OtpVarification'
import ChangePassword from './components/ChangePassword'
import Home from './components/Home'
import MessageBox from './components/MessageBox'
import useStore from './components/customhooks/UseStore'
import axios from 'axios'
import { MutateOptions } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
import DisplayImage from './components/DisplayImage'
import LandingPage from './components/LandingPage'


type logoutType = {
  mutate: (variables: void, options?: MutateOptions<any, unknown, void, unknown> | undefined) => void
}
export const logoutContext = React.createContext<logoutType>(null!)


type  userStatusType = {
  id: string | number,
  username: string,
  email: string,
  profile_image: string | null,
  access: string,
  refresh: string,
}

const logoutFunc = async (url: string, navigateToLogin: any) => {
  console.log("errror in userequest")
  try {
      const userStatus: userStatusType = JSON.parse(sessionStorage.getItem("userProfile")!);
      let config = {
          headers: { Authorization: "Bearer " + userStatus.access },
      };
      const postRefresh: {refresh: string} = {refresh: userStatus.refresh}
      const response = await axios.post(url, postRefresh,  config);
      if (response.status === 200) {
        sessionStorage.removeItem("userProfile")
        navigateToLogin("log-in/")
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
                      const postRefresh: {refresh: string} = {refresh: userStatus.refresh}
                      const retryResponse = await axios.post(url, postRefresh, config);
                      if (retryResponse.status === 200) {
                        sessionStorage.removeItem("userProfile")
                        navigateToLogin("/log-in/")
                      } else {
                          throw new Error ("failed to refresh token")
                      }
                  }
              } catch {
                  navigateToLogin("/log-in/");
                  throw new Error("Failed to refresh token.");
              }
          }
      } else {
          throw new Error("Request failed.");
      }
  }
};



function App() {


  const messageWebsocket = useStore(state =>  state.messageWebsocket)
  const navigateToLogin = useNavigate()
  const logoutMutate = useMutation({
    mutationFn: () => logoutFunc("http://127.0.0.1:8000/api/users/logout_user/", navigateToLogin),
  })


  useEffect(() => {
    document.body.classList.add("bg-gray-[#F5EFFF]")
    document.body.classList.add("overflow-x-hidden")  
  }, [messageWebsocket])

  return (
    <>
    <logoutContext.Provider value={{
      mutate: logoutMutate.mutate
    }}>
        <Routes>
          <Route path='/' element={<LandingPage/>} />
          <Route path='/sign-up' element={<SignUp/>} />
          <Route path='/log-in' element={<LogIn/>} />
          <Route path='/forgot-password' element={<EmailVarification/>} />
          <Route path='/otp-verification' element={<OtpVarification/>} />
          <Route path='/change-password' element={<ChangePassword/>} /> 
          <Route path='/home/' element={<Home/>}>
          <Route path='friend/:userId' element={<MessageBox/>} />
          <Route path='group/:groupId' element={<MessageBox/>} />
          </Route>
        </Routes>
        </logoutContext.Provider>
        {
          createPortal(<DisplayImage/>, document.getElementById("image-root")!)
        }    
    </>
  )
}

export default App
