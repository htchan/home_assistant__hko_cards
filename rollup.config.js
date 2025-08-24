import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'hko-cards.js',
    format: 'es',
    name: 'HkoCards'
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    terser()
  ]
};