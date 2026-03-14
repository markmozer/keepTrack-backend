/**
 * File: src/infrastructure/services/clock/FixedClock.js
 */



export class FixedClock {
  /**
   * @param {Date} fixedDate
   */
  constructor(fixedDate) {
    if (!(fixedDate instanceof Date) || Number.isNaN(fixedDate.valueOf())) {
      throw new Error("FixedClock: fixedDate must be a valid Date");
    }
    this.fixedDate = fixedDate;
  }

  /**
   * 
   * @returns Date
   */
  now() {
    // return nieuw Date-object zodat callers het niet per ongeluk muteren
    return new Date(this.fixedDate);
  }

  /**
   * 
   * @param {Date} date 
   * @param {number} days 
   * @returns Date
   */
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
}
