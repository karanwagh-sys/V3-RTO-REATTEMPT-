/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : DashboardService.gs
 * =====================================================
 */


/*=========================================================
  DASHBOARD COUNTS
=========================================================*/

function getDashboardCounts() {

  try {

    const adminUser = getCurrentUser();

    if (!adminUser) {

      throw new Error(

        "Session Expired. Please login again."

      );

    }

    const sheet = getSheet(

      APP.SHEETS.SUBMISSIONS

    );

    const lastRow = sheet.getLastRow();

    const counts = {

      submitted: 0,

      pending: 0,

      review: 0,

      approved: 0,

      rejected: 0

    };

    if (lastRow < 2) {

      return {

        success: true,

        data: counts

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

    values.forEach(function (row, index) {

      const submission = getSubmissionObject(row);

      autoReleaseSubmission(

        index + 2,

        submission

      );

      const latest =

        findSubmissionById(

          submission.id

        );

      if (!latest) {

        return;

      }

      if (

        !canAccessSubmission(

          latest.submission,

          adminUser

        )

      ) {

        return;

      }

      switch (

        latest.submission.status

      ) {

        case APP.STATUS.SUBMITTED:

          counts.pending++;
          counts.submitted++;

          break;

        case APP.STATUS.UNDER_REVIEW:

          counts.review++;

          break;

        case APP.STATUS.APPROVED:

          counts.approved++;

          break;

        case APP.STATUS.REJECTED:

          counts.rejected++;

          break;

      }

    });

    return {

      success: true,

      data: counts

    };

  }

  catch (err) {

    Logger.log(err);

    return {

      success: false,

      message:

        err.message,

      data: {

        pending: 0,

        review: 0,

        approved: 0,

        rejected: 0

      }

    };

  }

}


/*=========================================================
  REFRESH DASHBOARD
=========================================================*/

function refreshDashboard() {

  return getDashboardCounts();

}
