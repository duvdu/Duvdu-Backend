// import { CustomError } from './custom-error';

// export class DatabaseConnectionError extends CustomError {
//   statusCode = 500;
//   constructor(message?: string) {
//     super(message || 'Error connecting to database');

//     Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
//   }

//   serializeError() {
//     return [
//       {
//         message: this.message || 'Error connecting to database',
//       },
//     ];
//   }
// }

import { CustomError } from './custom-error';

type LocalizedMessages = {
  en: string;
  ar: string;
};

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  private lang: string;
  private messages: LocalizedMessages;

  private static defaultMessages: LocalizedMessages = {
    en: 'Error connecting to database',
    ar: 'خطأ في الاتصال بقاعدة البيانات',
  };

  constructor(message?: LocalizedMessages | string, lang: string = 'en') {
    let localizedMessage: string;
    let messages: LocalizedMessages;

    if (!message) {
      messages = DatabaseConnectionError.defaultMessages;
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
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeError() {
    const localizedMessage = this.messages[this.lang as keyof LocalizedMessages] || this.messages['en'];
    return [{ message: localizedMessage }];
  }
}
