import React, { useState, useEffect, useRef } from "react";
import { BsFillCloudUploadFill } from "react-icons/bs";
import CircularProgress from "@material-ui/core/CircularProgress";
import Webcam from "react-webcam";
import { IoCameraReverse } from "react-icons/io5";
import axios from "axios";
import Container from "./container";

const Hero = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedText, setDetectedText] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [detectedImages, setDetectedImages] = useState([]);
  const [responseImage, setResponseImage] = useState("");

  const webcamRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setDetectedText("");
    }
  };

  const base64ToBlob = (base64, mimeType) => {
    var byteString = window.atob(base64.split(",")[1]);
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var uintArray = new Uint8Array(arrayBuffer);

    for (var i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeType });
  };

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 800;
      const maxHeight = 800;
      let width = image.width;
      let height = image.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);

      const base64Image = canvas.toDataURL("image/jpeg");
      const blob = base64ToBlob(base64Image, "image/jpeg");

      setFile(blob);
      setSelectedImage(base64Image);
      setDetectedText("");
      setShowWebcam(false);
    };
  }, [webcamRef]);

  const handleTextDetection = async () => {
    setLoading(true);
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", file); // Include the "file" field in the FormData

      try {
        const response = await axios.post("/api/uploadfile/", formData);

        if (response.status === 200) {
          const { filenames, images } = response.data;
          if (
            filenames &&
            filenames.length > 0 &&
            images &&
            images.length > 0
          ) {
            setDetectedText(filenames[0].toString());
            setResponseImage(images[0].toString());
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error detecting text:", error);
        setLoading(false);
      }
    }
  };

  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const backCam = videoDevices.find((device) =>
      device.label.toLowerCase().includes("back")
    );

    if (backCam) {
      setDeviceId(backCam.deviceId);
    }
  };

  const switchCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const currentIndex = videoDevices.findIndex(
      (device) => device.deviceId === deviceId
    );
    const nextIndex = (currentIndex + 1) % videoDevices.length;

    setDeviceId(videoDevices[nextIndex].deviceId);
  };

  const fetchImage = (filename) => {
    fetch(`http://127.0.0.1:5000/get-image/${filename}`)
      .then((response) => response.json())
      .then((data) => {
        const imageBase64 = data.image;
        const imageSrc = `data:image/jpeg;base64,${imageBase64}`;
        setDetectedImages((prevImages) => [...prevImages, imageSrc]);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  };

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <div className="bg-indigo-400 flex">
      <div className="max-w-3xl mx-auto px-4 mt-14 mb-20">
        <h1 className="text-white text-4xl font-bold mb-4 flex justify-center">
          Truck Detection System
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-700 mb-4 text-2xl font-bold">
            Upload an image for detection:
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="uploadInput"
          />
          <div className="flex space-x-4">
            <label
              htmlFor="uploadInput"
              className="block bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg cursor-pointer flex justify-center"
            >
              <BsFillCloudUploadFill className="mr-2 mt-1" size={25} />
              {selectedImage ? "Change Image" : "Upload Image"}
            </label>
            <button
              onClick={() => setShowWebcam(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg"
            >
              Webcam/Camera
            </button>
          </div>
          {showWebcam && (
            <div className="mt-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ deviceId: deviceId }}
              />
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg mt-5"
                onClick={capture}
              >
                Capture photo
              </button>
              <button
                onClick={switchCamera}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg mt-5 ml-5"
              >
                <IoCameraReverse size={20} />
              </button>
            </div>
          )}
          {selectedImage && (
            <div className="mt-4">
              <img
                src={selectedImage}
                alt="Uploaded"
                className="max-w-full rounded-lg"
              />
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={handleTextDetection}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg"
              disabled={loading || !selectedImage}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Detect"
              )}
            </button>
          </div>
          {detectedText && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Detected License Plate Number:
              </p>
              <p className="text-gray-700">{detectedText}</p>
            </div>
          )}

          {responseImage && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">Detected Image:</p>
              <img
                src={`data:image/jpeg;base64,${responseImage}`}
                alt="Detected Image"
                className="max-w-full rounded-lg mt-2"
              />
            </div>
          )}

          {detectedImages.map((img, index) => {
            return (
              <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
                <p className="text-gray-700 font-extrabold">Detected Image:</p>
                <img
                  key={index}
                  src={`data:image/jpeg;base64,${img}`}
                  alt={`Detected ${index}`}
                  className="max-w-full rounded-lg mt-2"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Hero;
