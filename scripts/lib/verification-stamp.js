"use strict";

/**
 * scripts/lib/verification-stamp.js
 *
 * Single policy for what an approval may stamp into models.verified /
 * models.verification_status. Shared by approveModel, approveModels and
 * approveStaged in src/app/admin/actions.ts so all approval paths converge.
 *
 * Rule: a DISPUTED status is a deliberate, documented curator decision
 * (rationale lives in curator_notes). Approving content — manual edits or
 * staged pipeline proposals — must never silently overturn it. The 2026-08-25
 * incident: one Approve click flipped DISPUTED -> LIKELY and re-listed a
 * card the catalog had deliberately withheld. Un-disputing goes through
 * overrideVerification, which requires a written reason and audits the act.
 *
 * @param {string|null|undefined} existingStatus - models.verification_status before approval
 * @param {boolean|null|undefined} existingVerified - models.verified before approval
 * @param {string} gateStatus - scoreModelPage gate result ('indexed' | 'thin' | ...)
 * @returns {{verified: boolean, verification_status: string, disputePreserved: boolean}}
 */
function resolveVerificationStamp(existingStatus, existingVerified, gateStatus) {
  if (existingStatus === "DISPUTED") {
    return {
      verified: Boolean(existingVerified),
      verification_status: "DISPUTED",
      disputePreserved: true,
    };
  }
  return {
    verified: gateStatus === "indexed",
    verification_status: gateStatus === "indexed" ? "VERIFIED" : "LIKELY",
    disputePreserved: false,
  };
}

module.exports = { resolveVerificationStamp };
