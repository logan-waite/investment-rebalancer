export function objectIsEmpty(obj: object) {
  return obj == undefined || Object.keys(obj).length === 0;
}
