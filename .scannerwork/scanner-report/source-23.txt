/************************************************************************************
 * @purpose   : Used to provide routes to web pages.
 * 
 * @file      : noteRoutes.js
 * @overview  : provides routes to web pages.
 * @author    : nandhak907@gmail.com
 * @version   : 1.0
 * @since     : 
 * 
 *************************************************************************************/

const express = require('express');
const router = express.Router();
const note = require('../controllers/note.controller');
const middle= require('../authentication/index')
const upload = require ('../middleware/fileUpload')

router.post('/createNote',middle.auth,  note.createNote);
router.get("/getNotes/:userId",middle.auth, note.getNotes);
router.put('/isTrashed',middle.auth, note.isTrashed); 
router.post('/deleteNote',middle.auth,  note.deleteNote);
router.post('/emptyTrash',middle.auth,  note.erashTrash);

router.put('/updateColor', middle.auth, note.updateColor);
router.put('/reminder',middle.auth,note.reminder);
router.put('/isArchived',middle.auth,note.isArchived);


router.put('/editTitle', middle.auth, note.editTitle);
router.put('/editDescription', middle.auth, note.editDescription);


router.post('/addLabel', middle.auth, note.addLabel);
router.get('/getLabels/:userId', middle.auth, note.getLabels);
router.post('/deleteLabel', middle.auth, note.deleteLabel);
router.put('/updateLabel', middle.auth, note.updateLabel);

router.post('/saveLabelToNote', middle.auth,note.saveLabelToNote);
router.post('/deleteLabelToNote', middle.auth,note.deleteLabelToNote);

router.post('/sequence/:userId', middle.auth,note.sequence);


router.post('/noteimage/:noteID' ,upload.single('image'), note.noteimage);




module.exports = router;