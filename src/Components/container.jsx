import React, { useState, useEffect, useRef } from "react";
import { BsFillCloudUploadFill } from "react-icons/bs";
import CircularProgress from "@material-ui/core/CircularProgress";
import Webcam from "react-webcam";
import { IoCameraReverse } from "react-icons/io5";
import axios from "axios";
// import Container from "./container";

const Container = () => {
  const [selectedImage2, setSelectedImage2] = useState(null);
  const [detectedText2, setDetectedText2] = useState("");
  const [showWebcam2, setShowWebcam2] = useState(false);
  const [loading2, setLoading] = useState(false);
  const [file2, setFile2] = useState(null);
  const [deviceId2, setDeviceId2] = useState("");
  const [detectedImages2, setDetectedImages2] = useState([]);
  const [responseImage2, setResponseImage2] = useState("");
  const [containersealpresent2, setContainersealpresent2] = useState(Boolean);
  const [detectedStickerImages2, setDetectedStickerImages2] = useState([]);
  const webcamRef2 = useRef(null);

  const handleImageUpload2 = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile2(file);
      setSelectedImage2(URL.createObjectURL(file));
      setDetectedText2("");
    }
  };

  const base64ToBlob2 = (base64, mimeType) => {
    var byteString = window.atob(base64.split(",")[1]);
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var uintArray = new Uint8Array(arrayBuffer);

    for (var i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeType });
  };

  const capture2 = React.useCallback(() => {
    const imageSrc = webcamRef2.current.getScreenshot();
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
      const blob = base64ToBlob2(base64Image, "image/jpeg");

      setFile2(blob);
      setSelectedImage2(base64Image);
      setDetectedText2("");
      setShowWebcam2(false);
    };
  }, [webcamRef2]);

  const handleTextDetection2 = async () => {
    setLoading(true);
    if (selectedImage2) {
      const formData = new FormData();
      formData.append("file", file2);

      try {
        // Simulating the response data from API
        const response = await axios.post("/api2/uploadfile/", formData);

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
          setDetectedText2(container_number[0]);
          setResponseImage2(container_number_image[0]);
          setDetectedImages2(container_seal_image);
          setDetectedStickerImages2(container_sticker_image);
          if (
            container_seal_present === "true" ||
            container_seal_present === true
          ) {
            setContainersealpresent2("Yes");
          } else {
            setContainersealpresent2("No");
          }
        }
      } catch (error) {
        console.error("Error detecting text:", error);
      }

      setLoading(false);
    }
  };

  const getDevices2 = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const backCam = videoDevices.find((device) =>
      device.label.toLowerCase().includes("back")
    );

    if (backCam) {
      setDeviceId2(backCam.deviceId);
    }
  };

  const switchCamera2 = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const currentIndex = videoDevices.findIndex(
      (device) => device.deviceId === deviceId2
    );
    const nextIndex = (currentIndex + 1) % videoDevices.length;

    setDeviceId2(videoDevices[nextIndex].deviceId);
  };

  const fetchImage = (filename) => {
    fetch(`http://127.0.0.1:5000/get-image/${filename}`)
      .then((response) => response.json())
      .then((data) => {
        const imageBase64 = data.image;
        const imageSrc = `data:image/jpeg;base64,${imageBase64}`;
        setDetectedImages2((prevImages) => [...prevImages, imageSrc]);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  };

  useEffect(() => {
    getDevices2();
  }, []);

  return (
    <div className="bg-indigo-400 flex">
      <div className="max-w-3xl mx-auto px-4 mt-10 mb-10">
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
            onChange={handleImageUpload2}
            className="hidden"
            id="uploadInput"
          />
          <div className="flex space-x-4">
            <label
              htmlFor="uploadInput"
              className="block bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg cursor-pointer flex justify-center"
            >
              <BsFillCloudUploadFill className="mr-2 mt-1" size={25} />
              {selectedImage2 ? "Change Image" : "Upload Image"}
            </label>
            <button
              onClick={() => setShowWebcam2(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg"
            >
              Webcam/Camera
            </button>
          </div>
          {showWebcam2 && (
            <div className="mt-4">
              <Webcam
                audio={false}
                ref={webcamRef2}
                screenshotFormat="image/jpeg"
                videoConstraints={{ deviceId: deviceId2 }}
              />
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg mt-5"
                onClick={capture2}
              >
                Capture photo
              </button>
              <button
                onClick={switchCamera2}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg mt-5 ml-5"
              >
                <IoCameraReverse size={20} />
              </button>
            </div>
          )}
          {selectedImage2 && (
            <div className="mt-4">
              <img
                src={selectedImage2}
                alt="Uploaded"
                className="max-w-full rounded-lg"
              />
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={handleTextDetection2}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg"
              disabled={loading2 || !selectedImage2}
            >
              {loading2 ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Detect"
              )}
            </button>
          </div>
          {detectedText2 && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Detected Container Number:
              </p>
              <p className="text-gray-700">{detectedText2}</p>
            </div>
          )}

          {responseImage2 && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Detected Number Image:
              </p>
              <img
                src={`data:image/jpeg;base64,${responseImage2}`}
                alt="Detected Image"
                className="max-w-full rounded-lg mt-2"
              />
            </div>
          )}
          {containersealpresent2 && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Container Seal Present:
              </p>
              <p className="text-gray-700">{containersealpresent2}</p>
            </div>
          )}
          {detectedImages2.map((img, index) => {
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
          {detectedStickerImages2.map((img, index) => {
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
