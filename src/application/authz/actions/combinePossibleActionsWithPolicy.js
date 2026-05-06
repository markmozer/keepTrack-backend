/**
 * File: keepTrack-backend/src/application/authz/actions/combinePossibleActionsWithPolicy.js
 */

/**
 * @typedef {Object} ActionPolicyEntry
 * @property {string} requiredAbility
 */

/**
 * @typedef {Object} CombinePossibleActionsWithAbilitiesInput
 * @property {Record<string, import("../../../domain/shared/decision/decision.js").DomainDecision>} possibleActions
 * @property {string[]} principalAbilities
 * @property {Record<string, ActionPolicyEntry>} actionAbilityMap
 */

/**
 * @param {CombinePossibleActionsWithAbilitiesInput} input
 */
export function combinePossibleActionsWithAbilities({
  possibleActions,
  principalAbilities,
  actionAbilityMap,
}) {
  return Object.fromEntries(
    Object.entries(possibleActions).map(([actionName, resourceDecision]) => {
      const requiredAbility = actionAbilityMap[actionName]?.requiredAbility;

      if (!requiredAbility) {
        return [
          actionName,
          {
            allowed: false,
            reason: "ACTION_HAS_NO_ABILITY_MAPPING",
          },
        ];
      }

      if (!principalAbilities.includes(requiredAbility)) {
        return [
          actionName,
          {
            allowed: false,
            reason: "PRINCIPAL_MISSING_ABILITY",
          },
        ];
      }

      return [
        actionName,
        {
          allowed: resourceDecision.allowed,
          reason: resourceDecision.reason,
        },
      ];
    }),
  );
}
