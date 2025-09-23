import { SelectOption } from "@/model/sharemodel"

export const stringArrayToReactSelectOption = ( list: string[]) : SelectOption[] => {
    // let selectOption: {'id': string, 'name': string}
    if (list == undefined || list.length == 0){
        return []
    }
    const selectOption = list.map((item) => createOption(item))

    return selectOption
}

export const createOption = (label: string) => ({
    label: label,
    value: label,
  });