import React, { useState, useRef, useEffect } from "react";
import { FileItem } from "@/types/file";
import { useCollaborativeFileService } from "@/hooks/useCollaborativeFileService";
import { X, Plus, FileText } from "lucide-react";

interface FileTabsProps {
  roomId: string;
  className?: string;
}

export const FileTabs: React.FC<FileTabsProps> = ({
  roomId,
  className = "",
}) => {
  const collaborativeService = useCollaborativeFileService(roomId);
  const files = collaborativeService.files;
  const activeFile = collaborativeService.activeFile;
  console.log("Files in FileTabs:", files);
  console.log("Active file in FileTabs:", activeFile);
  const canAddFile = files.length < 20; // Limit to 20 files
  const canDeleteFile = files.length > 1; // Must have at least 1 file
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFileId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingFileId]);

  const handleTabClick = (fileId: string) => {
    console.log("Tab clicked:", fileId);
    console.log("Active file before switch:", activeFile?.id);
    collaborativeService.switchToFile(fileId);
  };

  const handleTabDoubleClick = (fileId: string, fileName: string) => {
    setEditingFileId(fileId);
    setEditingFileName(fileName);
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingFileName(e.target.value);
  };

  const handleFileNameBlur = () => {
    if (editingFileId && editingFileName.trim()) {
      collaborativeService.renameFile(editingFileId, editingFileName.trim());
    }
    setEditingFileId(null);
    setEditingFileName("");
  };

  const handleFileNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFileNameBlur();
    } else if (e.key === "Escape") {
      setEditingFileId(null);
      setEditingFileName("");
    }
  };

  const handleAddFile = () => {
    if (canAddFile) {
      collaborativeService.createNewFile();
    }
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDeleteFile) {
      collaborativeService.deleteFile(fileId);
    }
  };

  return (
    <div className={`flex items-center bg-[#1c1e24] ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {files.map((file: FileItem) => (
          <div
            key={file.id}
            className={`flex items-center px-4 py-2 cursor-pointer border-r border-gray-700 min-w-max ${
              file.isActive || file.id === activeFile?.id
                ? "bg-gray-900 text-white"
                : "bg-[#1c1e24] text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => handleTabClick(file.id)}
            onDoubleClick={() => handleTabDoubleClick(file.id, file.name)}
          >
            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
            {editingFileId === file.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingFileName}
                onChange={handleFileNameChange}
                onBlur={handleFileNameBlur}
                onKeyDown={handleFileNameKeyDown}
                className="bg-transparent text-sm font-medium outline-none border-b border-gray-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm font-medium truncate max-w-xs">
                {file.name}
              </span>
            )}
            {canDeleteFile && editingFileId !== file.id && (
              <button
                className="ml-2 text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                onClick={(e) => handleDeleteFile(file.id, e)}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {canAddFile && (
        <button
          className="flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-700 ml-auto"
          onClick={handleAddFile}
          title="Add new file"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
