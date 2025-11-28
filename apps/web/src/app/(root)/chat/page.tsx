"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Chat from "@/components/root/Chat";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading chat...</div>}>
      <Chat />
    </Suspense>
  );
}
