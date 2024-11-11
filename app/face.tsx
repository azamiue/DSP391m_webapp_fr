"use client";

import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { AuthenticatorSchema } from "./type";
import { useFormContext, useWatch } from "react-hook-form";
import { convertNameEmail } from "@/config/name";

export function FaceDetect() {
  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const isModelsLoaded = useWatch({ control, name: "ModelsLoaded" });
  const faceDirection = useWatch({ control, name: "faceDirection" });
  const lookingFor = useWatch({ control, name: "lookingFor" });
  const email = useWatch({ control, name: "email" });
  const isDone = useWatch({ control, name: "isDone" });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastCaptureTime = useRef<number>(0);
  const captureDebounceTime = 50;
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const publicDir = process.env.NEXT_PUBLIC_PUBLIC_URL;

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = publicDir + "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      // await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      // await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
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
  const getFaceDirection = (pose: { yaw: number; pitch: number }) => {
    const { yaw, pitch } = pose;

    const yawThreshold = 12;
    const pitchThreshold = 10;

    if (Math.abs(pitch) > pitchThreshold) {
      if (pitch < 90 && yaw < 10) return "Up";
      if (pitch > 170 && yaw < 10) return "Down";
    }

    if (Math.abs(yaw) > yawThreshold) {
      if (yaw < 0) return "Right";
      if (yaw > 15) return "Left";
    }

    return "Straight";
  };

  // Capture and save frame from video stream
  const captureAndSaveFrameFromVideo = async (
    boundingBox: faceapi.Box,
    count: number,
    direction: string
  ) => {
    // Check debounce time
    const currentTime = Date.now();
    if (currentTime - lastCaptureTime.current < captureDebounceTime) {
      return;
    }

    if (videoRef.current) {
      const video = videoRef.current;

      try {
        const offscreenCanvas = new OffscreenCanvas(224, 224);
        const context = offscreenCanvas.getContext("2d");

        if (context) {
          context.drawImage(
            video,
            boundingBox.x - 50,
            boundingBox.y - 50,
            boundingBox.width,
            boundingBox.height,
            0,
            0,
            224,
            224
          );

          const blob = await offscreenCanvas.convertToBlob({
            type: "image/jpeg",
            quality: 1,
          });

          const name = convertNameEmail(email);

          const formData = new FormData();
          formData.append("image", blob, `${direction}-${Date.now()}.jpg`);
          formData.append("name", name);

          const response = await fetch("/api/save-image", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            return true;
          } else {
            console.error("Failed to save image");
            return false;
          }
        }

        lastCaptureTime.current = currentTime;
      } catch (error) {
        console.error("Error capturing and saving frame from video:", error);
      }
    }
  };

  // zip img
  const zipImage = async () => {
    const name = convertNameEmail(email);

    const formData = new FormData();
    formData.append("name", name);

    try {
      const response = await fetch("/api/zip-images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setValue("isDone", true);
      } else {
        console.log("Failed to create zip file. Please check the server logs.");
      }
    } catch (error) {
      console.error("Error zipping images:", error);
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
        faceapi.draw.drawDetections(canvas, resizedDetections);

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
          await zipImage();
          setValue("zipPath", "/tmp/zips");
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
    <div className="flex flex-col gap-y-3">
      <div className="text-center">
        <h2 className="text-2xl">
          Look at the camera and follow the instructions
        </h2>
        {faceDirection === lookingFor ? (
          <h1 className="text-xl">Stay Out! Good Job!</h1>
        ) : (
          <h1 className="text-xl">Turn to: {lookingFor}</h1>
        )}
      </div>
      <div
        className={`relative rounded-2xl  ${
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
          width="720"
          height="560"
          className="rounded-2xl"
        />
        <canvas
          ref={canvasRef}
          width="720"
          height="560"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
    </div>
  );
}
