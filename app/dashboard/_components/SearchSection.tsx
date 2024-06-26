import { Search } from 'lucide-react';
import React from 'react';

function SearchSection({onSearchInput}:any) {
  return (
    <div className='p-10 bg-gradient-to-br from-purple-500 via-purple-700 to-blue-600 flex justify-center items-center text-white flex-col max-h-screen'>
      <h2 className='text-3xl font-bold'>Browse All Templates</h2>
      <p>What would you like to create today</p>
      <div className='w-full mt-3'>
        <div className='flex gap-2 p-2 rounded-md bg-white'>
          <Search className='text-primary' />
          <input
            type="text"
            placeholder='Search'
            onChange={(event)=>onSearchInput(event.target.value)}
            className='bg-transparent border-none outline-none placeholder-gray-500 rounded-md w-[50%] max-w-full text-black'
          />
        </div>
      </div>
    </div>
  );
}

export default SearchSection;
