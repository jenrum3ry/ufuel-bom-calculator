import { useTranslation } from 'react-i18next';

/**
 * Language Toggle Component
 * Switches between English and Spanish - prominent dual-button design
 */
export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="lang-toggle">
      <button
        onClick={() => setLanguage('en')}
        className={`lang-btn ${currentLang === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}
        aria-label="Switch to English"
      >
        <span className="lang-flag">EN</span>
        <span className="lang-label">English</span>
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`lang-btn ${currentLang === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}
        aria-label="Cambiar a Español"
      >
        <span className="lang-flag">ES</span>
        <span className="lang-label">Español</span>
      </button>
    </div>
  );
}
