"use client";
import React from "react";

function ErrorBoundary() {
  return (
    <div className="flex items-center justify-center w-full h-full text-white">
      Error While Retrieving the message
    </div>
  );
}

export default ErrorBoundary;
