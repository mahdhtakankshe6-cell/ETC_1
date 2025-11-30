import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhTW from '@/messages/zh-TW.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import vi from '@/messages/vi.json';
import fil from '@/messages/fil.json';
import fr from '@/messages/fr.json';
import id from '@/messages/id.json';
import ja from '@/messages/ja.json';
import ko from '@/messages/ko.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      en: { translation: en },
      es: { translation: es },
      vi: { translation: vi },
      fil: { translation: fil },
      fr: { translation: fr },
      id: { translation: id },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    lng: 'zh-TW', // 默认语言
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false, // React 已经处理了 XSS
    },
  });

export default i18n;
