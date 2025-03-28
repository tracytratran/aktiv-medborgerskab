import 'react-i18next';
import enTranslation from './en/translation.json';

// React i18next modules augmentation
declare module 'react-i18next' {
  interface CustomTypeOptions {
    // custom resources type
    resources: {
      translation: typeof enTranslation;
    };
    // other namespaces in case you use them
    // defaultNS: 'translation';
    // custom namespace type if you changed it
    // defaultNS: 'ns1';
  }
}
