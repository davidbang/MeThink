var db = require("mongojs").connect("game", ["users"]);

/*
 
*/
var authenticate = function(user, pword, callback){
    if (user && pword){
        db.users.count({"user":user, "password":pword}, function(err, count){
            if (err) console.log(err);
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

var register = function(user, pword, pwordConfirm, callback){
    if (pword != pwordConfirm){
        callback(false, "The passwords entered do not match.");
    };
    db.users.count({"user":user}, function(err, count){
        if (err) console.log(err);
        if (count > 0){
            callback(false, "An account has already been registered with the username entered.");
        }else{
            db.users.save({"user":user, "password":pword});
            callback(true, "Successfully registered.");
        };
    });
};

//WORDS FUNCTION

exports.validLogin = authenticate;
exports.register = register;
