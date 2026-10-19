export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function formatDate(value: string | Date | null | undefined, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  }).format(new Date(value));
}

export function formatRelative(value: string | Date) {
  const diff = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

export function formatCurrency(amount: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Whole-blood donors must wait 56 days between donations.
export const DONATION_GAP_DAYS = 56;

export function donationEligibility(lastDonation: string | null | undefined) {
  if (!lastDonation) return { eligible: true, daysLeft: 0, nextDate: null as Date | null };
  const next = new Date(lastDonation);
  next.setDate(next.getDate() + DONATION_GAP_DAYS);
  const daysLeft = Math.ceil((next.getTime() - Date.now()) / 86_400_000);
  return { eligible: daysLeft <= 0, daysLeft: Math.max(daysLeft, 0), nextDate: next };
}

/** "1 donor", "3 donors" — pass the plural form when it isn't just +s. */
export const plural = (count: number, word: string, pluralWord = `${word}s`) =>
  `${count} ${count === 1 ? word : pluralWord}`;
