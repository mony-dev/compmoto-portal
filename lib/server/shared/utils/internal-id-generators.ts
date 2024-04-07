import { DateTime } from "luxon";

export enum InternalIdPrefix {
  SuperAdmin = "SAD",
  Admin = "AD",
  User = "US",
  Tester = "TS",
  Company = "COM",
  Department = "DEP",
}
export function generateInternalId(prefix: InternalIdPrefix) {
  const now = DateTime.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return prefix + now.toFormat("ddMMyy") + now.toUnixInteger() + random;
}
