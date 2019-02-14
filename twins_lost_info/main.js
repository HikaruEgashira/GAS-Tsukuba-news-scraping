function scraping() {
  // POSTデータ
  var NAME = PropertiesService.getScriptProperties().getProperty("userName");
  var PASSWORD = PropertiesService.getScriptProperties().getProperty("password");

  // POSTオプション
  var options = {
    method : "post",
    followRedirects: false,
    contentType: "application/x-www-form-urlencoded",
    payload : {
      userName: NAME,
      password: PASSWORD,
      wfId: "nwf_PTW0000002_login",
      locale: "ja_JP",
      action: "rwf",
      tabId: "home"
    }
  };

  // アクセス先（http headerなどでPOSTのURLなどを調べる）
  var LOGIN_URL = "https://twins.tsukuba.ac.jp/campusweb/campusportal.do"
  // ログイン
  var response = UrlFetchApp.fetch(LOGIN_URL, options);

  // レスポンスヘッダーからcookieを取得
  var headers = response.getAllHeaders();
  var cookies = [];
  if ( typeof headers['Set-Cookie'] !== 'undefined' ) {
    // Set-Cookieヘッダーが2つ以上の場合はheaders['Set-Cookie']の中身は配列
    var cookies = typeof headers['Set-Cookie'] == 'string' ? [ headers['Set-Cookie'] ] : headers['Set-Cookie'];
    for (var i = 0; i < cookies.length; i++) {
      // Set-Cookieヘッダーからname=valueだけ取り出し、セミコロン以降の属性は除外する
      cookies[i] = cookies[i].split( ';' )[0];
    };
  }

  var responseCode = response.getResponseCode();

  if (responseCode === 200) {
    var topUrl = "https://twins.tsukuba.ac.jp/campusweb/campussquare.do?_flowId=KJW0001100-flow&_campus_new_portal=true&_action_id=referPortletRequest&keijitype=4&genrecd=8";

    // ログインで認証されたcookieはヘッダーで使用
    var options = {
      method: "get",
      followRedirects: true,
      contentType: "text/html;charset=UTF-8",
      muteHttpExceptions: true,
      headers: {
        Cookie: cookies.join(';')
      }
    };

    var response = UrlFetchApp.fetch(topUrl, options);
    var content = response.getContentText("UTF-8");

    var regexp = /seqNo=([\s\S]*?)">/;
    var num = content.match(regexp)[1];

    var info = "https://twins.tsukuba.ac.jp/campusweb/campussquare.do?_flowId=KJW0001100-flow&_campus_new_portal=true&_action_id=displayPortletRequest&keijitype=4&genrecd=8&seqNo=" + num
    var response = UrlFetchApp
      .fetch(info, options)
      .getContentText("UTF-8");

    var regexp = /【拾得場所】([\s\S]*?)<BR>/;
    var location = response.match(regexp)[1];

    var regexp = /物】([\s\S]*?)<BR>/;
    var item = response.match(regexp)[1];

    var regexp = /<td height="25">([\s\S]*?) /;
    var now = response.match(regexp);
    
    var regexp = /掲載日時／([\s\S]*?)<\/td>/;
    var time = response.match(regexp)[1];
    
    Logger.log(time + ": " + location + "で" + item + "を拾得。現在" + now + "で保管してあります");

  } else {
    console.log(Utilities.formatString("Request failed. Expected 200, got %d: %s", responseCode, responseBody));
    // 例外処理
  }
}
