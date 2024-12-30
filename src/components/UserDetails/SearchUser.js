import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5"
import Loading from '../Accessories/Loading'
import UserSearchCard from './UserSearchCard'
import toast from 'react-hot-toast'
import { summaryApi } from '../../common'
import { IoClose } from "react-icons/io5";

function SearchUser({onClose}) {
    const [searchUser, setSearchUser] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [debounceTimeout, setDebounceTimeout] = useState(null)

    const searchUserHandler = async (searchTerm) => {
      if (!searchTerm.trim()) {
          setSearchUser([])
          return
      }
      
      try {
          setLoading(true)
          const response = await fetch(summaryApi.searchUser.url, {
              method: summaryApi.searchUser.method,
              credentials: "include",
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                  search: searchTerm.trim()  // Matches the backend expected field name
              })     
          })
  
          const searchResult = await response.json()
          
          if (!response.ok) {
              throw new Error(searchResult.message || 'Failed to search users')
          }
  
          // Log the response for debugging
          console.log("Search response:", searchResult)
  
          setSearchUser(searchResult.users || [])
          
      } catch (error) {
          console.error("Search error:", error)
          const errorMessage = error.response?.data?.message || error.message || 'Error searching users'
          toast.error(errorMessage)
          setSearchUser([])
      } finally {
          setLoading(false)
      }
  }

    useEffect(() => {
        // Clear the previous timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout)
        }

        // Set a new timeout
        const timeout = setTimeout(() => {
            searchUserHandler(search)
        }, 500) // Wait 500ms after user stops typing

        setDebounceTimeout(timeout)

        // Cleanup function
        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout)
            }
        }
    }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (e) => {
        setSearch(e.target.value)
        if (!e.target.value.trim()) {
            setSearchUser([])
            setLoading(false)
        }
    }

    console.log("seaarch user", searchUser);

    return (
        <div className='fixed top-0 bottom-0 right-0 left-0 bg-slate-700 z-50 bg-opacity-40 p-2'>
            <div className='w-full max-w-lg mx-auto mt-10'>
                {/* Search input */}
                <div className='bg-white rounded h-14 overflow-hidden flex'>
                    <input
                        type='text'
                        placeholder='Search user by name, email ....'
                        onChange={handleSearchChange}
                        value={search}
                        className='w-full px-4 py-1 text-sm text-gray-700 placeholder-gray-400 rounded-md outline-none'
                    />
                    <div className='h-14 w-14 flex justify-center items-center'>
                        <IoSearchOutline
                            size={25}
                            className={loading ? 'animate-spin' : ''}
                        />
                    </div>
                </div>

                {/* Results display */}
                <div className='bg-white mt-2 w-full p-4 rounded max-h-[calc(100vh-200px)] overflow-y-auto'>
                    {/* Empty state */}
                    {!search.trim() && (
                        <p className='text-center text-slate-500'>Start typing to search users</p>
                    )}

                    {/* No results */}
                    {search.trim() && searchUser.length === 0 && !loading && (
                        <p className='text-center text-slate-500'>No users found</p>
                    )}

                    {/* Loading state */}
                    {loading && (
                        <div className='text-center text-slate-500'>
                            <Loading/>
                        </div>
                    )}

                    {/* Results list */}
                    {!loading && searchUser.length > 0 && (
                        <div className='space-y-2'>
                            {searchUser.map((user, index) => (
                                <UserSearchCard
                                    key={`${user._id}-${index}`}
                                    user={user}
                                    onClose={onClose} // Close the search modal when a user card is clicked on
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
              <IoClose size={25} onClick={onClose} className='absolute top-5 right-5 text-white hover:text-primary' />  
            </div>
        </div>
    )
}

export default SearchUser