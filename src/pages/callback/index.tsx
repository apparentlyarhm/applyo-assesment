import { Suspense } from "react";
import LoginSuccess from "./login-suc";


export default function Page() {
  return (
    <Suspense fallback={<p>"Loading login state..."</p>}>
      <LoginSuccess />
    </Suspense>
  );
}
