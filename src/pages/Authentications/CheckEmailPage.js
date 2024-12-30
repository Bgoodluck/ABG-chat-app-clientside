import React, { useState } from 'react'
import { PiUserCircle } from "react-icons/pi";
// import { IoClose } from "react-icons/io5";
import {Link, useNavigate} from "react-router-dom"
// import uploadFile from '../../helpers/uploadFile';
// import axios from "axios"
import toast from 'react-hot-toast';
import { summaryApi } from '../../common';




function CheckEmailPage() {


  const [data, setData] = useState({
    email: ''    
  })

  
  const navigate  = useNavigate()



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

  
  const handleSubmit = async(e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!data.email) {
        toast.error("Please fill all fields")
        return
    }

    try {
        const response = await fetch(summaryApi.email.url, {
            method: summaryApi.email.method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(data),
        })

        const responseData = await response.json();
        
        if (responseData.success) {

          const emailData = {
            email: data.email,
            userData: responseData.data 
        };

            setData({                
                email: '',                
            })

            navigate("/password", {
              state: emailData
            })
            console.log("Email", data)
            console.log("Email23", setData)
            console.log("Email2343", responseData)
        }
        
        toast.success(responseData.message || "successfully")
        
    } catch (error) {
        toast.error(error?.response?.data?.message || "Error Occurred")
    }

    console.log("everything", data)
}




  return (
    <div className='mt-5'>
        <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto mb-8'>
          <div className='w-fit mx-auto mb-2'>
             <PiUserCircle
              size={80}
             />
          </div>
           <h3>
              Welcome to ABG Messenger!
           </h3>
           <form className='grid gap-4 mt-5' onSubmit={handleSubmit}>
             
             <div className=' flex flex-col gap-1'>
               <label htmlFor='email'>Email :</label>
               <input 
                 type='email' 
                 id='email' 
                 name='email' 
                 placeholder='Enter your email'
                 className='bg-slate-100 px-2 py-1 focus:outline-primary'
                 value={data.email}
                 onChange={handleOnChange}
                 required 
              />
             </div>            
             <button
               className='bg-primary text-lg px-4 py-1 hover:bg-secondary hover:text-white rounded mt-4 font-bold leading-relaxed tracking-wide'
             >
                Delve In!
             </button>
           </form>

           <p className='my-3 text-center'>
            Don't have an account ? 
             <Link
                to={"/register"}
                className='hover:text-primary hover:underline font-semibold'
             >
                Register
             </Link>
           </p>
          
        </div>
    </div>
  )
}

export default CheckEmailPage