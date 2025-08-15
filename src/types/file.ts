export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileCreateOptions {
  name?: string;
  content?: string;
  language?: string;
}

export interface FileUpdateOptions {
  name?: string;
  content?: string;
  language?: string;
}

export interface FileState {
  files: FileItem[];
  activeFileId: string | null;
}

export interface IFileRepository {
  createFile(options: FileCreateOptions): FileItem;
  updateFile(id: string, options: FileUpdateOptions): FileItem | null;
  deleteFile(id: string): boolean;
  getFile(id: string): FileItem | null;
  getAllFiles(): FileItem[];
  setActiveFile(id: string): void;
  getActiveFile(): FileItem | null;
}

export interface IFileService {
  createNewFile(options?: FileCreateOptions): FileItem;
  updateFileContent(id: string, content: string): void;
  renameFile(id: string, newName: string): void;
  deleteFile(id: string): void;
  switchToFile(id: string): void;
  getFiles(): FileItem[];
  getActiveFile(): FileItem | null;
  exportFiles(): string;
  importFiles(filesData: string): boolean;
}

export interface ICollaborativeFileService extends IFileService {
  initializeCollaboration(roomId: string): void;
  destroyCollaboration(): void;
  onFileUpdate(callback: (file: FileItem) => void): void;
  onFileListUpdate(callback: (files: FileItem[]) => void): void;
}
