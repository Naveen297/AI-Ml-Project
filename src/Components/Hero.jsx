import React, { useState, useEffect, useRef } from "react";
import { BsFillCloudUploadFill } from "react-icons/bs";
import CircularProgress from "@material-ui/core/CircularProgress";
import Webcam from "react-webcam";
import { IoCameraReverse } from "react-icons/io5";

const Hero = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedText, setDetectedText] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [model, setModel] = useState("license_plate"); // default to license_plate model
  const [detectedImages, setDetectedImages] = useState([]);

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

  const handleTextDetection = () => {
    console.log("handleTextDetection");
    setLoading(true);
    if (selectedImage) {
      // Convert image to base64
      const convertImageToBase64 = (url, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
          var reader = new FileReader();
          reader.onloadend = function () {
            callback(reader.result);
          };
          reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
      };

      convertImageToBase64(selectedImage, (base64Image) => {
        fetch("http://127.0.0.1:5000/detect-text", {
          method: "POST",
          body: JSON.stringify({ image: base64Image, model: model }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:");
            const detectedTexts = data.detectedTexts;
            setDetectedText(detectedTexts.join(" "));
            console.log("Detected Text: ", detectedTexts.join(" "));
            console.log("Detected Images enter");
            if (model === "seal" || model === "sticker") {
              if (data.detectedImages) {
                data.detectedImages.forEach((filename) => {
                  console.log("fetching");
                  fetchImage(filename);
                });
              }
            } else {
              setDetectedImages(data.detectedImages || []); // for license plate and container
            }
            setLoading(false);
          })

          .catch((error) => {
            console.error("Error detecting text:", error);
            setLoading(false);
          });
      });
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
  return (
    <div className="bg-indigo-400 py-16 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <h1 className="text-white text-4xl font-bold mb-4 flex justify-center">
          Detect and Recognize License Plate or Seal
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-700 mb-4 text-2xl font-bold">
            Select model and upload an image for detection:
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="uploadInput"
          />
          <div className="flex space-x-4">
            <div className="inline-block">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg cursor-pointer mr-4"
              >
                <option value="license_plate">License Plate</option>
                <option value="shipping_container">Shipping Container</option>
                <option value="seal">Seal Detection</option>
                <option value="sticker">Sticker Detection</option>{" "}
                {/* Added this line */}
              </select>
            </div>
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
              disabled={loading}
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
                Detected Licence Plate Number:
              </p>
              <p className="text-gray-700">{detectedText}</p>
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
