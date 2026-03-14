/**
 * File: src/infrastructure/services/clock/SystemClock.js
 */

export class SystemClock {
  now() {
    return new Date();
  }

    /**
     * 
     * @param {any} date 
     * @param {any} days 
     * @returns Date
     */
  addDays(date, days) {
    if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
      throw new Error("SystemClock.addDays: invalid date");
    }
    if (!Number.isInteger(days)) {
      throw new Error("SystemClock.addDays: days must be an integer");
    }

    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
}
