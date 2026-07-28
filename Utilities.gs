/**
 * ============================================================
 * Utilities.gs
 * Version : 2.1.0
 * Company : TrueMeds
 * ============================================================
 */


/* ============================================================
 * SPREADSHEET HELPERS
 * ============================================================
 */

function getSpreadsheet() {

  return SpreadsheetApp.openById(APP.SPREADSHEET_ID);

}

function getSheet(sheetName) {

  const sheet = getSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {

    throw new Error("Sheet not found : " + sheetName);

  }

  return sheet;

}


/* ============================================================
 * DRIVE HELPERS
 * ============================================================
 */

function getUploadFolder(type) {

  type = safeString(type).toLowerCase();

  switch (type) {

    case "mandatory":

      return DriveApp.getFolderById(
        APP.DRIVE.MANDATORY_FOLDER_ID
      );

    case "optional":

      return DriveApp.getFolderById(
        APP.DRIVE.OPTIONAL_FOLDER_ID
      );

    default:

      throw new Error(
        "Unknown Upload Folder : " + type
      );

  }

}

function getLogoUrl() {

  return (
    "https://drive.google.com/thumbnail?id=" +
    APP.DRIVE.LOGO_FILE_ID +
    "&sz=w600"
  );

}


/* ============================================================
 * DATE & TIME HELPERS
 * ============================================================
 */

function now() {

  return new Date();

}

function getCurrentTimestamp() {

  return new Date();

}

function formatDate(value) {

  if (!value) {

    return "";

  }

  return Utilities.formatDate(

    new Date(value),

    APP.DATE.TIMEZONE,

    APP.DATE.FORMAT

  );

}


/* ============================================================
 * STRING HELPERS
 * ============================================================
 */

function safeString(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value).trim();

}

function isEmpty(value) {

  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );

}

function isNotEmpty(value) {

  return !isEmpty(value);

}

function sanitizeFileName(fileName) {

  if (isEmpty(fileName)) {

    return "";

  }

  return safeString(fileName)

    .replace(/[\\\/:*?"<>|]/g, "")

    .replace(/\s+/g, "_")

    .replace(/_+/g, "_");

}
/* ============================================================
 * RANDOM HELPERS
 * ============================================================
 */

function generateRandomNumber(length) {

  length = Number(length) || 5;

  const min = Math.pow(10, length - 1);

  const max = Math.pow(10, length) - 1;

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;

}


/* ============================================================
 * SUBMISSION ID GENERATOR
 * Format :
 * SUB_YYYYMMDD_12345
 * ============================================================
 */

function generateSubmissionId() {

  const datePart = Utilities.formatDate(

    new Date(),

    APP.DATE.TIMEZONE,

    "yyyyMMdd"

  );

  let submissionId = "";

  let exists = true;

  while (exists) {

    submissionId =

      APP.SUBMISSION.PREFIX +

      "_" +

      datePart +

      "_" +

      generateRandomNumber(

        APP.SUBMISSION.RANDOM_DIGITS

      );

    exists = findSubmissionById(submissionId) !== null;

  }

  return submissionId;

}


/* ============================================================
 * ORDER NUMBER HELPERS
 * ============================================================
 */

function validateOrderNumber(orderNumber) {

  orderNumber = safeString(orderNumber);

  if (isEmpty(orderNumber)) {

    throw new Error(
      "Order Number is required."
    );

  }

  if (
    orderNumber.length >
    APP.ORDER.MAX_LENGTH
  ) {

    throw new Error(
      "Order Number cannot exceed " +
      APP.ORDER.MAX_LENGTH +
      " characters."
    );

  }

  if (
    !APP.ORDER.REGEX.test(orderNumber)
  ) {

    throw new Error(
      "Order Number should not contain spaces or special characters."
    );

  }

  return orderNumber;

}


/* ============================================================
 * FILE LINK HELPERS
 * ============================================================
 */

function createFileHyperlink(url, text) {

  if (isEmpty(url)) {

    return "";

  }

  return SpreadsheetApp
    .newRichTextValue()
    .setText(text)
    .setLinkUrl(url)
    .build();

}

function mandatoryProofLink(url) {

  return createFileHyperlink(

    url,

    "👁 View Mandatory Proof"

  );

}

function optionalProofLink(url) {

  return createFileHyperlink(

    url,

    "👁 View Optional Proof"

  );

}


/* ============================================================
 * SESSION HELPERS
 * ============================================================
 */

function getSessionAge(loginTime) {

  if (!loginTime) {

    return Number.MAX_SAFE_INTEGER;

  }

  const diff =

    new Date().getTime() -

    new Date(loginTime).getTime();

  return diff / (1000 * 60 * 60);

}

function isSessionExpired(loginTime) {

  return (

    getSessionAge(loginTime) >=

    APP.SESSION_HOURS

  );

}
/* ============================================================
 * SUBMISSION SEARCH HELPERS
 * ============================================================
 */

function findSubmissionById(submissionId) {

  submissionId = safeString(submissionId);

  if (isEmpty(submissionId)) {

    return null;

  }

  const sheet = getSheet(APP.SHEETS.SUBMISSIONS);

  const values = sheet.getDataRange().getValues();

  const C = APP.COL.SUBMISSION;

  for (let i = 1; i < values.length; i++) {

    if (

      safeString(values[i][C.ID - 1]) ===

      submissionId

    ) {

      return {

        row: i + 1,

        values: values[i],

        submission: getSubmissionObject(values[i])

      };

    }

  }

  return null;

}


/* ============================================================
 * FIND BY ORDER NUMBER
 * ============================================================
 */

function findSubmissionByOrderNumber(orderNumber) {

  orderNumber = validateOrderNumber(orderNumber);

  const sheet = getSheet(APP.SHEETS.SUBMISSIONS);

  const values = sheet.getDataRange().getValues();

  const C = APP.COL.SUBMISSION;

  for (let i = 1; i < values.length; i++) {

    if (

      safeString(values[i][C.ORDER_NUMBER - 1]) ===

      orderNumber

    ) {

      return {

        row: i + 1,

        values: values[i],

        submission: getSubmissionObject(values[i])

      };

    }

  }

  return null;

}


/* ============================================================
 * DUPLICATE ORDER VALIDATION
 * ============================================================
 */

function validateDuplicateOrder(orderNumber) {

  const existing = findSubmissionByOrderNumber(orderNumber);

  if (!existing) {

    return;

  }

  const submission = existing.submission;

  if (

    submission.status === APP.STATUS.APPROVED ||

    submission.status === APP.STATUS.REJECTED

  ) {

    return;

  }

  throw new Error(

    "Please close previous Submission ID: " +

    submission.id +

    " created on " +

    formatDate(submission.timestamp)

  );

}


/* ============================================================
 * SUBMISSION OBJECT
 * ============================================================
 */

function getSubmissionObject(rowValues) {

  if (!rowValues) {

    return null;

  }

  const C = APP.COL.SUBMISSION;

  return {

    id: rowValues[C.ID - 1],

    timestamp: rowValues[C.TIMESTAMP - 1],

    username: rowValues[C.USERNAME - 1],

    riderName: rowValues[C.RIDER_NAME - 1],

    employeeId: rowValues[C.EMPLOYEE_ID - 1],

    zone: rowValues[C.ZONE - 1],

    warehouse: rowValues[C.WAREHOUSE - 1],

    lmHub: rowValues[C.LM_HUB - 1],

    orderNumber: rowValues[C.ORDER_NUMBER - 1],

    mandatoryProof: rowValues[C.MANDATORY_PROOF - 1],

    optionalProof: rowValues[C.OPTIONAL_PROOF - 1],

    reason: rowValues[C.REASON - 1],

    status: rowValues[C.STATUS - 1],

    assignedTo: rowValues[C.ASSIGNED_TO - 1],

    hubManagerRemarks: rowValues[C.HUB_MANAGER_REMARKS - 1],

    reviewedBy: rowValues[C.REVIEWED_BY - 1],

    reviewedOn: rowValues[C.REVIEWED_ON - 1],

    lastUpdated: rowValues[C.LAST_UPDATED - 1],

    reviewTime: rowValues[C.REVIEW_TIME - 1]

  };

}
/* ============================================================
 * FIND FIRST SUBMITTED REQUEST
 * ============================================================
 */

function findPendingSubmission() {

  const sheet = getSheet(APP.SHEETS.SUBMISSIONS);

  const values = sheet.getDataRange().getValues();

  const C = APP.COL.SUBMISSION;

  for (let i = 1; i < values.length; i++) {

    if (

      safeString(values[i][C.STATUS - 1]) ===

      APP.STATUS.SUBMITTED

    ) {

      return {

        row: i + 1,

        values: values[i],

        submission: getSubmissionObject(values[i])

      };

    }

  }

  return null;

}


/* ============================================================
 * FIND ASSIGNED REQUEST
 * ============================================================
 */

function findAssignedSubmission(employeeId) {

  employeeId = safeString(employeeId);

  if (isEmpty(employeeId)) {

    return null;

  }

  const sheet = getSheet(APP.SHEETS.SUBMISSIONS);

  const values = sheet.getDataRange().getValues();

  const C = APP.COL.SUBMISSION;

  for (let i = 1; i < values.length; i++) {

    if (

      safeString(values[i][C.ASSIGNED_TO - 1]) === employeeId &&

      safeString(values[i][C.STATUS - 1]) === APP.STATUS.UNDER_REVIEW

    ) {

      return {

        row: i + 1,

        values: values[i],

        submission: getSubmissionObject(values[i])

      };

    }

  }

  return null;

}


/* ============================================================
 * UPDATE SUBMISSION
 * ============================================================
 */

function updateSubmission(row, updates) {

  const sheet = getSheet(APP.SHEETS.SUBMISSIONS);

  const C = APP.COL.SUBMISSION;

  Object.keys(updates).forEach(function (key) {

    const column = C[key];

    if (column !== undefined) {

      sheet

        .getRange(row, column)

        .setValue(updates[key]);

    }

  });

  sheet

    .getRange(

      row,

      C.LAST_UPDATED

    )

    .setValue(getCurrentTimestamp());

}


/* ============================================================
 * CHECK USER ACCESS
 * ============================================================
 */

function canAccessSubmission(submission, user) {

  if (!submission || !user) {

    return false;

  }

  switch (safeString(user.accessScope)) {

    case APP.ACCESS_SCOPE.PAN_INDIA:

      return true;

    case APP.ACCESS_SCOPE.ZONE:

      return (

        safeString(submission.zone) ===

        safeString(user.zone)

      );

    case APP.ACCESS_SCOPE.WAREHOUSE:

      return (

        safeString(submission.warehouse) ===

        safeString(user.warehouse)

      );

    case APP.ACCESS_SCOPE.LM_HUB:

      return (

        safeString(submission.lmHub) ===

        safeString(user.lmHub)

      );

    default:

      return false;

  }

}


/* ============================================================
 * REVIEW VALIDATION
 * ============================================================
 */

function isSubmissionClosed(submission) {

  if (!submission) {

    return false;

  }

  return (

    submission.status === APP.STATUS.APPROVED ||

    submission.status === APP.STATUS.REJECTED

  );

}

function validateSubmissionEditable(submission) {

  if (isSubmissionClosed(submission)) {

    throw new Error(

      "This request has already been closed and cannot be modified."

    );

  }

}
/* ============================================================
 * REVIEW TIME HELPERS
 * ============================================================
 */

function getMinutesDifference(startTime, endTime) {

  if (!startTime || !endTime) {

    return 0;

  }

  const diff =

    new Date(endTime).getTime() -

    new Date(startTime).getTime();

  return Math.floor(diff / (1000 * 60));

}

function hasReviewTimedOut(lastUpdated) {

  if (!lastUpdated) {

    return false;

  }

  return (

    getMinutesDifference(

      lastUpdated,

      new Date()

    ) >= APP.REVIEW.LOCK_TIMEOUT_MINUTES

  );

}


/* ============================================================
 * AUTO RELEASE HELPERS
 * ============================================================
 */

function autoReleaseSubmission(row, submission) {

  if (!submission) {

    return false;

  }

  if (!APP.REVIEW.AUTO_RELEASE) {

    return false;

  }

  if (

    submission.status !==

    APP.STATUS.UNDER_REVIEW

  ) {

    return false;

  }

  if (

    !hasReviewTimedOut(

      submission.lastUpdated

    )

  ) {

    return false;

  }

  updateSubmission(row, {

    STATUS: APP.STATUS.SUBMITTED,

    ASSIGNED_TO: ""

  });

  if (

    typeof logAudit === "function"

  ) {

    logAudit({

      submissionId: submission.id,

      action: APP.AUDIT_ACTION.AUTO_RELEASE,

      module: APP.MODULE.REVIEW,

      oldStatus: APP.STATUS.UNDER_REVIEW,

      newStatus: APP.STATUS.SUBMITTED,

      remarks:

        "Auto released after timeout"

    });

  }

  return true;

}

function ensureAssignmentValid(record, employeeId) {

  if (!record) {

    throw new Error(

      "Submission not found."

    );

  }

  autoReleaseSubmission(

    record.row,

    record.submission

  );

  const latest = findSubmissionById(

    record.submission.id

  );

  if (!latest) {

    throw new Error(

      "Submission not found."

    );

  }

  if (

    latest.submission.status !==

    APP.STATUS.UNDER_REVIEW

  ) {

    throw new Error(

      "This request is no longer assigned to you. Please refresh and reopen the request."

    );

  }

  if (

    safeString(

      latest.submission.assignedTo

    ) !== safeString(employeeId)

  ) {

    throw new Error(

      "This request is no longer assigned to you. Please refresh and reopen the request."

    );

  }

  return latest;

}


/* ============================================================
 * REVIEW TIME
 * ============================================================
 */

function calculateReviewTime(startTime) {

  if (!startTime) {

    return "";

  }

  return (

    getMinutesDifference(

      startTime,

      new Date()

    ) + " Minutes"

  );

}


/* ============================================================
 * CONNECTION TEST
 * ============================================================
 */

function testConnections() {

  Logger.log(

    "Application : " +

    APP.NAME

  );

  Logger.log(

    "Version : " +

    APP.VERSION

  );

  Logger.log(

    "Spreadsheet : " +

    getSpreadsheet().getName()

  );

  Logger.log(

    "Mandatory Folder : " +

    getUploadFolder("mandatory").getName()

  );

  Logger.log(

    "Optional Folder : " +

    getUploadFolder("optional").getName()

  );

  Logger.log(

    "Current Timestamp : " +

    getCurrentTimestamp()

  );

}


/* ============================================================
 * SYSTEM TEST
 * ============================================================
 */

function testUtilities() {

  Logger.log(

    "Submission ID : " +

    generateSubmissionId()

  );

  Logger.log(

    "Timestamp : " +

    getCurrentTimestamp()

  );

  Logger.log(

    "Order Validation : " +

    validateOrderNumber("TM123456789")

  );

  Logger.log(

    "Session Expired : " +

    isSessionExpired(new Date())

  );

  Logger.log(

    "Utilities Loaded Successfully."

  );

}
