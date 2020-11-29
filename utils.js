exports.createToken = function () {
    var session = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 48; i++)
        session += possible.charAt(Math.floor(Math.random() * possible.length));

    return session;
}