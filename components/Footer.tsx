
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

const Footer: React.FC = () => {
  const { settings } = useAppContext();
  const footerSettings = settings.footer;

  const footerStyle: React.CSSProperties = {
    backgroundColor: footerSettings?.backgroundColor,
    color: footerSettings?.textColor,
    fontFamily: footerSettings?.typography?.fontFamily ?? 'inherit',
    fontWeight: footerSettings?.typography?.fontWeight ?? 'inherit',
    fontStyle: footerSettings?.typography?.fontStyle ?? 'inherit',
    textDecoration: footerSettings?.typography?.textDecoration ?? 'inherit',
    position: 'relative',
    overflow: 'hidden',
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: footerSettings?.backgroundImageUrl ? `url(${footerSettings.backgroundImageUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: footerSettings?.backgroundImageOpacity,
    zIndex: -1,
  };

  return (
    <footer className="border-t border-gray-200/50 mt-auto" style={footerStyle}>
      <div style={backgroundStyle}></div>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="sm:flex sm:items-center sm:justify-between">
            <p className="text-center sm:text-left text-sm">
                &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="mt-2 text-center sm:mt-0 sm:text-right">
                <Link to="/login" className="text-sm opacity-80 hover:opacity-100 hover:underline transition-opacity">
                    Admin Login
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;