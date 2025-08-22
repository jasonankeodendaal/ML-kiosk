import type { Brand, Product, Catalogue, Pamphlet, Settings, ScreensaverAd, AdminUser, TvContent, Category, FontStyleSettings, ThemeColors } from '../types';

export const adminUsers: AdminUser[] = [
  {
    id: "au_1723",
    firstName: "Main",
    lastName: "Admin",
    tel: "000 000 0000",
    pin: "1723",
    isMainAdmin: true,
    permissions: {
      canManageBrandsAndProducts: true,
      canManageCatalogues: true,
      canManagePamphlets: true,
      canManageScreensaver: true,
      canManageSettings: true,
      canManageSystem: true,
      canManageTvContent: true,
      canViewAnalytics: true,
    }
  },
  {
    id: "au_1234",
    firstName: "Jane",
    lastName: "Doe",
    tel: "082 123 4567",
    pin: "1234",
    isMainAdmin: false,
    permissions: {
      canManageBrandsAndProducts: true,
      canManageCatalogues: true,
      canManagePamphlets: false,
      canManageScreensaver: false,
      canManageSettings: false,
      canManageSystem: false,
      canManageTvContent: false,
      canViewAnalytics: false,
    }
  }
];

export const brands: Brand[] = [
    { "id": "b-generic", "name": "Generic Brand", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23e2e8f0'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='24' font-weight='800' fill='%23475569'%3eGENERIC BRAND%3c/text%3e%3c/svg%3e" },
    { "id": "b-alpha", "name": "AlphaBrand", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23e2e8f0'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='24' font-weight='800' fill='%23475569'%3eALPHABRAND%3c/text%3e%3c/svg%3e" },
    { "id": "b-bravo", "name": "Bravo Inc.", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23e2e8f0'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='24' font-weight='800' fill='%23475569'%3eBRAVO INC.%3c/text%3e%3c/svg%3e" },
    { "id": "b-charlie-tv", "name": "Charlie Displays", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23e2e8f0'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='24' font-weight='800' fill='%23475569'%3eCHARLIE DISPLAYS%3c/text%3e%3c/svg%3e", isTvBrand: true },
    { "id": "b-delta-tv", "name": "Delta Screens", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23e2e8f0'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='24' font-weight='800' fill='%23475569'%3eDELTA SCREENS%3c/text%3e%3c/svg%3e", isTvBrand: true }
];

export const categories: Category[] = [
    { id: "cat-generic-1", name: "Featured Products", brandId: "b-generic" },
    { id: "cat-generic-2", name: "Accessories", brandId: "b-generic" },
    { id: "cat-generic-3", name: "Core Products", brandId: "b-generic" },
    { id: "cat-alpha-1", name: "Premium Range", brandId: "b-alpha" },
    { id: "cat-alpha-2", name: "Essentials", brandId: "b-alpha" },
    { id: "cat-bravo-1", name: "Collection A", brandId: "b-bravo" },
    { id: "cat-bravo-2", name: "Collection B", brandId: "b-bravo" }
];

export const products: Product[] = [
    {
        "id": "p-generic-item",
        "name": "Sample Product",
        "sku": "SKU-001",
        "brandId": "b-generic",
        "categoryId": "cat-generic-1",
        "description": "This is a sample product description. You can edit this or add new products in the admin panel. Use the bulk import feature to add multiple products at once from a CSV or ZIP file.",
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop"
        ],
        "specifications": [
            { "id": "s1", "key": "Feature A", "value": "Value A" },
            { "id": "s2", "key": "Feature B", "value": "Value B" }
        ],
        "documents": [],
        "whatsInTheBox": ["Sample Item", "User Manual"],
        "termsAndConditions": "This is a sample terms and conditions section."
    },
    {
        "id": "p-alpha-premium",
        "name": "Premium Product X",
        "sku": "ALPHA-PREM-X",
        "brandId": "b-alpha",
        "categoryId": "cat-alpha-1",
        "description": "Engineered for excellence, the Premium Product X delivers unparalleled performance and sophisticated design. It's built for those who demand the best, combining advanced technology with premium materials.",
        "images": [
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1550598839-8769cf0d1829?q=80&w=800&auto=format&fit=crop"
        ],
        "video": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        "specifications": [
            { "id": "s3", "key": "Material", "value": "Premium Alloy" },
            { "id": "s4", "key": "Dimensions", "value": "15cm x 10cm x 5cm" },
            { "id": "s5", "key": "Weight", "value": "2.5kg" },
            { "id": "s6", "key": "Finish", "value": "Matte" }
        ],
        "documents": [
            { "id": "doc1", "title": "Quick Start Guide", "type": "pdf", "url": "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUiBdCi9Db3VudCAxPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSAxMCAwIFIKPj4KL1Byb2NTZXQgWy9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUldPj4KL01lZGlhQm94IFswIDAgNTk1LjI4IDg0MS44OV0KL0NvbnRlbnRzIDUgMCBSCi9Hcm91cCA8PAovVHlwZSAvR3JvdXAKL1MgL1RyYW5zcGFyZW5jeQovQ1MgL0RldmljZVJHQgo+PgovVGFicyAvUwo+PgplbmRvYmoKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDEwMj4+CnN0cmVhbQp4nE2NQQrCMBBF95JX6d0tUqgH8QM4eQk2i52EqLy3sYVfFwzD+7y8/84gQpEw8SAtB2p4lR5IuPM5h4CsFF5GIm7u0A0x2fB9aC6fLzL48/c5wztc2/x6buPU+GUm/xY3sxkPsvV22PDzY4wMm2K4/x/IeSDynx2JpJfL7A8UCQplZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMTAwCi9IZWlnaHQgMTAwCi9Db2xvclNwYWNlIC9EZXZpY2VSR0IKL0JpdHNQZXJDb21wb25lbnQgOAovRmlsdGVyIC9GbGF0ZURlY29kZQovRGVjb2RlUGFybXMgPDwKL1ByZWRpY3RvciAxNQovQ29sdW1ucyAxMDAKPj4KL0xlbmd0aCAzNTg+PgpzdHJlYW0KeJzt2EEKg0AQBdAd/v/N4CAhECyB5jT3ZmAy3JEOvTz111f3wDEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALy+Pt56AJ8L9xwbg8d+eG4GYgB+BX8z0Hk+4J7P+gE+d+A73y8AAD7n8p4uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg7wc+50aAAQCF5/6dCmVuZHN0cmVhbQplbmRvYmoKNyAwIG9iago8PAovUHJvZHVjZXIgKGpzUERGIDEuMy4yKQovQ3JlYXRpb25EYXRlIChEOjIwMjQwMTIzMTY0MDM3WikKPj4KZW5kb2JqCjggMCBvYmoKPDwKL1R5cGUgL0ZvbnREZXNjcmlwdG9yCi9Gb250TmFtZSAvSGVsdmV0aWNhCi9GbGFncyAzMgovaXRBbmdsZSAwCi9Bc2NlbnQgOTEwCi9EZXNjZW50IC0yMTAKCi9DYXBIZWlnaHQgOTEwCi9BdmdXaWR0aCA0NDAKL01heFdpZHRoIDI2NjAKL0ZvbnRXZWlnaHQgNDAwCi9YSGVpZ2h0IDI1MAovU3RlbVYgNDQKL0ZvbnRCQm94IFstNTU4IC0zMDcgMjAwMCAxMDAwXQo+PgplbmRvYmoKOSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHJ1ZVR5cGUKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKL0ZvbnREZXNjcmlwdG9yIDggMCBSCi9GaXJzdENoYXIgMAovTGFzdENoYXIgMjU1Ci9XaWR0aHMgWzgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOCAwIDgwOF0KL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagoMTAgMCBvYmoKPDwKL0YxIDkgMCBSCj4+CmVuZG9iagp4cmVmCjAgMTEKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzAgMDAwMDAgbiAKMDAwMDAwMDEwNCAwMDAwMCBuIAowMDAwMDAwMTU1IDAwMDAwIG4gCjAwMDAwMDAzOTMgMDAwMDAgbiAKMDAwMDAwMDQ5NSAwMDAwMCBuIAowMDAwMDAwOTE1IDAwMDAwIG4gCjAwMDAwMDEyOTIgMDAwMDAgbiAKMDAwMDAwMjU2OCAwMDAwMCBuIAowMDAwMDAyNjQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgMTEKL1Jvb3QgMSAwIFIKL0luZm8gNyAwIFIKL0lEIFs8YTQ3Zjk5OGQ5NWEzYTEzMjY5YzEzZDY0ZWM3ZmE4MjE+PGE0N2Y5OThkOTVhM2ExMzI2OWMxM2Q2NGVjN2ZhODIxPl0KPj4Kc3RhcnR4cmVmCjI2NzYKJSVFT0YK" },
            { "id": "doc2", "title": "Spec Sheet", "type": "image", "imageUrls": ["https://images.unsplash.com/photo-1542435503-956c46dd776b?q=80&w=800&auto=format&fit=crop"] }
        ]
    }
];

export const catalogues: Catalogue[] = [];
export const pamphlets: Pamphlet[] = [];
export const screensaverAds: ScreensaverAd[] = [
    {
        "id": "ad-1",
        "title": "Experience Premium Product X",
        "media": [
            { "url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1920&auto=format&fit=crop", "type": "image" }
        ],
        "startDate": "2024-01-01",
        "endDate": "2025-12-31",
        "link": { "type": "product", "id": "p-alpha-premium" }
    },
    {
        "id": "ad-2",
        "title": "Discover AlphaBrand",
        "media": [
            { "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", "type": "video" }
        ],
        "startDate": "2024-01-01",
        "endDate": "2025-12-31",
        "link": { "type": "brand", "id": "b-alpha" }
    }
];
export const tvContent: TvContent[] = [
    {
        "id": "tv-charlie-1",
        "brandId": "b-charlie-tv",
        "modelName": "Vision Pro 55\"",
        "media": [
            { "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "type": "video" }
        ]
    },
    {
        "id": "tv-delta-1",
        "brandId": "b-delta-tv",
        "modelName": "UltraView 75",
        "media": [
            { "url": "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=1920&auto=format&fit=crop", "type": "image" }
        ]
    }
];

const defaultLight: ThemeColors = {
  appBg: "#f3f4f6",
  appBgImage: "none",
  mainBg: "#ffffff",
  mainText: "#1f2937",
  mainShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
  primary: "#4f46e5",
  primaryButton: {
    background: "#4f46e5",
    text: "#ffffff",
    hoverBackground: "#4338ca",
  },
  destructiveButton: {
    background: "#dc2626",
    text: "#ffffff",
    hoverBackground: "#b91c1c"
  }
};

const defaultDark: ThemeColors = {
  appBg: "#111827",
  appBgImage: "radial-gradient(at 15% 20%, hsla(220, 80%, 30%, 0.25) 0px, transparent 50%), radial-gradient(at 85% 80%, hsla(280, 70%, 45%, 0.2) 0px, transparent 50%)",
  mainBg: "#1f2937",
  mainText: "#e5e7eb",
  mainShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.03)",
  primary: "#818cf8",
  primaryButton: {
    background: "#4f46e5",
    text: "#ffffff",
    hoverBackground: "#6366f1",
  },
  destructiveButton: {
    background: "#be123c",
    text: "#ffffff",
    hoverBackground: "#9f1239"
  }
};

const defaultBodyFont: FontStyleSettings = { fontFamily: "Inter", fontWeight: "400", fontStyle: "normal", textDecoration: "none" };
const defaultHeadingsFont: FontStyleSettings = { fontFamily: "Montserrat", fontWeight: "800", fontStyle: "normal", textDecoration: "none" };
const defaultItemTitlesFont: FontStyleSettings = { fontFamily: "Poppins", fontWeight: "600", fontStyle: "normal", textDecoration: "none" };

export const settings: Settings = {
    logoUrl: 'data:image/svg+xml,%3csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3e%3ccircle cx="50" cy="50" r="48" fill="%23FFFFFF" stroke="%23E5E7EB" stroke-width="4" /%3e%3ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="16" font-weight="800" fill="%23475569"%3eLogo%3c/text%3e%3c/svg%3e',
    customApiUrl: "",
    customApiKey: "",
    lightTheme: defaultLight,
    darkTheme: defaultDark,
    screensaverDelay: 15,
    videoVolume: 0.75,
    backgroundMusicUrl: "",
    backgroundMusicVolume: 0.5,
    screensaverImageDuration: 8,
    screensaverTransitionEffect: 'gentle-drift',
    screensaverTouchPromptText: "Touch to Explore",
    typography: {
        body: defaultBodyFont,
        headings: defaultHeadingsFont,
        itemTitles: defaultItemTitlesFont
    },
    header: {
        backgroundColor: "transparent",
        textColor: "#e5e7eb",
        backgroundImageUrl: "",
        backgroundImageOpacity: 0.5,
        effect: "glassmorphism",
        typography: defaultHeadingsFont
    },
    footer: {
        backgroundColor: "#1f2937",
        textColor: "#e5e7eb",
        backgroundImageUrl: "",
        backgroundImageOpacity: 0.5,
        effect: "none",
        typography: defaultBodyFont
    },
    pamphletPlaceholder: {
        text: "No Active Promotions",
        font: { fontFamily: 'Playfair Display', fontWeight: '900', fontStyle: 'italic', textDecoration: 'none' },
        color1: "#a78bfa",
        color2: "#f472b6"
    },
    cardStyle: {
        cornerRadius: 'rounded-2xl',
        shadow: 'shadow-xl'
    },
    layout: {
        width: 'standard'
    },
    pageTransitions: {
        effect: 'fade'
    },
    kiosk: {
        idleRedirectTimeout: 90
    },
    navigation: {
        links: [
            { id: 'nav-home', label: 'Home', path: '/', enabled: true },
            { id: 'nav-tvs', label: 'TVs', path: '/tvs', enabled: true },
            { id: 'nav-catalogues', label: 'Catalogues', path: '/catalogues', enabled: true },
        ]
    }
};