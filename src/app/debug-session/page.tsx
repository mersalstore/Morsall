"use client";
import { useSession } from "next-auth/react";

export default function DebugSession() {
  const { data: session, status } = useSession();

  return (
    <div style={{ padding: "50px", direction: "ltr" }}>
      <h1>Session Debug</h1>
      <p>Status: {status}</p>
      {status === "authenticated" ? (
        <pre style={{ background: "#f0f0f0", padding: "20px" }}>
          {JSON.stringify(session, null, 2)}
        </pre>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}
