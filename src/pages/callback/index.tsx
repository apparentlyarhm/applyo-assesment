import { Suspense } from "react";
import LoginSuccess from "./login-suc";
import { Spinner } from "@radix-ui/themes";


export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">

      <Suspense fallback={
          // Use the same UI for the suspense fallback for a seamless experience
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="3" />
            <span className="text-gray-700 text-sm font-semibold">
              Loading login state...
            </span>
          </div>
        }
      >

        <LoginSuccess />
        
      </Suspense>
    </div>
  );
}