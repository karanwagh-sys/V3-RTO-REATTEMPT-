/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.0.0
 * File    : Admin.gs
 * =====================================================
 */


/*=========================================================
  CHECK ADMIN ACCESS
=========================================================*/

function getAdminScope(user) {

  if (!user) {

    throw new Error("Invalid User.");

  }

  if (user.role !== APP.ROLE.ADMIN) {

    throw new Error("Access Denied.");

  }

  return {

    scope: user.accessScope,

    zone: user.zone,

    warehouse: user.warehouse,

    lmHub: user.lmHub

  };

}


/*=========================================================
  GET PENDING REQUESTS
=========================================================*/

function getPendingRequests(user) {

  try {

    getAdminScope(user);

    const sheet = getSheet(APP.SHEETS.SUBMISSIONS);

    const lastRow = sheet.getLastRow();

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

    const requests = [];

    values.forEach(function (row) {

      const submission = getSubmissionObject(row);

      if (submission.status !== APP.STATUS.SUBMITTED) {

        return;

      }

      if (!canAccessSubmission(submission, user)) {

        return;

      }

      requests.push(submission);

    });

    requests.sort(function (a, b) {

      return new Date(b.timestamp) - new Date(a.timestamp);

    });

    return requests;

  }

  catch (err) {

    Logger.log(err);

    return [];

  }

}
