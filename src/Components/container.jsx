import React, { useState, useEffect, useRef } from "react";
import { BsFillCloudUploadFill } from "react-icons/bs";
import CircularProgress from "@material-ui/core/CircularProgress";
import Webcam from "react-webcam";
import { IoCameraReverse } from "react-icons/io5";
import axios from "axios";
// import Container from "./container";

const Container = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedText, setDetectedText] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [detectedImages, setDetectedImages] = useState([]);
  const [responseImage, setResponseImage] = useState("");
  const [containersealpresent, setContainersealpresent] = useState(Boolean);
  const [detectedStickerImages, setDetectedStickerImages] = useState([]);
  const webcamRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setDetectedText("");
    }
  };

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelectedImage(imageSrc);
    setDetectedText("");
    setShowWebcam(false);
  }, [webcamRef]);

  const handleTextDetection = async () => {
    setLoading(true);
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Simulating the response data from API
        const response = await axios.post(
          "http://3.110.230.199/uploadfile/",
          formData
        );

        if (response.status === 200) {
          const {
            container_number,
            container_number_image,
            container_seal_present,
            container_seal_image,
            container_sticker_present,
            container_sticker_image,
          } = response.data;

          // Printing the container number
          if (container_number && container_number.length > 0) {
            console.log("Container Number:", container_number[0]);
          }

          // Printing the container seal presence
          console.log("Container Seal Present:", container_seal_present);

          // Printing the container seal images
          console.log("Container Seal Images:");
          container_seal_image.forEach((image, index) => {
            console.log(`Image ${index + 1}: ${image}`);
          });

          // Printing the container sticker presence
          console.log("Container Sticker Present:", container_sticker_present);

          // Printing the container sticker images
          console.log("Container Sticker Images:");
          container_sticker_image.forEach((image, index) => {
            console.log(`Image ${index + 1}: ${image}`);
          });

          // Set the state values
          setDetectedText(container_number[0]);
          setResponseImage(container_number_image[0]);
          setDetectedImages(container_seal_image);
          setDetectedStickerImages(container_sticker_image);
          if (
            container_seal_present === "true" ||
            container_seal_present === true
          ) {
            setContainersealpresent("Yes");
          } else {
            setContainersealpresent("No");
          }
        }
      } catch (error) {
        console.error("Error detecting text:", error);
      }

      setLoading(false);
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
    <div className="bg-indigo-400 py-16 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <h1 className="text-white text-4xl font-bold mb-4 flex justify-center">
          Container Detection System
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
                Detected Container Number:
              </p>
              <p className="text-gray-700">{detectedText}</p>
            </div>
          )}

          {responseImage && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Detected Number Image:
              </p>
              <img
                src={`data:image/jpeg;base64,${responseImage}`}
                alt="Detected Image"
                className="max-w-full rounded-lg mt-2"
              />
            </div>
          )}
          {containersealpresent && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Container Seal Present:
              </p>
              <p className="text-gray-700">{containersealpresent}</p>
            </div>
          )}
          {detectedImages.map((img, index) => {
            return (
              <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
                <p className="text-gray-700 font-extrabold">
                  Detected Seal Image:
                </p>
                <img
                  key={index}
                  src={`data:image/jpeg;base64,${img}`}
                  alt={`Detected ${index}`}
                  className="max-w-full rounded-lg mt-2"
                />
              </div>
            );
          })}
          {detectedStickerImages.map((img, index) => {
            return (
              <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
                <p className="text-gray-700 font-extrabold">
                  Detected Sticker Image:
                </p>
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

export default Container;
