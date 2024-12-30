import React from 'react'
import Avatar from '../UsersAvatar/Avatar'
import { Link } from 'react-router-dom'

function UserSearchCard({user, onClose}) {
  return (
    <Link to={"/"+user?._id} onClick={onClose} className='flex items-center gap-3 p-2 lg:p-4 border border-transparent border-b-slate-200 hover:border hover:border-primary rounded cursor-pointer'>
       <div>
          <Avatar
            width={50}
            height={50}
            firstName={user.firstName}
            lastName={user.lastName}
            imageUrl={user?.picture}
            userId={user?._id}
          />
       </div>

       <div>
          <div className='font-semibold text-ellipsis line-clamp-1'>
              {user.firstName} {user.lastName}
          </div>
          <p className='text-sm text-ellipsis line-clamp-1'>
            {user.email}
          </p>
       </div>
    </Link>
  )
}

export default UserSearchCard