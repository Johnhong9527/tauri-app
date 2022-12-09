import {InputHTMLAttributes} from "react";

// export declare interface ButtonHTMLAttributes extends InputHTMLAttributes {
//   type?: 'submit' | 'reset' | 'button' | 'default'
// }
//

export declare interface InputHTMLAttributes<T> extends InputHTMLAttributes<T> {
  webkitdirectory?: boolean | undefined
  directory?: boolean | undefined
}
