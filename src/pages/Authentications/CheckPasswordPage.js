import React, { useEffect, useState } from 'react'
// import { PiUserCircle } from "react-icons/pi";
// import { IoClose } from "react-icons/io5";
import {Link, useLocation, useNavigate} from "react-router-dom"
// import uploadFile from '../../helpers/uploadFile';
// import axios from "axios"
import toast from 'react-hot-toast';
import { summaryApi } from '../../common';
import Avatar from '../../components/UsersAvatar/Avatar';
import { useDispatch } from 'react-redux'
import { setToken, setUser } from '../../redux/userSlice';
import { saveUserToStorage } from '../../utils/localStorage';

function CheckPasswordPage() {
  
  const [isLoading, setIsLoading] = useState(false)
  const navigate  = useNavigate()
  const location = useLocation()

  const [data, setData] = useState({
    password: '', 
    userId: location?.state?.userData?._id   
  })

  const dispatch = useDispatch()

  
  

console.log("location", location?.state?.userData?._id)



useEffect(()=>{
  if (!location?.state?.email) {
    navigate("/email")      
  }
},[]) // eslint-disable-line react-hooks/exhaustive-deps



  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData((prev)=>{
      return(
        {
         ...prev,
          [name]: value
        }
      )
    })
  }

  
//   const handleSubmit = async(e) => {
//     e.preventDefault()
//     e.stopPropagation()
    
//     if (!data.password) {
//         toast.error("Please fill all fields")
//         return
//     }

//     try {
//         console.log("Sending password check request:", {
//             userId: data.userId,
//             passwordLength: data.password?.length
//         });

//         const response = await fetch(summaryApi.password.url, {
//             method: summaryApi.password.method,
//             credentials: 'include',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(data),
//         })

//         const responseData = await response.json();
//         console.log("Password check response:", responseData);

//         if (responseData.success) {
//           dispatch(setToken(responseData.token))
//           localStorage.setItem('token', responseData.token)
//           saveUserToStorage("token", responseData.token); 
//             setData({ password: '' })
//             navigate("/")            
//             toast.success(responseData.message || "Login successful")
//         } else {
//             toast.error(responseData.message || "Invalid credentials")
//         }
        
//     } catch (error) {
//         console.error("Password check error:", error);
//         toast.error("Error occurred while logging in")
//     }
// }


const handleSubmit = async(e) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (!data.password) {
      toast.error("Please fill all fields")
      return
  }

  try {
    setIsLoading(true)
      console.log("Sending password check request:", {
          userId: data.userId,
          passwordLength: data.password?.length
      });

      const response = await fetch(summaryApi.password.url, {
          method: summaryApi.password.method,
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      })

      const responseData = await response.json();
      console.log("Password check response:", responseData);

      if (responseData.success) {
        try {
            dispatch(setToken(responseData.token))
            localStorage.setItem('token', responseData.token)
            
            if (responseData.user) {
                dispatch(setUser(responseData.user))
                saveUserToStorage(responseData.user)
            }
            
            setData({ password: '' })
            navigate("/")            
            toast.success(responseData.message || "Login successful")
        } catch (storageError) {
            console.error("Error saving to localStorage:", storageError)
            toast.warning("Logged in successfully, but there was an error saving your session")
        }
    } else {
          toast.error(responseData.message || "Invalid credentials")
      }
      
  } catch (error) {
      console.error("Password check error:", error);
      toast.error("Error occurred while logging in")
  }finally {
    setIsLoading(false)
}
}



  return (
    <div className='mt-5'>
        <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto mb-8'>
          <div className='w-24 h-24 mx-auto mb-2 mt-2 flex justify-center items-center flex-col'>
             {/* <PiUserCircle
              size={80}
             /> */}
             <Avatar
             width={96}
             height={96}
             imageUrl={location?.state?.userData?.picture}
             firstName={location?.state?.userData?.firstName}
             lastName={location?.state?.userData?.lastName}
            
             />
             <h2 className='whitespace-nowrap font-semibold text-lg mt-1'>
              {location?.state?.userData?.firstName} {location?.state?.userData?.lastName}
             </h2>
          </div>
           {/* <h3>
              Welcome to ABG Messenger!
           </h3> */}
           <form className='grid gap-4 mt-6 ' onSubmit={handleSubmit}>
             
             <div className=' flex flex-col gap-1'>
               <label htmlFor='password'>Password :</label>
               <input 
                 type='password' 
                 id='password' 
                 name='password' 
                 placeholder='Enter your password'
                 className='bg-slate-100 px-2 py-1 focus:outline-primary'
                 value={data.password}
                 onChange={handleOnChange}
                 required 
              />
             </div>            
             <button
                type="submit" 
                disabled={isLoading}
               className='bg-primary text-lg px-4 py-1 hover:bg-secondary hover:text-white rounded mt-4 font-bold leading-relaxed tracking-wide'
             >
                 {isLoading ? "Logging in..." : "Login"}
             </button>
           </form>

           <p className='my-3 text-center'>
             Forgot your password? 
             <Link
                to={"/forgot"}
                className='hover:text-primary hover:underline font-semibold'
             >
                Click here
             </Link>
           </p>
          
        </div>
    </div>
  )
}


export default CheckPasswordPage