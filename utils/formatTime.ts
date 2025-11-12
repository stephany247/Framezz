export default function formatTime(time: string | number | Date): string {
  const now = new Date();
  const postTime = new Date(time);
  const diff = (now.getTime() - postTime.getTime()) / 1000; // seconds

  const minute = 60;
  const hour = 3600;
  const day = 86400;
  const week = 604800;
  const month = 2592000;
  const year = 31536000;

  if (diff < minute) return "Just now";
  if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  }
  if (diff < day) {
    const hrs = Math.floor(diff / hour);
    return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  }
  if (diff < 2 * day) return "Yesterday";
  if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (diff < year) {
    const months = Math.floor(diff / month);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const sameYear = postTime.getFullYear() === now.getFullYear();
  return postTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}