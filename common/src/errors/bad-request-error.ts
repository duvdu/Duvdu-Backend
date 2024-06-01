// import { CustomError } from './custom-error';

// export class BadRequestError extends CustomError {
//   statusCode: number = 400;
//   constructor(message: string) {
//     super(message || 'bad-request error');
//     Object.setPrototypeOf(this, BadRequestError.prototype);
//   }
//   serializeError(): { message: string; field?: string | undefined }[] {
//     return [{ message: this.message || 'bad-request error' }];
//   }
// }

import { CustomError } from './custom-error';

type LocalizedMessages = {
  en: string;
  ar: string;
};

export class BadRequestError extends CustomError {
  statusCode: number = 400;
  private lang: string;
  private messages: LocalizedMessages;

  private static defaultMessages: LocalizedMessages = {
    en: 'bad-request error',
    ar: 'خطأ في الطلب',
  };

  constructor(message?: LocalizedMessages | string, lang: string = 'en') {
    let localizedMessage: string;
    let messages: LocalizedMessages;

    if (!message) {
      messages = BadRequestError.defaultMessages;
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
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeError(): { message: string; field?: string | undefined }[] {
    const localizedMessage = this.messages[this.lang as keyof LocalizedMessages] || this.messages['en'];
    return [{ message: localizedMessage }];
  }
}
