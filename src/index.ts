export { VACDataType } from "./util"
export { VACErrorInfo } from "./error"
export { FillDataOption, IsArrayOfOptions, FieldInfo, ValidateAndCleanFunction } from "./core"
export { TypeDescriptor } from "./value-type/base"

export { getTypeDescriptor, registerType, registerType as registerFieldType } from "./value-type/registry"
export { getVACInfoOf } from "./core"
export { VACInfo, VACData } from "./core"
export * from "./decorators"
