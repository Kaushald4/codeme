"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContainerTextFlip } from "./ui/container-text-flip";

const LandingPage = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomId = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const startCollaboration = () => {
    setIsCreating(true);
    const roomId = generateRoomId();
    router.push(`/editor/${roomId}`);
  };

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#e0e2f4,transparent)]"></div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <a
              href="https://github.com/Kaushald4/codeme"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex border border-blue-200 backdrop-blur-md mb-5 px-2 rounded-2xl items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Give a star on GitHub</span>
            </a>
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-6 tracking-tight">
                Code <ContainerTextFlip words={["Share", "Me", "Now"]} />
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Real-time collaborative code editing. Share your code,
                collaborate instantly.
              </p>
            </div>

            <button
              onClick={startCollaboration}
              disabled={isCreating}
              className="group relative px-12 py-6 bg-slate-900 text-white text-xl font-semibold rounded-lg hover:bg-slate-800 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              <span className="flex items-center space-x-3">
                {isCreating ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Creating Room...</span>
                  </>
                ) : (
                  <>
                    <span>Share Now</span>
                    <svg
                      className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </span>
            </button>

            <p className="text-slate-500 mt-6 text-sm">
              Click to generate a shared room and start collaborating instantly
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Real-time Collaboration
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Multiple users can edit the same code simultaneously with
                instant synchronization across all devices.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Syntax Highlighting
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Full JavaScript syntax highlighting with intelligent code
                completion and error detection powered by CodeMirror.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Secure & Private
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Your code is secure with end-to-end encryption. No data is
                stored on servers - it&apos;s all in real-time memory.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Click Share Now
                </h3>
                <p className="text-slate-600">
                  Generate a unique room ID instantly
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Share the Link
                </h3>
                <p className="text-slate-600">
                  Send the room URL to your collaborators
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Code Together
                </h3>
                <p className="text-slate-600">
                  Start collaborating in real-time
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t border-slate-200 pt-12">
            <p className="text-slate-400 text-sm mb-4">
              Open source • Free to use • No registration required
            </p>
            <a
              href="https://github.com/Kaushald4/codeme"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Give a star on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
