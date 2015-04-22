var db = require("mongojs").connect("game", ["users"]);

//
var authenticate = function(user, pword, callback){
    if (user || pword){
        db.users.count({"user":user, "password":pword}, function(err, count){
            if (count == 1){
                callback(true, "Successfully authenticated.");
            }else if (count == 0){
                callback(false, "Wrong username or password.");
            }else{
                console.log("Duplicate accounts! (" + user + ")");
                callback(false, "Multiple registered accounts.");
            };
        });
    }else{
        callback(false, "Username or password field blank.");
    };
};

exports.validLogin = authenticate;
