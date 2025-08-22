import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SearchIcon, VolumeUpIcon, VolumeOffIcon, Bars3Icon, XIcon, EnterFullScreenIcon, ExitFullScreenIcon, VolumeLowIcon, SunIcon, MoonIcon } from './Icons.tsx';
import { useAppContext } from './context/AppContext.tsx';
import LocalMedia from './LocalMedia.tsx';
import { AnimatePresence, motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isVolumeControlOpen, setIsVolumeControlOpen] = useState(false);
  const [lastVolume, setLastVolume] = useState(0.75);
  const volumeControlTimeout = useRef<number | null>(null);
  
  const navigate = useNavigate();
  const { settings, localVolume, setLocalVolume, theme, toggleTheme } = useAppContext();

  useEffect(() => {
    if (localVolume > 0) {
      setLastVolume(localVolume);
    }
  }, [localVolume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };
  
  const toggleMute = () => {
    setLocalVolume(localVolume > 0 ? 0 : lastVolume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalVolume(parseFloat(e.target.value));
  };

  const getVolumeIcon = () => {
    if (localVolume === 0) {
      return <VolumeOffIcon className="h-6 w-6" />;
    }
    if (localVolume <= 0.5) {
      return <VolumeLowIcon className="h-6 w-6" />;
    }
    return <VolumeUpIcon className="h-6 w-6" />;
  };
  
  const handleMouseEnter = () => {
    if (volumeControlTimeout.current) {
        clearTimeout(volumeControlTimeout.current);
    }
    setIsVolumeControlOpen(true);
  };

  const handleMouseLeave = () => {
      volumeControlTimeout.current = window.setTimeout(() => {
        setIsVolumeControlOpen(false);
      }, 300);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const headerSettings = settings.header;

  const headerStyle: React.CSSProperties = {
    backgroundColor: headerSettings?.effect === 'glassmorphism' ? 'transparent' : headerSettings?.backgroundColor,
    color: theme === 'light' ? 'var(--main-text)' : headerSettings?.textColor,
    fontFamily: headerSettings?.typography?.fontFamily ?? 'inherit',
    fontWeight: headerSettings?.typography?.fontWeight ?? 'inherit',
    fontStyle: headerSettings?.typography?.fontStyle ?? 'inherit',
    textDecoration: headerSettings?.typography?.textDecoration ?? 'inherit',
    position: 'relative',
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: headerSettings?.backgroundImageUrl ? `url(${headerSettings.backgroundImageUrl})` : 'none',
    backgroundColor: headerSettings?.backgroundColor,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: headerSettings?.backgroundImageOpacity,
    zIndex: -2,
  };

  const headerClasses = [
    'sticky top-0 z-40 border-b border-gray-200 dark:border-white/10',
    headerSettings?.effect === 'glassmorphism' ? 'effect-glassmorphism' : '',
    headerSettings?.effect === '3d-shadow' ? 'effect-3d-shadow' : 'shadow-lg',
  ].filter(Boolean).join(' ');

  const inactiveLinkClass = 'opacity-70 hover:opacity-100 transition-opacity';
  const activeLinkClass = 'opacity-100';
  
  const navLinks = settings.navigation?.links || [];

  return (
    <>
      <header className={headerClasses} style={headerStyle}>
        <div style={backgroundStyle}></div>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center group">
               <LocalMedia src={settings.logoUrl} type="image" alt="Company Logo" className="h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-6">
              <nav className="hidden md:flex items-center space-x-8">
                {navLinks.filter(link => link.enabled).map(link => (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      `text-lg font-semibold ${isActive ? activeLinkClass : inactiveLinkClass}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <form onSubmit={handleSearchSubmit} className="relative w-36 sm:w-48 lg:w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition text-sm bg-white/80 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                  aria-label="Search products"
                />
                <button type="submit" aria-label="Submit search" className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </button>
              </form>
               <div
                  className="relative flex items-center"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
               >
                  <button
                    onClick={toggleMute}
                    className="p-2 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Toggle volume"
                  >
                    {getVolumeIcon()}
                  </button>
                  <AnimatePresence>
                    {isVolumeControlOpen && (
                        <MotionDiv
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 dark:border-white/10"
                        >
                             <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={localVolume}
                                onChange={handleVolumeChange}
                                className="w-32 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 dark:accent-indigo-400"
                                aria-label="Volume slider"
                            />
                        </MotionDiv>
                    )}
                  </AnimatePresence>
               </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <MoonIcon className="h-6 w-6" />
                  ) : (
                    <SunIcon className="h-6 w-6" />
                  )}
                </button>
               <button
                onClick={toggleFullScreen}
                className="p-2 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFullscreen ? (
                  <ExitFullScreenIcon className="h-6 w-6" />
                ) : (
                  <EnterFullScreenIcon className="h-6 w-6" />
                )}
              </button>
              <div className="md:hidden">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors" aria-label="Open menu">
                      <Bars3Icon className="h-6 w-6" />
                  </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isMobileMenuOpen && (
            <MotionDiv 
                className="fixed inset-0 bg-gray-900 z-50 p-6 md:hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            >
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white section-heading">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                        <XIcon className="h-8 w-8 text-white"/>
                    </button>
                </div>
                <nav className="mt-8 flex flex-col space-y-6">
                    {navLinks.filter(link => link.enabled).map(link => (
                        <NavLink 
                            key={link.id} 
                            to={link.path}
                            end={link.path === '/'}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `text-2xl font-semibold transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;