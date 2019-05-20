/******************************************************************************
 *  @Purpose        : To create a note schema and store data into database.
 *  @file           : note.models.js
 *  @author         : nandhak907@gmail.com
 *  @version        : v0.1
 *  @since          : 
 ******************************************************************************/
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
var redis = require('redis');
var client = redis.createClient();
const Schema = mongoose.Schema;
/*******************************************************************************
 * @description : Creating note schema using mongoose
 ******************************************************************************/
var noteSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'userSchema'
    },
    title: {
      type: String,
      //required: [true, "Title required"]
    },
    description: {
      type: String,
      //required: [true, "Description required"]
    },
    reminder: {
      type: String
    },
    color: {
      type: String
    },
    image: {
      type: String
    },
    archive: {
      type: Boolean
    },
    pinned: {
      type: Boolean
    },
    trash: {
      type: Boolean
    },
    notemessage: {
      type: String
    },
    sequence: {
      type: Number
    },

    label: [
      {
        type: String,
        ref: "labelSchema"
      }
    ]
  },
  {
    timestamps: true
  }
);
var note = mongoose.model("Note", noteSchema);

function noteModel() { }
/*******************************************************************************************************
 * @description:it will add the notes data using note schema and save the data into the database
 * @param {*request from frontend} objectNote
 * @param {*response to backend} callback
 ******************************************************************************************************/
// noteModel.prototype.addNotes = (objectNote, callback) => {
//   console.log("this is headers",objectNote.headers)
// console.log("data-->", objectNote.decoded.payload.user_id);
//   const noteModel = new note({
//     "userId": objectNote.decoded.payload.user_id,
//     "title": objectNote.body.title,
//     "description": objectNote.body.description,
//     "color": objectNote.body.color,
//     "image": objectNote.body.image
//   });
//   noteModel.save((err, result) => {
//     if (err) {
//       callback(err);
//     } else {
//       callback(null, result);
//     }
//   });
// };
//redis using

noteModel.prototype.addNotes = (objectNote, callback) => {
  console.log("data-->", objectNote.decoded.payload.user_id);
  var redisToken = "";
  client.get("loginToken" + objectNote.decoded.payload.user_id, (err, data) => {
    if (err) { console.log("error in redis part") }
    redisToken = data;

  })
  var localstrorageToken = objectNote.headers.token
  console.log("this is localstrge token", localstrorageToken)
  if (redisToken.localeCompare(localstrorageToken)) {

    const noteModel = new note({
      "userId": objectNote.decoded.payload.user_id,
      "title": objectNote.body.title,
      "description": objectNote.body.description,
      "color": objectNote.body.color,
      "image": objectNote.body.image
    });
    noteModel.save((err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  }
  else {
   console.log("error redis token doest match")
   callback(err);
  }
}

/*******************************************************************************
 * @description:it will get the notes using userId and find the notes with data
 * @param : {*request from frontend} id
 * @param : {*response to backend} callback
 ********************************************************************************/
// noteModel.prototype.getNotes = (id, callback) => {
//    console.log("modelid",id.decoded.payload.user_id);

//   note.find(
//     {
//       userId: id.decoded.payload.user_id
//     },
//     (err, result) => {
//       if (err) {
//         callback(err);
//       } else {
//         console.log("adadadad",result)
//         callback(null, result);
//       }
//     }
//   );
// };
noteModel.prototype.getNotes = (id, callback) => {

  console.log("in model", id);
  note.find({ userId: id }, (err, result) => {
    if (err) {
      callback(err);
    } else {
      console.log("", result);
      return callback(null, result);
    }
  }).sort({ sequence: 0 });
};
module.exports = new noteModel();

/************************************************************************
 * @description:
 * @param : noteID
 * @param : updateParams
 * @param : callback
 ************************************************************************/
noteModel.prototype.updateColor = (noteID, updateParams, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        color: updateParams
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log("Result", result)
        return callback(null, updateParams);
      }
    }
  );
};
/*********************************************************************
 * @description:
 * @param : data
 * @param : callback
 **********************************************************************/
noteModel.prototype.deleteNote = (data, callback) => {
  note.deleteOne(
    {
      _id: data.body.noteID
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        const obj = {
          status: 200,
          msg: "note is deleted successfully"
        };
        console.log("Result", result)
        return callback(null, obj);
      }
    }
  );
};
/*********************************************************************
 * @description:
 * @param : data
 * @param : callback
 **********************************************************************/


noteModel.prototype.erashTrash = (req, callback) => {
  console.log("in model", req.body);
  note.deleteMany({ trash: true }, (err, result) => {
    if (err) {
      callback(err)
    } else {
      console.log("Trash", result)
      return callback(null, result)
    }
  })
};
/***************************************************************************
 *
 * @param : noteID
 * @param : archiveParams
 * @param : callback
 ****************************************************************************/
noteModel.prototype.isArchived = (noteID, archiveNote, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        archive: archiveNote,
        trash: false,
        pinned: false
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log("Result", result)
        return callback(null, archiveNote);
      }
    }
  );
};
/************************************************************************************
 * @param : id
 * @param : callback
 ****************************************************************************************/
noteModel.prototype.getTrashStatus = (id, callback) => {
  note.findOne(
    {
      _id: id
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        //   console.log("dtaa in getrash notes==>",result.trash);

        return callback(null, result.trash);
      }
    }
  );
};
/*****************************************************************************************
 * @param : noteID
 * @param : trashStatus
 * @param : callback
 *****************************************************************************************/
// noteModel.prototype.isTrashed = (noteID, trashNote, callback) => {
//   // console.log("dtaa in getrash notes==>",trashNote)
//   // console.log("dtaa in getrash notes==>",noteID)
//   note.findOneAndUpdate(
//     {
//       _id: noteID
//     },
//     {
//       $set: {
//         trash: trashNote.status
//       }
//     },
//     (err, result) => {
//       if (err) {
//         callback(err);
//       } else {
//         return callback(null, trashNote.status);
//       }
//     }
//   );
// };
noteModel.prototype.isTrashed = (noteID, trashNote, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        trash: trashNote,
        archive: false
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log("Result", result)
        return callback(null, trashNote);
      }
    }
  );
};
/****************************************************************************
 * @param {*} noteID
 * @param {*} reminderParams
 * @param {*} callback
 ********************************************************************************/
noteModel.prototype.reminder = (noteID, reminderParams, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        reminder: reminderParams
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        return callback(null, reminderParams);
      }
    }
  );
};
/****************************************************************************************
 * @param : noteID
 * @param : titleParams
 * @param : callback
 ****************************************************************************************/
noteModel.prototype.editTitle = (noteID, titleParams, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        title: titleParams
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        return callback(null, titleParams);
      }
    }
  );
};
/*************************************************************************************************
 * @param : noteID
 * @param : descParams
 * @param : callback
 ****************************************************************************************************/
noteModel.prototype.editDescription = (noteID, descParams, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        description: descParams
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        return callback(null, descParams);
      }
    }
  );
};
/*******************************************************************************************
 * @param : noteID
 * @param : pinParams
 * @param : callback
 ********************************************************************************************/
noteModel.prototype.isPinned = (noteID, pinParams, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        pinned: pinParams,
        trash: false,
        archive: false
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        return callback(null, pinParams);
      }
    }
  );
};
/**************************************************************************************************
 *
 * @param : noteID
 * @param : updateNote
 * @param : callback
 *
 *************************************************************************************************/
noteModel.prototype.updateImage = (noteID, updateNote, callback) => {
  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $set: {
        image: updateNote
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log("updated image to note successfully");
        return callback(null, updateNote);
      }
    }
  );
};

/*********************************************************************
 * @description : Creating Label schema using mongoose
 *********************************************************************/

var labelSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "userSchema"
    },
    label: {
      type: String,
      require: [true, "Label require"],
      unique: true
    }
  },
  {
    timestamps: true
  }
);
var label = mongoose.model("Label", labelSchema);

/************************************************************************************************
 *
 * @param : labelData
 * @param : callback
 *********************************************************************************************/
noteModel.prototype.addLabel = (labelData, callback) => {
  console.log("ultimate save", labelData);
  const Data = new label({
    "userId": labelData.decoded.payload.user_id,
    "label": labelData.body.label
  });
  Data.save((err, result) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      console.log("label result", result);
      return callback(null, result);
    }
  });
};

/*********************************************************************************************
 *
 * @param : id
 * @param : callback
 *********************************************************************************************/
// noteModel.prototype.getLabels = (id, callback) => {
//   console.log("in model", id.userID);
//   label.find({ userID: id.userId }, (err, result) => {
//     if (err) {
//       callback(err);
//     } else {
//       console.log("labels", result);
//       return callback(null, result);
//     }
//   });
// };
noteModel.prototype.getLabels = (id, callback) => {

  console.log("in model", id);
  label.find({ userId: id }, (err, result) => {
    if (err) {
      callback(err);
    } else {
      console.log("", result);
      return callback(null, result);
    }
  })
};

/*****************************************************************************************************
 *
 * @param : id
 * @param : callback
 *****************************************************************************************************/
noteModel.prototype.deleteLabel = (id, callback) => {
  console.log("in model", id);
  label.deleteOne({ _id: id.labelID }, (err, result) => {
    if (err) {
      callback(err);
    } else {
      console.log("labels", result);
      return callback(null, result);
    }
  });
};

/**************************************************************************************
 *
 * @param : changedLabel
 * @param : callback
 ****************************************************************************************/
noteModel.prototype.updateLabel = (changedLabel, callback) => {
  var editLabel = null;
  var labelId = null;
  console.log("in model", changedLabel);
  if (changedLabel != null) {
    editLabel = changedLabel.editLabel;
    labelId = changedLabel.labelID;
  } else {
    callback("Pinned note not found");
  }
  label.findOneAndUpdate(
    {
      _id: labelId
    },
    {
      $set: {
        label: editLabel
      }
    },
    (err, result) => {
      if (err) {
        console.log("in modelerr");
        callback(err);
      } else {
        console.log("in modelsuccess");
        return callback(null, changedLabel);
      }
    }
  );
};

/********************************************************************************************
 *
 * @param : labelParams
 * @param : callback
 *****************************************************************************************/
noteModel.prototype.saveLabelToNote = (labelParams, callback) => {
  console.log("in model", labelParams);
  var labelledNote = null;
  var noteID = null;

  labelledNote = labelParams.label;
  noteID = labelParams.noteID;

  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $push: {
        label: labelledNote
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log("in model success", result.label);
        let res = result.label;
        res.push(labelledNote);
        return callback(null, res);
      }
    }
  );
};

/**************************************************************************************************
 *
 * @param : labelParams
 * @param : callback
 *************************************************************************************************/
noteModel.prototype.deleteLabelToNote = (labelParams, callback) => {
  console.log("in model", labelParams.label);
  var labelledNote = null;
  var noteID = null;

  labelledNote = labelParams.label;
  noteID = labelParams.noteID;

  note.findOneAndUpdate(
    {
      _id: noteID
    },
    {
      $pull: {
        label: labelParams.label
      }
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {

        console.log("in model success result", result.label);
        let newArray = result.label;
        console.log("newArray===>", newArray.length);

        for (let i = 0; i < newArray.length; i++) {
          if (newArray[i] === labelParams.label) {
            newArray.splice(i, 1);
            console.log("adjshji==>", newArray);

            return callback(null, newArray);
          }
        }
      }
    }
  );
};



noteModel.prototype.getAllUser = (callBack) => {
  note.find((err, result) => {
    if (err) {
      callBack(err);
    }
    else {
      const reminder = []
      var d = new Date();
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()).toJSON();

      result.forEach(function (value) {
        if (value.reminder == date) {
          console.log('correct');
          reminder.push(value);
        }
      })
      console.log("Reminder length", reminder.length);
      if (reminder.length > 0) {
        callBack(null, reminder)
      }
      else {
        callBack(null, "No reminders found")
      }
    }
  });
}

noteModel.prototype.noteimage = (req, callback) => {

  // updateOne() Updates a single document within the collection based on the filter.
  console.log("request in model... ==>", req.params.noteID);

  note.findOneAndUpdate({ _id: req.params.noteID }, {
    $set: {
      notemessage: req.file.location
    },
  }, (err, data) => {
    if (err) {
      console.log("Error in");
      return callback(err);
    } else {
      console.log("adadad", data)
      return callback(null, data);
    }
  });

}
noteModel.prototype.sequence = (userId, req, callback) => {

  note.find(
    {
      userId: userId
    },
    (err, result) => {
      if (err) {
        callback(err);
      } else {
        for (let i = 0; i < req.body.length; i++) {
          note.updateOne(
            { _id: req.body[i]._id },
            {
              sequence: i
            }, (err, data) => {
              if (err) {
                console.log("Error in");
                return callback(err);
              } else {
                console.log("adadad", data)
              }
            });
        }
        return callback(null, result);
      }
    }
  );
};
module.exports = new noteModel();
