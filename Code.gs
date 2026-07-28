/**
 * =====================================================
 * Code.gs
 * =====================================================
 */

function doGet() {

  return HtmlService
    .createTemplateFromFile("Index")
    .evaluate()
    .setTitle(APP.NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

}

function include(filename){

  return HtmlService
      .createHtmlOutputFromFile(filename)
      .getContent();

}
