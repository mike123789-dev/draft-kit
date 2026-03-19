"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <section style={{ textAlign: "center" }}>
        <h1>Counter App</h1>
        <p style={{ fontSize: "2rem", margin: "1rem 0" }}>{count}</p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
          <button type="button" onClick={() => setCount((prev) => prev - 1)}>
            -
          </button>
          <button type="button" onClick={() => setCount((prev) => prev + 1)}>
            +
          </button>
          <button type="button" onClick={() => setCount(0)}>
            reset
          </button>
        </div>
      </section>
    </main>
  );
}
