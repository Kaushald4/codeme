"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { yCollab } from "y-codemirror.next";
import { showMinimap } from "@replit/codemirror-minimap";
import { FileTabs } from "./FileTabs";
import { useCollaborativeFileService } from "@/hooks/useCollaborativeFileService";
import { githubLight } from "@uiw/codemirror-theme-github";
import { githubDark } from "@uiw/codemirror-theme-github";
import { abcdef } from "@uiw/codemirror-theme-abcdef";
import { androidstudio } from "@uiw/codemirror-theme-androidstudio";
import { andromeda } from "@uiw/codemirror-theme-andromeda";
import { atomone } from "@uiw/codemirror-theme-atomone";
import { aura } from "@uiw/codemirror-theme-aura";
import { basicLight } from "@uiw/codemirror-theme-basic";
import { basicDark } from "@uiw/codemirror-theme-basic";
import { bespin } from "@uiw/codemirror-theme-bespin";
import { copilot } from "@uiw/codemirror-theme-copilot";
import { darcula } from "@uiw/codemirror-theme-darcula";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { duotoneLight } from "@uiw/codemirror-theme-duotone";
import { duotoneDark } from "@uiw/codemirror-theme-duotone";
import { eclipse } from "@uiw/codemirror-theme-eclipse";
import { gruvboxDark } from "@uiw/codemirror-theme-gruvbox-dark";
import { material } from "@uiw/codemirror-theme-material";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { monokaiDimmed } from "@uiw/codemirror-theme-monokai-dimmed";
import { noctisLilac } from "@uiw/codemirror-theme-noctis-lilac";
import { nord } from "@uiw/codemirror-theme-nord";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { solarizedLight } from "@uiw/codemirror-theme-solarized";
import { solarizedDark } from "@uiw/codemirror-theme-solarized";
import { sublime } from "@uiw/codemirror-theme-sublime";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import { tomorrowNightBlue } from "@uiw/codemirror-theme-tomorrow-night-blue";
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { xcodeLight } from "@uiw/codemirror-theme-xcode";
import { xcodeDark } from "@uiw/codemirror-theme-xcode";

interface CodeEditorProps {
  roomId: string;
  theme?:
    | "light"
    | "dark"
    | "githubLight"
    | "githubDark"
    | "abcdef"
    | "androidstudio"
    | "andromeda"
    | "atomone"
    | "aura"
    | "basicLight"
    | "basicDark"
    | "bespin"
    | "copilot"
    | "darcula"
    | "dracula"
    | "duotoneLight"
    | "duotoneDark"
    | "eclipse"
    | "gruvboxDark"
    | "material"
    | "monokai"
    | "monokaiDimmed"
    | "noctisLilac"
    | "nord"
    | "okaidia"
    | "solarizedLight"
    | "solarizedDark"
    | "sublime"
    | "tokyoNight"
    | "tokyoNightStorm"
    | "tomorrowNightBlue"
    | "vscodeLight"
    | "vscodeDark"
    | "xcodeLight"
    | "xcodeDark";
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  roomId,
  theme: propTheme = "light",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [userCount, setUserCount] = useState(1);
  const [currentTheme, setCurrentTheme] = useState(propTheme);
  const collaborativeService = useCollaborativeFileService(roomId);
  const activeFile = collaborativeService.activeFile;

  // Function to get theme extension based on selected theme
  const getThemeExtension = (): Extension => {
    switch (currentTheme) {
      case "dark":
        return oneDark;
      case "githubDark":
        return githubDark;
      case "abcdef":
        return abcdef;
      case "androidstudio":
        return androidstudio;
      case "andromeda":
        return andromeda;
      case "atomone":
        return atomone;
      case "aura":
        return aura;
      case "basicLight":
        return basicLight;
      case "basicDark":
        return basicDark;
      case "bespin":
        return bespin;
      case "copilot":
        return copilot;
      case "darcula":
        return darcula;
      case "dracula":
        return dracula;
      case "duotoneLight":
        return duotoneLight;
      case "duotoneDark":
        return duotoneDark;
      case "eclipse":
        return eclipse;
      case "gruvboxDark":
        return gruvboxDark;
      case "material":
        return material;
      case "monokai":
        return monokai;
      case "monokaiDimmed":
        return monokaiDimmed;
      case "noctisLilac":
        return noctisLilac;
      case "nord":
        return nord;
      case "okaidia":
        return okaidia;
      case "solarizedLight":
        return solarizedLight;
      case "solarizedDark":
        return solarizedDark;
      case "sublime":
        return sublime;
      case "tokyoNight":
        return tokyoNight;
      case "tokyoNightStorm":
        return tokyoNightStorm;
      case "tomorrowNightBlue":
        return tomorrowNightBlue;
      case "vscodeLight":
        return vscodeLight;
      case "vscodeDark":
        return vscodeDark;
      case "xcodeLight":
        return xcodeLight;
      case "xcodeDark":
        return xcodeDark;
      case "light":
      case "githubLight":
      default:
        return githubLight;
    }
  };

  const clientId = useRef<string>(
    `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const activeClients = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const awareness = collaborativeService.getAwareness();
    if (!awareness) return;

    const currentTime = Date.now();
    awareness.setLocalState({
      clientId: clientId.current,
      name: `User ${Math.floor(Math.random() * 1000)}`,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      lastSeen: currentTime,
    });

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const now = Date.now();
      const timeoutThreshold = 3000;

      // Update active clients map with current timestamp for each client
      const updatedClients = new Map<string, number>();
      states.forEach((state, clientID) => {
        if (state && state.clientId) {
          // Use the client's lastSeen timestamp if available, otherwise use current time
          const lastSeen = state.lastSeen || now;
          updatedClients.set(state.clientId, lastSeen);
        }
      });

      activeClients.current = updatedClients;

      // Count only clients that have been recently active (within timeout threshold)
      let connectedCount = 0;
      updatedClients.forEach((lastSeen, clientClientId) => {
        if (now - lastSeen < timeoutThreshold) {
          connectedCount++;
        }
      });

      setUserCount(connectedCount);
    };

    // Periodic check to remove inactive clients (more frequent than before)
    const checkInterval = setInterval(() => {
      handleAwarenessChange();
    }, 1000);

    awareness.on("change", handleAwarenessChange);

    const provider = collaborativeService.getProvider();
    const handleConnectionStatusChange = () => {
      handleAwarenessChange();
    };

    if (provider) {
      provider.on("status", handleConnectionStatusChange);
    }

    const heartbeatInterval = setInterval(() => {
      if (awareness) {
        const currentState = awareness.getLocalState();
        if (currentState) {
          awareness.setLocalState({
            ...currentState,
            lastSeen: Date.now(),
          });
        }
      }
    }, 2000);

    return () => {
      awareness.off("change", handleAwarenessChange);
      if (provider) {
        provider.off("status", handleConnectionStatusChange);
      }
      clearInterval(checkInterval);
      clearInterval(heartbeatInterval);
      awareness.setLocalState(null);
    };
  }, [collaborativeService]);

  // Initialize or reinitialize editor when active file changes
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    const yText = collaborativeService.getFileYText(activeFile.id);
    if (!yText) return;

    const awareness = collaborativeService.getAwareness();
    if (!awareness) return;

    const minimapConfig = showMinimap.compute(["doc"], (state) => {
      return {
        create: (view: EditorView) => {
          const dom = document.createElement("div");
          return { dom };
        },
        displayText: "blocks",
        showOverlay: "always",
      };
    });

    const collaborationExtension = yCollab(yText, awareness);

    const extensions: Extension[] = [
      basicSetup,
      javascript(),
      getThemeExtension(),
      minimapConfig,
      collaborationExtension,
    ];

    // Destroy existing editor if it exists
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // Initialize CodeMirror with collaboration extensions
    const view = new EditorView({
      doc: yText.toString(),
      extensions,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [activeFile?.id, currentTheme, collaborativeService]);

  return (
    <div className="flex flex-col h-full bg-[#282c34]">
      <FileTabs roomId={roomId} />
      <div className="flex items-center justify-between p-2 bg-[#1c1e24] !text-white">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              collaborativeService.isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-400 dark:text-gray-300">
            {collaborativeService.isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400 dark:text-gray-300">
            Users: {userCount}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-300">
            Room: {roomId}
          </span>
          {activeFile && (
            <span className="text-sm text-gray-400 dark:text-gray-300">
              File: {activeFile.name}
            </span>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400 dark:text-gray-300">
              Theme:
            </span>
            <select
              value={currentTheme}
              onChange={(e) =>
                setCurrentTheme(
                  e.target.value as
                    | "light"
                    | "dark"
                    | "githubLight"
                    | "githubDark"
                    | "abcdef"
                    | "androidstudio"
                    | "andromeda"
                    | "atomone"
                    | "aura"
                    | "basicLight"
                    | "basicDark"
                    | "bespin"
                    | "copilot"
                    | "darcula"
                    | "dracula"
                    | "duotoneLight"
                    | "duotoneDark"
                    | "eclipse"
                    | "gruvboxDark"
                    | "material"
                    | "monokai"
                    | "monokaiDimmed"
                    | "noctisLilac"
                    | "nord"
                    | "okaidia"
                    | "solarizedLight"
                    | "solarizedDark"
                    | "sublime"
                    | "tokyoNight"
                    | "tokyoNightStorm"
                    | "tomorrowNightBlue"
                    | "vscodeLight"
                    | "vscodeDark"
                    | "xcodeLight"
                    | "xcodeDark"
                )
              }
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="githubLight">GitHub Light</option>
              <option value="githubDark">GitHub Dark</option>
              <option value="abcdef">ABCDEF</option>
              <option value="androidstudio">Android Studio</option>
              <option value="andromeda">Andromeda</option>
              <option value="atomone">Atom One</option>
              <option value="aura">Aura</option>
              <option value="basicLight">Basic Light</option>
              <option value="basicDark">Basic Dark</option>
              <option value="bespin">Bespin</option>
              <option value="copilot">Copilot</option>
              <option value="darcula">Darcula</option>
              <option value="dracula">Dracula</option>
              <option value="duotoneLight">Duotone Light</option>
              <option value="duotoneDark">Duotone Dark</option>
              <option value="eclipse">Eclipse</option>
              <option value="gruvboxDark">Gruvbox Dark</option>
              <option value="material">Material</option>
              <option value="monokai">Monokai</option>
              <option value="monokaiDimmed">Monokai Dimmed</option>
              <option value="noctisLilac">Noctis Lilac</option>
              <option value="nord">Nord</option>
              <option value="okaidia">Okaidia</option>
              <option value="solarizedLight">Solarized Light</option>
              <option value="solarizedDark">Solarized Dark</option>
              <option value="sublime">Sublime</option>
              <option value="tokyoNight">Tokyo Night</option>
              <option value="tokyoNightStorm">Tokyo Night Storm</option>
              <option value="tomorrowNightBlue">Tomorrow Night Blue</option>
              <option value="vscodeLight">VSCode Light</option>
              <option value="vscodeDark">VSCode Dark</option>
              <option value="xcodeLight">Xcode Light</option>
              <option value="xcodeDark">Xcode Dark</option>
            </select>
          </div>
        </div>
      </div>
      <div ref={editorRef} className="flex-1 overflow-y-auto" />
    </div>
  );
};

export default CodeEditor;
