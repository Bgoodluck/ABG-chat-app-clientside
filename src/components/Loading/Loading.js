import React from 'react'

function Loading() {
    return Array(5).fill().map((_, index) => (
        <div 
            key={index} 
            className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320x] h-36 bg-slate-200 dark:bg-slate-800 rounded-sm shadow-md flex animate-pulse'
        >
            <div className='bg-slate-300 dark:bg-slate-700 h-full p-4 min-w-[120px] md:min-w-[145px] flex items-center justify-center'>
                <div className='w-full h-full bg-slate-400 dark:bg-slate-600 rounded'></div>
            </div>
            <div className='p-4 grid w-full'>
                <div className='h-4 bg-slate-300 dark:bg-slate-700 mb-2 w-3/4 rounded'></div>
                <div className='h-3 bg-slate-300 dark:bg-slate-700 mb-2 w-1/2 rounded'></div>
                <div className='h-4 bg-slate-300 dark:bg-slate-700 mb-2 w-2/3 rounded'></div>
                <div className='h-8 bg-slate-300 dark:bg-slate-700 w-1/2 rounded mt-2'></div>
            </div>
        </div>
    ));
}

export default Loading