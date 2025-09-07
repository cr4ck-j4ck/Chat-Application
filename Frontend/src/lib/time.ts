export const formatTimeToAmPm = (date: string | number | Date): string => {
  try {
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return String(date);
  }
};
