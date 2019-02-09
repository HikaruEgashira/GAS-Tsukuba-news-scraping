function main() {
  var BASE_URL = "http://www.tsukuba.ac.jp/attention-research";
  var regexp = /_icon">([\s\S]*?)<\/li>/;
  var response = UrlFetchApp
    .fetch(BASE_URL)
    .getContentText("UTF-8")
    .match(regexp)[1];

  var regexp = /">([\s\S]*?)<\/a>/;
  var contents = response.match(regexp)[1];

  var regexp = /<a href="([\s\S]*?)">/;
  var url = response.match(regexp)[1];

  var regexp = /\d\d\d\d\/\d\d\/\d\d/;
  var date = response.match(regexp)[0];
  var today = Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd");

  if (date == today) {
    sendIFTTTWebHook("news", contents, url, date);
  }
}

function test() {
  sendIFTTTWebHook("news", "テスト", "with gas");
}

function sendIFTTTWebHook(endpoint, contents, url, date) {
  var message = {
    "value1":contents,
    "value2":url,
    "value3":date
  };

  var options = {
    "method":"POST",
    "headers": {
      "Content-Type":"application/json"
    },
    "payload":JSON.stringify(message)
  };

  UrlFetchApp.fetch("https://maker.ifttt.com/trigger/" + endpoint + "/with/key/xxx", options)
}