import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 미리보기를 정적 페이지로 올릴 때 어느 주소 아래에서도 열리게 상대 경로로 쓴다
  plugins: [react()],
})
