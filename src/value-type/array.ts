import { TypeDescriptor } from './base';
import { translate, R } from '../i18n';
import { isArray } from '../util';
import { toErrorInfo, VACErrorInfo } from '../error';
import { FieldInfo, FillDataOption } from '../core';
import { getTypeDescriptor } from './registry';

export const ArrayTypeDescriptor: TypeDescriptor<any> = {
  name: "Array",
  fromRaw(incoming, field, popt) {
    const { isArrayOf: elementType, isArrayOf_options: arrOpt } = field

    const elementTypeDescriptor = getTypeDescriptor(elementType)
    if (!elementTypeDescriptor) throw new Error("Type of array element is not registered")

    const prefixedKey = popt.keyPrefix + field.key
    const prefixedLabel = popt.labelPrefix + field.label

    var array: any[]

    if (isArray(incoming)) array = incoming
    else if (typeof incoming === 'string' && popt.loose) array = incoming.split(',')
    else throw translate(R.MUST_BE_ARRAY, prefixedLabel)

    function arrOpt_check(is2pass: boolean) {
      if (arrOpt.unique) array = [...new Set(array)]

      if (is2pass) {
        // after processing, array's length gets finally stable
        if ('minLength' in arrOpt && array.length < arrOpt.minLength) throw translate(R.LENGTH_TOO_SHORT, prefixedLabel, arrOpt.minLength, array.length)
        if ('maxLength' in arrOpt && array.length > arrOpt.maxLength) throw translate(R.LENGTH_TOO_LONG, prefixedLabel, arrOpt.maxLength, array.length)
      }
    }

    arrOpt_check(false) // check array formats

    const out_errors: VACErrorInfo[] = []
    let idx = 0

    const itemField: FieldInfo = { ...field, type: elementType }
    const itemPopt: FillDataOption = { ...popt }

    for (; idx < array.length; idx++) {
      itemField.key = `[${idx}]`
      itemField.label = `#${idx}`
      itemPopt.keyPrefix = `${prefixedKey}`
      itemPopt.labelPrefix = `${prefixedLabel}->`

      try {
        const newVal = elementTypeDescriptor.fromRaw(array[idx], itemField, itemPopt)
        if (typeof newVal === 'undefined') array.splice(idx--, 1)
        else array[idx] = newVal
      } catch (err) {
        if (isArray(err)) out_errors.push(...err)
        else out_errors.push(toErrorInfo(err, itemField, itemPopt))
        break
      }
    }

    if (out_errors.length > 0) {
      out_errors.unshift({ key: prefixedKey, message: translate(R.HAS_BAD_ELEMENT_AT, prefixedLabel, idx) })
      throw out_errors
    }

    arrOpt_check(true) // check again because the array might change

    return array
  }
}
