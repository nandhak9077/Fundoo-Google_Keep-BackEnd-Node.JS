/******************************************************************************
 *  Execution       : default node          : cmd> 
 * 
 *  Purpose         : Send forgot mail
 * 
 *  @description    
 * 
 *  @file           : forgotmail.js
 *  @overview       : sending mail
 *  @author         : Nandhakumar <nandhak907@gmail.com>
 *  @version        : 1.0
 *  @since          :
 *
 ******************************************************************************/
//import the nodemailer
var nodemailer = require('nodemailer');
//send mail function using nodemailer 
exports.sendMailFun = (url, email) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass:  process.env.PASSWORD
        }
    }); 

    var mailOptions = {
        from: 'Fundoo Help',
        to: email,
        subject: 'GoogleKeep-App (RetrievePassword) Do Not Reply',
        text: 'Click here to Update Your Password '+url
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info);
        }
    });

}
