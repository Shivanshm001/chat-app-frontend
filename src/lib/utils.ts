import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"
import moment from 'moment'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


interface AddToastI {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => Promise<any>
  }
}
export function addtoast(options: AddToastI){
  return toast(options.title, {
    description: options.description,
    action: options.action,
    position: "top-right",
  })
}

export function formatDate(date: Date | string, format: string = "DD-MM-YYYY"){
    return moment(date).format(format)
}