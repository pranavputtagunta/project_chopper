import React, { useRef, useState } from 'react';

const MedicationUpload = () => {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const uploadRef = useRef(null);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Unable to access camera.');
    }
  };

  const stopCamera = () => {
    setShowCamera(false);
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureImage = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const imageUrl = canvasRef.current.toDataURL('image/png');
    setImage(imageUrl);
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!image) return alert('No image selected.');
    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      alert(`Detected: ${data.name} ($${data.lowestPrice}), Trust Score: ${data.trustScore}`);
    } catch (err) {
      console.error(err);
      alert('Could not analyze image.');
    }

    const takeAnother = confirm("Would you like to take another picture?");
    if (!takeAnother) {
      setAnalyzed(true);
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    setImage(null);
    setAnalyzed(false);
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow max-w-3xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Upload or Take a Medication Picture</h2>

      <div className="flex justify-center gap-8 mb-10">
        <button
          onClick={() => uploadRef.current.click()}
          disabled={analyzed}
          className={`bg-pink-500 hover:bg-pink-600 text-white text-lg px-6 py-3 rounded-xl shadow ${analyzed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          📤 Upload Image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={uploadRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          onClick={startCamera}
          disabled={analyzed}
          className={`bg-rose-500 hover:bg-rose-600 text-white text-lg px-6 py-3 rounded-xl shadow ${analyzed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          📷 Take Picture
        </button>
      </div>

      {showCamera && (
        <div className="flex flex-col items-center mb-6">
          <video
            ref={videoRef}
            width="640"
            height="480"
            className="rounded-xl border-4 border-pink-200"
          />
          <div className="mt-4 flex gap-4">
            <button
              onClick={captureImage}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-lg"
            >
              📸 Capture
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg text-lg"
            >
              ✖ Cancel
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{ display: 'none' }}
          />
        </div>
      )}

      {image && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Preview:</h3>
          <img src={image} alt="Medication" className="mx-auto w-[640px] rounded-xl shadow-lg" />

          <div className="mt-6 flex justify-center gap-6">
            <button
              onClick={handleAnalyzeImage}
              disabled={analyzed}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-lg shadow"
            >
              🧠 Analyze Image
            </button>

            {analyzed && (
              <button
                onClick={handleReset}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl text-lg shadow"
              >
                🔁 Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationUpload;
