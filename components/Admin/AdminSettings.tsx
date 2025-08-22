

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { SaveIcon, UploadIcon, EyeIcon, EyeOffIcon, CloudArrowUpIcon, Bars3Icon } from '../Icons.tsx';
import type { Settings, FontStyleSettings, ThemeColors, NavLink } from '../../types.ts';
import LocalMedia from '../LocalMedia.tsx';
import { Link } from 'react-router-dom';

// --- ICONS ---
const Cog6ToothIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.05.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.127.332-.183.582.495.645-.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const PaintBrushIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.43 2.43a4.5 4.5 0 008.642-1.424c-.102.343-.228.66-.376.952l-.008.018a.25.25 0 01-.445.044l-.004-.007a.25.25 0 01.044-.445l.007-.004a.25.25 0 01.445.044l.004.007a.25.25 0 01-.044.445l-.007.004a.25.25 0 01-.445.044l-.004-.007a.25.25 0 01.044-.445l.007-.004a.25.25 0 01.445.044l.004.007a.25.25 0 01-.044.445l-.007.004a.25.25 0 01-.445.044l-.004-.007a.25.25 0 01.044-.445l.007-.004a.25.25 0 01.445.044l.004.007a.25.25 0 01-.044.445l-.007.004a.25.25 0 01-.445.044l-.008-.018a.25.25 0 01.445.044l-.008.018c-.148.292-.274.61-.376.952a4.5 4.5 0 008.642-1.424 2.25 2.25 0 01-2.43-2.43 3 3 0 00-5.78-1.128z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.642-10.023 8.998 8.998 0 00-1.253-5.042A2.25 2.25 0 0017.345 4.5H6.655a2.25 2.25 0 00-2.043 1.435A8.998 8.998 0 003.358 10.977a9.004 9.004 0 008.642 10.023z" /></svg>
);
const CharacterSpacingIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5M5.25 4.5l3.75-3.75m0 0L12.75 4.5M9 8.25v12.75" /></svg>
);
const ViewColumnsIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>
);
const ComputerDesktopIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>
);
const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
);


// --- SHARED DATA & STYLES ---
const selectStyle = "block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 dark:focus:ring-offset-gray-900 dark:focus:ring-gray-200 sm:text-sm disabled:opacity-70 disabled:bg-gray-100";
const colorInputStyle = "p-1 h-10 w-full block bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800";
const textInputStyle = "w-full bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-800 sm:text-sm";
const availableFonts = [ 'Inter', 'Roboto', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro', 'Poppins', 'Open Sans', 'Raleway', 'Nunito Sans', 'Merriweather', 'Playfair Display', 'Ubuntu', 'PT Sans', 'Lora', 'Noto Sans', 'Slabo 27px', 'Roboto Condensed', 'Zilla Slab', 'Fira Sans', 'Cormorant Garamond', 'Work Sans', 'Karla', 'Rubik', 'Arvo', 'Bebas Neue', 'Josefin Sans', 'Libre Baskerville', 'Pacifico', 'Lobster', 'Anton', 'Comfortaa', 'Righteous', 'Caveat', 'Dancing Script', 'Shadows Into Light', 'Amatic SC', 'Patrick Hand', 'Permanent Marker', 'Archivo', 'Barlow', 'Exo 2', 'Maven Pro', 'Questrial', 'Teko', 'Titillium Web', 'Yanone Kaffeesatz', 'Quicksand'].sort();


// --- REUSABLE UI COMPONENTS ---

const SettingsNavItem: React.FC<{ sectionId: string; title: string; icon: React.ReactNode; activeSection: string; setActiveSection: (section: string) => void; }> = ({ sectionId, title, icon, activeSection, setActiveSection }) => {
    const isActive = activeSection === sectionId;
    return (
        <button type="button" role="tab" aria-selected={isActive} onClick={() => setActiveSection(sectionId)} className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50'}`}>
            <div className="mr-3">{icon}</div><span className="font-semibold">{title}</span>
        </button>
    );
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    return (
        <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700/50" open={defaultOpen}>
            <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h3>
                <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                    <ChevronDownIcon />
                </div>
            </summary>
            <div className="px-4 sm:px-5 pb-5 border-t border-gray-200/80 dark:border-gray-700">
                {children}
            </div>
        </details>
    );
};

const SettingRow: React.FC<{ label: string; description: string; htmlFor?: string; children: React.ReactNode; }> = ({ label, description, htmlFor, children }) => (
    <div className="py-5 grid grid-cols-3 gap-4 items-start border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="col-span-1">
            <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="mt-0 col-span-2">
            {children}
        </div>
    </div>
);

const ColorInput: React.FC<{ name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, value, onChange }) => (
    <div className="flex items-center gap-2">
        <input type="color" name={name} value={value} onChange={onChange} className={colorInputStyle} />
        <input type="text" name={name} value={value} onChange={onChange} className={textInputStyle} />
    </div>
);

const RangeSlider: React.FC<{ name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; unit?: string; }> = ({ name, value, onChange, min, max, step, unit = '' }) => (
    <div className="flex items-center gap-4">
        <input type="range" name={name} value={value} onChange={onChange} min={min} max={max} step={step} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gray-800 dark:accent-gray-300" />
        <span className="text-sm font-mono text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1 w-24 text-center">{value}{unit}</span>
    </div>
);

const TypographyControls: React.FC<{ value: FontStyleSettings; onChange: (field: keyof FontStyleSettings, value: string) => void; idPrefix: string; }> = ({ value, onChange, idPrefix }) => (
    <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-inner">
            <p style={{ fontFamily: value.fontFamily, fontWeight: value.fontWeight, fontStyle: value.fontStyle, textDecoration: value.textDecoration }} className="text-lg truncate text-gray-800 dark:text-gray-100">
                The quick brown fox jumps over the lazy dog.
            </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor={`${idPrefix}-fontFamily`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Font Family</label>
                <select id={`${idPrefix}-fontFamily`} value={value.fontFamily} onChange={(e) => onChange('fontFamily', e.target.value)} className={selectStyle}>
                    {availableFonts.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor={`${idPrefix}-fontWeight`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Font Weight</label>
                <select id={`${idPrefix}-fontWeight`} value={value.fontWeight} onChange={(e) => onChange('fontWeight', e.target.value as FontStyleSettings['fontWeight'])} className={selectStyle}>
                    {[300, 400, 500, 600, 700, 800, 900].map(w => <option key={w} value={w.toString()}>{w}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor={`${idPrefix}-fontStyle`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Font Style</label>
                <select id={`${idPrefix}-fontStyle`} value={value.fontStyle} onChange={(e) => onChange('fontStyle', e.target.value as FontStyleSettings['fontStyle'])} className={selectStyle}>
                    <option value="normal">Normal</option><option value="italic">Italic</option>
                </select>
            </div>
            <div>
                <label htmlFor={`${idPrefix}-textDecoration`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Text Decoration</label>
                <select id={`${idPrefix}-textDecoration`} value={value.textDecoration} onChange={(e) => onChange('textDecoration', e.target.value as FontStyleSettings['textDecoration'])} className={selectStyle}>
                    <option value="none">None</option><option value="underline">Underline</option>
                </select>
            </div>
        </div>
    </div>
);

const ThemeEditor: React.FC<{
  theme: ThemeColors;
  onThemeChange: (key: keyof ThemeColors, value: any) => void;
  onButtonChange: (btn: 'primaryButton' | 'destructiveButton', key: keyof ThemeColors['primaryButton'], value: string) => void;
}> = ({ theme, onThemeChange, onButtonChange }) => (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <SettingRow label="Primary Color" description="Used for accents, links, and highlights.">
            <ColorInput name="primary" value={theme.primary} onChange={e => onThemeChange('primary', e.target.value)} />
        </SettingRow>
        <SettingRow label="App Background" description="Outermost background color of the app.">
            <ColorInput name="appBg" value={theme.appBg} onChange={e => onThemeChange('appBg', e.target.value)} />
        </SettingRow>
        <SettingRow label="Main Content Background" description="Background of the main content container.">
            <ColorInput name="mainBg" value={theme.mainBg} onChange={e => onThemeChange('mainBg', e.target.value)} />
        </SettingRow>
        <SettingRow label="Main Text Color" description="Default color for most text.">
            <ColorInput name="mainText" value={theme.mainText} onChange={e => onThemeChange('mainText', e.target.value)} />
        </SettingRow>
        <SettingRow label="Primary Button" description="Background and text color for main actions.">
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <ColorInput name="background" value={theme.primaryButton.background} onChange={e => onButtonChange('primaryButton', 'background', e.target.value)} />
                    <ColorInput name="text" value={theme.primaryButton.text} onChange={e => onButtonChange('primaryButton', 'text', e.target.value)} />
                </div>
                <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium shadow-md" style={{ backgroundColor: theme.primaryButton.background, color: theme.primaryButton.text }}>Preview Button</button>
            </div>
        </SettingRow>
        <SettingRow label="Destructive Button" description="Background and text color for delete actions.">
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <ColorInput name="background" value={theme.destructiveButton.background} onChange={e => onButtonChange('destructiveButton', 'background', e.target.value)} />
                    <ColorInput name="text" value={theme.destructiveButton.text} onChange={e => onButtonChange('destructiveButton', 'text', e.target.value)} />
                </div>
                 <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium shadow-md" style={{ backgroundColor: theme.destructiveButton.background, color: theme.destructiveButton.text }}>Preview Button</button>
            </div>
        </SettingRow>
    </div>
);


// --- MAIN SETTINGS COMPONENT ---

const AdminSettings: React.FC = () => {
    const { settings: initialSettings, updateSettings, saveFileToStorage, loggedInUser } = useAppContext();
    const [localSettings, setLocalSettings] = useState<Settings>(initialSettings);
    const [activeSection, setActiveSection] = useState('general');
    const [isDirty, setIsDirty] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSettings;

    useEffect(() => {
        setLocalSettings(initialSettings);
        setIsDirty(false);
    }, [initialSettings]);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage settings.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const markDirty = () => !isDirty && setIsDirty(true);
    
    // Generic handler for flat settings
    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' || type ==='range' ? parseFloat(value) : value;
        setLocalSettings(prev => ({ ...prev, [name]: parsedValue }));
        markDirty();
    };

    const handleNestedSettingChange = <T extends keyof Settings>(
        key: T,
        field: keyof Settings[T],
        value: any
    ) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] as object),
                [field as any]: value,
            },
        }));
        markDirty();
    };
    
    const handleNavigationChange = (index: number, field: keyof NavLink, value: string | boolean) => {
        const newLinks = [...localSettings.navigation.links];
        const linkToUpdate = { ...newLinks[index], [field]: value };
        newLinks[index] = linkToUpdate;
        handleNestedSettingChange('navigation', 'links' as any, newLinks);
    };
    
    const handleThemeChange = (themeMode: 'lightTheme' | 'darkTheme', key: keyof ThemeColors, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            [themeMode]: {
                ...prev[themeMode],
                [key]: value
            }
        }));
        markDirty();
    };

    const handleButtonThemeChange = (
        themeMode: 'lightTheme' | 'darkTheme',
        btn: 'primaryButton' | 'destructiveButton',
        key: keyof ThemeColors['primaryButton'],
        value: string
    ) => {
        setLocalSettings(prev => ({
            ...prev,
            [themeMode]: {
                ...prev[themeMode],
                [btn]: {
                    ...prev[themeMode][btn],
                    [key]: value
                }
            }
        }));
        markDirty();
    };
    
    // Specific handler for deeply nested typography
    const handleTypographyChange = (key: 'body' | 'headings' | 'itemTitles', field: keyof FontStyleSettings, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            typography: {
                ...prev.typography,
                [key]: { ...prev.typography[key], [field]: value }
            }
        }));
        markDirty();
    };
    
    const handleCustomElementTypographyChange = (
        key: 'header' | 'footer' | 'pamphletPlaceholder',
        field: keyof FontStyleSettings,
        value: string
    ) => {
         setLocalSettings(prev => {
            const newSettings = { ...prev };

            if (key === 'pamphletPlaceholder') {
                const currentFontSettings = newSettings.pamphletPlaceholder.font;
                const newFontSettings = { ...currentFontSettings, [field]: value as any };
                newSettings.pamphletPlaceholder = { ...newSettings.pamphletPlaceholder, font: newFontSettings };
            } else { // header or footer
                const currentTypographySettings = newSettings[key].typography;
                const newTypographySettings = { ...currentTypographySettings, [field]: value as any };
                newSettings[key] = { ...newSettings[key], typography: newTypographySettings };
            }
            
            return newSettings;
         });
        markDirty();
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileName = await saveFileToStorage(e.target.files[0]);
                setLocalSettings(prev => ({ ...prev, logoUrl: fileName }));
                markDirty();
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to save logo.");
            }
        }
    };
    
    const handleMusicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileName = await saveFileToStorage(e.target.files[0]);
                setLocalSettings(prev => ({ ...prev, backgroundMusicUrl: fileName }));
                markDirty();
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to save music file.");
            }
        } else { // Handle removing
            setLocalSettings(prev => ({ ...prev, backgroundMusicUrl: '' }));
            markDirty();
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(localSettings);
        setIsDirty(false);
    };

    const navItems = [
        { id: 'general', title: 'General', icon: <Cog6ToothIcon /> },
        { id: 'branding', title: 'Branding & Style', icon: <PaintBrushIcon /> },
        { id: 'typography', title: 'Typography', icon: <CharacterSpacingIcon /> },
        { id: 'navigation', title: 'Navigation', icon: <Bars3Icon /> },
        { id: 'components', title: 'Components', icon: <ViewColumnsIcon /> },
        { id: 'kiosk', title: 'Kiosk Mode', icon: <ComputerDesktopIcon /> },
        { id: 'api', title: 'API Integrations', icon: <CloudArrowUpIcon /> },
    ];
    
    const renderPanel = () => {
        switch(activeSection) {
            case 'general': return (
                <CollapsibleSection title="Company & Brand Identity" defaultOpen>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <SettingRow label="Logo" description="Upload a PNG, JPG, or SVG. Displayed in the header.">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 object-contain bg-gray-100 dark:bg-gray-700 p-2 rounded-2xl border dark:border-gray-600 shadow-sm">
                                  <LocalMedia src={localSettings.logoUrl} alt="Logo Preview" type="image" className="h-full w-full object-contain"/>
                                </div>
                                <label htmlFor="logo-upload" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"><UploadIcon className="h-5 w-5" /><span>Change Logo</span></label>
                                <input id="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml" />
                            </div>
                        </SettingRow>
                    </div>
                </CollapsibleSection>
            );
            case 'branding': return (
                <div className="space-y-6">
                    <CollapsibleSection title="Light Theme" defaultOpen>
                        <ThemeEditor 
                            theme={localSettings.lightTheme}
                            onThemeChange={(key, value) => handleThemeChange('lightTheme', key, value)}
                            onButtonChange={(btn, key, value) => handleButtonThemeChange('lightTheme', btn, key, value)}
                        />
                    </CollapsibleSection>
                    <CollapsibleSection title="Dark Theme">
                         <ThemeEditor 
                            theme={localSettings.darkTheme}
                            onThemeChange={(key, value) => handleThemeChange('darkTheme', key, value)}
                            onButtonChange={(btn, key, value) => handleButtonThemeChange('darkTheme', btn, key, value)}
                        />
                    </CollapsibleSection>
                    <CollapsibleSection title="Card & Layout Styles">
                         <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            <SettingRow label="Card Corner Radius" description="Controls the roundness of product and catalogue cards.">
                                <select value={localSettings.cardStyle.cornerRadius} onChange={(e) => handleNestedSettingChange('cardStyle', 'cornerRadius', e.target.value)} className={selectStyle}>
                                    <option value="rounded-none">None</option>
                                    <option value="rounded-lg">Medium</option>
                                    <option value="rounded-2xl">Large</option>
                                    <option value="rounded-3xl">Extra Large</option>
                                </select>
                            </SettingRow>
                             <SettingRow label="Card Shadow" description="Controls the drop shadow intensity on cards.">
                                <select value={localSettings.cardStyle.shadow} onChange={(e) => handleNestedSettingChange('cardStyle', 'shadow', e.target.value)} className={selectStyle}>
                                    <option value="shadow-none">None</option>
                                    <option value="shadow-md">Medium</option>
                                    <option value="shadow-lg">Large</option>
                                    <option value="shadow-xl">Extra Large</option>
                                </select>
                            </SettingRow>
                             <SettingRow label="Layout Width" description="Switch between a standard centered or wider layout.">
                                <select value={localSettings.layout.width} onChange={(e) => handleNestedSettingChange('layout', 'width' as any, e.target.value)} className={selectStyle}>
                                    <option value="standard">Standard (Centered)</option>
                                    <option value="wide">Wide (Expansive)</option>
                                </select>
                            </SettingRow>
                             <SettingRow label="Page Transitions" description="Animation when navigating between pages.">
                                <select value={localSettings.pageTransitions.effect} onChange={(e) => handleNestedSettingChange('pageTransitions', 'effect', e.target.value)} className={selectStyle}>
                                    <option value="none">None</option>
                                    <option value="fade">Fade</option>
                                    <option value="slide">Slide</option>
                                </select>
                            </SettingRow>
                         </div>
                    </CollapsibleSection>
                </div>
            );
            case 'typography': return (
                <div className="space-y-6">
                    <CollapsibleSection title="Body Typography" defaultOpen>
                        <SettingRow label="Body Text" description="Controls the default text style for paragraphs and descriptions.">
                            <TypographyControls value={localSettings.typography.body} onChange={(field, value) => handleTypographyChange('body', field, value)} idPrefix="body"/>
                        </SettingRow>
                    </CollapsibleSection>
                    <CollapsibleSection title="Heading Typography">
                        <SettingRow label="Headings" description="Controls the style for all major section titles (e.g., 'Shop by Brand').">
                            <TypographyControls value={localSettings.typography.headings} onChange={(field, value) => handleTypographyChange('headings', field, value)} idPrefix="headings"/>
                        </SettingRow>
                    </CollapsibleSection>
                    <CollapsibleSection title="Item Title Typography">
                        <SettingRow label="Item Titles" description="Controls the style for titles on product/catalogue cards.">
                           <TypographyControls value={localSettings.typography.itemTitles} onChange={(field, value) => handleTypographyChange('itemTitles', field, value)} idPrefix="itemTitles"/>
                        </SettingRow>
                    </CollapsibleSection>
                </div>
            );
            case 'navigation': return (
                <CollapsibleSection title="Header Navigation Links" defaultOpen>
                    <p className="text-sm text-gray-600 dark:text-gray-300 pb-4">
                        Enable, disable, or rename the main navigation tabs shown in the header.
                    </p>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {localSettings.navigation.links.map((link, index) => (
                            <div key={link.id} className="py-4 grid grid-cols-3 gap-4 items-center">
                                <div className="col-span-1">
                                    <label htmlFor={`nav-label-${index}`} className="sr-only">Tab Name</label>
                                    <input
                                        type="text"
                                        id={`nav-label-${index}`}
                                        value={link.label}
                                        onChange={(e) => handleNavigationChange(index, 'label', e.target.value)}
                                        className={textInputStyle}
                                    />
                                     <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Path: <code>{link.path}</code></p>
                                </div>
                                <div className="mt-0 col-span-2 flex justify-end">
                                     <label htmlFor={`nav-enabled-${index}`} className="flex items-center cursor-pointer">
                                        <span className={`mr-3 text-sm font-medium ${link.enabled ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {link.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id={`nav-enabled-${index}`}
                                                className="sr-only peer"
                                                checked={link.enabled}
                                                onChange={(e) => handleNavigationChange(index, 'enabled', e.target.checked)}
                                            />
                                            <div className="block w-14 h-8 rounded-full transition-colors bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-500"></div>
                                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            );
            case 'components': return(
                <div className="space-y-6">
                    <CollapsibleSection title="Header Customization" defaultOpen>
                         <SettingRow label="Header Style" description="Set background, text, and effects for the header.">
                             <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                 <ColorInput name="backgroundColor" value={localSettings.header.backgroundColor} onChange={(e) => handleNestedSettingChange('header', 'backgroundColor', e.target.value)} />
                                 <ColorInput name="textColor" value={localSettings.header.textColor} onChange={(e) => handleNestedSettingChange('header', 'textColor', e.target.value)} />
                                <select value={localSettings.header.effect} onChange={(e) => handleNestedSettingChange('header', 'effect', e.target.value as any)} className={selectStyle}>
                                    <option value="none">No Effect</option>
                                    <option value="glassmorphism">Glassmorphism</option>
                                    <option value="3d-shadow">3D Shadow</option>
                                </select>
                             </div>
                        </SettingRow>
                         <SettingRow label="Header Typography" description="Set a custom font for the header text.">
                            <TypographyControls value={localSettings.header.typography} onChange={(field, value) => handleCustomElementTypographyChange('header', field, value)} idPrefix="header-typo" />
                        </SettingRow>
                    </CollapsibleSection>
                    <CollapsibleSection title="Footer Customization">
                         <SettingRow label="Footer Style" description="Set background, text, and effects for the footer.">
                              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                 <ColorInput name="backgroundColor" value={localSettings.footer.backgroundColor} onChange={(e) => handleNestedSettingChange('footer', 'backgroundColor', e.target.value)} />
                                 <ColorInput name="textColor" value={localSettings.footer.textColor} onChange={(e) => handleNestedSettingChange('footer', 'textColor', e.target.value)} />
                             </div>
                        </SettingRow>
                         <SettingRow label="Footer Typography" description="Set a custom font for the footer text.">
                            <TypographyControls value={localSettings.footer.typography} onChange={(field, value) => handleCustomElementTypographyChange('footer', field, value)} idPrefix="footer-typo" />
                        </SettingRow>
                    </CollapsibleSection>
                    <CollapsibleSection title="Pamphlet Placeholder">
                        <SettingRow label="Placeholder Text" description="Text shown when no active pamphlets are available.">
                            <input type="text" value={localSettings.pamphletPlaceholder.text} onChange={(e) => handleNestedSettingChange('pamphletPlaceholder', 'text', e.target.value)} className={textInputStyle} />
                        </SettingRow>
                        <SettingRow label="Gradient Colors" description="The two colors for the text gradient effect.">
                            <div className="grid grid-cols-2 gap-4">
                                <ColorInput name="color1" value={localSettings.pamphletPlaceholder.color1} onChange={(e) => handleNestedSettingChange('pamphletPlaceholder', 'color1', e.target.value)} />
                                <ColorInput name="color2" value={localSettings.pamphletPlaceholder.color2} onChange={(e) => handleNestedSettingChange('pamphletPlaceholder', 'color2', e.target.value)} />
                            </div>
                        </SettingRow>
                        <SettingRow label="Placeholder Typography" description="Set a custom font for the placeholder text.">
                            <TypographyControls value={localSettings.pamphletPlaceholder.font} onChange={(field, value) => handleCustomElementTypographyChange('pamphletPlaceholder', field, value)} idPrefix="pamphlet-typo" />
                        </SettingRow>
                    </CollapsibleSection>
                </div>
            );
            case 'kiosk': return(
                <CollapsibleSection title="Kiosk & Screensaver Settings" defaultOpen>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <SettingRow label="Screensaver Delay" description="Time of inactivity before screensaver starts.">
                            <RangeSlider name="screensaverDelay" value={localSettings.screensaverDelay} onChange={handleGeneralChange} min={5} max={180} step={5} unit="s" />
                        </SettingRow>
                        <SettingRow label="Screensaver Image Duration" description="How long each image is shown in the screensaver.">
                            <RangeSlider name="screensaverImageDuration" value={localSettings.screensaverImageDuration} onChange={handleGeneralChange} min={3} max={30} step={1} unit="s" />
                        </SettingRow>
                        <SettingRow label="Screensaver Transition" description="Animation effect between screensaver items.">
                            <select name="screensaverTransitionEffect" value={localSettings.screensaverTransitionEffect} onChange={handleGeneralChange} className={selectStyle}>
                                <option value="fade">Fade</option>
                                <option value="slide">Slide</option>
                                <option value="scale">Scale</option>
                                <option value="slide-fade">Slide & Fade</option>
                                <option value="gentle-drift">Gentle Drift (Modern)</option>
                                <option value="reveal-blur">Reveal from Blur (Modern)</option>
                            </select>
                        </SettingRow>
                        <SettingRow label="Screensaver Prompt Text" description="The text displayed on the 'Touch to Explore' slide.">
                            <input 
                                type="text" 
                                name="screensaverTouchPromptText" 
                                value={localSettings.screensaverTouchPromptText} 
                                onChange={handleGeneralChange} 
                                className={textInputStyle} 
                            />
                        </SettingRow>
                        <SettingRow label="Default Video Volume" description="The volume for all product and screensaver videos.">
                            <RangeSlider name="videoVolume" value={localSettings.videoVolume} onChange={handleGeneralChange} min={0} max={1} step={0.05} />
                        </SettingRow>
                        <SettingRow label="Idle Redirect Timeout" description="After this time on any page besides Home, automatically navigate back to Home. 0 disables this.">
                           <RangeSlider name="idleRedirectTimeout" value={localSettings.kiosk.idleRedirectTimeout} onChange={(e) => handleNestedSettingChange('kiosk', 'idleRedirectTimeout', parseFloat(e.target.value))} min={0} max={300} step={10} unit="s" />
                        </SettingRow>
                        <SettingRow label="Background Music" description="Upload an audio file (e.g., MP3) to play continuously. Stops during screensaver.">
                           <div className="space-y-2">
                                <label htmlFor="music-upload" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 w-full justify-center"><UploadIcon className="h-5 w-5" /><span>{localSettings.backgroundMusicUrl ? 'Change Music' : 'Upload Music File'}</span></label>
                                <input id="music-upload" type="file" className="sr-only" onChange={handleMusicChange} accept="audio/mpeg, audio/wav, audio/ogg" />
                                {localSettings.backgroundMusicUrl && (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Current: {localSettings.backgroundMusicUrl}</p>
                                        <button type="button" onClick={() => handleMusicChange({ target: { files: null } } as any)} className="text-xs text-red-500 hover:underline">Remove</button>
                                    </div>
                                )}
                           </div>
                        </SettingRow>
                        <SettingRow label="Music Volume" description="Relative volume for the background music, multiplied by the main volume.">
                             <RangeSlider name="backgroundMusicVolume" value={localSettings.backgroundMusicVolume} onChange={handleGeneralChange} min={0} max={1} step={0.05} />
                        </SettingRow>
                    </div>
                </CollapsibleSection>
            );
            case 'api': return(
                 <CollapsibleSection title="API Integrations" defaultOpen>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <SettingRow label="Custom API URL" description="Base URL for your custom API (e.g., https://api.yourdomain.com/data).">
                            <input type="url" name="customApiUrl" value={localSettings.customApiUrl} onChange={handleGeneralChange} className={textInputStyle} placeholder="https://api.yourdomain.com/data"/>
                        </SettingRow>
                        <SettingRow label="Custom API Auth Key" description="Optional security key for your Custom API. Sent as 'x-api-key' header.">
                            <div className="relative">
                                <input 
                                    type={showApiKey ? 'text' : 'password'} 
                                    name="customApiKey" 
                                    value={localSettings.customApiKey} 
                                    onChange={handleGeneralChange} 
                                    className={textInputStyle} 
                                    placeholder="Enter your secret API key"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowApiKey(!showApiKey)} 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    {showApiKey ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </SettingRow>
                    </div>
                 </CollapsibleSection>
            );
            default: return null;
        }
    }

    return (
        <form onSubmit={handleSave}>
            <div className="flex flex-row gap-12 items-start">
                <aside className="w-64 sticky top-28">
                    <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading mb-4 px-2">Settings</h3>
                    <nav role="tablist" aria-orientation="vertical" className="space-y-1">
                       {navItems.map(item => (<SettingsNavItem key={item.id} sectionId={item.id} title={item.title} icon={item.icon} activeSection={activeSection} setActiveSection={setActiveSection}/>))}
                    </nav>
                </aside>

                <main className="flex-1 min-w-0 w-full space-y-6" role="tabpanel">
                   {renderPanel()}
                </main>
            </div>
            
            {isDirty && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 z-50">
                    <div className="bg-gray-800 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between transition-all duration-300 transform animate-fade-in-up">
                        <span className="text-sm font-medium">You have unsaved changes.</span>
                        <div className="flex items-center gap-3">
                            <button type="submit" className="btn btn-primary bg-green-500 hover:bg-green-600 disabled:bg-gray-500"><SaveIcon className="h-5 w-5" /> Save Changes</button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes fade-in-up {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                    `}</style>
                </div>
            )}
        </form>
    );
};

export default AdminSettings;