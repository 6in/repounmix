// Minimal internal helper types for File System Access interactions
// These mirror only the methods used by the adapter and are safe fallbacks.

export interface MinimalFileHandle {
  getFile?: () => Promise<File>;
  createWritable?: (options?: { keepExistingData?: boolean }) => Promise<{ write: (data: string | ArrayBuffer | ArrayBufferView | Blob) => Promise<void>; close: () => Promise<void> }>;
}

export type MinimalDirEntry = { kind: 'file' | 'directory'; name: string };

export interface MinimalDirectoryHandle {
  getDirectoryHandle?: (name: string, options?: { create?: boolean }) => Promise<MinimalDirectoryHandle>;
  getFileHandle?: (name: string, options?: { create?: boolean }) => Promise<MinimalFileHandle>;
  removeEntry?: (name: string, options?: { recursive?: boolean }) => Promise<void>;
  values?: () => AsyncIterableIterator<MinimalDirEntry>;
  queryPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
  requestPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
}

export function emptyDirIterator(): AsyncIterableIterator<MinimalDirEntry> {
  async function* gen() {
    // yields nothing
  }
  return gen();
}
