import { uiStrings as en } from './ui.en';
import { uiStrings as de } from './ui.de';

const translations = { en, de };

export function getUI(language) {
  return translations[language] || translations.en;
}
