import { useTranslation } from 'react-i18next';

/**
 * Language Toggle Component
 * Switches between English and Spanish
 */
export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="btn-secondary px-4 py-2 text-sm"
      aria-label="Toggle language"
    >
      {t('language.toggle')}
    </button>
  );
}
