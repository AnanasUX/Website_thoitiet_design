import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.anx.thoitiet',
  appName: 'AnX Thời Tiết',
  webDir: 'dist-app',
  server: {
    androidScheme: 'https'
  }
};

export default config;
