import React from 'react';

const RequestForm = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Request a Demo</h2>
        <p className="mb-4 text-gray-700">
          Please fill out the form below to schedule a demo with our team.
        </p>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              id="name" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              id="email" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
            <input 
              type="text" 
              id="company" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Your company"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3b3992] hover:bg-[#2e2c70]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm; 