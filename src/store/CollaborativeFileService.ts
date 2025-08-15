import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import {
  FileItem,
  FileCreateOptions,
  FileUpdateOptions,
  IFileService,
  ICollaborativeFileService,
} from "@/types/file";
import { fileService } from "./FileService";

export class CollaborativeFileService implements ICollaborativeFileService {
  private yDoc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private yFiles: Y.Map<Y.Map<string | boolean | number>> | null = null;
  private yActiveFileId: Y.Text | null = null;
  private yFileContents: Y.Map<Y.Text> | null = null;
  private fileUpdateCallbacks: ((file: FileItem) => void)[] = [];
  private fileListUpdateCallbacks: ((files: FileItem[]) => void)[] = [];
  private isInitialized = false;
  private localClientId: string = "";

  constructor() {
    this.localClientId = `client_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  initializeCollaboration(roomId: string): void {
    if (this.isInitialized) return;

    this.yDoc = new Y.Doc();

    this.provider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_SERVER_URL as string,
      roomId,
      this.yDoc
    );

    this.yFiles = this.yDoc.getMap("files");
    this.yActiveFileId = this.yDoc.getText("activeFileId");
    this.yFileContents = this.yDoc.getMap("fileContents");

    this.setupObservers();

    if (this.yFiles.size === 0) {
      this.initializeDefaultFile();
    }

    this.isInitialized = true;
  }

  destroyCollaboration(): void {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
    if (this.yDoc) {
      this.yDoc.destroy();
      this.yDoc = null;
    }
    this.yFiles = null;
    this.yActiveFileId = null;
    this.yFileContents = null;
    this.isInitialized = false;
  }

  private setupObservers(): void {
    if (!this.yFiles || !this.yActiveFileId) return;

    this.yFiles.observe((event) => {
      this.handleFileListChange();
    });

    this.yActiveFileId.observe((event) => {
      this.handleActiveFileChange();
    });

    if (this.yFileContents) {
      this.yFileContents.observe((event) => {
        this.handleFileContentChange(event);
      });
    }
  }

  private initializeDefaultFile(): void {
    if (!this.yFiles || !this.yActiveFileId || !this.yFileContents) return;

    if (this.yFiles.size > 0) return;

    setTimeout(() => {
      if (!this.yFiles || !this.yActiveFileId || !this.yFileContents) return;
      if (this.yFiles.size > 0) return;

      const defaultFile: FileItem = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: "untitled1.js",
        content: "",
        language: "javascript",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fileMap = new Y.Map<string | boolean | number>();
      fileMap.set("id", defaultFile.id);
      fileMap.set("name", defaultFile.name);
      fileMap.set("language", defaultFile.language);
      fileMap.set("isActive", defaultFile.isActive);
      fileMap.set("createdAt", defaultFile.createdAt.toISOString());
      fileMap.set("updatedAt", defaultFile.updatedAt.toISOString());

      this.yFiles.set(defaultFile.id, fileMap);

      this.yActiveFileId.delete(0, this.yActiveFileId.length);
      this.yActiveFileId.insert(0, defaultFile.id);

      const contentText = new Y.Text(defaultFile.content);
      this.yFileContents.set(defaultFile.id, contentText);
    }, 100);
  }

  private handleFileListChange(): void {
    if (!this.yFiles) return;

    const files = this.getFiles();
    this.fileListUpdateCallbacks.forEach((callback) => callback(files));

    fileService.syncRemoteFiles(files, this.getActiveFile()?.id || null);
  }

  private handleActiveFileChange(): void {
    if (!this.yActiveFileId) return;

    const activeFileId = this.yActiveFileId.toString();
    const files = this.getFiles();

    console.log(
      "handleActiveFileChange called with activeFileId:",
      activeFileId
    );
    console.log("Files before update:", files);

    files.forEach((file) => {
      const fileYMap = this.yFiles?.get(file.id);
      if (fileYMap) {
        const shouldBeActive = file.id === activeFileId;
        fileYMap.set("isActive", shouldBeActive);
        console.log(`Setting file ${file.id} isActive to ${shouldBeActive}`);
      }
    });

    this.handleFileListChange();

    const activeFile = files.find((file) => file.id === activeFileId);
    if (activeFile) {
      fileService.switchToFile(activeFileId);
    }
  }

  private handleFileContentChange(event: Y.YMapEvent<Y.Text>): void {
    if (!this.yFileContents) return;

    event.changes.keys.forEach((change, key) => {
      if (change.action === "update" || change.action === "add") {
        const contentText = this.yFileContents?.get(key);
        if (contentText) {
          const content = contentText.toString();
          fileService.updateFileContent(key, content);
        }
      }
    });
  }

  private fileItemToYMap(file: FileItem): Y.Map<string | boolean | number> {
    const fileMap = new Y.Map<string | boolean | number>();
    fileMap.set("id", file.id);
    fileMap.set("name", file.name);
    fileMap.set("language", file.language);
    fileMap.set("isActive", file.isActive);
    fileMap.set("createdAt", file.createdAt.toISOString());
    fileMap.set("updatedAt", file.updatedAt.toISOString());
    return fileMap;
  }

  private yMapToFileItem(
    yMap: Y.Map<string | boolean | number>
  ): FileItem | null {
    try {
      const id = yMap.get("id");
      const name = yMap.get("name");
      const language = yMap.get("language");
      const isActive = yMap.get("isActive");
      const createdAt = yMap.get("createdAt");
      const updatedAt = yMap.get("updatedAt");

      if (
        typeof id !== "string" ||
        typeof name !== "string" ||
        typeof language !== "string" ||
        typeof isActive !== "boolean" ||
        (typeof createdAt !== "string" && typeof createdAt !== "number") ||
        (typeof updatedAt !== "string" && typeof updatedAt !== "number")
      ) {
        return null;
      }

      return {
        id,
        name,
        content: this.getFileContent(id) || "",
        language,
        isActive,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      };
    } catch (error) {
      console.error("Error converting Y.Map to FileItem:", error);
      return null;
    }
  }

  createNewFile(options: FileCreateOptions = {}): FileItem {
    if (!this.yFiles || !this.yActiveFileId || !this.yFileContents) {
      throw new Error("Collaborative service not initialized");
    }

    const currentFiles = this.getFiles();
    const newFile: FileItem = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: options.name || `untitled${currentFiles.length + 1}.js`,
      content: options.content || "",
      language: options.language || "javascript",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fileMap = this.fileItemToYMap(newFile);
    this.yFiles.set(newFile.id, fileMap);

    const contentText = new Y.Text(newFile.content);
    this.yFileContents.set(newFile.id, contentText);

    // The caller (useCollaborativeFileService hook) will handle switching to the new file
    // This ensures only the user who created the file switches to it
    return newFile;
  }

  updateFileContent(id: string, content: string): void {
    if (!this.yFileContents) return;

    const contentText = this.yFileContents.get(id);
    if (contentText) {
      contentText.delete(0, contentText.length);
      contentText.insert(0, content);

      const fileYMap = this.yFiles?.get(id);
      if (fileYMap) {
        fileYMap.set("updatedAt", new Date().toISOString());
      }
    }
  }

  renameFile(id: string, newName: string): void {
    if (!this.yFiles) return;

    const fileYMap = this.yFiles.get(id);
    if (fileYMap) {
      fileYMap.set("name", newName);
      fileYMap.set("updatedAt", new Date().toISOString());

      this.handleFileListChange();
    }
  }

  deleteFile(id: string): void {
    if (!this.yFiles || !this.yActiveFileId || !this.yFileContents) return;

    const currentFiles = this.getFiles();
    const fileToDelete = currentFiles.find((file) => file.id === id);

    if (!fileToDelete) return;

    this.yFiles.delete(id);
    this.yFileContents.delete(id);

    if (fileToDelete.isActive && currentFiles.length > 1) {
      const remainingFiles = currentFiles.filter((file) => file.id !== id);
      const newActiveFile = remainingFiles[0];

      this.yActiveFileId.delete(0, this.yActiveFileId.length);
      this.yActiveFileId.insert(0, newActiveFile.id);

      const newActiveFileYMap = this.yFiles.get(newActiveFile.id);
      if (newActiveFileYMap) {
        newActiveFileYMap.set("isActive", true);
      }
    }
  }

  switchToFile(id: string): void {
    if (!this.yFiles || !this.yActiveFileId) return;

    const currentFiles = this.getFiles();
    console.log("switchToFile called with id:", id);
    console.log("Current files:", currentFiles);

    const targetFile = currentFiles.find((file) => file.id === id);

    if (!targetFile) return;

    currentFiles.forEach((file) => {
      const fileYMap = this.yFiles?.get(file.id);
      if (fileYMap) {
        fileYMap.set("isActive", false);
        console.log(`Deactivated file ${file.id}`);
      }
    });

    const targetFileYMap = this.yFiles.get(id);
    if (targetFileYMap) {
      targetFileYMap.set("isActive", true);
      console.log(`Activated file ${id}`);
    }

    this.yActiveFileId.delete(0, this.yActiveFileId.length);
    this.yActiveFileId.insert(0, id);
    console.log(`Updated activeFileId to: ${id}`);
  }

  getFiles(): FileItem[] {
    if (!this.yFiles) return [];

    const files: FileItem[] = [];
    this.yFiles.forEach((yMap) => {
      const file = this.yMapToFileItem(yMap);
      if (file) {
        files.push(file);
      }
    });

    return files;
  }

  getActiveFile(): FileItem | null {
    if (!this.yFiles || !this.yActiveFileId) return null;

    const activeFileId = this.yActiveFileId.toString();
    const activeFileYMap = this.yFiles.get(activeFileId);

    if (!activeFileYMap) return null;

    return this.yMapToFileItem(activeFileYMap);
  }

  getFileContent(fileId: string): string | null {
    if (!this.yFileContents) return null;

    const contentText = this.yFileContents.get(fileId);
    return contentText ? contentText.toString() : null;
  }

  exportFiles(): string {
    const files = this.getFiles();
    return JSON.stringify(files, null, 2);
  }

  importFiles(filesData: string): boolean {
    try {
      const parsedFiles = JSON.parse(filesData);

      if (!Array.isArray(parsedFiles)) return false;

      if (!this.yFiles || !this.yActiveFileId || !this.yFileContents) {
        return false;
      }

      this.yFiles.clear();
      this.yFileContents.clear();

      const validFiles: FileItem[] = parsedFiles.map((file: FileItem) => ({
        ...file,
        isActive: false,
        createdAt: new Date(file.createdAt || Date.now()),
        updatedAt: new Date(file.updatedAt || Date.now()),
      }));

      if (validFiles.length > 0) {
        validFiles[0].isActive = true;

        validFiles.forEach((file) => {
          const fileMap = this.fileItemToYMap(file);
          this.yFiles?.set(file.id, fileMap);

          const contentText = new Y.Text(file.content);
          this.yFileContents?.set(file.id, contentText);
        });

        this.yActiveFileId.delete(0, this.yActiveFileId.length);
        this.yActiveFileId.insert(0, validFiles[0].id);

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to import files:", error);
      return false;
    }
  }

  onFileUpdate(callback: (file: FileItem) => void): void {
    this.fileUpdateCallbacks.push(callback);
  }

  onFileListUpdate(callback: (files: FileItem[]) => void): void {
    this.fileListUpdateCallbacks.push(callback);
  }

  getFileYText(fileId: string): Y.Text | null {
    if (!this.yFileContents) return null;
    return this.yFileContents.get(fileId) || null;
  }

  getAwareness() {
    return this.provider?.awareness || null;
  }

  getProvider() {
    return this.provider || null;
  }

  isConnected(): boolean {
    return this.provider?.wsconnected || false;
  }

  getLocalClientId(): string {
    return this.localClientId;
  }
}

export const collaborativeFileService = new CollaborativeFileService();
