/**
 * File: src/infrastructure/services/email/EmailServiceMock.js
 */



export class EmailServiceMock {
  /**
   * 
   * @param {{to: string, link: string, expiresAt: Date}} param0 
   * @returns {Promise<void>}
   */
  async sendInviteUserEmail({ to, link, expiresAt }) {
    
    const result = (`email sent to ${to} with link ${link} that expires at ${expiresAt}`);
    console.log(result);
    return //result;
  }

    /**
   * 
   * @param {{to: string, link: string, expiresAt: Date}} param0 
   * @returns {Promise<void>}
   */
  async sendPasswordResetEmail({ to, link, expiresAt }) {
    
    const result = (`email sent to ${to} with link ${link} that expires at ${expiresAt}`);
    console.log(result);
    return //result;
  }

}

