/// <reference path="../../swiper.d.ts" />

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { 
    settings as initialSettings,
    brands as initialBrands,
    products as initialProducts,
    catalogues as initialCatalogues,
    pamphlets as initialPamphlets,
    screensaverAds as initialScreensaverAds,
    adminUsers as initialAdminUsers,
    tvContent as initialTvContent,
    categories as initialCategories,
} from '../../data/mockData.ts';
import type { Settings, Brand, Product, Catalogue, Pamphlet, ScreensaverAd, BackupData, AdminUser, ThemeColors, StorageProvider, ProductDocument, TvContent, Category } from '../../types.ts';
import { idbGet, idbSet } from './idb.ts';


// --- UTILITY FUNCTIONS ---
function deepMerge<T>(target: T, source: Partial<T>): T {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceKey = key as keyof T;
            if (isObject(source[sourceKey])) {
                if (!(sourceKey in target)) {
                    (output as any)[sourceKey] = source[sourceKey];
                } else {
                    (output[sourceKey] as any) = deepMerge(target[sourceKey], source[sourceKey] as any);
                }
            } else {
                (output as any)[sourceKey] = source[sourceKey];
            }
        });
    }
    return output;
}

function isObject(item: any): item is object {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

const loadFont = (fontName: string) => {
    if (!fontName) return;
    const fontId = `google-font-${fontName.replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    }
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const verifyPermission = async (fileHandle: FileSystemDirectoryHandle, readWrite: boolean): Promise<boolean> => {
    const options: FileSystemHandlePermissionDescriptor = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    try {
        if ((await fileHandle.queryPermission(options)) === 'granted') return true;
        if ((await fileHandle.requestPermission(options)) === 'granted') return true;
    } catch (error) {
        console.error("Error verifying file system permissions:", error);
    }
    return false;
};

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

interface BookletModalState {
  isOpen: boolean;
  title: string;
  imageUrls: string[];
}

interface PdfModalState {
  isOpen: boolean;
  url: string;
  title: string;
}

type DocumentType = ProductDocument | Catalogue | Pamphlet;

type ViewCounts = {
    brands: Record<string, number>;
    products: Record<string, number>;
};

interface AppContextType {
  // Data
  brands: Brand[];
  products: Product[];
  catalogues: Catalogue[];
  pamphlets: Pamphlet[];
  settings: Settings;
  screensaverAds: ScreensaverAd[];
  adminUsers: AdminUser[];
  loggedInUser: AdminUser | null;
  tvContent: TvContent[];
  categories: Category[];
  viewCounts: ViewCounts;
  
  // Auth
  login: (userId: string, pin: string) => AdminUser | null;
  logout: () => void;

  // Updaters (CRUD)
  addBrand: (brand: Brand) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void; // Soft delete
  
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void; // Soft delete

  addCatalogue: (catalogue: Catalogue) => void;
  updateCatalogue: (catalogue: Catalogue) => void;
  deleteCatalogue: (catalogueId: string) => void;

  addPamphlet: (pamphlet: Pamphlet) => void;
  updatePamphlet: (pamphlet: Pamphlet) => void;
  deletePamphlet: (pamphletId: string) => void;

  addAd: (ad: ScreensaverAd) => void;
  updateAd: (ad: ScreensaverAd) => void;
  deleteAd: (adId: string) => void;

  addAdminUser: (user: AdminUser) => void;
  updateAdminUser: (user: AdminUser) => void;
  deleteAdminUser: (userId: string) => void;
  
  addTvContent: (content: TvContent) => void;
  updateTvContent: (content: TvContent) => void;
  deleteTvContent: (contentId: string) => void;

  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  updateSettings: (newSettings: Partial<Settings>) => void;
  restoreBackup: (data: Partial<BackupData>) => void;
  
  // Trash functions
  restoreBrand: (brandId: string) => void;
  permanentlyDeleteBrand: (brandId: string) => void;
  restoreProduct: (productId: string) => void;
  permanentlyDeleteProduct: (productId: string) => void;
  restoreCatalogue: (catalogueId: string) => void;
  permanentlyDeleteCatalogue: (catalogueId: string) => void;
  restorePamphlet: (pamphletId: string) => void;
  permanentlyDeletePamphlet: (pamphletId: string) => void;
  restoreTvContent: (contentId: string) => void;
  permanentlyDeleteTvContent: (contentId: string) => void;

  // Screensaver & Kiosk
  isScreensaverActive: boolean;
  isScreensaverEnabled: boolean;
  toggleScreensaver: () => void;
  exitScreensaver: () => void;
  localVolume: number;
  setLocalVolume: (volume: number) => void;
  activeTvContent: TvContent | null;
  playTvContent: (content: TvContent) => void;
  stopTvContent: () => void;

  // Global Modals
  pdfModalState: PdfModalState;
  bookletModalState: BookletModalState;
  openDocument: (document: DocumentType, title: string) => void;
  closePdfModal: () => void;
  closeBookletModal: () => void;
  confirmation: ConfirmationState;
  showConfirmation: (message: string, onConfirm: () => void) => void;
  hideConfirmation: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // PWA Install Prompt
  deferredPrompt: BeforeInstallPromptEvent | null;
  triggerInstallPrompt: () => Promise<void>;

  // Storage and Sync
  storageProvider: StorageProvider;
  connectToLocalProvider: () => Promise<void>;
  connectToCloudProvider: (provider: 'customApi') => void;
  disconnectFromStorage: () => void;
  isStorageConnected: boolean;
  directoryHandle: FileSystemDirectoryHandle | null;
  saveFileToStorage: (file: File) => Promise<string>;
  getFileUrl: (fileName: string) => Promise<string>;
  saveDatabaseToLocal: () => Promise<void>;
  loadDatabaseFromLocal: (silent?: boolean, isConfirmed?: boolean) => Promise<void>;
  pushToCloud: () => Promise<void>;
  pullFromCloud: () => Promise<void>;

  // Analytics
  trackBrandView: (brandId: string) => void;
  trackProductView: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialValue);
  const isInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      try {
        const storedValue = await idbGet<T>(key);
        if (isMounted) {
          if (storedValue !== undefined) {
            // Deep merge for settings object to handle new properties added in updates
            if (key === 'settings' && isObject(initialValue) && isObject(storedValue)) {
               setState(deepMerge(initialValue as any, storedValue as any));
            } else {
               setState(storedValue);
            }
          }
          isInitialized.current = true;
        }
      } catch (error) {
        console.error(`Failed to load state for key "${key}" from IndexedDB.`, error);
        if(isMounted) isInitialized.current = true;
      }
    };
    loadState();
    return () => { isMounted = false };
  }, [key, initialValue]);

  useEffect(() => {
    if (isInitialized.current) {
      idbSet(key, state).catch(error => {
        console.error(`Failed to save state for key "${key}" to IndexedDB.`, error);
      });
    }
  }, [key, state]);

  return [state, setState];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [brands, setBrands] = usePersistentState<Brand[]>('brands', initialBrands);
    const [products, setProducts] = usePersistentState<Product[]>('products', initialProducts);
    const [catalogues, setCatalogues] = usePersistentState<Catalogue[]>('catalogues', initialCatalogues);
    const [pamphlets, setPamphlets] = usePersistentState<Pamphlet[]>('pamphlets', initialPamphlets);
    const [settings, setSettings] = usePersistentState<Settings>('settings', initialSettings);
    const [screensaverAds, setScreensaverAds] = usePersistentState<ScreensaverAd[]>('screensaverAds', initialScreensaverAds);
    const [adminUsers, setAdminUsers] = usePersistentState<AdminUser[]>('adminUsers', initialAdminUsers);
    const [tvContent, setTvContent] = usePersistentState<TvContent[]>('tvContent', initialTvContent);
    const [categories, setCategories] = usePersistentState<Category[]>('categories', initialCategories);
    const [viewCounts, setViewCounts] = usePersistentState<ViewCounts>('viewCounts', { brands: {}, products: {} });

    const [localVolume, setLocalVolume] = usePersistentState<number>('localVolume', 0.75);
    const [storageProvider, setStorageProvider] = usePersistentState<StorageProvider>('storageProvider', 'none');
    const [theme, setTheme] = usePersistentState<'light' | 'dark'>(
        'theme', 
        window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    );
    
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [isScreensaverEnabled, setIsScreensaverEnabled] = useState(true);
  const inactivityTimer = useRef<number | null>(null);

  const [pdfModalState, setPdfModalState] = useState<PdfModalState>({ isOpen: false, url: '', title: '' });
  const [bookletModalState, setBookletModalState] = useState<BookletModalState>({ isOpen: false, title: '', imageUrls: [] });
  const [activeTvContent, setActiveTvContent] = useState<TvContent | null>(null);

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  const blobUrlCache = useRef(new Map<string, string>());
  const fileHandleCache = useRef(new Map<string, FileSystemFileHandle>());


  const updateDataTimestamp = useCallback(() => {
    setSettings(prev => ({ ...prev, lastUpdated: Date.now() }));
  }, [setSettings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
      setSettings(prev => deepMerge(prev, newSettings));
      updateDataTimestamp();
  }, [setSettings, updateDataTimestamp]);

  const restoreBackup = useCallback((data: Partial<BackupData>) => {
    // Note: The `|| initial...` is a fallback for corrupted/incomplete backup files.
    setBrands(Array.isArray(data.brands) ? data.brands : initialBrands);
    setProducts(Array.isArray(data.products) ? data.products : initialProducts);
    setCatalogues(Array.isArray(data.catalogues) ? data.catalogues : initialCatalogues);
    setPamphlets(Array.isArray(data.pamphlets) ? data.pamphlets : initialPamphlets);
    setScreensaverAds(Array.isArray(data.screensaverAds) ? data.screensaverAds : initialScreensaverAds);
    setAdminUsers(Array.isArray(data.adminUsers) ? data.adminUsers : initialAdminUsers);
    setTvContent(Array.isArray(data.tvContent) ? data.tvContent : initialTvContent);
    setCategories(Array.isArray(data.categories) ? data.categories : initialCategories);
    setViewCounts(data.viewCounts || { brands: {}, products: {} });
    
    // Cloud DBs might return settings as an array with one item, file backups as an object.
    // This handles both, preferring a direct object.
    const settingsSource = Array.isArray(data.settings) ? data.settings[0] : data.settings;
    if (settingsSource && isObject(settingsSource)) {
        setSettings(prev => deepMerge(prev, settingsSource as Partial<Settings>));
    } else {
        setSettings(initialSettings);
    }
  }, [setBrands, setProducts, setCatalogues, setPamphlets, setScreensaverAds, setAdminUsers, setSettings, setTvContent, setCategories, setViewCounts]);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, [setTheme]);
  
    useEffect(() => {
        const rootStyle = document.documentElement.style;
        const activeTheme: ThemeColors | undefined = theme === 'light' ? settings.lightTheme : settings.darkTheme;
        if (!activeTheme) return; 

        rootStyle.setProperty('--app-bg', activeTheme.appBg);
        rootStyle.setProperty('--app-bg-image', activeTheme.appBgImage);
        rootStyle.setProperty('--main-bg', activeTheme.mainBg);
        rootStyle.setProperty('--main-text', activeTheme.mainText);
        rootStyle.setProperty('--main-shadow', activeTheme.mainShadow);
        rootStyle.setProperty('--primary-color', activeTheme.primary);
        rootStyle.setProperty('--btn-primary-bg', activeTheme.primaryButton.background);
        rootStyle.setProperty('--btn-primary-text', activeTheme.primaryButton.text);
        rootStyle.setProperty('--btn-primary-hover-bg', activeTheme.primaryButton.hoverBackground);
        rootStyle.setProperty('--btn-destructive-bg', activeTheme.destructiveButton.background);
        rootStyle.setProperty('--btn-destructive-text', activeTheme.destructiveButton.text);
        rootStyle.setProperty('--btn-destructive-hover-bg', activeTheme.destructiveButton.hoverBackground);
        
        const { typography, header, footer, pamphletPlaceholder } = settings;
        if (!typography || !header || !footer || !pamphletPlaceholder) return; 
        
        const { body, headings, itemTitles } = typography;
        rootStyle.setProperty('--body-font-family', body.fontFamily);
        rootStyle.setProperty('--body-font-weight', body.fontWeight);
        rootStyle.setProperty('--body-font-style', body.fontStyle);
        rootStyle.setProperty('--body-font-decoration', body.textDecoration);
        rootStyle.setProperty('--headings-font-family', headings.fontFamily);
        rootStyle.setProperty('--headings-font-weight', headings.fontWeight);
        rootStyle.setProperty('--headings-font-style', headings.fontStyle);
        rootStyle.setProperty('--headings-font-decoration', headings.textDecoration);
        rootStyle.setProperty('--item-titles-font-family', itemTitles.fontFamily);
        rootStyle.setProperty('--item-titles-font-weight', itemTitles.fontWeight);
        rootStyle.setProperty('--item-titles-font-style', itemTitles.fontStyle);
        rootStyle.setProperty('--item-titles-font-decoration', itemTitles.textDecoration);
        
        const fontsToLoad = new Set([
            body.fontFamily, headings.fontFamily, itemTitles.fontFamily,
            header.typography.fontFamily, footer.typography.fontFamily,
            pamphletPlaceholder.font.fontFamily,
        ]);
        fontsToLoad.forEach(font => font && loadFont(font));
    }, [settings, theme]);

  const toggleScreensaver = () => setIsScreensaverEnabled(prev => !prev);
  const exitScreensaver = useCallback(() => setIsScreensaverActive(false), []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (isScreensaverEnabled && settings.screensaverDelay > 0 && !activeTvContent) {
      inactivityTimer.current = window.setTimeout(() => {
        if(document.visibilityState === 'visible') setIsScreensaverActive(true);
      }, settings.screensaverDelay * 1000);
    }
  }, [settings.screensaverDelay, isScreensaverEnabled, activeTvContent]);

  const handleUserActivity = useCallback(() => {
    if (isScreensaverActive) exitScreensaver();
    resetInactivityTimer();
  }, [isScreensaverActive, resetInactivityTimer, exitScreensaver]);
  
  useEffect(() => {
    resetInactivityTimer();
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [handleUserActivity, resetInactivityTimer, isScreensaverEnabled]);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('kiosk-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (adminUsers.find(u => u.id === user.id)) {
            setLoggedInUser(user);
        } else {
            sessionStorage.removeItem('kiosk-user');
        }
      }
    } catch (e) {
      console.error("Failed to parse user from session storage", e);
      sessionStorage.removeItem('kiosk-user');
    }
  }, [adminUsers]);

  const login = useCallback((userId: string, pin: string): AdminUser | null => {
    const user = adminUsers.find(u => u.id === userId && u.pin === pin);
    if (user) {
        setLoggedInUser(user);
        sessionStorage.setItem('kiosk-user', JSON.stringify(user));
        return user;
    }
    return null;
  }, [adminUsers]);

  const logout = useCallback(() => {
      setLoggedInUser(null);
      sessionStorage.removeItem('kiosk-user');
  }, []);
  
  const addBrand = useCallback((b: Brand) => { setBrands(p => [...p, b]); updateDataTimestamp(); }, [setBrands, updateDataTimestamp]);
  const updateBrand = useCallback((b: Brand) => { setBrands(p => p.map(i => i.id === b.id ? b : i)); updateDataTimestamp(); }, [setBrands, updateDataTimestamp]);
  const deleteBrand = useCallback((brandId: string) => { setBrands(prev => prev.map(b => b.id === brandId ? { ...b, isDeleted: true } : b)); updateDataTimestamp(); }, [setBrands, updateDataTimestamp]);
  
  const addProduct = useCallback((p: Product) => { setProducts(prev => [...prev, p]); updateDataTimestamp(); }, [setProducts, updateDataTimestamp]);
  const updateProduct = useCallback((p: Product) => { setProducts(prev => prev.map(i => i.id === p.id ? p : i)); updateDataTimestamp(); }, [setProducts, updateDataTimestamp]);
  const deleteProduct = useCallback((productId: string) => { setProducts(prev => prev.map(p => p.id === productId ? { ...p, isDeleted: true } : p)); updateDataTimestamp(); }, [setProducts, updateDataTimestamp]);

  const restoreBrand = useCallback((brandId: string) => {
    setBrands(prev => prev.map(b => b.id === brandId ? { ...b, isDeleted: false } : b));
    setProducts(prev => prev.map(p => p.brandId === brandId ? { ...p, isDeleted: false } : p));
    updateDataTimestamp();
  }, [setBrands, setProducts, updateDataTimestamp]);

  const permanentlyDeleteBrand = useCallback((brandId: string) => {
    setBrands(p => p.filter(i => i.id !== brandId));
    setProducts(p => p.filter(prod => prod.brandId !== brandId));
    setCatalogues(p => p.filter(c => c.brandId !== brandId));
    setCategories(p => p.filter(c => c.brandId !== brandId));
    updateDataTimestamp();
  }, [setBrands, setProducts, setCatalogues, setCategories, updateDataTimestamp]);
  
  const restoreProduct = useCallback((productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isDeleted: false } : p));
    updateDataTimestamp();
  }, [setProducts, updateDataTimestamp]);

  const permanentlyDeleteProduct = useCallback((productId: string) => {
    setProducts(p => p.filter(i => i.id !== productId));
    updateDataTimestamp();
  }, [setProducts, updateDataTimestamp]);

  const addCatalogue = useCallback((c: Catalogue) => { setCatalogues(p => [...p, c]); updateDataTimestamp(); }, [setCatalogues, updateDataTimestamp]);
  const updateCatalogue = useCallback((c: Catalogue) => { setCatalogues(p => p.map(i => i.id === c.id ? c : i)); updateDataTimestamp(); }, [setCatalogues, updateDataTimestamp]);
  const deleteCatalogue = useCallback((id: string) => { setCatalogues(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setCatalogues, updateDataTimestamp]);
  
  const addPamphlet = useCallback((p: Pamphlet) => { setPamphlets(prev => [...prev, p]); updateDataTimestamp(); }, [setPamphlets, updateDataTimestamp]);
  const updatePamphlet = useCallback((p: Pamphlet) => { setPamphlets(prev => prev.map(i => i.id === p.id ? p : i)); updateDataTimestamp(); }, [setPamphlets, updateDataTimestamp]);
  const deletePamphlet = useCallback((id: string) => { setPamphlets(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setPamphlets, updateDataTimestamp]);
  
  const addAd = useCallback((a: ScreensaverAd) => { setScreensaverAds(p => [...p, a]); updateDataTimestamp(); }, [setScreensaverAds, updateDataTimestamp]);
  const updateAd = useCallback((a: ScreensaverAd) => { setScreensaverAds(p => p.map(i => i.id === a.id ? a : i)); updateDataTimestamp(); }, [setScreensaverAds, updateDataTimestamp]);
  const deleteAd = useCallback((id: string) => { setScreensaverAds(p => p.filter(i => i.id !== id)); updateDataTimestamp(); }, [setScreensaverAds, updateDataTimestamp]);
  
  const addAdminUser = useCallback((u: AdminUser) => {
      setAdminUsers(p => [...p, u]);
      updateDataTimestamp();
  }, [setAdminUsers, updateDataTimestamp]);

  const updateAdminUser = useCallback((u: AdminUser) => {
      setAdminUsers(p => p.map(i => i.id === u.id ? u : i));
      if (loggedInUser?.id === u.id) {
          setLoggedInUser(u);
          sessionStorage.setItem('kiosk-user', JSON.stringify(u));
      }
      updateDataTimestamp();
  }, [setAdminUsers, updateDataTimestamp, loggedInUser]);
  
  const deleteAdminUser = useCallback((id: string) => { if (loggedInUser?.id === id) { alert("Cannot delete self."); return; } setAdminUsers(p => p.filter(i => i.id !== id)); updateDataTimestamp(); }, [loggedInUser, setAdminUsers, updateDataTimestamp]);
  
  const addTvContent = useCallback((c: TvContent) => { setTvContent(p => [...p, c]); updateDataTimestamp(); }, [setTvContent, updateDataTimestamp]);
  const updateTvContent = useCallback((c: TvContent) => { setTvContent(p => p.map(i => i.id === c.id ? c : i)); updateDataTimestamp(); }, [setTvContent, updateDataTimestamp]);
  const deleteTvContent = useCallback((id: string) => { setTvContent(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setTvContent, updateDataTimestamp]);

  const addCategory = useCallback((c: Category) => { setCategories(p => [...p, c]); updateDataTimestamp(); }, [setCategories, updateDataTimestamp]);
  const updateCategory = useCallback((c: Category) => { setCategories(p => p.map(i => i.id === c.id ? c : i)); updateDataTimestamp(); }, [setCategories, updateDataTimestamp]);
  const deleteCategory = useCallback((id: string) => { setCategories(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setCategories, updateDataTimestamp]);

  const restoreCatalogue = useCallback((id: string) => {
    setCatalogues(prev => prev.map(c => c.id === id ? { ...c, isDeleted: false } : c));
    updateDataTimestamp();
  }, [setCatalogues, updateDataTimestamp]);

  const permanentlyDeleteCatalogue = useCallback((id: string) => {
    setCatalogues(p => p.filter(i => i.id !== id));
    updateDataTimestamp();
  }, [setCatalogues, updateDataTimestamp]);

  const restorePamphlet = useCallback((id: string) => {
    setPamphlets(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
    updateDataTimestamp();
  }, [setPamphlets, updateDataTimestamp]);

  const permanentlyDeletePamphlet = useCallback((id: string) => {
    setPamphlets(p => p.filter(i => i.id !== id));
    updateDataTimestamp();
  }, [setPamphlets, updateDataTimestamp]);

  const restoreTvContent = useCallback((id: string) => {
    setTvContent(prev => prev.map(tc => tc.id === id ? { ...tc, isDeleted: false } : tc));
    updateDataTimestamp();
  }, [setTvContent, updateDataTimestamp]);

  const permanentlyDeleteTvContent = useCallback((id: string) => {
    setTvContent(p => p.filter(i => i.id !== id));
    updateDataTimestamp();
  }, [setTvContent, updateDataTimestamp]);

  const playTvContent = useCallback((content: TvContent) => {
    setIsScreensaverActive(false);
    setActiveTvContent(content);
  }, []);

  const stopTvContent = useCallback(() => {
    setActiveTvContent(null);
    resetInactivityTimer();
  }, [resetInactivityTimer]);
  
  const disconnectFromStorage = useCallback(() => {
    setStorageProvider('none');
    setDirectoryHandle(null);
    blobUrlCache.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlCache.current.clear();
    fileHandleCache.current.clear(); // Clear the new file handle cache
    alert("Disconnected from storage provider.");
  }, [setStorageProvider, setDirectoryHandle]);

  const getFileUrl = useCallback(async (src: string): Promise<string> => {
    if (!src) return '';
    // 1. Pass through absolute URLs directly.
    if (src.startsWith('http') || src.startsWith('data:')) {
        return src;
    }

    // 2. Check for a valid, cached blob URL.
    if (blobUrlCache.current.has(src)) {
        const cachedUrl = blobUrlCache.current.get(src)!;
        try {
            // HEAD request is lightweight and perfect for checking if a blob URL is still valid.
            const response = await fetch(cachedUrl, { method: 'HEAD' });
            if (response.ok) return cachedUrl;
        } catch (e) {
            // This is an expected failure if the blob URL has been revoked (e.g., after back navigation).
        }
        // If fetch failed or response was not OK, the URL is stale. Clean up.
        URL.revokeObjectURL(cachedUrl);
        blobUrlCache.current.delete(src);
    }
    
    // 3. If no valid blob URL, use the persistent file handle to create a new one.
    if (storageProvider === 'local' && directoryHandle) {
        try {
            let handle = fileHandleCache.current.get(src);

            // 3a. If handle is not cached, get it from the directory and cache it.
            if (!handle) {
                const hasPermission = await verifyPermission(directoryHandle, false);
                if (!hasPermission) {
                    disconnectFromStorage();
                    alert("File access permission was lost. Please reconnect to your storage folder.");
                    return '';
                }
                handle = await directoryHandle.getFileHandle(src);
                fileHandleCache.current.set(src, handle);
            }

            // 3b. Create a fresh blob URL from the handle.
            const file = await handle.getFile();
            const newBlobUrl = URL.createObjectURL(file);
            blobUrlCache.current.set(src, newBlobUrl);
            return newBlobUrl;

        } catch (error) {
            console.error(`Error getting local file handle for "${src}":`, error);
            return ''; // Return empty string for not found, allowing UI to show a placeholder.
        }
    }
    
    return ''; // Fallback for when no provider is connected.
  }, [storageProvider, directoryHandle, disconnectFromStorage]);

  const openDocument = useCallback(async (document: DocumentType, title: string) => {
    setIsScreensaverActive(false);
    
    switch(document.type) {
        case 'pdf': {
            let displayUrl = '';
            // Data URIs are self-contained and don't need getFileUrl
            if (document.url.startsWith('data:application/pdf')) {
                displayUrl = document.url;
            } else {
                displayUrl = await getFileUrl(document.url);
            }
            
            if (displayUrl) {
                setPdfModalState({ isOpen: true, url: displayUrl, title });
            } else {
                alert("Could not load the PDF document.");
            }
            break;
        }
        case 'image':
            if (document.imageUrls && document.imageUrls.length > 0) {
                setBookletModalState({ isOpen: true, title, imageUrls: document.imageUrls });
            } else {
                alert("This document has no images to display.");
            }
            break;
    }
  }, [getFileUrl]);

  const closePdfModal = useCallback(() => {
    if (pdfModalState.url.startsWith('blob:')) {
        URL.revokeObjectURL(pdfModalState.url);
    }
    setPdfModalState({ isOpen: false, url: '', title: '' });
  }, [pdfModalState.url]);

  const closeBookletModal = useCallback(() => setBookletModalState({ isOpen: false, title: '', imageUrls: [] }), []);

  const showConfirmation = useCallback((message: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, message, onConfirm });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  }, []);

  const connectToLocalProvider = useCallback(async () => {
    if (!window.showDirectoryPicker) {
        alert("Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge on a desktop computer.");
        return;
    }
    try {
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        if (await verifyPermission(handle, true)) {
            disconnectFromStorage(); // Clear all old caches before connecting
            setDirectoryHandle(handle);
            setStorageProvider('local');
            alert(`Connected to local folder "${handle.name}". You can now save/load data from the Backup/Restore tab.`);
        } else {
            alert("Permission to read/write to the folder was denied.");
        }
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error("Error connecting to local folder:", error);
        alert(`Failed to connect to local folder. ${error instanceof Error ? error.message : ''}`);
    }
  }, [setStorageProvider, setDirectoryHandle, disconnectFromStorage]);
  
  const connectToCloudProvider = useCallback((provider: 'customApi') => {
    const url = settings.customApiUrl;
    if (!url) {
        alert(`Please set the Custom API URL in the Settings > API Integrations tab first.`);
        return;
    }
    setStorageProvider(provider);
    alert(`Connected to Custom API. You can now sync data from the Cloud Sync tab.`);
  }, [settings.customApiUrl, setStorageProvider]);

  useEffect(() => {
    if (directoryHandle) {
        const checkPerms = async () => {
            const hasPermission = await verifyPermission(directoryHandle, true);
            if (!hasPermission) {
                console.warn("Permission for persisted directory handle was lost. Automatically disconnecting.");
                disconnectFromStorage();
                alert("Connection to the local folder was lost as permission was not granted. Please reconnect via the Storage tab.");
            }
        };
        checkPerms();
    }
  }, [directoryHandle, disconnectFromStorage]);
  
  const saveFileToStorage = useCallback(async (file: File): Promise<string> => {
    if (storageProvider === 'local' && directoryHandle) {
        const hasPermission = await verifyPermission(directoryHandle, true);
        if (!hasPermission) {
            disconnectFromStorage();
            throw new Error("Permission to write to the folder was lost. Disconnected from storage.");
        }
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        return fileName;
    }
    return fileToBase64(file);
  }, [storageProvider, directoryHandle, disconnectFromStorage]);
  
  const isStorageConnected = storageProvider !== 'none';
  
  const saveDatabaseToLocal = useCallback(async () => {
    if (!directoryHandle) {
        alert("Not connected to a local folder.");
        return;
    }
    // Check for lock file
    try {
        await directoryHandle.getFileHandle('database.lock');
        alert("Error: A sync operation is already in progress. A 'database.lock' file was found. If this is an error, please remove the file manually from the shared folder and try again.");
        return;
    } catch (e) {
        // Expected error if file doesn't exist, so we can proceed.
        if (!(e instanceof DOMException && e.name === 'NotFoundError')) throw e;
    }

    let lockFileHandle;
    try {
        lockFileHandle = await directoryHandle.getFileHandle('database.lock', { create: true });
        const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, viewCounts };
        const dataFileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
        const writable = await dataFileHandle.createWritable();
        await writable.write(JSON.stringify(backupData, null, 2));
        await writable.close();
        alert("Data successfully saved to the connected folder.");
    } catch (error) {
        console.error("Failed to save database to local folder:", error);
        alert(`Error saving data: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
        if (lockFileHandle) {
            await directoryHandle.removeEntry('database.lock');
        }
    }
  }, [directoryHandle, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, viewCounts]);

  const loadDatabaseFromLocal = useCallback(async (silent = false, isConfirmed = false) => {
    if (!directoryHandle) {
        if (!silent) alert("Not connected to a local folder.");
        return;
    }
    try {
        const fileHandle = await directoryHandle.getFileHandle('database.json');
        const file = await fileHandle.getFile();
        const text = await file.text();
        const data = JSON.parse(text);

        const remoteSettings = Array.isArray(data.settings) ? data.settings[0] : data.settings;
        if (silent && remoteSettings?.lastUpdated && settings.lastUpdated && remoteSettings.lastUpdated <= settings.lastUpdated) {
             console.log('Background sync: No new data found.');
             return;
        }

        const confirmLoad = isConfirmed || (silent ? true : window.confirm("Are you sure you want to load data from the drive? This will overwrite all current local data."));

        if (confirmLoad) {
            restoreBackup(data);
            if (!silent) {
                alert("Data successfully loaded from the connected folder.");
            } else {
                console.log(`Background sync: Data updated successfully from network drive. New version: ${remoteSettings?.lastUpdated}`);
            }
        }
    } catch (error) {
        if (silent) {
            console.error('Background sync failed:', error);
        } else {
            console.error("Failed to load database from local folder:", error);
            alert(`Error loading data: ${error instanceof Error ? error.message : "database.json not found or is invalid."}`);
        }
    }
  }, [directoryHandle, restoreBackup, settings]);
  
  const getCloudUrl = useCallback(() => {
    if (storageProvider === 'customApi') return settings.customApiUrl;
    return null;
  }, [storageProvider, settings]);

  const pushToCloud = useCallback(async () => {
    const url = getCloudUrl();
    if (!url) return;
    
    showConfirmation("Are you sure you want to push data to the cloud? This will overwrite the current cloud data.", async () => {
      try {
          const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, viewCounts };
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (settings.customApiKey) {
              headers['x-api-key'] = settings.customApiKey;
          }

          const response = await fetch(url, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(backupData)
          });
          if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
          alert("Data successfully pushed to the cloud.");
      } catch (error) {
          alert(`Error pushing data to cloud: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  }, [getCloudUrl, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, viewCounts, showConfirmation]);

  const pullFromCloud = useCallback(async () => {
    const url = getCloudUrl();
    if (!url) return;
    
    showConfirmation("Are you sure you want to pull data from the cloud? This will overwrite all current local data.", async () => {
      try {
          const headers: HeadersInit = {};
          if (settings.customApiKey) {
              headers['x-api-key'] = settings.customApiKey;
          }
          const response = await fetch(url, { headers });
          if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
          const data = await response.json();
          restoreBackup(data);
          alert("Data successfully pulled from the cloud.");
      } catch (error) {
          alert(`Error pulling data from cloud: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  }, [getCloudUrl, restoreBackup, settings.customApiKey, showConfirmation]);

  // Auto-sync for local (network drive) provider
  useEffect(() => {
    if (storageProvider !== 'local' || !directoryHandle) {
        return;
    }

    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
    const intervalId = setInterval(() => {
        console.log('Performing scheduled background sync from local/network drive...');
        loadDatabaseFromLocal(true);
    }, TWELVE_HOURS_MS);

    // Initial check on connect
    loadDatabaseFromLocal(true);

    return () => {
        console.log('Clearing background sync interval.');
        clearInterval(intervalId);
    };
  }, [storageProvider, directoryHandle, loadDatabaseFromLocal]);

  // PWA Install prompt
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const triggerInstallPrompt = useCallback(async () => {
    if (!deferredPrompt) {
      alert('The app cannot be installed right now. Please try again later.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const trackBrandView = useCallback((brandId: string) => {
    setViewCounts(prev => ({
        ...prev,
        brands: {
            ...prev.brands,
            [brandId]: (prev.brands[brandId] || 0) + 1,
        }
    }));
  }, [setViewCounts]);

  const trackProductView = useCallback((productId: string) => {
    setViewCounts(prev => ({
        ...prev,
        products: {
            ...prev.products,
            [productId]: (prev.products[productId] || 0) + 1,
        }
    }));
  }, [setViewCounts]);

  return (
    <AppContext.Provider value={{
        brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, loggedInUser, tvContent, categories, viewCounts,
        login, logout,
        addBrand, updateBrand, deleteBrand,
        addProduct, updateProduct, deleteProduct,
        addCatalogue, updateCatalogue, deleteCatalogue,
        addPamphlet, updatePamphlet, deletePamphlet,
        addAd, updateAd, deleteAd,
        addAdminUser, updateAdminUser, deleteAdminUser,
        addTvContent, updateTvContent, deleteTvContent,
        addCategory, updateCategory, deleteCategory,
        updateSettings, restoreBackup,
        restoreBrand, permanentlyDeleteBrand, restoreProduct, permanentlyDeleteProduct,
        restoreCatalogue, permanentlyDeleteCatalogue, restorePamphlet, permanentlyDeletePamphlet,
        restoreTvContent, permanentlyDeleteTvContent,
        isScreensaverActive, isScreensaverEnabled, toggleScreensaver, exitScreensaver,
        localVolume, setLocalVolume: setLocalVolume,
        activeTvContent, playTvContent, stopTvContent,
        pdfModalState, bookletModalState, openDocument, closePdfModal, closeBookletModal,
        confirmation, showConfirmation, hideConfirmation,
        theme, toggleTheme,
        deferredPrompt, triggerInstallPrompt,
        storageProvider, connectToLocalProvider, connectToCloudProvider,
        disconnectFromStorage, isStorageConnected, directoryHandle,
        saveFileToStorage, getFileUrl,
        saveDatabaseToLocal, loadDatabaseFromLocal,
        pushToCloud, pullFromCloud,
        trackBrandView, trackProductView,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};