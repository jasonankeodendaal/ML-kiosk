// This file is for custom type definitions.
// It's used to inform TypeScript about custom elements like <swiper-container> and <swiper-slide>.
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        navigation?: string;
        pagination?: string;
        loop?: string;
        'slides-per-view'?: string;
        'space-between'?: string;
        init?: string;
        zoom?: string;
        effect?: string;
        'grab-cursor'?: string;
      }, HTMLElement>;
      'swiper-slide': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

declare global {
  // Fired when the browser detects that the app can be installed.
  // We can listen for this, prevent the default browser prompt,
  // and trigger it later with our own UI.
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed',
      platform: string,
    }>;
    prompt(): Promise<void>;
  }

  // Add beforeinstallprompt to the official WindowEventMap
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }

  // Add types for File System Access API to fix window.showDirectoryPicker error
  interface DirectoryPickerOptions {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | FileSystemHandle;
  }

  interface Window {
    showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
    jspdf: any;
    marked: {
      parse(markdownString: string, options?: any): string;
    };
    DOMPurify: {
      sanitize(source: string | Node, config?: any): string;
    };
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }

  // Add missing types for File System Access API permissions
  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
  }

  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
      readonly kind: 'directory';
      getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
      getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
      removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
      resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
      [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>;
      entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
      keys(): AsyncIterableIterator<string>;
      values(): AsyncIterableIterator<FileSystemHandle>;
  }

  interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
  }

  interface FileSystemGetDirectoryOptions {
    create?: boolean;
  }
  interface FileSystemGetFileOptions {
    create?: boolean;
  }
  interface FileSystemRemoveOptions {
    recursive?: boolean;
  }
}