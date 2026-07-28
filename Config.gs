/**
 * =====================================================
 * RTO & Reattempt Portal
 * Company : TrueMeds
 * Version : 2.1.0
 * File    : Config.gs
 * =====================================================
 */

const APP = {

  // =====================================================
  // APPLICATION
  // =====================================================

  NAME: "RTO & Reattempt Portal",

  COMPANY: "TrueMeds",

  VERSION: "2.1.0",

  SESSION_HOURS: 12,

  MAX_LOGIN_ATTEMPTS: 3,



  // =====================================================
  // SPREADSHEET
  // =====================================================

  SPREADSHEET_ID: "1Vw7qJ-cHXiB62IEaEznmRU0md0JJqnVWGLsrFtLdzkQ",



  // =====================================================
  // GOOGLE DRIVE
  // =====================================================

  DRIVE: {

    ROOT_FOLDER_ID: "1IGAkKJrLi1LEGhLFWqdX8R9Ywju5g3q9",

    LOGO_FILE_ID: "1BeVMVO-0efBXui7Xc5M3LQD2G3fzPSfH",

    MANDATORY_FOLDER_ID: "1yubJWOfznR7m8-hMu1cmDWAbja2c22Bp",

    OPTIONAL_FOLDER_ID: "1Z0f8F0efLaKGlWIUDPFQ7_A04HGNkL4Y"

  },



  // =====================================================
  // SHEET NAMES
  // =====================================================

  SHEETS: {

    USERS: "Users",

    REASONS: "Reasons",

    SUBMISSIONS: "Submissions",

    SETTINGS: "Settings",

    LOGS: "Logs",

    AUDIT_LOGS: "AuditLogs"

  },



  // =====================================================
  // USER ROLES
  // =====================================================

  ROLE: Object.freeze({

    ADMIN: "Admin",

    RIDER: "Rider",

    SYSTEM: "System"

  }),



  // =====================================================
  // ACCESS SCOPE
  // =====================================================

  ACCESS_SCOPE: Object.freeze({

    PAN_INDIA: "Pan India",

    ZONE: "Zone",

    WAREHOUSE: "Warehouse",

    LM_HUB: "LM Hub"

  }),



  // =====================================================
  // MODULES
  // =====================================================

  MODULE: Object.freeze({

    AUTH: "Authentication",

    SUBMISSION: "Submission",

    ASSIGNMENT: "Assignment",

    REVIEW: "Review",

    UPLOAD: "Upload",

    SYSTEM: "System"

  }),



  // =====================================================
  // SUBMISSION STATUS
  // =====================================================

  STATUS: Object.freeze({

    SUBMITTED: "Submitted",

    UNDER_REVIEW: "Under Review",

    APPROVED: "Approved",

    REJECTED: "Rejected"

  }),



  // =====================================================
  // SUBMISSION SETTINGS
  // =====================================================

  SUBMISSION: {

    PREFIX: "SUB",

    RANDOM_DIGITS: 5,

    ALLOW_DUPLICATE_IF_STATUS: [

      "Approved",

      "Rejected"

    ]

  },



  // =====================================================
  // AUDIT ACTIONS
  // =====================================================

  AUDIT_ACTION: Object.freeze({

    SUBMITTED: "SUBMITTED",

    ASSIGNED: "ASSIGNED",

    APPROVED: "APPROVED",

    REJECTED: "REJECTED",

    AUTO_RELEASE: "AUTO_RELEASE",

    LOGIN_SUCCESS: "LOGIN_SUCCESS",

    LOGIN_FAILED: "LOGIN_FAILED",

    LOGOUT: "LOGOUT"

  }),



  // =====================================================
  // COLUMN INDEXES
  // =====================================================

  COL: {

    SUBMISSION: {

      ID: 1,

      TIMESTAMP: 2,

      USERNAME: 3,

      RIDER_NAME: 4,

      EMPLOYEE_ID: 5,

      ZONE: 6,

      WAREHOUSE: 7,

      LM_HUB: 8,

      ORDER_NUMBER: 9,

      MANDATORY_PROOF: 10,

      OPTIONAL_PROOF: 11,

      REASON: 12,

      STATUS: 13,

      ASSIGNED_TO: 14,

      HUB_MANAGER_REMARKS: 15,

      REVIEWED_BY: 16,

      REVIEWED_ON: 17,

      LAST_UPDATED: 18,

      REVIEW_TIME: 19

    },

    AUDIT: {

      TIMESTAMP: 1,

      SUBMISSION_ID: 2,

      ACTION: 3,

      MODULE: 4,

      OLD_STATUS: 5,

      NEW_STATUS: 6,

      PERFORMED_BY: 7,

      ROLE: 8,

      REMARKS: 9,

      VERSION: 10

    }

  },



  // =====================================================
  // REVIEW SETTINGS
  // =====================================================

  REVIEW: {

    LOCK_TIMEOUT_MINUTES: 10,

    AUTO_RELEASE: true

  },



  // =====================================================
  // AUDIT SETTINGS
  // =====================================================

  AUDIT: {

    ENABLED: true,

    ARCHIVE_AFTER_ROWS: 5000,

    ARCHIVE_AFTER_DAYS: 90

  },



  // =====================================================
  // DATE & TIME
  // =====================================================

  DATE: {

    TIMEZONE: Session.getScriptTimeZone(),

    FORMAT: "dd/MM/yyyy HH:mm:ss"

  },



  // =====================================================
  // DASHBOARD SETTINGS
  // =====================================================

  DASHBOARD: {

    RECENT_REQUEST_LIMIT: 20

  },



  DASHBOARD_STATUS: {

    RIDER: [

      "Submitted",

      "Under Review",

      "Approved",

      "Rejected"

    ],

    ADMIN: [

      "Submitted",

      "Under Review",

      "Approved",

      "Rejected"

    ]

  },



  // =====================================================
  // FILE SETTINGS
  // =====================================================

  FILE: {

    MAX_SIZE_MB: 20,

    MAX_FILES: {

      MANDATORY: 1,

      OPTIONAL: 1

    },

    ALLOWED_TYPES: [

      "image/jpeg",

      "image/png",

      "image/jpg",

      "application/pdf",

      "audio/mpeg",

      "audio/mp3",

      "audio/wav",

      "video/mp4",

      "video/quicktime"

    ]

  },



  // =====================================================
  // ORDER NUMBER
  // =====================================================

  ORDER: {

    MAX_LENGTH: 25,

    REGEX: /^[A-Za-z0-9]+$/

  },



  // =====================================================
  // LOGOUT
  // =====================================================

  LOGOUT: {

    REDIRECT_PAGE: "login",

    CLEAR_SESSION: true

  },



  // =====================================================
  // SESSION
  // =====================================================

  SESSION: {

    PROPERTY_NAME: "USER_SESSION"

  }

};
