import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <label htmlFor="lang" className="mr-2 text-sm text-gray-700 dark:text-gray-200">
        {t('language')}:
      </label>
      <select
        id="lang"
        value={i18n.language}
        onChange={handleChange}
        className="p-1 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
