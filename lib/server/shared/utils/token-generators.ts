import { randomBytes, randomInt } from "crypto";

import { DateTime } from "luxon";
import { PHONE_VERIFICATION_TIMEOUT_IN_MINS } from "@lib-shared/constants/configurations";

export type Token = {
  token: string;
  expiredAt: Date;
  reference: string;
};

export function generateToken(): Token {
  const expiredAt = new Date();
  expiredAt.setHours(expiredAt.getHours() + 24);
  return {
    token: randomBytes(20).toString("hex"),
    expiredAt,
    reference: Math.random().toString(36).substring(7).toUpperCase(),
  };
}

export function generatePhoneVerificationToken(): Token {
  const expiredAt = DateTime.now().plus({ minutes: PHONE_VERIFICATION_TIMEOUT_IN_MINS }).toJSDate();
  const n = randomInt(0, 100000);
  const verificationCode = n.toString().padStart(6, "0");
  return {
    token: verificationCode,
    expiredAt,
    reference: Math.random().toString(36).substring(7).toUpperCase(),
  };
}
