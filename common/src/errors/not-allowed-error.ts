// import { CustomError } from './custom-error';

// export class NotAllowedError extends CustomError {
//   statusCode: number = 405;
//   constructor(message?: string) {
//     super(message || 'not allowed error');
//     Object.setPrototypeOf(this, NotAllowedError.prototype);
//   }
//   serializeError(): { message: string; field?: string | undefined }[] {
//     return [{ message: this.message || 'not allowed error' }];
//   }
// }

import { CustomError } from './custom-error';

type LocalizedMessages = {
  en: string;
  ar: string;
};

export class NotAllowedError extends CustomError {
  statusCode: number = 405;
  private lang: string;
  private messages: LocalizedMessages;

  private static defaultMessages: LocalizedMessages = {
    en: 'Not allowed error',
    ar: 'خطأ: غير مسموح',
  };

  constructor(message?: LocalizedMessages | string, lang: string = 'en') {
    let localizedMessage: string;
    let messages: LocalizedMessages;

    if (!message) {
      messages = NotAllowedError.defaultMessages;
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
    Object.setPrototypeOf(this, NotAllowedError.prototype);
  }

  serializeError(): { message: string; field?: string | undefined }[] {
    const localizedMessage =
      this.messages[this.lang as keyof LocalizedMessages] || this.messages['en'];
    return [{ message: localizedMessage }];
  }
}
