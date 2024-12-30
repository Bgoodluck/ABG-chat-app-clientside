import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Avatar from "../UsersAvatar/Avatar";
import uploadFile from "../../helpers/uploadFile";
import Divider from "../Accessories/Divider";
import { summaryApi } from "../../common";
import toast from "react-hot-toast";
import { setUser } from "../../redux/userSlice";
import { RiFolderCloseLine } from "react-icons/ri";
import { saveUserToStorage } from "../../utils/localStorage";




function EditUserDetails({ onClose, user }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    picture: user.picture,
    statusMessage: user.statusMessage || "",
    phone: user.phone || "",
    socialProfiles: {
      twitter: user.socialProfiles?.twitter || "",
      facebook: user.socialProfiles?.facebook || "",
      instagram: user.socialProfiles?.instagram || "",
      linkedin: user.socialProfiles?.linkedin || "",
      abgMrkt: user.socialProfiles?.abgMrkt || "",
      abgsocial: user.socialProfiles?.abgsocial || "",
    },
  });

  const uploadPicRef = useRef();



  const validateUrl = (url) => {
    if (!url) return true; // Allow empty URLs
    
    // Remove leading/trailing whitespace
    let normalizedUrl = url.trim();
    
    // If it's just a domain name or starts with a dot, add appropriate prefix
    if (normalizedUrl.startsWith('.')) {
      normalizedUrl = normalizedUrl.substring(1);
    }
    
    // Don't require http:// or www. - add them if they're missing
    if (!normalizedUrl.match(/^(https?:\/\/|www\.)/)) {
      // Check if it at least contains a dot to be a valid domain
      if (normalizedUrl.includes('.')) {
        // Check if it might be just a domain name
        if (!normalizedUrl.startsWith('www.')) {
          normalizedUrl = `www.${normalizedUrl}`;
        }
      }
    }
    
    // Ensure https:// is present
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Basic check for domain validity
    if (normalizedUrl.includes('.')) {
      return normalizedUrl;
    }
    
    return false;
  };
  
  


  useEffect(() => {
    setData((prev) => ({
      ...prev,
      ...user,
    }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenUploadPic = () => {
    uploadPicRef.current.click();
  };

  const handleUploadPic = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Show loading toast while uploading
      const loadingToast = toast.loading("Uploading image...");

      const uploadProfilePic = await uploadFile(file);

      if (uploadProfilePic?.url) {
        setData((prev) => ({
          ...prev,
          picture: uploadProfilePic.url,
        }));
        toast.success("Image uploaded successfully", {
          id: loadingToast,
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      toast.error(
        "Failed to upload image: " + (error.message || "Unknown error")
      );
    }
  };

  // Handle social profile changes
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    // Just update the value without validation
    setData((prev) => ({
      ...prev,
      socialProfiles: {
        ...prev.socialProfiles,
        [name]: value,
      },
    }));
  };
  
  // New handler for when input loses focus
  const handleSocialBlur = (e) => {
    const { name, value } = e.target;
    if (!value) return; // Don't validate empty values
    
    const validatedUrl = validateUrl(value);
    
    if (validatedUrl === false) {
      toast.error("Please enter a valid website address (e.g., facebook.com)");
      return;
    }
  
    setData((prev) => ({
      ...prev,
      socialProfiles: {
        ...prev.socialProfiles,
        [name]: validatedUrl,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!data.firstName || !data.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validatedProfiles = {};
    let hasInvalidUrl = false;

    Object.entries(data.socialProfiles).forEach(([key, value]) => {
      if (value) {
        const validatedUrl = validateUrl(value);
        if (validatedUrl === false) {
          toast.error(`Invalid URL format for ${key}`);
          hasInvalidUrl = true;
        }
        validatedProfiles[key] = validatedUrl;
      }
    });

    if (hasInvalidUrl) return;

    const updatedData = {
      ...data,
      socialProfiles: validatedProfiles,
    };

    try {
      setIsLoading(true);
      const response = await fetch(summaryApi.updateUser.url, {
        method: summaryApi.updateUser.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
        body: JSON.stringify(updatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile");
      }

      // Update Redux store and localStorage with new user data
      if (responseData.success && responseData.data) {
        const userData = responseData.data;
        dispatch(setUser(userData));
        saveUserToStorage(userData); // Save to localStorage
        toast.success("Profile updated successfully");
        onClose();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  
  

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-50 bg-gray-700 bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-4 py-6 m-1 rounded w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between">
          <h2 className="font-semibold">Profile Details</h2>
          <button onClick={onClose}>
              <RiFolderCloseLine/>
          </button>
        </div>
        <p className="text-sm">Edit user details</p>

        <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
          <div className=" flex flex-col sm:flex-row">
            <div className="flex flex-col gap-1">
              <label htmlFor="firstName" className="font-semibold">
                First Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={data.firstName}
                onChange={handleOnChange}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="lastName" className="font-semibold">
                Last Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={data.lastName}
                onChange={handleOnChange}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
                required
              />
            </div>
          </div>

          <div>
            <div className="font-semibold mb-1">Profile Image</div>
            <div className="my-1 flex items-center gap-4">
              <Avatar
                width={40}
                height={40}
                imageUrl={data.picture}
                alt="Profile picture"
              />
              <label htmlFor="picture">
                <button
                  type="button"
                  className="font-semibold text-sm"
                  onClick={handleOpenUploadPic}
                  disabled={isLoading}
                >
                  Upload Image
                </button>
                <input
                  type="file"
                  id="picture"
                  ref={uploadPicRef}
                  hidden
                  onChange={handleUploadPic}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="statusMessage" className="font-semibold">
              Status Message
            </label>
            <input
              type="text"
              id="statusMessage"
              placeholder="What's on your mind?"
              name="statusMessage"
              value={data.statusMessage}
              onChange={handleOnChange}
              className="w-full py-1 px-2 focus:outline-primary border-0.5"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="font-semibold">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={data.phone}
              onChange={handleOnChange}
              className="w-full py-1 px-2 focus:outline-primary border-0.5"
            />
          </div>

          {/* Social Profiles Section */}
          <div className="flex flex-col gap-3">
            <label className="font-semibold">Social Profiles</label>

            <div className="flex flex-col gap-2">
              <div className="flex flex-row">
              <input
  type="text" // Changed from type="url" to type="text"
  placeholder="Twitter URL"
  name="twitter"
  value={data.socialProfiles.twitter}
  onChange={handleSocialChange}
  onBlur={handleSocialBlur}
  className="w-full py-1 px-2 focus:outline-primary border-0.5"
/>
              <input
                type="text"
                placeholder="Facebook URL"
                name="facebook"
                value={data.socialProfiles.facebook}
                onChange={(e) => handleSocialChange(e)}
                onBlur={handleSocialBlur}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
              />
              </div>
               
               <div className="flex flex-row">
              <input
                type="text"
                placeholder="Instagram URL"
                name="instagram"
                value={data.socialProfiles.instagram}
                onBlur={handleSocialBlur}
                onChange={(e) => handleSocialChange(e)}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
              />

              <input
                type="text"
                placeholder="LinkedIn URL"
                name="linkedin"
                value={data.socialProfiles.linkedin}
                onChange={(e) => handleSocialChange(e)}
                onBlur={handleSocialBlur}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
              />
              </div>
              <div className="flex flex-row">
              <input
                type="text"
                placeholder="ABG Market URL"
                name="abgMrkt"
                value={data.socialProfiles.abgMrkt}
                onBlur={handleSocialBlur}
                onChange={(e) => handleSocialChange(e)}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
              />

              <input
                type="text"
                placeholder="ABG Social URL"
                name="abgsocial"
                value={data.socialProfiles.abgsocial}
                onChange={(e) => handleSocialChange(e)}
                onBlur={handleSocialBlur}
                className="w-full py-1 px-2 focus:outline-primary border-0.5"
              />
              </div>
            </div>
          </div>

          <Divider />
          <div className="flex gap-2 w-fit ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="border-primary border text-primary px-4 py-1 rounded hover:bg-primary hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-primary bg-primary text-white border px-4 py-1 rounded hover:bg-secondary disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserDetails;
