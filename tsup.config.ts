import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';
import Replace from 'unplugin-replace/esbuild';

const { version } = createRequire(import.meta.url)('./package.json') as { version: string };

export default defineConfig({
	clean: true,
	dts: false,
	entry: ['src/backend/**'],
	format: 'esm',
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'es2022',
	tsconfig: 'src/backend/tsconfig.json',
	outDir: 'dist/backend',
	bundle: false,
	esbuildPlugins: [
		Replace({
			preventAssignment: true,
			values: [{ find: /\[VI\]{{inject}}\[\/VI\]/g, replacement: version }]
		})
	]
});
