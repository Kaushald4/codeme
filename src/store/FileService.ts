import {
  FileItem,
  FileCreateOptions,
  FileUpdateOptions,
  FileState,
  IFileService,
} from "@/types/file";
import { atom } from "jotai";
import { fileStateAtom, filesAtom, activeFileIdAtom } from "./fileAtoms";

type SetAtom<T> = (value: T) => void;
type GetAtom<T> = () => T;

export class FileService implements IFileService {
  private setFileState: SetAtom<FileState>;
  private getFileState: GetAtom<FileState>;
  private setFiles: SetAtom<FileItem[]>;
  private getFilesInternal: GetAtom<FileItem[]>;
  private setActiveFileId: SetAtom<string | null>;
  private getActiveFileId: GetAtom<string | null>;

  constructor() {
    // Initialize with dummy functions - will be properly set later
    this.setFileState = () => {};
    this.getFileState = () => ({ files: [], activeFileId: null });
    this.setFiles = () => {};
    this.getFilesInternal = () => [];
    this.setActiveFileId = () => {};
    this.getActiveFileId = () => null;
  }

  // Method to initialize the service with Jotai atom setters/getters
  initializeWithAtoms(
    setFileState: SetAtom<FileState>,
    getFileState: GetAtom<FileState>,
    setFiles: SetAtom<FileItem[]>,
    getFiles: GetAtom<FileItem[]>,
    setActiveFileId: SetAtom<string | null>,
    getActiveFileId: GetAtom<string | null>
  ) {
    this.setFileState = setFileState;
    this.getFileState = getFileState;
    this.setFiles = setFiles;
    this.getFilesInternal = getFiles;
    this.setActiveFileId = setActiveFileId;
    this.getActiveFileId = getActiveFileId;
  }

  generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateFileName(index: number): string {
    return `untitled${index + 1}.js`;
  }

  createNewFile(options: FileCreateOptions = {}): FileItem {
    const currentFiles = this.getFilesInternal();
    const newFile: FileItem = {
      id: this.generateFileId(),
      name: options.name || this.generateFileName(currentFiles.length),
      content: options.content || "",
      language: options.language || "javascript",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Deactivate all other files
    const updatedFiles = currentFiles.map((file: FileItem) => ({
      ...file,
      isActive: false,
    }));

    this.setFiles([...updatedFiles, newFile]);
    this.setActiveFileId(newFile.id);

    // Broadcast file state changes
    this.broadcastFileState();

    return newFile;
  }

  updateFileContent(id: string, content: string): void {
    const currentFiles = this.getFilesInternal();
    const fileIndex = currentFiles.findIndex(
      (file: FileItem) => file.id === id
    );

    if (fileIndex === -1) return;

    const updatedFiles = [...currentFiles];
    updatedFiles[fileIndex] = {
      ...updatedFiles[fileIndex],
      content,
      updatedAt: new Date(),
    };

    this.setFiles(updatedFiles);

    // Broadcast file state changes for content updates
    this.broadcastFileState();
  }

  renameFile(id: string, newName: string): void {
    const currentFiles = this.getFilesInternal();
    const fileIndex = currentFiles.findIndex(
      (file: FileItem) => file.id === id
    );

    if (fileIndex === -1) return;

    const updatedFiles = [...currentFiles];
    updatedFiles[fileIndex] = {
      ...updatedFiles[fileIndex],
      name: newName,
      updatedAt: new Date(),
    };

    this.setFiles(updatedFiles);

    // Broadcast file state changes
    this.broadcastFileState();
  }

  deleteFile(id: string): void {
    const currentFiles = this.getFilesInternal();
    const fileIndex = currentFiles.findIndex(
      (file: FileItem) => file.id === id
    );

    if (fileIndex === -1) return;

    const updatedFiles = currentFiles.filter(
      (file: FileItem) => file.id !== id
    );
    const wasActive = currentFiles[fileIndex].isActive;
    const newActiveFileId =
      wasActive && updatedFiles.length > 0 ? updatedFiles[0].id : null;

    this.setFiles(updatedFiles);
    this.setActiveFileId(newActiveFileId);

    // Broadcast file state changes
    this.broadcastFileState();
  }

  switchToFile(id: string): void {
    const currentFiles = this.getFilesInternal();
    const fileExists = currentFiles.some((file: FileItem) => file.id === id);

    if (!fileExists) return;

    const updatedFiles = currentFiles.map((file: FileItem) => ({
      ...file,
      isActive: file.id === id,
    }));

    this.setFiles(updatedFiles);
    this.setActiveFileId(id);

    // Broadcast file state changes
    this.broadcastFileState();
  }

  getFiles(): FileItem[] {
    return this.getFilesInternal();
  }

  getActiveFile(): FileItem | null {
    const activeFileId = this.getActiveFileId();
    const files = this.getFilesInternal();
    return files.find((file: FileItem) => file.id === activeFileId) || null;
  }

  exportFiles(): string {
    const files = this.getFilesInternal();
    return JSON.stringify(files, null, 2);
  }

  importFiles(filesData: string): boolean {
    try {
      const parsedFiles = JSON.parse(filesData);

      if (!Array.isArray(parsedFiles)) return false;

      const validFiles: FileItem[] = parsedFiles.map((file: FileItem) => ({
        ...file,
        isActive: false,
        createdAt: new Date(file.createdAt || Date.now()),
        updatedAt: new Date(file.updatedAt || Date.now()),
      }));

      if (validFiles.length > 0) {
        validFiles[0].isActive = true;
        this.setFiles(validFiles);
        this.setActiveFileId(validFiles[0].id);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to import files:", error);
      return false;
    }
  }

  // Utility methods
  clearAllFiles(): void {
    this.setFiles([]);
    this.setActiveFileId(null);
  }

  getFileCount(): number {
    return this.getFilesInternal().length;
  }

  canAddFile(): boolean {
    return this.getFileCount() < 20;
  }

  canDeleteFile(): boolean {
    return this.getFileCount() > 1;
  }

  // Flag to prevent sync loops
  private isSyncing = false;

  // Method to sync remote file state changes
  syncRemoteFiles(files: FileItem[], activeFileId: string | null): void {
    // Prevent sync loops
    if (this.isSyncing) return;

    const currentFiles = this.getFilesInternal();
    const currentActiveFileId = this.getActiveFileId();

    // Check if files have changed
    const filesChanged = JSON.stringify(currentFiles) !== JSON.stringify(files);
    const activeFileChanged = currentActiveFileId !== activeFileId;

    if (filesChanged || activeFileChanged) {
      this.isSyncing = true;

      // Update files with remote changes
      this.setFiles(files);

      // Update active file ID
      if (activeFileId !== null) {
        this.setActiveFileId(activeFileId);
      }

      // Reset sync flag after a short delay to allow state to update
      setTimeout(() => {
        this.isSyncing = false;
      }, 100);
    }
  }

  // Method to broadcast file state changes to remote clients
  public broadcastFileState(): {
    files: FileItem[];
    activeFileId: string | null;
  } {
    const files = this.getFilesInternal();
    const activeFileId = this.getActiveFileId();

    // This will be called by the CodeEditor component to update the shared Yjs document
    // The actual broadcasting will be handled in the CodeEditor component
    return {
      files,
      activeFileId,
    };
  }
}

export const fileService = new FileService();

import { useSetAtom, useAtomValue } from "jotai";

export function useFileService() {
  const setFileState = useSetAtom(fileStateAtom);
  const getFileState = useAtomValue(fileStateAtom);
  const setFiles = useSetAtom(filesAtom);
  const getFiles = useAtomValue(filesAtom);
  const setActiveFileId = useSetAtom(activeFileIdAtom);
  const getActiveFileId = useAtomValue(activeFileIdAtom);

  fileService.initializeWithAtoms(
    setFileState,
    () => getFileState,
    setFiles,
    () => getFiles,
    setActiveFileId,
    () => getActiveFileId
  );

  return fileService;
}
