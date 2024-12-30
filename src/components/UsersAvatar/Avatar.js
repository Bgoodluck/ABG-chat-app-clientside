import React, { useMemo } from "react";
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from "react-redux";

function Avatar({ userId, firstName, lastName, imageUrl, width, height }) {
  const onlineUsers = useSelector((state) => state?.user?.onlineUsers);

  // i generated initials from firstName and lastName
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    }
    return "";
  };

  // Using a stable background color based on the user's name
  const getBgColorClass = useMemo(() => {
    const bgColors = [
      "bg-slate-200",
      "bg-teal-200",
      "bg-yellow-200",
      "bg-green-200",
      "bg-red-200",
      "bg-blue-200",
      "bg-indigo-200",
      "bg-purple-200",
      "bg-pink-200",
      "bg-gray-200",
    ];

    if (!firstName && !lastName) return bgColors[0]; // Default color for no name

    // Create a stable index based on the name
    const nameString = `${firstName}${lastName}`;
    const sum = nameString
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return bgColors[sum % bgColors.length];
  }, [firstName, lastName]);

  // Check if user is online
  const isUserOnline = useMemo(() => {
    return onlineUsers.some(user => user._id === userId);
  }, [userId, onlineUsers]);

  return (
    <div
      className={`text-slate-800 overflow-hidden rounded-full border relative font-bold shadow flex items-center justify-center ${getBgColorClass}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`, // Ensure minimum dimensions
        minHeight: `${height}px`,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${firstName || ""} ${lastName || ""}`}
          className="w-full h-full object-cover"
        />
      ) : firstName ? (
        <span
          style={{
            fontSize: `${Math.min(width, height) / 2.5}px`,
          }}
        >
          {getInitials()}
        </span>
      ) : (
        <PiUserCircle
          size={Math.min(width, height) * 0.8}
          className="text-slate-600"
        />
      )}
      {isUserOnline && (
        <div className="absolute bottom-2 -right-1 p-1 z-10 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
}

export default Avatar;
