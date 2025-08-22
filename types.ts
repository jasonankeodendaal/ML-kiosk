
export type ProductDocument =
  | { id: string; title: string; type: 'image'; imageUrls: string[]; }
  | { id: string; title: string; type: 'pdf'; url: string; };


export type Pamphlet = {
  id: string;
  title: string;
  imageUrl: string; // The cover image
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isDeleted?: boolean;
} & { type: 'image'; imageUrls: string[]; };

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  isTvBrand?: boolean;
  isDeleted?: boolean;
}


export type Catalogue = {
  id:string;
  title: string;
  thumbnailUrl: string;
  brandId?: string;
  year: number;
  isDeleted?: boolean;
} & { type: 'image'; imageUrls: string[]; };

export interface Category {
  id: string;
  name: string;
  brandId: string;
  isDeleted?: boolean;
}

export interface Product {
  id:string;
  name: string;
  sku: string;
  description: string;
  images: string[];
  specifications: { id: string; key: string; value: string; }[];
  documents?: ProductDocument[];
  video?: string;
  websiteUrl?: string;
  brandId: string;
  categoryId?: string;
  isDiscontinued?: boolean;
  isDeleted?: boolean;
  whatsInTheBox?: string[];
  termsAndConditions?: string;
}

export interface FontStyleSettings {
  fontFamily: string;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
}

export interface CustomElementSettings {
  backgroundColor: string;
  textColor: string;
  backgroundImageUrl: string;
  backgroundImageOpacity: number; // 0 to 1
  effect: 'none' | 'glassmorphism' | '3d-shadow';
  typography: FontStyleSettings;
}

export interface ThemeColors {
  appBg: string;
  appBgImage: string;
  mainBg: string;
  mainText: string;
  mainShadow: string;
  primary: string;
  primaryButton: {
    background: string;
    text: string;
    hoverBackground: string;
  };
  destructiveButton: {
    background: string;
    text: string;
    hoverBackground: string;
  };
}

export interface NavLink {
  id: string;
  label: string;
  path: string;
  enabled: boolean;
}

export interface Settings {
  logoUrl: string;
  customApiUrl: string;
  customApiKey: string;
  lightTheme: ThemeColors;
  darkTheme: ThemeColors;
  screensaverDelay: number; // in seconds
  videoVolume: number; // 0 to 1
  backgroundMusicUrl: string;
  backgroundMusicVolume: number; // 0 to 1
  screensaverImageDuration: number; // in seconds
  screensaverTransitionEffect: 'fade' | 'slide' | 'scale' | 'slide-fade' | 'gentle-drift' | 'reveal-blur';
  screensaverTouchPromptText: string;
  typography: {
    body: FontStyleSettings;
    headings: FontStyleSettings;
    itemTitles: FontStyleSettings;
  };
  header: CustomElementSettings;
  footer: CustomElementSettings;
  pamphletPlaceholder: {
    text: string;
    font: FontStyleSettings;
    color1: string;
    color2: string;
  };
  cardStyle: {
    cornerRadius: string; // e.g., 'rounded-lg', 'rounded-2xl'
    shadow: string; // e.g., 'shadow-xl'
  };
  layout: {
    width: 'standard' | 'wide';
  };
  pageTransitions: {
    effect: 'none' | 'fade' | 'slide';
  };
  kiosk: {
    idleRedirectTimeout: number; // in seconds, 0 to disable
  };
  navigation: {
    links: NavLink[];
  };
  lastUpdated?: number; // Timestamp for sync checking
}

export type StorageProvider = 'local' | 'customApi' | 'none';

export type AdLink =
  | { type: 'brand'; id: string; }
  | { type: 'product'; id: string; }
  | { type: 'catalogue'; id: string; }
  | { type: 'pamphlet'; id: string; }
  | { type: 'external'; url: string; };

export interface ScreensaverAd {
  id: string;
  title: string;
  media: Array<{ url: string; type: 'image' | 'video' }>;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  link?: AdLink;
}

export interface AdminUserPermissions {
  canManageBrandsAndProducts: boolean;
  canManageCatalogues: boolean;
  canManagePamphlets: boolean;
  canManageScreensaver: boolean;
  canManageSettings: boolean;
  canManageSystem: boolean; // Covers Storage, Backup/Restore, Trash
  canManageTvContent: boolean;
  canViewAnalytics: boolean;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  tel: string;
  pin: string;
  isMainAdmin: boolean;
  permissions: AdminUserPermissions;
}

export interface TvContent {
  id: string;
  brandId: string;
  modelName: string;
  media: Array<{ url: string; type: 'image' | 'video' }>;
  isDeleted?: boolean;
}

export interface BackupData {
  brands: Brand[];
  products: Product[];
  catalogues: Catalogue[];
  pamphlets: Pamphlet[];
  settings: Settings;
  screensaverAds: ScreensaverAd[];
  adminUsers: AdminUser[];
  tvContent: TvContent[];
  categories?: Category[];
  viewCounts?: {
    brands: Record<string, number>;
    products: Record<string, number>;
  };
}