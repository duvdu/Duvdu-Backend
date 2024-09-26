// import { CustomError } from './custom-error';

// export class UnauthenticatedError extends CustomError {
//   statusCode = 401;
//   constructor(message?: string) {
//     super(message || 'un-authenticated error');
//     Object.setPrototypeOf(this, UnauthenticatedError.prototype);
//   }

//   serializeError(): { message: string; field?: string | undefined }[] {
//     return [{ message: this.message || 'un-authenticated error' }];
//   }
// }

import { CustomError } from './custom-error';

type LocalizedMessages = {
  en: string;
  ar: string;
};

export class UnauthenticatedError extends CustomError {
  statusCode = 401;
  private lang: string;
  private messages: LocalizedMessages;

  private static defaultMessages: LocalizedMessages = {
    en: 'Unauthenticated error',
    ar: 'خطأ: غير مصدق',
  };

  constructor(message?: LocalizedMessages | string, lang: string = 'en') {
    let localizedMessage: string;
    let messages: LocalizedMessages;

    if (!message) {
      messages = UnauthenticatedError.defaultMessages;
      localizedMessage = messages[lang as keyof LocalizedMessages] || messages['en'];
    } else if (typeof message === 'string') {
      messages = { en: message, ar: message };
      localizedMessage = message;
    } else {
      messages = message;
      localizedMessage = message[lang as keyof LocalizedMessages] || message['en'];
    }

    super(localizedMessage);
    this.messages = messages;
    this.lang = lang;
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }

  serializeError(): { message: string; field?: string | undefined }[] {
    const localizedMessage =
      this.messages[this.lang as keyof LocalizedMessages] || this.messages['en'];
    return [{ message: localizedMessage }];
  }
}
