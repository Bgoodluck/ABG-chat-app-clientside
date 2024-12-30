import React from 'react'
import logo from "../asset/logo2.png"

function AuthLayouts({children}) {
  return (
    <>
      <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
         <img 
           src={logo} 
           alt="logo"            
           className='rounded-full w-12 h-12'
           />
         {/* <h1>Welcome to ABG Messenger</h1> */}
         {/* <hr /> */}
      </header>
    
     {children}
    </>
  )
}

export default AuthLayouts