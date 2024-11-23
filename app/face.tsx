"use client";

import * as faceapi from "face-api.js";
import { useEffect, useRef, useState, useMemo } from "react";
import { AuthenticatorSchema } from "./type";
import { useFormContext, useWatch } from "react-hook-form";
import { convertNameEmail } from "@/config/name";
import { useMediaQuery } from "react-responsive";

export function FaceDetect() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isIOS, setIsIOS] = useState(false);

  // Check if device is iOS
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    setIsIOS(checkIsIOS());
  }, []);

  // Optimize detection intervals based on device
  const DETECTION_INTERVAL = useMemo(() => (isMobile ? 150 : 100), [isMobile]);
  // Reduce model size for mobile
  const TINY_FACE_DETECTOR_OPTIONS = useMemo(() => {
    return new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.2,
    });
  }, [isIOS]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 720, height: 560 });
  const [circleSize, setCircleSize] = useState({ width: 192, height: 192 }); // Initial size for circle (in pixels)
  const [progress, setProgress] = useState<Record<string, number>>({
    Straight: 0,
    Left: 0,
    Right: 0,
    Up: 0,
    Down: 0,
  });

  const { control, setValue } = useFormContext<AuthenticatorSchema>();

  const isModelsLoaded = useWatch({ control, name: "ModelsLoaded" });
  const faceDirection = useWatch({ control, name: "faceDirection" });
  const lookingFor = useWatch({ control, name: "lookingFor" });
  const email = useWatch({ control, name: "email" });
  const isDone = useWatch({ control, name: "isDone" });
  const name = useWatch({ control, name: "name" });
  const organization = useWatch({ control, name: "organization" });
  const selectPlan = useWatch({ control, name: "selectPlan" });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastCaptureTime = useRef<number>(0);
  const captureDebounceTime = isMobile ? 150 : 100;
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const publicDir = process.env.NEXT_PUBLIC_PUBLIC_URL;

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = (containerWidth * 3) / 4;

        // For mobile, reduce dimensions slightly
        const scaleFactor = isMobile ? 0.9 : 1;
        const newWidth = containerWidth * scaleFactor;
        const newHeight = containerHeight * scaleFactor;
        setDimensions({
          width: newWidth,
          height: newHeight,
        });

        const circleDiameter = Math.min(newWidth, newHeight) * 0.65;
        setCircleSize({
          width: circleDiameter,
          height: circleDiameter,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isMobile]);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = publicDir + "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setValue("ModelsLoaded", true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

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

  const getFaceDirection = ({ yaw, pitch }: { yaw: number; pitch: number }) => {
    if (!isMobile) {
      if (pitch < 90 && yaw >= -2 && yaw <= 15) return "Up";
      if (pitch > 170 && yaw >= -2 && yaw <= 15) return "Down";
      if (yaw < 0) return "Right";
      if (yaw > 15) return "Left";
      return "Straight";
    }

    if (pitch < 90 && yaw >= -10 && yaw <= 15) return "Up";
    if (pitch > 170 && yaw >= -10 && yaw <= 15) return "Down";
    if (yaw < -20) return "Right";
    if (yaw > 20) return "Left";
    return "Straight";
  };

  const captureAndSaveFrameFromVideo = async (
    boundingBox: faceapi.Box,
    count: number,
    direction: string
  ) => {
    const currentTime = Date.now();
    if (currentTime - lastCaptureTime.current < captureDebounceTime) {
      return false;
    }

    if (!videoRef.current) return false;

    const video = videoRef.current;
    try {
      const scaleX = video.videoWidth / video.width;
      const scaleY = video.videoHeight / video.height;

      const scaledBoundingBox = {
        x: boundingBox.x * scaleX,
        y: boundingBox.y * scaleY,
        width: boundingBox.width * scaleX,
        height: boundingBox.height * scaleY,
      };

      const outputSize = isMobile ? 224 : 224;
      const captureCanvas = new OffscreenCanvas(
        scaledBoundingBox.width,
        scaledBoundingBox.height
      );
      const outputCanvas = new OffscreenCanvas(outputSize, outputSize);

      const captureContext = captureCanvas.getContext("2d");
      const outputContext = outputCanvas.getContext("2d");

      if (!captureContext || !outputContext) return false;

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

      const aspectRatio = scaledBoundingBox.width / scaledBoundingBox.height;
      let drawWidth = outputSize;
      let drawHeight = outputSize;
      let offsetX = 0;
      let offsetY = 0;

      if (aspectRatio > 1) {
        drawHeight = outputSize / aspectRatio;
        offsetY = (outputSize - drawHeight) / 2;
      } else {
        drawWidth = outputSize * aspectRatio;
        offsetX = (outputSize - drawWidth) / 2;
      }

      outputContext.drawImage(
        captureCanvas,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );

      const quality = isMobile ? 0.85 : 0.9;
      const blob = await outputCanvas.convertToBlob({
        type: "image/jpeg",
        quality,
      });

      const name_email = convertNameEmail(email);
      const formData = new FormData();
      formData.append("image", blob, `${direction}-${Date.now()}.jpg`);
      formData.append("name", name);
      formData.append("email", name_email);
      formData.append("organization", organization);
      formData.append("selectPlan", selectPlan);

      const response = await fetch("/api/save-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        lastCaptureTime.current = currentTime;
        // Update progress when image is captured successfully
        setProgress((prev) => ({
          ...prev,
          [direction]: Math.min((prev[direction] || 0) + 2, 100), // Increment by 2% for each successful capture
        }));
        return true;
      }
    } catch (error) {
      console.error("Error capturing and saving frame:", error);
    }
    return false;
  };

  const handleVideoPlay = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const counts: Record<string, number> = {
      straight: 0,
      left: 0,
      right: 0,
      up: 0,
      down: 0,
    };

    const captureSequence = [
      { direction: "Straight", target: 50 },
      { direction: "Left", target: 50 },
      { direction: "Right", target: 50 },
      { direction: "Up", target: 50 },
      { direction: "Down", target: 50 },
    ];

    let currentStageIndex = 0;
    let frameSkipCount = 0;

    const intervalId = setInterval(async () => {
      if (processingRef.current) return;

      // Skip frames on mobile for better performance
      if (isMobile) {
        frameSkipCount = (frameSkipCount + 1) % 2;
        if (frameSkipCount !== 0) return;
      }

      try {
        processingRef.current = true;

        const detections = await faceapi
          .detectAllFaces(video, TINY_FACE_DETECTOR_OPTIONS)
          .withFaceLandmarks();

        if (detections.length >= 2) {
          setValue("faceDirection", "Multiple faces detected");
          processingRef.current = false;
          return;
        }

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        const context = canvas.getContext("2d");
        if (!context) {
          processingRef.current = false;
          return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (resizedDetections.length === 0) {
          setValue("faceDirection", "No face detected");
          processingRef.current = false;
          return;
        }

        if (!isMobile) {
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }

        const pose = calculateFacePose(resizedDetections[0].landmarks);
        const currentDirection = getFaceDirection(pose);
        setValue("faceDirection", currentDirection);

        const currentStage = captureSequence[currentStageIndex];
        if (!currentStage) {
          clearInterval(intervalId);
          setValue("lookingFor", "Done capturing all images");
          setValue("isDone", true);
          processingRef.current = false;
          return;
        }

        setValue("lookingFor", currentStage.direction);

        // Release processing lock before capture attempt
        processingRef.current = false;

        if (currentDirection === currentStage.direction) {
          const directionKey = currentStage.direction.toLowerCase();
          const boundingBox = resizedDetections[0].detection.box;

          const captured = await captureAndSaveFrameFromVideo(
            boundingBox,
            counts[directionKey],
            currentStage.direction
          );

          if (captured) {
            counts[directionKey]++;
            if (counts[directionKey] === currentStage.target) {
              currentStageIndex++;

              // Trigger vibration on mobile
              if (isMobile && navigator.vibrate) {
                navigator.vibrate(200); // Rung 200ms
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in face detection:", error);
        processingRef.current = false;
      }
    }, DETECTION_INTERVAL);

    intervalRef.current = intervalId;
    return () => clearInterval(intervalId);
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

  // Modified camera activation with iOS-specific constraints
  useEffect(() => {
    if (isModelsLoaded && videoRef.current && !isDone) {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
        },
      };

      // Special handling for iOS devices
      if (isIOS) {
        // Force hardware acceleration for iOS
        if (videoRef.current) {
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("webkit-playsinline", "true");
        }
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;

            // For iOS, we need to call play() after setting srcObject
            if (isIOS) {
              videoRef.current.play().catch((error) => {
                console.error("Error playing video:", error);
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    }
    return () => {
      stopWebcam();
    };
  }, [isModelsLoaded, isDone, isIOS]);

  const lookingForVietnamese = useMemo(() => {
    if (lookingFor === "Straight") return "Thẳng";
    if (lookingFor === "Left") return "Trái";
    if (lookingFor == "Right") return "Phải";
    if (lookingFor === "Up") return "Lên";
    if (lookingFor === "Down") return "Xuống";
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto" ref={containerRef}>
      <div className="flex flex-col gap-y-3">
        <div className="text-center flex flex-col gap-y-3">
          <h2
            className={`${
              isMobile ? "text-sm pt-3" : "text-2xl pt-3"
            } font-bold`}
          >
            Nhìn vào camera và làm theo hướng dẫn
          </h2>
          {faceDirection === lookingFor ? (
            <h1 className="text-xl text-green-500 font-bold">Giữ nguyên!</h1>
          ) : (
            <h1 className="text-xl text-red-500 font-bold">
              Hướng sang: {lookingForVietnamese}
            </h1>
          )}
        </div>

        {/* Progress bars */}
        <div className="grid grid-cols-5 gap-2 px-4 mb-4">
          {Object.entries(progress).map(([direction, value]) => (
            <div key={direction} className="flex flex-col items-center">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className={`${isMobile ? "text-xs" : "text-sm"} mt-1`}>
                {
                  {
                    Straight: "Thẳng",
                    Left: "Trái",
                    Right: "Phải",
                    Up: "Lên",
                    Down: "Xuống",
                  }[direction]
                }
              </span>
            </div>
          ))}
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
            // playsInline
            muted
            onPlay={handleVideoPlay}
            width={dimensions.width}
            height={dimensions.height}
            className="rounded-2xl w-full h-full object-cover"
            style={{ transform: isMobile ? "scaleX(-1)" : "none" }}
          />
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: isMobile ? "scaleX(-1)" : "none" }}
          />

          {/* Focus circle for mobile */}
          {/* Updated responsive focus circle for mobile */}
          {isMobile && (
            <>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <mask id="circle-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <circle
                      cx={dimensions.width / 2}
                      cy={dimensions.height / 2}
                      r={circleSize.width / 2}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="black"
                  opacity="0.7"
                  mask="url(#circle-mask)"
                />
              </svg>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
