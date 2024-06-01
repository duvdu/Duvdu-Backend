// import { CustomError } from './custom-error';

// export class NotFound extends CustomError {
//   statusCode = 404;
//   constructor(message?: string) {
//     super(message || 'not found error');
//     Object.setPrototypeOf(this, NotFound.prototype);
//   }
//   serializeError(): { message: string; field?: string | undefined }[] {
//     return [{ message: this.message || 'not found error' }];
//   }
// }


import { CustomError } from './custom-error';

type LocalizedMessages = {
  en: string;
  ar: string;
};

export class NotFound extends CustomError {
  statusCode = 404;
  private lang: string;
  private messages: LocalizedMessages;

  private static defaultMessages: LocalizedMessages = {
    en: 'Not found error',
    ar: 'خطأ: لم يتم العثور على الصفحة',
  };

  constructor(message?: LocalizedMessages | string, lang: string = 'en') {
    let localizedMessage: string;
    let messages: LocalizedMessages;

    if (!message) {
      messages = NotFound.defaultMessages;
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
    Object.setPrototypeOf(this, NotFound.prototype);
  }

  serializeError(): { message: string; field?: string | undefined }[] {
    const localizedMessage = this.messages[this.lang as keyof LocalizedMessages] || this.messages['en'];
    return [{ message: localizedMessage }];
  }
}
