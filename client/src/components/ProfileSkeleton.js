import React from "react";

function ProfileSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid hsl(203, 58%, 74%)",
        borderRadius: "16px",
        width: "72px",
        height: "48px",
        color: "#000000",
        display: "flex", // Use Flexbox layout
        justifyContent: "center", // Horizontally center the content
        fontSize: "x-large",
        marginLeft: "10px",
      }}
    >
      <span style={{ animation: "blink 1.5s infinite" }}>.</span>
      <span
        style={{ animation: "blink 1.5s infinite", animationDelay: "0.5s" }}
      >
        .
      </span>
      <span style={{ animation: "blink 1.5s infinite", animationDelay: "1s" }}>
        .
      </span>
    </div>
  );
}

export { ProfileSkeleton };
