/**
 * File: src/infrastructure/email/templates/inviteUserEmail.js
 */

/**
 * 
 * @param {{link: string, expiresAt: Date}} params 
 * @returns {Object}
 */
export function buildInviteUserEmail({ link, expiresAt }) {
  const expiryText = expiresAt instanceof Date ? expiresAt.toISOString().slice(0, 10) : String(expiresAt);

  return {
    subject: "You are invited to KeepTrack",
    contentType: "Text", // of "HTML"
    content:
      `Hello,\n\n` +
      `You have been invited to KeepTrack.\n\n` +
      `Create your password using this link:\n${link}\n\n` +
      `This link expires on: ${expiryText}\n\n` +
      `If you did not request this, you can ignore this email.\n`,
  };
}
