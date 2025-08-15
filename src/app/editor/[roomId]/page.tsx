"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import { useFileService } from "@/store/FileService";

export default function EditorPage() {
  const params = useParams();
  const roomId = (params.roomId as string) || "default-room";
  const [mounted, setMounted] = useState(false);
  const fileService = useFileService();

  useEffect(() => {
    setMounted(true);

    // Initialize with a default file if no files exist
    if (fileService.getFileCount() === 0) {
      fileService.createNewFile({
        name: "index.js",
        content:
          "// Welcome to the collaborative editor!\n// Start coding here...",
        language: "javascript",
      });
    }
  }, [fileService]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Room
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No room ID provided. Please create or join a room.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto">
        <div className="h-[calc(100vh)] overflow-y-auto">
          <CodeEditor roomId={roomId} theme="dark" />
        </div>
      </div>
    </div>
  );
}
