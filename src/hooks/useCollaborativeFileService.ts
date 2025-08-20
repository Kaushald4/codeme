import { useEffect, useState, useCallback } from "react";
import { collaborativeFileService } from "@/store/CollaborativeFileService";
import { FileItem, FileCreateOptions } from "@/types/file";

export function useCollaborativeFileService(roomId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);

  useEffect(() => {
    if (!roomId) return;

    collaborativeFileService.initializeCollaboration(roomId);

    const handleStatusChange = ({ status }: { status: string }) => {
      setIsConnected(status === "connected");
    };

    const provider = collaborativeFileService.getProvider();
    if (provider) {
      provider.on("status", handleStatusChange);
      // Set initial connection status
      setIsConnected(provider.wsconnected);
    }

    const handleFileUpdate = (file: FileItem) => {
      setActiveFile(file);
    };

    const handleFileListUpdate = (updatedFiles: FileItem[]) => {
      setFiles(updatedFiles);
      const newActiveFile = updatedFiles.find((file) => file.isActive);
      if (newActiveFile) {
        setActiveFile(newActiveFile);
      }
    };

    collaborativeFileService.onFileUpdate(handleFileUpdate);
    collaborativeFileService.onFileListUpdate(handleFileListUpdate);

    setFiles(collaborativeFileService.getFiles());
    setActiveFile(collaborativeFileService.getActiveFile());

    return () => {
      if (provider) {
        provider.off("status", handleStatusChange);
      }
      collaborativeFileService.destroyCollaboration();
    };
  }, [roomId]);

  useEffect(() => {
    const currentActiveFile = collaborativeFileService.getActiveFile();
    if (currentActiveFile && currentActiveFile.id !== activeFile?.id) {
      setActiveFile(currentActiveFile);
    }
  }, [files, activeFile?.id]);

  const createNewFile = useCallback((options?: FileCreateOptions) => {
    const newFile = collaborativeFileService.createNewFile(options);
    collaborativeFileService.switchToFile(newFile.id);
    return newFile;
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    collaborativeFileService.updateFileContent(id, content);
  }, []);

  const renameFile = useCallback((id: string, newName: string) => {
    collaborativeFileService.renameFile(id, newName);
  }, []);

  const deleteFile = useCallback((id: string) => {
    collaborativeFileService.deleteFile(id);
  }, []);

  const switchToFile = useCallback((id: string) => {
    collaborativeFileService.switchToFile(id);
  }, []);

  const getFiles = useCallback(() => {
    return collaborativeFileService.getFiles();
  }, []);

  const getActiveFile = useCallback(() => {
    return collaborativeFileService.getActiveFile();
  }, []);

  const getFileYText = useCallback((fileId: string) => {
    return collaborativeFileService.getFileYText(fileId);
  }, []);

  const getAwareness = useCallback(() => {
    return collaborativeFileService.getAwareness();
  }, []);

  const getProvider = useCallback(() => {
    return collaborativeFileService.getProvider();
  }, []);

  const getLocalClientId = useCallback(() => {
    return collaborativeFileService.getLocalClientId();
  }, []);

  const exportFiles = useCallback(() => {
    return collaborativeFileService.exportFiles();
  }, []);

  const importFiles = useCallback((filesData: string) => {
    return collaborativeFileService.importFiles(filesData);
  }, []);

  return {
    isConnected,
    files,
    activeFile,
    createNewFile,
    updateFileContent,
    renameFile,
    deleteFile,
    switchToFile,
    getFiles,
    getActiveFile,
    getFileYText,
    getAwareness,
    getProvider,
    getLocalClientId,
    exportFiles,
    importFiles,
  };
}
