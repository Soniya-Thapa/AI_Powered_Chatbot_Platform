"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { verifyCode, clearError } from "@/lib/redux/slices/auth.slice";
import { authAPI } from "@/lib/api";
import { Bot, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyClient() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!email) {
      toast.error("Email not found. Please register again.");
      router.push("/register");
    }
  }, [email, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");
    if (codeToVerify.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    const toastId = toast.loading("Verifying your code...");

    try {
      const result = await dispatch(
        verifyCode({ email, code: codeToVerify })
      );

      toast.dismiss(toastId);

      if (verifyCode.fulfilled.match(result)) {
        toast.success("Email verified successfully!");
        setTimeout(() => router.push("/login"), 1000);
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Verification failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Verify Your Email
        </h1>
        <p className="text-center text-gray-600 mb-6">{email}</p>

        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
