var db = require("mongojs").connect("game", ["users"]);

var authenticate = function(user, pword){
    if (user || pword){
        var n = db.users.count({"user":user, "password":pword});
        if (n == 1){
            return [true, "Successfully authenticated."];
        }else if (n == 0){
            return [false, "Wrong username or password."];
        }else{
            console.log("Duplicate accounts! (" + user + ")");
            return [false, "Multiple registed accounts."];
        };
    };
    return [false, "Username or password field blank."];
};

exports.validLogin = authenticate;
