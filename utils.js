exports.createToken = function () {
    var session = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 48; i++)
        session += possible.charAt(Math.floor(Math.random() * possible.length));

    return session;
}

exports.checkExpire = function (url) {
    var expire = extractTime(url);
    var current = getCurrentTime();
    return current >= expire;
}

function extractTime(url) {
    var regex = 'expire=([^"]{10})';
    var match = url.match(regex);
    if (match != null && match.length > 1) {
        return match[1];
    }
    return 0;
}

function getCurrentTime() {
    return Math.floor(Date.now() / 1000);
}

exports.convertDate = function (date) {
    return date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
}

exports.createId = function () {
    var date = new Date();
    var y = String(date.getFullYear()).substring(2);
    var m = date.getMonth()+1;
    var c = String(Date.now()).substring(6);
    if(m < 10) return y+'0'+m+ c;
    return y+m+ c;
}