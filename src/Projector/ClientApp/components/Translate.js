import { PureComponent, PropTypes } from 'react';
import { get, omit, upperFirst, snakeCase } from 'lodash';
import deepForceUpdate from 'react-deep-force-update';

function makeupMessage(message) {
  let parts = message.split('.');
  let word = snakeCase(parts[parts.length - 1]).split('_').map(x => x.length >= 2 ? upperFirst(x) : x).join(' ');
  return word;
}

let mainContext = null;
export function getTranslationContext() {
  return mainContext;
}

export function translateMessage(translationContext, message, defaultMessage) {
  if (!translationContext) {
    console.error(`Translate::translateMessage: translationContext is undefined. The value of message is "${message}".`);
    return makeupMessage(message);
  }

  if (!message) {
    return message;
  }

  let translation = get(translationContext.currentTranslation, message.split('.'));

  if (typeof translation === 'string') {
    return translation;
  }

  if (typeof defaultMessage === 'string') {
    return defaultMessage;
  }

  console.error(`Translate::translateMessage: No translation was found in the current context and no default message was given. The value of message is "${message}". The current locale is "${translationContext.currentLocale}".`);
  return makeupMessage(message);
}

export default class Translate extends PureComponent {

  render() {
    const childProps = omit(this.props, Object.keys(Translate.propTypes));
    const translation = translateMessage(this.context.translationContext, this.props.message, this.props.defaultMessage);

    return (
      <span {...childProps} dangerouslySetInnerHTML={{ __html: translation }} />
    );
  }

}

Translate.propTypes = {
  message: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
};

Translate.contextTypes = {
  translationContext: PropTypes.object.isRequired,
};

export function addTranslationContext(component) {
  let contextTypes = component.contextTypes || {};
  component.contextTypes = Object.assign({}, contextTypes, {
    translationContext: PropTypes.object.isRequired,
  });
}

function getUserLanguages() {
  if (typeof navigator === 'object') {
    if (typeof navigator.languages !== 'object') {
      Object.defineProperty(navigator, 'languages', {
        get: function () {
          return [navigator.language];
        }
      });
    }
    return navigator.languages;
  }
  return ['en'];
}

function getTranslation(translations, locale) {
  return translations[locale] || translations[locale.split('-')[0]] || translations["en-US"] || translations["en"];
}

function resolveLocale(translations) {
  const selectedLocale = typeof localStorage === 'object' ? localStorage.getItem("translate_selected_locale") : null;
  if (selectedLocale && selectedLocale in translations) {
    return selectedLocale;
  } else {
    let supported = getUserLanguages().filter(lang => lang in translations);
    if (supported.length === 0) {
      return 'en' in translations ? 'en' : Object.keys(translations)[0];
    } else {
      return supported[0];
    }
  }
}

export class TranslationProvider extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { locale: resolveLocale(props.translations) };
  }

  getChildContext() {
    const translations = this.props.translations;
    const currentLocale = this.state.currentLocale || resolveLocale(translations);
    const currentTranslation = getTranslation(translations, currentLocale);

    const context = {
      translationContext: {
        currentTranslation,
        currentLocale,
        translations,
        locales: Object.keys(translations).sort(),
        setLocale: locale => {
          if (locale in translations) {
            localStorage.setItem('translate_selected_locale', locale);
            setImmediate(() => {
              this.setState({ currentLocale: locale });
              deepForceUpdate(this);
            });
          } else {
            const localeList = Object.keys(translations).map(x => `"${x}"`).join(', ');
            console.error(`The locale "${locale}" is listed in the given translations. Supported translations are ${localeList}.`);
          }
        }
      }
    };

    mainContext = context;
    return context;
  }

  render() {
    return this.props.children;
  }

}

TranslationProvider.propTypes = {
  translations: PropTypes.object.isRequired,
};

TranslationProvider.childContextTypes = {
  translationContext: PropTypes.object.isRequired,
}

export class LanguageList extends PureComponent {
  render() {
    const locales = this.context.translationContext.locales;
    const currentLocale = this.context.translationContext.currentLocale;
    const setLocale = this.context.translationContext.setLocale;
    const children = locales.sort().map(locale => this.props.project(locale, setLocale, locale === currentLocale));

    return this.props.contain
      ? this.props.contain(children)
      : <div> {children} </div>;
  }
}

LanguageList.propTypes = {
  project: PropTypes.func.isRequired,
};

LanguageList.contextTypes = {
  translationContext: PropTypes.object.isRequired,
};