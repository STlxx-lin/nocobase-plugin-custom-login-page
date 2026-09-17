import path from 'path';
import { defineConfig } from '@nocobase/build';

export default defineConfig({
  modifyTsupConfig(config) {
    const next = { ...config };
    if (Array.isArray(next.entry)) {
      if (process.platform === 'win32') {
        next.entry = next.entry.map((item) =>
          path.isAbsolute(item) ? path.relative(process.cwd(), item).replace(/\\/g, '/') : item,
        );
      }
    }
    return next;
  },
});
