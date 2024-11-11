"use client";

import { title } from "@/components/primitives";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { AuthenticatorSchema } from "./type";
import { zodResolver } from "@hookform/resolvers/zod";
import { authenSchema } from "./type";
import { InputValid } from "./input";
import React, { useEffect } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InformationPage } from "./information";
import { FaceDetect } from "./face";
import { Submit } from "./submit";

export default function AuthenPage() {
  const methods = useForm<AuthenticatorSchema>({
    resolver: zodResolver(authenSchema),
    defaultValues: {
      email: "",
      loading: false,
      success: false,
      fail: false,
      faceStep: false,
      faceDirection: "No face detected",
      lookingFor: "Straight",
      isDone: false,
      isFinish: false,
    },
  });

  const { control, setValue } = methods;
  const success = useWatch({ control, name: "success" });
  const fail = useWatch({ control, name: "fail" });
  const faceStep = useWatch({ control, name: "faceStep" });
  const isDone = useWatch({ control, name: "isDone" });
  const isFinish = useWatch({ control, name: "isFinish" });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get("email");

    if (!email) {
      return;
    }

    setValue("email", email);
  }, []);

  useEffect(() => {
    if (success && !isFinish) {
      toast.success("Email is valid!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }

    if (isFinish) {
      toast.success("Your Information Send Successfully", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }

    if (fail) {
      toast.error("Email is invalid!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      setValue("fail", false);
    }
  }, [success, fail, isFinish, setValue]);

  return (
    <section className="w-full h-full flex justify-center items-center">
      {!faceStep && (
        <div className="border-1 border-transparent p-10 rounded-2xl backdrop-blur-3xl bg-white/20">
          {!success && (
            <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
              <div className="inline-block max-w-xl text-center justify-center">
                <span className={title({ color: "violet", size: "sm" })}>
                  Authentication&nbsp;
                </span>
              </div>
              <h1 className="text-sm font-semibold">
                Eligibility check: enter your email you have received an
                invitation from the organizers
              </h1>
              <FormProvider {...methods}>
                <InputValid />
              </FormProvider>
            </div>
          )}
          {success && (
            <FormProvider {...methods}>
              <InformationPage />
            </FormProvider>
          )}
        </div>
      )}

      {faceStep && !isDone && (
        <FormProvider {...methods}>
          <div className="border-1 border-transparent p-10 rounded-2xl backdrop-blur-3xl bg-white/20">
            <FaceDetect />
          </div>
        </FormProvider>
      )}

      {isDone && !isFinish && (
        <FormProvider {...methods}>
          <div className="border-1 border-transparent p-10 rounded-2xl backdrop-blur-3xl bg-white/20">
            <Submit />
          </div>
        </FormProvider>
      )}

      {isFinish && (
        <div className="text-[30px] flex justify-center items-center">
          Thanks For Submit! See You
        </div>
      )}

      <ToastContainer />
    </section>
  );
}
