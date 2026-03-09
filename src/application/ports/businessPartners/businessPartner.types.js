/**
 * File: keepTrack-backend/src/application/ports/businessPartners/businessPartner.types.js
 */

/**
 * @typedef {import("../../../domain/businessPartners/BusinessPartnerType.js")} BPType
 * @typedef {import("../../../domain/businessPartners/BusinessPartnerStatus.js")} BPStatus
 * @typedef {import("../../../domain/businessPartners/Gender.js")} Gender
 * @typedef {import("../../../domain/contactPoints/ContactPointType.js")} ContactPointType
 * @typedef {import("../../../domain/contactPoints/ContactPointStatus.js")} ContactPointStatus
 * @typedef {import("../../../domain/addresses/AddressPurpose.js")} AddressPurpose
 * @typedef {import("../../../domain/addresses/AddressStatus.js")} AddressStatus
 */

/**
 * @typedef {Object} ContactPointDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} businessPartnerId
 * @property {ContactPointType} type
 * @property {string} value
 * @property {string | null} label
 * @property {ContactPointStatus} status
 * @property {boolean} isPrimary
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AddressDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} businessPartnerId
 * @property {AddressPurpose} purpose
 * @property {AddressStatus} status
 * @property {boolean} isPrimary
 * @property {string} street
 * @property {string | null} houseNumber
 * @property {string | null} houseNumberSuffix
 * @property {string | null} line2
 * @property {string | null} postalCode
 * @property {string} city
 * @property {string} countryCode
 * @property {string | null} attentionOf
 * @property {string | null} poBox
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CompanyDetailsDto
 * @property {string} legalName
 * @property {string | null} tradeName
 * @property {string | null} cocNumber
 * @property {string | null} vatNumber
 * @property {string | null} country
 * @property {string | null} currency
 */

/**
 * @typedef {Object} PersonDetailsDto
 * @property {string} givenName
 * @property {string | null} preferredName
 * @property {string | null} familyNamePrefix
 * @property {string} familyName
 * @property {string | null} suffix
 * @property {Gender} gender
 * @property {string | null} dateOfBirth   // ISO string or null
 * @property {string} sortKey
 */

/**
 * @typedef {Object} BusinessPartnerDto
 * @property {string} id
 * @property {string} tenantId
 * @property {BPType} type
 * @property {string} displayName
 * @property {BPStatus} status
 * @property {CompanyDetailsDto | null} companyDetails
 * @property {PersonDetailsDto | null} personDetails
 * @property {ContactPointDto[]} contactPoints
 * @property {AddressDto[]} addresses
 * @property {string | null} createdById
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateContactPointInput
 * @property {string} [id]
 * @property {ContactPointType} type
 * @property {string} value
 * @property {string | null} [label]
 * @property {ContactPointStatus} [status]
 */

/**
 * @typedef {Object} SetPrimaryContactPointInput
 * @property {string} [BPId]
 * @property {string} [CPId]
 * /

/**
 * @typedef {Object} CreateAddressInput
 * @property {string} [BPId]
 * @property {AddressPurpose} purpose
 * @property {string} [countryCode]
 * @property {string | null} [postalCode]
 * @property {string} [city]
 * @property {string} street
 * @property {string | null} houseNumber
 * @property {string | null} houseNumberSuffix
 * @property {string | null} [line2]
 * @property {string=} attentionOf
 * @property {string=} poBox
 * @property {AddressStatus} [status]
 */

/**
 * @typedef {Object} CreateCompanyBusinessPartnerRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {BPStatus} status
 * @property {string} legalName
 * @property {string | null} tradeName
 * @property {string | null} cocNumber
 * @property {string | null} vatNumber
 * @property {string | null} country
 * @property {string | null} currency
 * @property {CreateContactPointInput[]} contactPoints
 * @property {CreateAddressInput[]} addresses
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * @typedef {Object} CreatePersonBusinessPartnerRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {BPStatus} status
 * @property {string} givenName
 * @property {string | null} preferredName
 * @property {string | null} familyNamePrefix
 * @property {string} familyName
 * @property {string | null} suffix
 * @property {Gender} gender
 * @property {string | null} dateOfBirth   // ISO string or null
 * @property {CreateContactPointInput[]} contactPoints
 * @property {CreateAddressInput[]} addresses
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export {};
