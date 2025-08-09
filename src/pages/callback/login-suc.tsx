"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Spinner } from "@radix-ui/themes";
import { handleLoginCallback } from "@/utils/auth-utils";

export default function LoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Finalizing login...");

  useEffect(() => {
    const processLogin = async () => {
      const tempCode = searchParams.get("code");

      if (!tempCode) {
        setMessage("Processing...");
        setTimeout(() => router.replace("/"), 3000);
        return;
      }

      try {
        const res = await handleLoginCallback(tempCode);

        localStorage.setItem("app_token", res.token);
        localStorage.setItem("id", res.id);
        localStorage.setItem("avatar", res.avatar);

        setMessage("Login successful! Redirecting...");
        
        setTimeout(() => {
          router.replace("/");
        }, 1000);

      } catch (e) {

        console.error("Failed to handle login callback:", e);
        setMessage("Authentication failed. Please try again.");
        
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      }
    };

    processLogin();
  }, [router, searchParams]); 

  return (
    <div className="flex flex-col items-center space-y-4">
      <Spinner size="3" />
      <span className="text-gray-700 text-sm font-semibold">
        {message}
      </span>
    </div>
  );
}