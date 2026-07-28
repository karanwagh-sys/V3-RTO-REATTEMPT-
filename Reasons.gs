function getReasons() {

  Logger.log("getReasons() called");

  try {

    const sheet = getSheet(APP.SHEETS.REASONS);

    Logger.log("Sheet Name = " + APP.SHEETS.REASONS);

    const lastRow = sheet.getLastRow();

    Logger.log("Last Row = " + lastRow);

    if (lastRow < 2) {

      Logger.log("No Reasons Found");

      return [];

    }

    const values = sheet
      .getRange(2, 1, lastRow - 1, 3)
      .getValues();

    Logger.log(JSON.stringify(values));

    const reasons = [];

    values.forEach(function(row) {

      const reason = String(row[0] || "").trim();

      const active = row[1];

      const mandatory = String(row[2] || "").trim();

      if (!reason) return;

      const isActive =
        active === true ||
        String(active).toUpperCase() === "TRUE";

      if (!isActive) return;

      reasons.push({

        reason: reason,

        mandatory: mandatory.toUpperCase()

      });

    });

    Logger.log(JSON.stringify(reasons));

    return reasons;

  } catch(err) {

    Logger.log(err);

    return [];

  }

}
