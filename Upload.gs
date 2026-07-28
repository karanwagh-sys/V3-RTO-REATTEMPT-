/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : Upload.gs
 * =====================================================
 */


/*=========================================================
  UPLOAD FILE TO GOOGLE DRIVE
=========================================================*/

function uploadFile(fileObject, type, user, orderNumber, reason) {

  try {

    if (!fileObject) {

      return {

        success: false,

        message: "No file received."

      };

    }

    if (

      !APP.FILE.ALLOWED_TYPES.includes(

        fileObject.mimeType

      )

    ) {

      return {

        success: false,

        message: "Unsupported file type."

      };

    }

    const fileSizeMB =

      Utilities.base64Decode(fileObject.data).length /

      (1024 * 1024);

    if (

      fileSizeMB >

      APP.FILE.MAX_SIZE_MB

    ) {

      return {

        success: false,

        message:

          "Maximum allowed file size is " +

          APP.FILE.MAX_SIZE_MB +

          " MB."

      };

    }

    const folder = getUploadFolder(type);

    const now = new Date();

    const timeStamp = Utilities.formatDate(

      now,

      APP.DATE.TIMEZONE,

      "yyyyMMdd_HHmmss"

    );

    let extension = "";

    if (

      fileObject.fileName &&

      fileObject.fileName.indexOf(".") > -1

    ) {

      extension =

        fileObject.fileName

          .split(".")

          .pop()

          .toLowerCase();

    }

    else {

      extension =

        fileObject.mimeType

          .split("/")

          .pop()

          .toLowerCase();

    }

    const fileName =

      user.employeeId +

      "_" +

      sanitizeFileName(orderNumber) +

      "_" +

      sanitizeFileName(reason) +

      "_" +

      timeStamp +

      "_" +

      type +

      "." +

      extension;

    const blob = Utilities.newBlob(

      Utilities.base64Decode(fileObject.data),

      fileObject.mimeType,

      fileName

    );

    const file = folder.createFile(blob);

    try {

      file.setSharing(

        DriveApp.Access.ANYONE_WITH_LINK,

        DriveApp.Permission.VIEW

      );

    }

    catch (shareErr) {

      Logger.log(

        "Sharing Warning : " +

        shareErr.message

      );

    }

    file.setDescription(

      "Order Number : " +

      orderNumber +

      "\n" +

      "Employee ID : " +

      user.employeeId +

      "\n" +

      "Rider Name : " +

      user.riderName +

      "\n" +

      "Reason : " +

      reason +

      "\n" +

      "File Type : " +

      type +

      "\n" +

      "Uploaded On : " +

      Utilities.formatDate(

        now,

        APP.DATE.TIMEZONE,

        APP.DATE.FORMAT

      )

    );

    Logger.log(

      "Uploaded Successfully : " +

      file.getName()

    );

    return {

      success: true,

      fileId: file.getId(),

      fileName: file.getName(),

      fileUrl:

        "https://drive.google.com/file/d/" +

        file.getId() +

        "/preview",

      driveUrl: file.getUrl()

    };

  }

  catch (err) {

    Logger.log(

      "Upload Error : " +

      err

    );

    return {

      success: false,

      message:

        err.message ||

        "File upload failed."

    };

  }

}
