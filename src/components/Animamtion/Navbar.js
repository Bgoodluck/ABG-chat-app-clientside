import React from 'react'
import { NavbarData } from '../../MockData/MockData'
import { CgMenuGridO } from "react-icons/cg";
import { FaUserFriends } from "react-icons/fa";
import { PiUserListFill } from "react-icons/pi";
import {  motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Navbar() {

  const navigate = useNavigate()


  const handleClickHome = () => {
    navigate('/')
  }


  return (
    <nav className='text-white py-5'>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }} 
          className='container flex justify-between items-center'>

               {/* logo section */}
               <div className='flex items-center gap-2 text-3xl font-semibold' onClick={handleClickHome}>                
                 <FaUserFriends/>
                    Active Conversations
               </div>

               {/* menu section */}
               <div className='hidden md:block'>
                 <ul className='flex items-center gap-4'>
                     {NavbarData.map((item, index) => {
                         return (
                          <li key={index}>
                            <a href={item.link} className='inline-block text-base py-2 px-3 uppercase'>{item.title}</a>
                          </li>
                         )
                     })}
                     <button className='text-xl ps-14'>
                          <PiUserListFill />
                     </button>
                 </ul>
               </div>

               {/* hamburger menu */}
               <div className='md:hidden' onClick={handleClickHome}>
                  <CgMenuGridO className='cursor-pointer text-4xl'/>
  
               </div>
          </motion.div>
    </nav>
  )
}

export default Navbar