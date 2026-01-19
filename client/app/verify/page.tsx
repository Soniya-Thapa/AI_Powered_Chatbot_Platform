import { Suspense } from "react";
import VerifyClient from "./verify.client";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading verification...</div>}>
      <VerifyClient />
    </Suspense>
  );
}






