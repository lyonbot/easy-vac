export const enum R {
  IS_REQUIRED,
  HAS_WRONG_TYPE,
  MUST_BE_STRING,
  MUST_BE_NUMBER,
  MUST_BE_BOOLEAN,
  CANT_BE_GREATER_THAN,
  CANT_BE_LESS_THAN,
  INTERNAL_UNKNOWN_TYPE,
  FIELD_TYPE_FACTORY_FAILED,
  MUST_BE_EMAIL,
  HAS_WRONG_FORMAT,
  HAS_WRONG_VALUE,
  CUSTOM_ASSERT_FAILED,
  MUST_BE_ARRAY,
  HAS_BAD_ELEMENT_AT,
  LENGTH_TOO_SHORT,
  LENGTH_TOO_LONG,
}

let dict: Record<R, string> = {
  [R.IS_REQUIRED]: "%1 is required",
  [R.HAS_WRONG_TYPE]: "%1 has wrong type",
  [R.MUST_BE_STRING]: "%1 must be string",
  [R.MUST_BE_NUMBER]: "%1 must be number",
  [R.MUST_BE_BOOLEAN]: "%1 must be boolean",
  [R.CANT_BE_GREATER_THAN]: "%1 can't be greater than %2",
  [R.CANT_BE_LESS_THAN]: "%1 can't be less than %2",
  [R.INTERNAL_UNKNOWN_TYPE]: "type of %1 can't be handled. If you are developer, see https://github.com/lyonbot/easy-vac/wiki/Field-Types",
  [R.FIELD_TYPE_FACTORY_FAILED]: "failed to instantialize object for field %1",
  [R.MUST_BE_EMAIL]: "%1 must be an valid email address",
  [R.HAS_WRONG_FORMAT]: "%1 has wrong format",
  [R.HAS_WRONG_VALUE]: "%1 has wrong value",
  [R.CUSTOM_ASSERT_FAILED]: "custom assertion failed on %1",
  [R.MUST_BE_ARRAY]: "%1 must be an array",
  [R.HAS_BAD_ELEMENT_AT]: "found bad element in %1 at %2",
  [R.LENGTH_TOO_SHORT]: "length of %1 is too short. minimum %2, got %3",
  [R.LENGTH_TOO_LONG]: "length of %1 is too long. maximum %2, got %3",
}

export function translate(i: R, ..._items: any[]) {
  return dict[i].replace(/%(\d+)/g, (_, x) => arguments[x])
}
