import { AppConfig } from '../types';

export interface PresetCategory {
  id: string;
  name: string;
  description: string;
  config: Partial<AppConfig>;
  badge: string;
}

export const PRESET_TEMPLATES: PresetCategory[] = [
  {
    id: 'e-commerce',
    name: 'E-Commerce / Store',
    description: 'Optimized for online shopping stores like Shopee, Tokopedia, Shopify.',
    badge: 'Shopping',
    config: {
      url: 'https://shopee.co.id',
      appName: 'ShopMax Flutter',
      packageName: 'com.jooexe.shopmax',
      themeColor: '#EE4D2D',
      accentColor: '#FF6B00',
      backgroundColor: '#FAFAFA',
      iconEmoji: 'Shop',
      splashTitle: 'ShopMax Mobile',
      splashTagline: 'Belanja Mudah & Cepat Multi-Platform',
      navMode: 'fullscreen',
      enablePullToRefresh: true,
      enableOfflineFallback: true,
      permissions: {
        camera: true,
        location: true,
        notifications: true,
        storage: true,
        microphone: false,
      },
    },
  },
  {
    id: 'media-stream',
    name: 'Video & Media Streaming',
    description: 'Designed for YouTube, TikTok, Netflix, or video streaming portals.',
    badge: 'Media',
    config: {
      url: 'https://www.youtube.com',
      appName: 'TubeStream App',
      packageName: 'com.jooexe.tubestream',
      themeColor: '#FF0000',
      accentColor: '#CC0000',
      backgroundColor: '#0F0F0F',
      iconEmoji: 'Stream',
      splashTitle: 'TubeStream',
      splashTagline: 'Nonton Stream Tanpa Batas',
      navMode: 'fullscreen',
      enablePullToRefresh: true,
      enableOfflineFallback: true,
      permissions: {
        camera: false,
        location: false,
        notifications: true,
        storage: true,
        microphone: true,
      },
    },
  },
  {
    id: 'news-portal',
    name: 'News & Blog Portal',
    description: 'Ideal for Wikipedia, Detik, Kompas, Medium, or news publishing sites.',
    badge: 'News',
    config: {
      url: 'https://id.wikipedia.org',
      appName: 'WikiReader Mobile',
      packageName: 'com.jooexe.wikireader',
      themeColor: '#3366CC',
      accentColor: '#0055BB',
      backgroundColor: '#FFFFFF',
      iconEmoji: 'Wiki',
      splashTitle: 'WikiReader Flutter',
      splashTagline: 'Pengetahuan Dalam Genggaman',
      navMode: 'header',
      enablePullToRefresh: true,
      enableOfflineFallback: true,
      permissions: {
        camera: false,
        location: false,
        notifications: true,
        storage: true,
        microphone: false,
      },
    },
  },
  {
    id: 'developer-hub',
    name: 'Dev Tools & GitHub Hub',
    description: 'Tailored for GitHub, StackOverflow, Figma, or SaaS dashboards.',
    badge: 'Developer',
    config: {
      url: 'https://github.com',
      appName: 'GitFlutter Mobile',
      packageName: 'com.jooexe.gitflutter',
      themeColor: '#24292F',
      accentColor: '#2DA44E',
      backgroundColor: '#0D1117',
      iconEmoji: 'Git',
      splashTitle: 'GitFlutter',
      splashTagline: 'Code & Manage Repos Anywhere',
      navMode: 'fullscreen',
      enablePullToRefresh: true,
      enableOfflineFallback: true,
      permissions: {
        camera: false,
        location: false,
        notifications: true,
        storage: true,
        microphone: false,
      },
    },
  },
];
