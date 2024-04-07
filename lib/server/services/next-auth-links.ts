export function setPasswordLink(token: string) {
  return `${process.env.NEXTAUTH_URL}/set-password?token=${token}`;
}
