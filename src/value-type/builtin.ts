import { TypeDescriptor } from './base';
import { translate, R } from '../i18n';

export const DateTypeDescriptor: TypeDescriptor<Date> = {
  name: "Date",
  fromRaw(x, field, { loose, labelPrefix }) {
    if (x instanceof Date) return x
    if (loose) {
      const ans = new Date(x)
      if (!isNaN(ans.getDay())) return ans   // avoid invalid Date
    }

    throw translate(R.MUST_BE_X, labelPrefix + field.label, "Date")
  },
}
