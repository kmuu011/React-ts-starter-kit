export const getTimezoneOffset = () => {
  return (new Date().getTimezoneOffset() / -60).toString();
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
