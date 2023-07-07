import React, { useState, useEffect, useRef } from "react";
import { BsFillCloudUploadFill } from "react-icons/bs";
import CircularProgress from "@material-ui/core/CircularProgress";
import Webcam from "react-webcam";
import { IoCameraReverse } from "react-icons/io5";
import axios from "axios";

const CombinedComponent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedText, setDetectedText] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [detectedImages, setDetectedImages] = useState([]);
  const [responseImage, setResponseImage] = useState("");
  const [responseImagetruck, setResponseImagetruck] = useState("");
  const [containersealpresent, setContainersealpresent] = useState(false);
  const [detectedStickerImages, setDetectedStickerImages] = useState([]);

  const [stickerPresent, setStickerPresent] = useState("");
  const [sealPresent, setSealPresent] = useState("");

  const TotalStickerImages = detectedStickerImages.length;
  const TotalSealImages = detectedImages.length;
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
      formData.append("file", file);

      try {
        // Simulating the response data from API
        const response2 = await axios.post("/api2/uploadfile/", formData);
        const response1 = await axios.post("/api/uploadfile/", formData);

        if (response1.status === 200 && response2.status === 200) {
          const { filenames, images } = response1.data;
          const {
            container_number,
            container_number_image,
            container_seal_present,
            container_seal_image,
            container_sticker_present,
            container_sticker_image,
          } = response2.data;
          // console.log(container_number_image)
          // Set the state values for Text Detection
          if (
            filenames &&
            filenames.length > 0 &&
            images &&
            images.length > 0
          ) {
            setDetectedText(filenames[0].toString());
            setResponseImagetruck(images[0].toString());
          }

          // Set the state values for Container Detection
          if (container_number && container_number.length > 0) {
            setDetectedText(container_number[0]);
          }

          setContainersealpresent(container_seal_present === "true");

          setResponseImage(container_number_image);
          setDetectedImages(container_seal_image || []);
          setDetectedStickerImages(container_sticker_image || []);

          console.log(container_sticker_image);
          console.log(container_seal_image);
          console.log(container_number_image);
          console.log(container_number);
          console.log(container_seal_present);
          console.log(container_sticker_present);
          console.log(filenames);
          console.log(images);
          if (container_sticker_present === true) {
            setStickerPresent("YES ");
          } else {
            setStickerPresent("NO ");
          }

          if (container_seal_present === true) {
            setSealPresent("YES ");
          } else {
            setSealPresent("NO ");
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

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <div className="bg-indigo-400 flex">
      <div className="max-w-3xl mx-auto px-4 mt-14 mb-20">
        <h1 className="text-white text-4xl font-bold mb-4 flex justify-center">
          Combined Detection System
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
              <p className="text-gray-700 font-extrabold">
                Detected Container Number Image:
              </p>
              <img
                src={`data:image/jpeg;base64,${responseImage}`}
                alt="Detected Image"
                className="max-w-full rounded-lg mt-2"
              />
            </div>
          )}
          {responseImagetruck && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Detected Number plate Image:
              </p>
              <img
                src={`data:image/jpeg;base64,${responseImagetruck}`}
                alt="Detected Image"
                className="max-w-full rounded-lg mt-2"
              />
            </div>
          )}
          {stickerPresent && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Container Sticker Present:
              </p>
              <p className="text-gray-700">{stickerPresent}</p>
              <p className="text-gray-700 font-extrabold">
                Total Number of Sticker Detected: {TotalStickerImages}
              </p>
            </div>
          )}
          {sealPresent && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Container Seal Present:
              </p>
              <p className="text-gray-700">{sealPresent}</p>
              <p className="text-gray-700 font-extrabold">
                Total Number of Seals Detected: {TotalSealImages}
              </p>
            </div>
          )}
          {containersealpresent && (
            <div className="mt-6 bg-gray-100 rounded-lg py-4 px-6">
              <p className="text-gray-700 font-extrabold">
                Container Seal Present:
              </p>
              <p className="text-gray-700">
                {containersealpresent ? "Yes" : "No"}
              </p>
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

export default CombinedComponent;
