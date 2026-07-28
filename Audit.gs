/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : Audit.gs
 * =====================================================
 */


/*=========================================================
  AUDIT LOGGER
=========================================================*/

function logAudit(audit) {

  try {

    if (!APP.AUDIT.ENABLED) {

      return {

        success: true,

        message: "Audit logging disabled."

      };

    }

    if (!audit || typeof audit !== "object") {

      return {

        success: false,

        message: "Invalid audit payload."

      };

    }

    const validActions = [

      APP.AUDIT_ACTION.SUBMITTED,

      APP.AUDIT_ACTION.ASSIGNED,

      APP.AUDIT_ACTION.APPROVED,

      APP.AUDIT_ACTION.REJECTED,

      APP.AUDIT_ACTION.AUTO_RELEASE

    ];

    if (

      validActions.indexOf(audit.action) === -1

    ) {

      return {

        success: false,

        message: "Invalid audit action."

      };

    }

    const sheet = getSheet(

      APP.SHEETS.AUDIT_LOGS

    );

    sheet.appendRow([

      getCurrentTimestamp(),

      safeString(audit.submissionId),

      safeString(audit.action),

      safeString(

        audit.module || APP.MODULE.REVIEW

      ),

      safeString(audit.oldStatus),

      safeString(audit.newStatus),

      safeString(audit.performedBy),

      safeString(audit.role),

      safeString(audit.remarks),

      APP.VERSION

    ]);

    return {

      success: true,

      message: "Audit log created."

    };

  }

  catch (err) {

    Logger.log(err);

    return {

      success: false,

      message: err.message

    };

  }

}
/*=========================================================
  GET AUDIT HISTORY
=========================================================*/

function getAuditHistory(submissionId) {

  try {

    const user = getCurrentUser();

    if (!user) {

      throw new Error(

        "Session Expired. Please login again."

      );

    }

    const submission = findSubmissionById(

      submissionId

    );

    if (!submission) {

      return {

        success: false,

        message: "Request not found.",

        data: []

      };

    }

    if (

      !canAccessSubmission(

        submission.submission,

        user

      )

    ) {

      return {

        success: false,

        message: "Unauthorized access.",

        data: []

      };

    }

    const sheet = getSheet(

      APP.SHEETS.AUDIT_LOGS

    );

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {

      return {

        success: true,

        data: []

      };

    }

    const values = sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        sheet.getLastColumn()

      )

      .getValues();

    const history = [];

    values.forEach(function (row) {

      if (

        safeString(row[1]) ===

        safeString(submissionId)

      ) {

        history.push({

          timestamp: formatDate(

            row[0]

          ),

          submissionId: row[1],

          action: row[2],

          module: row[3],

          oldStatus: row[4],

          newStatus: row[5],

          performedBy: row[6],

          role: row[7],

          remarks: row[8],

          version: row[9]

        });

      }

    });

    history.sort(function (a, b) {

      return (

        new Date(b.timestamp) -

        new Date(a.timestamp)

      );

    });

    return {

      success: true,

      data: history

    };

  }

  catch (err) {

    Logger.log(err);

    return {

      success: false,

      message: err.message,

      data: []

    };

  }

}
