import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import {Link, useNavigate} from "react-router-dom"
import uploadFile from '../../helpers/uploadFile';
import toast from 'react-hot-toast';
import { summaryApi } from '../../common';

function RegisterPage() {

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    picture: ""
  })

  const [uploadProfilePic, setUploadProfilePic] = useState("")
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

  const handleUploadProfilePic = async(e)=>{
    const file = e.target.files[0]

    const uploadProfilePic = await uploadFile(file)

    
    setUploadProfilePic(file)

    setData((prev)=>{
      return(
        {
         ...prev,
          picture: uploadProfilePic?.url
        }
      )
    })
  }

  const handleClearUploadProfilePic = (e)=>{    
    e.stopPropagation()
    e.preventDefault()
    setUploadProfilePic(null)
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!data.firstName ||!data.lastName ||!data.email ||!data.password) {
        toast.error("Please fill all fields")
        return
    }

    try {
        const response = await fetch(summaryApi.register.url, {
            method: summaryApi.register.method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(data),
        })

        const responseData = await response.json();
        
        if (responseData.success) {
            setData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                picture: ""
            })
            navigate("/email")
            console.log("another", data)
            console.log("another23", setData)
            console.log("another2343", responseData)
        }
        
        toast.success(responseData.message || "User registered successfully")
        
    } catch (error) {
        toast.error(error?.response?.data?.message || "Error Occurred")
    }

    console.log("everything", data)
}


  

  return (
    <div className='mt-5'>
        <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto mb-8'>
           <h3>
              Welcome to ABG Messenger!
           </h3>
           <form className='grid gap-4 mt-5' onSubmit={handleSubmit}>
             <div className=' flex flex-col gap-1'>
               <label htmlFor='firstName'>First Name :</label>
               <input 
                 type='text' 
                 id='firstName' 
                 name='firstName' 
                 placeholder='Enter your first name'
                 className='bg-slate-100 px-2 py-1 focus:outline-primary'
                 value={data.firstName}
                 onChange={handleOnChange}
                 required 
              />
             </div>

             <div className=' flex flex-col gap-1'>
               <label htmlFor='lastName'>Last Name :</label>
               <input 
                 type='text' 
                 id='lastName' 
                 name='lastName' 
                 placeholder='Enter your last name'
                 className='bg-slate-100 px-2 py-1 focus:outline-primary'
                 value={data.lastName}
                 onChange={handleOnChange}
                 required 
              />
             </div>

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

             <div className=' flex flex-col gap-1'>
               <label htmlFor='picture'>Profile picture :
                 <div className='h-14 bg-slate-200 flex justify-center items-center border hover:border-primary'>
                   <p className='text-sm cursor-pointer max-w-[300px] text-ellipsis line-clamp-1'>
                     {uploadProfilePic? uploadProfilePic?.name : 'Upload profile picture'}                    
                   </p>
                   {
                     uploadProfilePic?.name && (
                       <button onClick={handleClearUploadProfilePic}>
                         <IoClose className='w-5 h-5 hover:text-primary ml-2' />  
                       </button>
                     )
                   }                   
                 </div>
               </label>
               
               <input 
                 type='file' 
                 id='picture' 
                 name='picture' 
                 className='bg-slate-100 px-2 py-1 focus:outline-primary hidden'   
                 onChange={handleUploadProfilePic}              
              />
             </div>
             <button
               className='bg-primary text-lg px-4 py-1 hover:bg-secondary hover:text-white rounded mt-4 font-bold leading-relaxed tracking-wide'
             >
                Register
             </button>
           </form>

           <p className='my-3 text-center'>
            Already have an account ? 
             <Link
                to={"/email"}
                className='hover:text-primary hover:underline font-semibold'
             >
                Login
             </Link>
           </p>
          
        </div>
    </div>
  )
}

export default RegisterPage