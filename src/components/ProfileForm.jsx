import React, {useEffect, useRef, useState} from 'react';
import { Camera, User, Stethoscope, Upload } from 'lucide-react';

const ProfileForm = ({ formData, handleInputChange }) => {

  const fileInputRef = useRef(null)
  const [uploadedFile, setUploadedFile] = useState(null);

  const uploadHandler = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
   const file = event.target.files[0];
   if(!file) return;

   const formData = new FormData();
   formData.append('file', file);

   try{

      const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
   });

   if(!res.ok){
    const text = await res.text();
    alert('Upload failed: ' + text);
    return;
   }


   const data = await res.json();
   setUploadedFile({name: file.name, url: data.url});

  // data.url is the public URL of the uploaded file
   alert('File uploaded successfully!');

  } catch (err){
    alert('An unexpected error occured: ' + err.message);
  }
};

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
      {/* Profile Photo Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-shadow">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <button className="text-pink-600 font-medium hover:bg-pink-50 px-4 py-2 rounded-lg transition-colors">
          Add Photo
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-pink-500" />
          <span className="font-medium text-gray-700">Profile Information</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Healthcare Consultant</label>
          <div className="flex items-center space-x-2 px-4 py-3 bg-pink-50 rounded-xl border border-pink-200">
            <Stethoscope className="w-5 h-5 text-pink-500" />
            <span className="text-gray-800">{formData.consultant}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            placeholder="Enter your medical history, allergies, and current conditions"
            rows={4}
            className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
          />
        </div>

      {/* Upload medical documents */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        />
        <button 
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-6 rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        type="button"
        onClick={uploadHandler}
        >
          <Upload className="w-5 h-5" />
          <span>Upload Medical Documents</span>
        </button>
        {uploadedFile && (
          <div className="mt-2 text-sm text-green-600">
            Uploaded: {uploadedFile.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;