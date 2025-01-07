import { createI18n } from 'vue-i18n';

const messages = {};

const localeModules = import.meta.glob('@/locales/*/*.js', { eager: true });

Object.keys(localeModules).forEach((path) => {
    const [, locale, moduleName] = path.match(/locales\/([a-z]+)\/([a-z]+)\.js/);

    if (!messages[locale]) {
        messages[locale] = {};
    }

    messages[locale][moduleName] = localeModules[path].default;
});

const i18n = createI18n({
    legacy: false,
    messages
});

export default i18n;
