/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.0.0
 * File    : Messages.gs
 * =====================================================
 */

const MSG = {

  /*=====================================================
    LOGIN
  =====================================================*/

  LOGIN_SUCCESS: "Login successful.",
  LOGIN_FAILED: "Invalid username or password.",
  ACCOUNT_LOCKED: "Your account has been locked.",
  SESSION_EXPIRED: "Your session has expired.",
  UNAUTHORIZED: "Unauthorized access.",

  /*=====================================================
    SUBMISSION
  =====================================================*/

  SUBMISSION_SUCCESS: "Submission submitted successfully.",
  SUBMISSION_FAILED: "Unable to submit request.",
  INVALID_ORDER: "Invalid Order Number.",
  INVALID_REASON: "Please select a valid reason.",
  MANDATORY_PROOF_REQUIRED: "Mandatory proof is required.",

  /*=====================================================
    REVIEW
  =====================================================*/

  REQUEST_FOUND: "Request found.",

  REQUEST_NOT_FOUND: "Submission not found.",

  REQUEST_NOT_AVAILABLE: "Request is no longer available.",

  REQUEST_ALREADY_ASSIGNED:
      "Request is already assigned to another manager.",

  REQUEST_ASSIGNED:
      "Request assigned successfully.",

  REQUEST_APPROVED:
      "Request approved successfully.",

  REQUEST_REJECTED:
      "Request rejected successfully.",

  REQUEST_UNLOCKED:
      "Request unlocked successfully.",

  NO_PENDING_REQUEST:
      "No pending requests available.",

  UNAUTHORIZED_ACCESS:
      "You are not authorized to review this request.",

  /*=====================================================
    FILE
  =====================================================*/

  FILE_UPLOAD_SUCCESS: "File uploaded successfully.",

  FILE_UPLOAD_FAILED: "Unable to upload file.",

  FILE_TOO_LARGE: "File size exceeds limit.",

  INVALID_FILE_TYPE: "Unsupported file type.",

  /*=====================================================
    SYSTEM
  =====================================================*/

  SAVE_SUCCESS: "Saved successfully.",

  UPDATE_SUCCESS: "Updated successfully.",

  DELETE_SUCCESS: "Deleted successfully.",

  DATA_NOT_FOUND: "Data not found.",

  SOMETHING_WENT_WRONG:
      "Something went wrong. Please try again."

};
