import { TypeDescriptor } from './base';
import { translate, R } from '../i18n';

export const EnumTypeDescriptor: TypeDescriptor<any> = {
  name: "enum",
  fromRaw(incoming, field, opt) {
    const enumOptions = field.enum
    let correctedValue = void 0

    enumOptions.some(({ value }) => {
      if (opt.loose ? value == incoming : value === incoming) {
        correctedValue = value
        return true
      }

      return false
    })

    if (typeof correctedValue === 'undefined') throw translate(R.NOT_IN_ENUM_OPTION, opt.labelPrefix + field.label)

    return correctedValue
  }
}
