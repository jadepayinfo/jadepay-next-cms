//ref: https://github.com/dcastil/tailwind-merge/discussions/137#discussioncomment-3482513

import { twMerge as twMergeOriginal } from 'tailwind-merge'
import { clsx, ClassValue} from 'clsx';

export function cn(...inputs:ClassValue[]) {
    return twMergeOriginal(clsx(inputs))
}