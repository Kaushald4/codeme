import { atom } from "jotai";
import { FileState } from "@/types/file";

export const fileStateAtom = atom<FileState>({
  files: [],
  activeFileId: null,
});

export const filesAtom = atom(
  (get) => get(fileStateAtom).files,
  (get, set, newFiles: FileState["files"]) => {
    set(fileStateAtom, (prev) => ({
      ...prev,
      files: newFiles,
    }));
  }
);

export const activeFileIdAtom = atom(
  (get) => get(fileStateAtom).activeFileId,
  (get, set, newActiveFileId: string | null) => {
    set(fileStateAtom, (prev) => ({
      ...prev,
      activeFileId: newActiveFileId,
    }));
  }
);

export const activeFileAtom = atom((get) => {
  const { files, activeFileId } = get(fileStateAtom);
  return files.find((file) => file.id === activeFileId) || null;
});

export const fileCountAtom = atom((get) => get(fileStateAtom).files.length);

export const canAddFileAtom = atom((get) => get(fileCountAtom) < 20);

export const canDeleteFileAtom = atom((get) => get(fileCountAtom) > 1);
