/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : Assignment.gs
 * =====================================================
 */


/*=========================================================
  ASSIGN NEXT REQUEST
=========================================================*/

function assignRequest() {

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(30000);

    const adminUser = getCurrentUser();

    if (!adminUser) {

      throw new Error(

        "Session Expired. Please login again."

      );

    }

    const pending = findPendingSubmission();

    if (!pending) {

      return {

        success: false,

        message: "No pending requests available."

      };

    }

    if (

      !canAccessSubmission(

        pending.submission,

        adminUser

      )

    ) {

      return {

        success: false,

        message:

          "No pending requests available."

      };

    }

    updateSubmission(

      pending.row,

      {

        STATUS:

          APP.STATUS.UNDER_REVIEW,

        ASSIGNED_TO:

          adminUser.username,

        REVIEW_TIME:

          getCurrentTimestamp()

      }

    );

    logAudit({

      submissionId:

        pending.submission.id,

      action:

        APP.AUDIT_ACTION.ASSIGNED,

      module:

        APP.MODULE.ASSIGNMENT,

      oldStatus:

        APP.STATUS.SUBMITTED,

      newStatus:

        APP.STATUS.UNDER_REVIEW,

      performedBy:

        adminUser.username,

      role:

        adminUser.role,

      remarks:

        "Request assigned."

    });

    return {

      success: true,

      message:

        "Request assigned successfully.",

      submissionId:

        pending.submission.id

    };

  }

  catch (err) {

    Logger.log(err);

    return {

      success: false,

      message:

        err.message

    };

  }

  finally {

    lock.releaseLock();

  }

}
/*=========================================================
  GET ASSIGNED REQUEST
=========================================================*/

function getAssignedRequest() {

  try {

    const adminUser = getCurrentUser();

    if (!adminUser) {

      throw new Error(

        "Session Expired. Please login again."

      );

    }

    const assigned = findAssignedSubmission(

      adminUser.username

    );

    if (!assigned) {

      return {

        success: false,

        message: "No request assigned."

      };

    }

    autoReleaseSubmission(

      assigned.row,

      assigned.submission

    );

    const latest = findSubmissionById(

      assigned.submission.id

    );

    if (!latest) {

      return {

        success: false,

        message: "Request not found."

      };

    }

    if (

      latest.submission.status !==

      APP.STATUS.UNDER_REVIEW

    ) {

      return {

        success: false,

        message:

          "Assignment expired. Please assign a new request."

      };

    }

    if (

      safeString(

        latest.submission.assignedTo

      ) !== adminUser.username

    ) {

      return {

        success: false,

        message:

          "Assignment expired. Please assign a new request."

      };

    }

    if (

      !canAccessSubmission(

        latest.submission,

        adminUser

      )

    ) {

      return {

        success: false,

        message:

          "Unauthorized access."

      };

    }

    return {

      success: true,

      data: {

        submissionId:

          latest.submission.id,

        submittedOn:

          formatDate(

            latest.submission.timestamp

          ),

        username:

          latest.submission.username,

        riderName:

          latest.submission.riderName,

        employeeId:

          latest.submission.employeeId,

        zone:

          latest.submission.zone,

        warehouse:

          latest.submission.warehouse,

        lmHub:

          latest.submission.lmHub,

        orderNumber:

          latest.submission.orderNumber,

        mandatoryProof:

          latest.submission.mandatoryProof,

        optionalProof:

          latest.submission.optionalProof,

        reason:

          latest.submission.reason,

        status:

          latest.submission.status,

        assignedTo:

          latest.submission.assignedTo,

        reviewTime:

          latest.submission.reviewTime

      }

    };

  }

  catch (err) {

    Logger.log(err);

    return {

      success: false,

      message:

        err.message

    };

  }

}
