/**
 * File: src/infrastructure/services/email/templates/passwordResetEmail.js
 */



/**
 * 
 * @param {{link: string, expiresAt: Date, validityPeriod: string}} params 
 * @returns {import("../../../../application/ports/email/email.types.js").Email}
 */
export function buildPasswordResetEmail({ link, expiresAt, validityPeriod }) {
  const expiryText = expiresAt instanceof Date ? expiresAt.toISOString().slice(0, 10) : String(expiresAt);

  return {
    subject: "You have requested a password reset link for KeepTrack",
    contentType: "Text", // of "HTML"
    content:
      `Hello,\n\n` +
      `You have requested a password reset link for KeepTrack.\n\n` +
      `Reset your password using this link:\n${link}\n\n` +
      `This link is valid for ${validityPeriod}\n\n` +
      `If you did not request this, you can ignore this email.\n`,
  };
}
