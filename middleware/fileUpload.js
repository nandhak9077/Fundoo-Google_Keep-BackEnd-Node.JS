require('dotenv').config();

var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')

console.log("ghghgghgh", process.env.AccessKeyID);
console.log("asasasasa", process.env.SecretAccessKey);
var s3 = new aws.S3({
    
   // bucketName: 'fundoo-image',
    region: 'us-east-1',
    accessKeyId:process.env.AccessKeyID,
    secretAccessKey: process.env.SecretAccessKey
    
// const fileFilter = (req, file, callback) => {
//     // console.log("request --------",req);
//     console.log("file---------", file);
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         callback(null, true)
//     } else {
//         callback(new Error('Invalid Mime Type, only JPEG and PNG'), false);
//     }
 })


var upload = multer({
  //fileFilter,
    storage: multerS3({
        s3:s3,
        bucket: 'googlekeepnan1',
       acl: 'public-read',
        metadata: function (req, file, callback) {
         console.log("REQUEST FORM -->,",req.headers);

            console.log("log file form data-->",file);
            console.log("in metadata", file.originalname);
            
            callback(null, {fieldName: file.originalname });
        },
        key: function (req, file, callback) {
            callback(null, Date.now().toString())
        }
    })

})

//     bucket: 'fundoo-photo',
//     metadata: function (req, file, cb) {
//         console.log("REQUEST FORM -->,",req.file);

//       cb(null, {fieldName: file.fieldname});
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString())
//     }
//   })
// })
module.exports = upload;