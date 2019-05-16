/************************************************************************************
 * @purpose   : Controller will contain method for all CRUD operations.
 * 
 * @file      : user.controller.js
 * @overview  : Methods for all CRUD operation of user.
 * @author    : nandhak907@gmail.com
 * @version   : 1.0
 * @since     : 
 * 
 *************************************************************************************/

var userService = require('../services/user.services');
var jwt = require('jsonwebtoken');
var gentoken = require('../middleware/tokens');
var sendmail=require('../middleware/sendmail');
var forgot = require('../middleware/forgotmail');
var redis = require('redis');
var client = redis.createClient();
/***************************************************************************
*@description : To handel regester of new user
*@param       : req (request from client)
*@param       : res (response from server)
****************************************************************************/
module.exports.register = (req, res) => {
    console.log("inside register",req.body);
    req.checkBody('firstname', 'Firstname is not valid').isLength({ min: 3 }).isAlpha();
    req.checkBody('lastname', 'Lastname is not valid').isLength({ min: 2 }).isAlpha();
    req.checkBody('email', 'Email is not valid').isEmail(/[*@gmail.com]/);
    req.checkBody('password', 'password is not valid').isLength({ min: 4 }).equals(req.body.password);
    var errors = req.validationErrors();
    var response = {};
    if (errors) {	
        response.success = false;
        response.error = errors;
        return res.status(422).send(response);
    } else {
        userService.register(req.body, (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    message: err
                })
            } else {
                
                const payload = {
                    id: data._id
                }
                //    console.log("payload in controlller=====>",payload);
                const obj = gentoken.GenerateToken(payload);
                client.set('cache', obj.token);
                client.get('cache', function(error, result) {
                if (error) throw error;
                console.log('Redis GET result from register->', result)
                });
                const url = `http://localhost:4200/login/${obj.token}`;
                //window.location.reload();
                sendmail.sendEMailFunction(url,req.body.email);
                //Send email using this token generated     
                console.log("url in controller");
                res.status(200).send({
                        success : true,
                        message:"User registered sucessfully from serverside",
                        data:obj
                        
                    });
            }

        });

    }
    
};

/**************************************************************************** 
*@description : To handel login of user
*@param       : req (request from client)
*@param       : res (response from server)
****************************************************************************/

module.exports.login = (req, res) => {
    try {
    
        //Express validator to check login validation of email and password. 
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('password', 'password is not valid').isLength({ min: 4 });
        var secret = "nandhakum";
        var errors = req.validationErrors();
        var response = {};
        if (errors) {
            response.success = false;
            response.error = errors;
            return res.status(422).send(response);
        } else {
            userService.login(req.body, (err, data) => {
                if (err) {
                    return res.status(500).send({
                        message: err
                    });
                } else {
                    var response = {};
                    const payload = {
                        email : req.body.email,
                        user_id: data[0]._id,
                    }
                    console.log("dadadad",data[0]._id)
                    console.log("email req",req.body.email);
                    
                    const obj = gentoken.GenerateToken(payload)
                    data.token=obj;
                   // var token = jwt.sign({ payload }, secret, { expiresIn:'1d' });
                    client.set('cache',data.token);
                    client.get('cache', function(error, result) {
                        if (error) throw error;
                        console.log('Redis GET result from login ->', result)
                        });
                    
                    return res.status(200).send(
                        {
    
                        data:data,
                        token:data.token.token
                    });
                }
            })
        }
    
    } catch (error) {
        console.log("error in controller : ",err);
    };
}



/**************************************************************************** 
*@description : To handel forgot password of registerd user
*@param       : req (request from client)
*@param       : res (response from server)
****************************************************************************/

module.exports.forgotPassword = (req, res) => {
    try {
        req.checkBody('email', 'Email is not valid..').isEmail();
        var errors = req.validationErrors();
        var responce = {};
        if (errors) {
            responce.success = false;
            responce.error = errors;
            res.status(422).send(errors);
        }
        else {

            var respondresult = {};
            userService.forgotPassword(req.body, (err, result) => {
                if (err) {
                    respondresult.success = false;
                    respondresult.result = err;
                    res.status(400).send(respondresult);
                }
                else {
                    console.log("result is true : " + result);
                    respondresult.success = true;
                    respondresult.result = result;
                    const payload = {
                        user_id: result[0]._id
                    }
                    //    console.log("payload in controlller=====>",payload);
                    const obj = gentoken.GenerateToken(payload);
                    const url = `http://localhost:4200/reset/${obj.token}`;
                    forgot.sendMailFun(url,req.body.email);
                    //Send email using this token generated     
                    console.log("url in controller");
                    respondresult.url = url;
                    res.status(200).send(respondresult);
                }
            })
        }
    }
    catch (err) {
        console.log("error in controller,", err);
    }
   
}

/**************************************************************************** 
*@description : To reset password of the registerd user and replace new password 
*               with the old password.
*@param       : req (request from client)
*@param       : res (response from server)
****************************************************************************/

module.exports.resetPassword = (req, res) => {
    // console.log("inside forgotPassword");
    req.checkBody('password', 'password is not valid').isLength({ min: 4 })
    var errors = req.validationErrors();
    var response = {};
    if (errors) {
        response.success = false;
        response.error = errors;
        return res.status(422).send(response);
    } else {
        userService.resetPassword(req, (err, data) => {
            if (err) {
                // console.log(err);
                return res.status(500).send({
                    message: err
                })
            } else {
                return res.status(200).send({
                    message: data
                });
            }

        })

    }
}
/***********************************************************************************
 * 
 * @param : req (request from user) 
 * @param : res (response from server)
 * 
 **********************************************************************************/
// exports.setProfilePic = (req, res) => {
//     try {
        
//         // console.log("user controller",req);
//         var responseResult = {};
//         // console.log("userid -->",req.decoded.id);
//         userId = req.decoded.id;
//         // console.log("req dzsffxddfgdfgdfg===>",req.file.location);
//         let image =(req.file.location);

//         console.log("image -->",image);
//         userService.setProfilePic(userId, image, (err, result) => {
//             console.log("result in controler profile pic==?",result);
            
//             if (err) {
//                 responseResult.success = false;
//                 responseResult.error = err;
//                 res.status(500).send(responseResult)
//             } else {
//                 responseResult.status = true;
//                 responseResult.data = result;
//                 // console.log("******************************",responseResult);
                
//                 res.status(200).send(responseResult);
//             }
//         })
//     } catch (error) {
//         res.send(error);
//     }
// }


module.exports.userimage= (req, res) => {
    console.log("\npic location --------<",req.file.location);
  
    userService.userimage(req, (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    message: err
                })
            } else {
                console.log("message is coming here",data)
                return res.status(200).send({
                    
                    message: data
                });
            }
    
        })
    
    }




