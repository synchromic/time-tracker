export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function formatDate(date) {
  const datePart = date.toLocaleDateString("en-CA"); // "2025-11-03"
  const timePart = date.toLocaleTimeString("en-GB", { hour12: false }); // "09:37:11"
  return `${datePart} ${timePart}`;
}

export function formatDuration(seconds) {
  // doesn't support negative duration yet
  // examples: 0:00, 0:23, 1:23, 11:23, 1:05:06
  const [remMin, sec] = [Math.floor(seconds / 60), seconds % 60];
  const zeroSec = (sec < 10 ? "0" : "") + sec.toString();
  const [hr, min] = [Math.floor(remMin / 60), remMin % 60];
  if (hr === 0) {
    return `${min}:${zeroSec}`;
  } else {
    const zeroMin = (min < 10 ? "0" : "") + min.toString();
    return `${hr}:${zeroMin}:${zeroSec}`;
  }
}
