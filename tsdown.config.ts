/// <reference path="./types/tsdown-compat.d.ts" />

import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

const config: UserConfig[] = [
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    minify: false,
    outDir: 'dist',
    outExtensions: ({ format }) => ({
      js: format === 'cjs' ? '.cjs' : '.js',
    }),
  },
  {
    entry: ['src/cli/run.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    minify: false,
    outDir: 'dist/cli',
    banner: {
      js: '#!/usr/bin/env node',
    },
    deps: {
      neverBundle: ['chalk', 'commander'],
    },
  },
]

export default defineConfig(config)
