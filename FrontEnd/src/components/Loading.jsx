import React from "react";
import { ClipLoader } from "react-spinners";

function Loading() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <ClipLoader color="#3399df" size={50} />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;

