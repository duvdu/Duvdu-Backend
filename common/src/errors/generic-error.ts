import { CustomError } from './custom-error';



export class GenericError extends CustomError{
  statusCode: number;

  constructor(message:string , statusCode:number){
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this ,  GenericError.prototype);
  }

  serializeError(): { message: string; field?: string | undefined; }[] {
    return [{message:this.message}];
  }
}