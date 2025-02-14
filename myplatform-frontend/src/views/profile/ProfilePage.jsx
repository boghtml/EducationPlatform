import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Phone, User2, IdCard } from "lucide-react";
import { logout } from '../../features/user/userSlice';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="flex flex-col items-center space-y-4 pb-6">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Фото профілю" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-4xl text-white">
                {user.userName.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{user.userName}</h2>
            <span className="inline-block px-3 py-1 mt-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-700">
              <Mail className="w-5 h-5 text-blue-500" />
              <span>{user.userEmail}</span>
            </div>

            <div className="flex items-center space-x-3 text-gray-700">
              <Phone className="w-5 h-5 text-green-500" />
              <span>{user.phone_number}</span>
            </div>

            <div className="flex items-center space-x-3 text-gray-700">
              <User2 className="w-5 h-5 text-purple-500" />
              <span>{user.role}</span>
            </div>

            <div className="flex items-center space-x-3 text-gray-700">
              <IdCard className="w-5 h-5 text-orange-500" />
              <span>{user.id}</span>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() =>{
             dispatch(logout());
             navigate("/")
        } }>Вийти</button>

      </div>
    </div>
  );
};

export default UserProfile;