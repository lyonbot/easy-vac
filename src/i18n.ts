export const enum R {
  IS_REQUIRED,
  MUST_BE_STRING,
  MUST_BE_NUMBER,
  MUST_BE_BOOLEAN,
  MUST_BE_ARRAY,
  MUST_BE_EMAIL,
  MUST_BE_INTEGER,
  MUST_BE_X,
  CANT_BE_GREATER_THAN,
  CANT_BE_LESS_THAN,
  INTERNAL_UNKNOWN_TYPE,
  FAILED_AT_PREPROCESS,
  FIELD_TYPE_FACTORY_FAILED,
  HAS_WRONG_FORMAT,
  HAS_WRONG_VALUE,
  CUSTOM_ASSERT_FAILED,
  HAS_BAD_ELEMENT_AT,
  LENGTH_TOO_SHORT,
  LENGTH_TOO_LONG,
  NOT_IN_ENUM_OPTION,
}

let dict: Record<R, string> = {
  [R.IS_REQUIRED]: "%1 is required",
  [R.MUST_BE_STRING]: "%1 must be string",
  [R.MUST_BE_NUMBER]: "%1 must be number",
  [R.MUST_BE_BOOLEAN]: "%1 must be boolean",
  [R.MUST_BE_ARRAY]: "%1 must be an array",
  [R.MUST_BE_INTEGER]: "%1 must be an integer",
  [R.MUST_BE_EMAIL]: "%1 must be an valid email address",
  [R.MUST_BE_X]: "%1 must be a %2",
  [R.CANT_BE_GREATER_THAN]: "%1 can't be greater than %2",
  [R.CANT_BE_LESS_THAN]: "%1 can't be less than %2",
  [R.INTERNAL_UNKNOWN_TYPE]: "type of %1 can't be handled. If you are developer, see https://github.com/lyonbot/easy-vac/wiki/Field-Types",
  [R.FAILED_AT_PREPROCESS]: "failed to preprocess %1 at No.%2 function",
  [R.FIELD_TYPE_FACTORY_FAILED]: "failed to instantialize object for field %1",
  [R.HAS_WRONG_FORMAT]: "%1 has wrong format",
  [R.HAS_WRONG_VALUE]: "%1 has wrong value",
  [R.CUSTOM_ASSERT_FAILED]: "custom assertion failed on %1",
  [R.HAS_BAD_ELEMENT_AT]: "found bad element in %1 at %2",
  [R.LENGTH_TOO_SHORT]: "length of %1 is too short. minimum %2, got %3",
  [R.LENGTH_TOO_LONG]: "length of %1 is too long. maximum %2, got %3",
  [R.NOT_IN_ENUM_OPTION]: "value of %1 is not an option",
}

export function translate(i: R, ..._items: any[]) {
  return dict[i].replace(/%(\d+)/g, (_, x) => arguments[x])
}
