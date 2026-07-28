/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : Submission.gs
 * =====================================================
 */


/*=========================================================
  SAVE SUBMISSION
=========================================================*/

function saveSubmission(data) {

  try {

    if (!data) {

      throw new Error("No data received.");

    }

    const session = getCurrentUser();

    if (!session) {

      throw new Error(

        "Session Expired. Please login again."

      );

    }

    const orderNumber = validateOrderNumber(

      data.orderNumber

    );

    if (isEmpty(data.reason)) {

      throw new Error(

        "Reason is required."

      );

    }

    const reasons = getReasons();

const selectedReason = reasons.find(function (r) {

  return r.reason === data.reason;

});

const mandatoryRequired =

  selectedReason &&

  selectedReason.mandatory === "YES";

if (

  mandatoryRequired &&

  !data.mandatoryFile

) {

  throw new Error(

    "Mandatory proof is required."

  );

}

    validateDuplicateOrder(orderNumber);

    const submissionId = generateSubmissionId();

    const timeStamp = getCurrentTimestamp();

    let mandatoryLink = "";

    let optionalLink = "";

/* ==========================================
   MANDATORY FILE
========================================== */

if (mandatoryRequired) {

  const mandatoryUpload = uploadFile(

    data.mandatoryFile,

    "mandatory",

    session,

    orderNumber,

    data.reason

  );

  if (!mandatoryUpload.success) {

    throw new Error(

      mandatoryUpload.message

    );

  }

  mandatoryLink = mandatoryUpload.fileUrl;

}

    /* ==========================================
       OPTIONAL FILE
    ========================================== */

    if (data.optionalFile) {

      const optionalUpload = uploadFile(

        data.optionalFile,

        "optional",

        session,

        orderNumber,

        data.reason

      );

      if (!optionalUpload.success) {

        throw new Error(

          optionalUpload.message

        );

      }

      optionalLink = optionalUpload.fileUrl;

    }

    const sheet = getSheet(

      APP.SHEETS.SUBMISSIONS

    );
        const row = [

      submissionId,                               // 1 Submission ID

      timeStamp,                                  // 2 Timestamp

      session.username,                           // 3 Username

      session.riderName,                          // 4 Rider Name

      session.employeeId,                         // 5 Employee ID

      session.zone,                               // 6 Zone

      session.warehouse,                          // 7 Warehouse

      session.lmHub,                              // 8 LM Hub

      orderNumber,                                // 9 Order Number 
                                                   
      mandatoryLink,                              // 10 Mandatory Proof

      optionalLink,                               // 11 Optional Proof

      safeString(data.reason),                    // 12 Reason

      APP.STATUS.SUBMITTED,                       // 13 Status

      "",                                         // 14 Assigned To

      "",                                         // 15 Hub Manager Remarks

      "",                                         // 16 Reviewed By

      "",                                         // 17 Reviewed On

      timeStamp,                                  // 18 Last Updated

      ""                                          // 19 Review Time

    ];

    sheet.appendRow(row);

    const rowNumber = sheet.getLastRow();

if (mandatoryLink) {

  sheet

    .getRange(rowNumber, APP.COL.SUBMISSION.MANDATORY_PROOF)

    .setRichTextValue(

      mandatoryProofLink(mandatoryLink)

    );

}

if (optionalLink) {

  sheet

    .getRange(rowNumber, APP.COL.SUBMISSION.OPTIONAL_PROOF)

    .setRichTextValue(

      optionalProofLink(optionalLink)

    );

}

    logAudit({

      submissionId: submissionId,

      action: APP.AUDIT_ACTION.SUBMITTED,

      module: APP.MODULE.SUBMISSION,

      oldStatus: "",

      newStatus: APP.STATUS.SUBMITTED,

      performedBy: session.username,

      role: session.role,

      remarks: "Submission Created"

    });

    Logger.log(

      "Submission Saved : " +

      submissionId

    );

    return {

      success: true,

      submissionId: submissionId,

      message: "Submission saved successfully."

    };

  }

  catch (err) {

    Logger.log(err);

    return {

      success: false,

      message:

        err.message ||

        "Unable to save submission."

    };

  }

}


/*=========================================================
  GET MY SUBMISSIONS
=========================================================*/

function getMySubmissions() {

  try {

    Logger.log("===== getMySubmissions Started =====");

    const session = getCurrentUser();
    Logger.log("Session Username = " + session.username);

    Logger.log("Session Username : " + (session ? session.username : "NULL"));

    if (!session) {

      return [];

    }

    const sheet = getSheet(APP.SHEETS.SUBMISSIONS);

    const lastRow = sheet.getLastRow();

    Logger.log("Last Row : " + lastRow);

    if (lastRow < 2) {

      return [];

    }

    const values = sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        sheet.getLastColumn()
      )
      .getValues();

    const C = APP.COL.SUBMISSION;

    const list = [];

    values.forEach(function (row) {

      Logger.log(
        "Sheet Username = " +
        row[C.USERNAME - 1] +
        " | Session Username = " +
        session.username
      );

      if (

        safeString(row[C.USERNAME - 1]).toUpperCase() !==
        safeString(session.username).toUpperCase()

      ) {

        return;

      }

      list.push({

  submissionId: row[C.ID - 1],

  submittedOn: formatDate(row[C.TIMESTAMP - 1]),

  orderNumber: row[C.ORDER_NUMBER - 1],

  mandatoryProof: row[C.MANDATORY_PROOF - 1],

  optionalProof: row[C.OPTIONAL_PROOF - 1],

  reason: row[C.REASON - 1],

  status: row[C.STATUS - 1],

  assignedTo: row[C.ASSIGNED_TO - 1],

  managerRemarks: row[C.HUB_MANAGER_REMARKS - 1],

  reviewedBy: row[C.REVIEWED_BY - 1],

  reviewedOn: row[C.REVIEWED_ON - 1]
      ? formatDate(row[C.REVIEWED_ON - 1])
      : "",

  lastUpdated: row[C.LAST_UPDATED - 1]
      ? formatDate(row[C.LAST_UPDATED - 1])
      : ""

  // ❌ Temporarily remove reviewTime
});

    });

    Logger.log("Records Returned : " + list.length);
    Logger.log(JSON.stringify(list));
  return list;

  } catch (err) {

  Logger.log(err);

  throw err;

}

}
