const nodemailer=require('nodemailer');

exports.sendEMailFunction = (url,email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        },
    });
    var mailOptions = {
        from: 'Fundoo Help',
        to: email,
        subject: 'GoogleKeep-App Do Not Reply',
        text: 'Click here to Signin '+url
    };
    transporter.sendMail(mailOptions,(err,info) => {
        if (err){
        console.log("is it is invalid");
        
            console.log("error on sending mail--", err)
        }
        else
            console.log('result of sending mail-- ',info);
    });
    
}


