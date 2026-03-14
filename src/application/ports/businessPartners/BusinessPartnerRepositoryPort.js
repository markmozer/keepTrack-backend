/**
 * File: src/application/ports/businessPartners/BusinessPartnerRepositoryPort.js
 */

/**
 * @typedef {import("./businessPartner.types.js").BusinessPartnerDto} BusinessPartnerDto
 * @typedef {import("./businessPartner.types.js").CreateCompanyBusinessPartnerRepoInput} CreateCompanyBusinessPartnerRepoInput
 * @typedef {import("./businessPartner.types.js").CreatePersonBusinessPartnerRepoInput} CreatePersonBusinessPartnerRepoInput
 */

/**
 * @typedef {Object} BusinessPartnerRepositoryPort
 * @property {(tenantId: string, id: string) => Promise<BusinessPartnerDto | null>} findById
 * @property {(input: CreateCompanyBusinessPartnerRepoInput) => Promise<BusinessPartnerDto>} createCompany
 * @property {(input: CreatePersonBusinessPartnerRepoInput) => Promise<BusinessPartnerDto>} createPerson
 */

/**
 * @param {unknown} repo
 * @returns {asserts repo is BusinessPartnerRepositoryPort}
 */
export function assertBusinessPartnerRepositoryPort(repo) {
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof /** @type {any} */ (repo).findById !== "function" ||
    typeof /** @type {any} */ (repo).createCompany !== "function" ||
    typeof /** @type {any} */ (repo).createPerson !== "function"
  ) {
    throw new Error(
      "BusinessPartnerRepositoryPort not implemented: expected { findById(), createCompany(), createPerson() }"
    );
  }
}
