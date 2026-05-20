// Temporary compatibility shims for tsdown peer type imports.
// tsdown currently references these peer packages in its published .d.ts files
// even when the corresponding features are not used by this template.
//
// Re-check on every tsdown upgrade:
// - If tsdown stops importing these peer types unconditionally, delete this file.
// - If this template starts using one of these features, prefer installing the
//   real peer package instead of extending this shim.

declare module 'unplugin-unused' {
  export interface Options {
    [key: string]: unknown
  }
}

declare module '@vitejs/devtools/cli-commands' {
  export interface StartOptions {
    [key: string]: unknown
  }
}

declare module '@tsdown/exe' {
  export interface ExeExtensionOptions {
    [key: string]: unknown
  }
}

declare module '@tsdown/css' {
  export interface CssOptions {
    [key: string]: unknown
  }
}
