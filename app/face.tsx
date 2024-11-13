"use client";

import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { AuthenticatorSchema } from "./type";
import { useFormContext, useWatch } from "react-hook-form";
import { convertNameEmail } from "@/config/name";
import { useMediaQuery } from "react-responsive";

export function FaceDetect() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 720, height: 560 });

  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const isModelsLoaded = useWatch({ control, name: "ModelsLoaded" });
  const faceDirection = useWatch({ control, name: "faceDirection" });
  const lookingFor = useWatch({ control, name: "lookingFor" });
  const email = useWatch({ control, name: "email" });
  const isDone = useWatch({ control, name: "isDone" });
  const name = useWatch({ control, name: "name" });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastCaptureTime = useRef<number>(0);
  const captureDebounceTime = 50;
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const publicDir = process.env.NEXT_PUBLIC_PUBLIC_URL;

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Maintain aspect ratio of 4:3
        const containerHeight = (containerWidth * 3) / 4;
        setDimensions({
          width: containerWidth,
          height: containerHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = publicDir + "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setValue("ModelsLoaded", true);
    };
    loadModels();
  }, []);

  // Function to calculate face pose based on landmarks
  const calculateFacePose = (landmarks: any) => {
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const noseTop = nose[3];
    const noseBottom = nose[6];

    const leftEyeCenter = {
      x:
        leftEye.reduce((sum: number, point: any) => sum + point.x, 0) /
        leftEye.length,
      y:
        leftEye.reduce((sum: number, point: any) => sum + point.y, 0) /
        leftEye.length,
    };
    const rightEyeCenter = {
      x:
        rightEye.reduce((sum: number, point: any) => sum + point.x, 0) /
        rightEye.length,
      y:
        rightEye.reduce((sum: number, point: any) => sum + point.y, 0) /
        rightEye.length,
    };

    const eyeDistance = rightEyeCenter.x - leftEyeCenter.x;
    const noseCenterX = (noseTop.x + noseBottom.x) / 2;
    const eyesCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const yaw = ((noseCenterX - eyesCenterX) / eyeDistance) * 100;

    const eyeLevel = (leftEyeCenter.y + rightEyeCenter.y) / 2;
    const noseHeight = noseBottom.y - noseTop.y;
    const pitch = ((noseBottom.y - eyeLevel) / noseHeight - 1.5) * 50;

    return { yaw, pitch };
  };

  // Function to determine face direction based on angles
  const getFaceDirection = ({ yaw, pitch }: { yaw: number; pitch: number }) => {
    // Define directional boundaries (example fixed angle ranges)
    if (pitch < 90 && yaw >= -2 && yaw <= 15) return "Up";
    if (pitch > 165 && yaw >= -2 && yaw <= 15) return "Down";
    if (yaw < 0) return "Right";
    if (yaw > 15) return "Left";

    // Default case if no direction matches, indicating "straight" is the only fallback.
    return "Straight";
  };

  // Capture and save frame from video stream
  const captureAndSaveFrameFromVideo = async (
    boundingBox: faceapi.Box,
    count: number,
    direction: string
  ) => {
    const currentTime = Date.now();
    if (currentTime - lastCaptureTime.current < captureDebounceTime) {
      return;
    }

    if (videoRef.current) {
      const video = videoRef.current;

      try {
        // Calculate scaling factors based on the video's natural resolution
        const scaleX = video.videoWidth / video.width;
        const scaleY = video.videoHeight / video.height;

        // Scale the bounding box to match the actual video resolution
        const scaledBoundingBox = {
          x: boundingBox.x * scaleX,
          y: boundingBox.y * scaleY,
          width: boundingBox.width * scaleX,
          height: boundingBox.height * scaleY,
        };

        // Create two canvas elements: one for initial capture and one for resizing
        const captureCanvas = new OffscreenCanvas(
          scaledBoundingBox.width,
          scaledBoundingBox.height
        );
        const outputCanvas = new OffscreenCanvas(224, 224);

        const captureContext = captureCanvas.getContext("2d");
        const outputContext = outputCanvas.getContext("2d");

        if (captureContext && outputContext) {
          // First, capture the face region at original size
          captureContext.drawImage(
            video,
            scaledBoundingBox.x,
            scaledBoundingBox.y,
            scaledBoundingBox.width,
            scaledBoundingBox.height,
            0,
            0,
            scaledBoundingBox.width,
            scaledBoundingBox.height
          );

          // Calculate dimensions to maintain aspect ratio while fitting in 224x224
          const aspectRatio =
            scaledBoundingBox.width / scaledBoundingBox.height;
          let drawWidth = 224;
          let drawHeight = 224;
          let offsetX = 0;
          let offsetY = 0;

          if (aspectRatio > 1) {
            // Width is greater than height
            drawHeight = 224 / aspectRatio;
            offsetY = (224 - drawHeight) / 2;
          } else {
            // Height is greater than width
            drawWidth = 224 * aspectRatio;
            offsetX = (224 - drawWidth) / 2;
          }

          // Fill the background with black (optional)
          // outputContext.fillStyle = "#000000";
          // outputContext.fillRect(0, 0, 224, 224);

          // Draw the face image centered in the 224x224 canvas
          outputContext.drawImage(
            captureCanvas,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight
          );

          const blob = await outputCanvas.convertToBlob({
            type: "image/jpeg",
            quality: 1,
          });

          const name_email = convertNameEmail(email);

          const formData = new FormData();
          formData.append("image", blob, `${direction}-${Date.now()}.jpg`);
          formData.append("name", name);
          formData.append("email", name_email);

          const response = await fetch("/api/save-image", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            lastCaptureTime.current = currentTime;
            return true;
          } else {
            console.error("Failed to save image");
            return false;
          }
        }
      } catch (error) {
        console.error("Error capturing and saving frame from video:", error);
      }
    }
  };

  // Function to stop the webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Activate camera
  useEffect(() => {
    if (isModelsLoaded && videoRef.current && !isDone) {
      navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      });
    }
    return () => {
      stopWebcam(); // Clean up on component unmount
    };
  }, [isModelsLoaded, isDone]);

  // Modify handleVideoPlay to check counts accurately
  type Direction = "Straight" | "Left" | "Right" | "Up" | "Down";
  type DirectionLower = "straight" | "left" | "right" | "up" | "down";

  type Counts = {
    [K in DirectionLower]: number;
  };

  const handleVideoPlay = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };
    console.log("displaySize", displaySize);
    faceapi.matchDimensions(canvas, displaySize);

    // Initialize state object to track counts
    const counts: Counts = {
      straight: 0,
      left: 0,
      right: 0,
      up: 0,
      down: 0,
    };

    // Define the sequence of directions and required counts
    const captureSequence: Array<{ direction: Direction; target: number }> = [
      { direction: "Straight", target: 50 },
      { direction: "Left", target: 50 },
      { direction: "Right", target: 50 },
      { direction: "Up", target: 50 },
      { direction: "Down", target: 50 },
    ];

    let currentStageIndex = 0;

    // Helper function to convert Direction to DirectionLower
    const toLowerDirection = (dir: Direction): DirectionLower => {
      return dir.toLowerCase() as DirectionLower;
    };

    // Store interval ID for cleanup
    const intervalId = setInterval(async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        // Handle multiple faces
        if (detections.length >= 2) {
          setValue("faceDirection", "Multiple faces detected");
          return;
        }

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        const context = canvas.getContext("2d");
        if (!context) return;

        // Clear previous drawings
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (resizedDetections.length === 0) {
          setValue("faceDirection", "No face detected");
          return;
        }

        // Draw detections
        // faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        // Get current face direction
        const pose = calculateFacePose(resizedDetections[0].landmarks);
        const currentDirection = getFaceDirection(pose) as Direction;
        setValue("faceDirection", currentDirection);

        // Get current stage requirements
        const currentStage = captureSequence[currentStageIndex];
        if (!currentStage) {
          // All stages complete
          clearInterval(intervalId);
          setValue("lookingFor", "Done capturing all images");
          setValue("isDone", true);
          return;
        }

        // Update UI to show what we're looking for
        setValue("lookingFor", currentStage.direction);

        // If current direction matches what we're looking for
        if (currentDirection === currentStage.direction) {
          const directionKey = toLowerDirection(currentStage.direction);
          const boundingBox = resizedDetections[0].detection.box;

          // Attempt to capture frame
          const event = await captureAndSaveFrameFromVideo(
            boundingBox,
            counts[directionKey],
            currentStage.direction
          );

          if (event) {
            counts[directionKey]++;

            // If we've reached target count for current direction
            if (counts[directionKey] === currentStage.target) {
              currentStageIndex++;
            }
          }
        }
      } catch (error) {
        console.error("Error in face detection:", error);
        clearInterval(intervalId);
      }
    }, 100);

    // Cleanup function to clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto" ref={containerRef}>
      <div className="flex flex-col gap-y-3">
        <div className="text-center flex flex-col gap-y-3">
          <h2
            className={`${
              isMobile ? "text-sm pt-3" : "text-2xl pt-3"
            } font-bold`}
          >
            Look at the camera and follow the instructions
          </h2>
          {faceDirection === lookingFor ? (
            <h1 className="text-xl text-green-500 font-bold">Stay Out!</h1>
          ) : (
            <h1 className="text-xl text-red-500 font-bold">
              Turn to: {lookingFor}
            </h1>
          )}
        </div>
        <div
          className={`relative rounded-2xl ${
            faceDirection === lookingFor
              ? "shadow-2xl shadow-green-500/50"
              : "shadow-2xl shadow-red-500/50"
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            onPlay={handleVideoPlay}
            width={dimensions.width}
            height={dimensions.height}
            className="rounded-2xl w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
