import { defineConfig } from 'vite';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';

function compressAssetsPlugin() {
  return {
    name: 'vite-plugin-precompress-gzip-brotli',
    apply: 'build',
    closeBundle() {
      const distDir = 'dist';
      const compressibleExts = new Set(['.html', '.js', '.css', '.svg', '.json', '.webmanifest', '.ico', '.txt']);

      function collectFiles(dir) {
        const files = [];
        for (const entry of readdirSync(dir)) {
          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            files.push(...collectFiles(fullPath));
          } else if (compressibleExts.has(extname(fullPath))) {
            files.push(fullPath);
          }
        }
        return files;
      }

      const files = collectFiles(distDir);
      console.log('\n📦 [GZIP & BROTLI] Đang nén tài nguyên bản build production:');
      console.log('--------------------------------------------------------------------------------');

      let totalOrig = 0;
      let totalGzip = 0;
      let totalBrotli = 0;

      for (const file of files) {
        const content = readFileSync(file);
        const origSize = content.length;
        totalOrig += origSize;

        // 1. Nén Gzip (Level 9 - Tối Đa)
        const gzipped = gzipSync(content, { level: 9 });
        writeFileSync(`${file}.gz`, gzipped);
        const gzipSize = gzipped.length;
        totalGzip += gzipSize;

        // 2. Nén Brotli (Level 11 - Tối Đa)
        const brotlied = brotliCompressSync(content, {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: 11,
          },
        });
        writeFileSync(`${file}.br`, brotlied);
        const brotliSize = brotlied.length;
        totalBrotli += brotliSize;

        const rel = file.replace(/^dist\//, '');
        const gzSavings = ((1 - gzipSize / origSize) * 100).toFixed(1);
        const brSavings = ((1 - brotliSize / origSize) * 100).toFixed(1);

        console.log(
          `  ${rel.padEnd(34)} ${(origSize / 1024).toFixed(1).padStart(6)} kB → gzip: ${(gzipSize / 1024).toFixed(1).padStart(5)} kB (-${gzSavings}%) | br: ${(brotliSize / 1024).toFixed(1).padStart(5)} kB (-${brSavings}%)`
        );
      }

      console.log('--------------------------------------------------------------------------------');
      const totalGzSaved = ((1 - totalGzip / totalOrig) * 100).toFixed(1);
      const totalBrSaved = ((1 - totalBrotli / totalOrig) * 100).toFixed(1);
      console.log(
        `  TỔNG CỘNG: ${(totalOrig / 1024).toFixed(1)} kB → Gzip: ${(totalGzip / 1024).toFixed(1)} kB (-${totalGzSaved}%) | Brotli: ${(totalBrotli / 1024).toFixed(1)} kB (-${totalBrSaved}%)\n`
      );
    },
  };
}

export default defineConfig({
  plugins: [compressAssetsPlugin()],
  build: {
    target: 'es2022',
    cssMinify: true,
    minify: 'esbuild',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
  },
});
