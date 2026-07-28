/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : ReviewService.gs
 * =====================================================
 */


/*=========================================================
  APPROVE REQUEST
=========================================================*/

function approveRequest(submissionId, remarks) {

  return performReview(

    submissionId,

    APP.STATUS.APPROVED,

    remarks

  );

}


/*=========================================================
  REJECT REQUEST
=========================================================*/

function rejectRequest(submissionId, remarks) {

  return performReview(

    submissionId,

    APP.STATUS.REJECTED,

    remarks

  );

}


/*=========================================================
  PRIVATE REVIEW ENGINE
=========================================================*/

function performReview(

  submissionId,

  newStatus,

  remarks

) {

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(30000);

    const adminUser = getCurrentUser();

    if (!adminUser) {

      throw new Error(

        "Session Expired. Please login again."

      );

    }

    remarks = safeString(remarks);

    if (remarks === "") {

      return {

        success: false,

        message:

          "Remarks are mandatory."

      };

    }

    const record = findSubmissionById(

      submissionId

    );

    if (!record) {

      return {

        success: false,

        message:

          "Request not found."

      };

    }

    const submission = record.submission;

    if (

      !canAccessSubmission(

        submission,

        adminUser

      )

    ) {

      return {

        success: false,

        message:

          "Unauthorized access."

      };

    }

    autoReleaseSubmission(

      record.row,

      submission

    );

    const latest = findSubmissionById(

      submissionId

    );

    if (!latest) {

      return {

        success: false,

        message:

          "Request not found."

      };

    }

    const current = latest.submission;
        if (

      current.status !==

      APP.STATUS.UNDER_REVIEW

    ) {

      return {

        success: false,

        message:

          "This request is no longer under review."

      };

    }

    if (

      safeString(

        current.assignedTo

      ) !== adminUser.username

    ) {

      return {

        success: false,

        message:

          "This request is assigned to another reviewer."

      };

    }

    const completedOn = getCurrentTimestamp();

    updateSubmission(

      latest.row,

      {

        STATUS:

          newStatus,

        HUB_MANAGER_REMARKS:

          remarks,

        REVIEWED_BY:

          adminUser.username,

        REVIEWED_ON:

          completedOn,

        LAST_UPDATED:

          completedOn

      }

    );

    logAudit({

      submissionId:

        current.id,

      action:

        newStatus === APP.STATUS.APPROVED

          ? APP.AUDIT_ACTION.APPROVED

          : APP.AUDIT_ACTION.REJECTED,

      module:

        APP.MODULE.REVIEW,

      oldStatus:

        APP.STATUS.UNDER_REVIEW,

      newStatus:

        newStatus,

      performedBy:

        adminUser.username,

      role:

        adminUser.role,

      remarks:

        remarks

    });

    return {

      success: true,

      message:

        newStatus === APP.STATUS.APPROVED

          ? "Request approved successfully."

          : "Request rejected successfully."

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
