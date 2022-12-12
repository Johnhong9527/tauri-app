import {InputHTMLAttributes} from "react";

// export declare interface ButtonHTMLAttributes extends InputHTMLAttributes {
//   type?: 'submit' | 'reset' | 'button' | 'default'
// }
//

export declare interface InputHTMLAttributes<T> extends InputHTMLAttributes<T> {
  webkitdirectory?: boolean | undefined
  directory?: boolean | undefined
}

declare module 'clsx' {
  type ClassValue = string | number | ClassDictionary | ClassArray | undefined | null | boolean;

  interface ClassDictionary {
    [ id: string ]: any;
  }

  interface ClassArray extends Array<ClassValue> {
  }

  type ClassNamesFn = (...classes: ClassValue[]) => string;

  type ClassNamesExport = ClassNamesFn & { default: ClassNamesFn };

  const classNames: ClassNamesExport;

  export = classNames;
}
