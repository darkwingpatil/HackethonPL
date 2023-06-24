import React from "react";
import { getSkeletonProps } from "@pluralsight/headless-styles";

function ProfileSkeleton({ withDescription }) {
  const textSkeletonProps = getSkeletonProps({ kind: "text" });

  return (
    <div style={{ paddingInlineStart: "1rem", paddingInlineEnd: "1rem" }}>
      <div {...textSkeletonProps} style={{ height: "40px" }}></div>
      <div style={{ display: "flex", marginTop: "16px" }}>
        <div {...textSkeletonProps} style={{ height: "40px" }} />
      </div>
    </div>
  );
}

export { ProfileSkeleton };
