"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@radix-ui/themes";
import { handleLoginCallback } from "@/utils/auth-utils";

export default function LoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Logging in...");

  useEffect(() => {
    const tempCode = searchParams.get("code");

    if (!tempCode) {
      setMessage("Invalid access. Redirecting to application...");
      setTimeout(() => {
        router.replace("/");
      }, 10000);
      return;
    }

    try {
      handleLoginCallback(tempCode)
      .then((res)=> {
        localStorage.setItem("app_token", res.token)
        localStorage.setItem("id", res.id)
        localStorage.setItem("avatar", res.avatar)
      })

      const timeout = setTimeout(() => {
        router.replace("/");
      }, 1000);

      return () => clearTimeout(timeout);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
      setMessage("Something went wrong. Redirecting to login...");
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="animate-spin text-4xl text-black" />
        <span className="text-black text-sm font-semibold font-ember">
          {message}
        </span>
      </div>
    </div>
  )
}
