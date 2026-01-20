export const getTimezoneOffset = () => {
  return (new Date().getTimezoneOffset() / -60).toString();
}
