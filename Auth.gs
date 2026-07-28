/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : Auth.gs
 * =====================================================
 */


/*=========================================================
  AUTHENTICATE USER
=========================================================*/

function authenticateUser(username, password) {

  try {

    username = safeString(username).toLowerCase();

    password = String(password || "");

    if (isEmpty(username) || isEmpty(password)) {

      return {

        success: false,

        message: "Username and Password are required."

      };

    }

    const sheet = getSheet(APP.SHEETS.USERS);

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {

      const row = data[i];

      const user = {

        row: i + 1,

        username: safeString(row[0]),

        password: String(row[1]),

        riderName: safeString(row[2]),

        employeeId: safeString(row[3]),

        zone: safeString(row[4]),

        warehouse: safeString(row[5]),

        lmHub: safeString(row[6]),

        status: safeString(row[7]),

        failedAttempts: Number(row[8] || 0),

        locked: safeString(row[9]),

        role: safeString(row[10]),

        accessScope: safeString(row[11])

      };

      if (

        user.username.toLowerCase() !== username

      ) {

        continue;

      }

      /* ==========================================
       * USER STATUS VALIDATION
       * ========================================== */

      if (

        user.status.toLowerCase() !== "active"

      ) {

        writeLoginLog(

          user.username,

          "LOGIN_FAILED",

          "Inactive User"

        );

        return {

          success: false,

          message: "User is inactive."

        };

      }

      /* ==========================================
       * ACCOUNT LOCK VALIDATION
       * ========================================== */

      if (

        user.locked.toLowerCase() === "yes"

      ) {

        writeLoginLog(

          user.username,

          "LOGIN_FAILED",

          "Account Locked"

        );

        return {

          success: false,

          message: "Account locked. Contact Administrator."

        };

      }

      /* ==========================================
       * PASSWORD VALIDATION
       * ========================================== */

      if (

        user.password !== password

      ) {

        const attempts = user.failedAttempts + 1;

        sheet

          .getRange(user.row, 9)

          .setValue(attempts);

        if (

          attempts >= APP.MAX_LOGIN_ATTEMPTS

        ) {

          sheet

            .getRange(user.row, 10)

            .setValue("Yes");

          writeLoginLog(

            user.username,

            "LOGIN_FAILED",

            "Account Locked"

          );

          return {

            success: false,

            message:

              "Account locked after " +

              APP.MAX_LOGIN_ATTEMPTS +

              " failed attempts."

          };

        }

        writeLoginLog(

          user.username,

          "LOGIN_FAILED",

          "Wrong Password"

        );

        return {

          success: false,

          message:

            "Wrong Password. Remaining Attempts : " +

            (APP.MAX_LOGIN_ATTEMPTS - attempts)

        };

      }

      /* ==========================================
       * PASSWORD VERIFIED
       * RESET FAILED ATTEMPTS
       * ========================================== */

      sheet

        .getRange(user.row, 9)

        .setValue(0);
              /* ==========================================
       * SUCCESSFUL LOGIN
       * ========================================== */

      const session = {

        username: user.username,

        riderName: user.riderName,

        employeeId: user.employeeId,

        zone: user.zone,

        warehouse: user.warehouse,

        lmHub: user.lmHub,

        role: user.role,

        accessScope: user.accessScope,

        loginTime: new Date().toISOString()

      };

      PropertiesService

        .getUserProperties()

        .setProperty(

          APP.SESSION.PROPERTY_NAME,

          JSON.stringify(session)

        );

      writeLoginLog(

        user.username,

        APP.AUDIT_ACTION.LOGIN_SUCCESS,

        "Login Successful"

      );

      return {

        success: true,

        message: "Login Successful",

        user: session

      };

    }

    writeLoginLog(

      username,

      APP.AUDIT_ACTION.LOGIN_FAILED,

      "User Not Found"

    );

    return {

      success: false,

      message: "User not found."

    };

  }

  catch (err) {

    Logger.log(err);

    return {

      success: false,

      message: err.message || err.toString()

    };

  }

}


/*=========================================================
  GET CURRENT USER SESSION
=========================================================*/

function getCurrentUser() {

  const value = PropertiesService

    .getUserProperties()

    .getProperty(APP.SESSION.PROPERTY_NAME);

  if (!value) {

    return null;

  }

  const session = JSON.parse(value);

  if (

    isSessionExpired(session.loginTime)

  ) {

    logoutUser();

    throw new Error(

      "Session Expired. Please login again."

    );

  }

  return session;

}

/*=========================================================
  CHECK LOGIN
=========================================================*/

function isUserLoggedIn() {

  try {

    return getCurrentUser() !== null;

  }

  catch (e) {

    return false;

  }

}


/*=========================================================
  LOGOUT USER
=========================================================*/

function logoutUser() {

  const property =

    PropertiesService

      .getUserProperties();

  const value = property.getProperty(

    APP.SESSION.PROPERTY_NAME

  );

  if (value) {

    const session = JSON.parse(value);

    writeLoginLog(

      session.username,

      APP.AUDIT_ACTION.LOGOUT,

      "Logout Successful"

    );

  }

  property.deleteProperty(

    APP.SESSION.PROPERTY_NAME

  );

  return {

    success: true,

    message: "Logged out successfully."

  };

}


/*=========================================================
  LOGIN LOG WRITER
=========================================================*/

function writeLoginLog(username, action, remarks) {

  const sheet = getSheet(

    APP.SHEETS.LOGS

  );

  sheet.appendRow([

    getCurrentTimestamp(),

    safeString(username),

    safeString(action),

    safeString(remarks)

  ]);

}


/*=========================================================
  TEST LOGIN
=========================================================*/

function testLogin() {

  const response = authenticateUser(

    "Kartik",

    "12345"

  );

  Logger.log(

    JSON.stringify(

      response,

      null,

      2

    )

  );

}
