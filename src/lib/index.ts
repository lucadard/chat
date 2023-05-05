export const getAvatarById = (id: string, px = '40') =>
    `https://avatars.githubusercontent.com/u/${id}?s=${px}&v=4`

export const filterOutFromObj = (oldObj: any, props: string[]) => {
  return Object.keys(oldObj)
    .filter(key => !props.includes(key))
    .reduce((newObj: any, key) => {
      newObj[key] = oldObj[key]
      return newObj
    }, {})
}
