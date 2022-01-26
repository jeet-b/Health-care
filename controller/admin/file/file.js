const message = require('../../../utils/messages');
const responseCode = require('../../../utils/responseCode');
const fileServiceClass = require('../../../services/model/file');
const {
  MESSAGE
} = require("../../../config/message")
const db = require('../../../config/db');
const fileModel = require('../../../model/file')(db);
const _ = require('lodash');
const filePath = ''
const fs = require('fs')
const path = require('path')

function makeFileController ({
  fileService,makeFile
})
{
  const filesUpload = async(req) =>{
    try {
        if (!req.files) {
          return message.failureResponse(
            { 'Content-Type': 'application/json' },
            responseCode.internalServerError,
            req.i18n.t("file.not_found")
          );
        }else{
          let result;
          let files = req.files.file;
          const folder = req.body.folder;
           if (!req.body.hasOwnProperty('folder')) {
                return message.failureResponse(
                  { 'Content-Type': 'application/json' },
                  responseCode.internalServerError,
                  {message: req.i18n.t("file.folder")}
                );
             }
           if (Array.isArray(files) === false) {
                  const data = await fileData(files, folder);
                  result = await fileService.createDocument(data);
             } else {
                 result = [];
                 await Promise.all(_.map(files, async (file) => {
                    const data = await fileData(file, folder);
                    result.push(await fileService.createDocument(data))
                 }))
              }
                return message.successResponse(
                  { 'Content-Type': 'application/json' },
                  responseCode.success,
                  result,
                  req.i18n.t("file.upload")
                );
        }
    }
    catch (error){
      console.error(error);
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const fileData = async (file, folder) => {
    if (!file.name.match(/\.(PDF|pdf|jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        throw new Error("Only selcted fomat files are allowed..")
    }
    if (file.size / (1024 * 1024).toFixed(2) > 5) {
        utils.failureResponse({message: 'Your image size is more than 5 mb'}, res);
    }
    file.mv(`./public/${folder}/` + file.name);
    const data = {
        name: file.name,
        mimetype: file.mimetype,
        size: file.size,
        type: file.type,
        uri: `/${folder}/${file.name}`,
        type: file.mimetype
    }
    return data;
  }
  const removeFiles = async(req) => {
    try {
        const file = await fileModel.findById(req.body.file)
        if (file) {
          let pathRef = file.uri
          let normPath = path.normalize(`${filePath}${pathRef}`)
          let fileExists = fs.existsSync(normPath)
          if(fileExists){
             let isUnlinkFromAssets = fs.unlinkSync(normPath);
          }
         await fileModel.remove({id: req.body.file})
         return message.successResponse(
              { 'Content-Type': 'application/json' },
              responseCode.success,
              null,
              MESSAGE.FILE_DELETED_SUCCESSFULLY
            );
        }
        else {
          return message.failureResponse(
            { 'Content-Type': 'application/json' },
            responseCode.internalServerError,
            MESSAGE.NOT_FOUND
          );
        }
    }
    catch (error) {
      console.error(error);
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
 };
  const getFileById = async (id) =>{
    try {
      if (id){
        const file = await fileService.getSingleDocumentById(id);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          file
        );
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    }
    catch (error){
      console.error(error);
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const deleteFile = async (data,id) => {
    try {
      let possibleDependent = [
        {
          model: 'educationContent',
          refId: 'files' 
        },
        {
          model: 'messages',
          refId: 'files' 
        },
        {
          model: 'appointmentSummary',
          refId: 'treatmentIds' 
        },
        {
          model: 'specialisation',
          refId: 'file' 
        },
        {
          model: 'user',
          refId: 'profilePictureId' 
        },
        {
          model: 'user',
          refId: 'libraryPhotos' 
        }
      ];
      const deleteDependentService = require('../../../utils/deleteDependent');
      if (data.isWarning) {
        let all = await deleteDependentService.countFile({ _id:id });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteFile({ _id: id });
        if (result){
          return message.successResponse(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            result
          );
                    
        }
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    }
    catch (error){
      console.error(error);
      if (error.name === 'ValidationError'){
        return message.inValidParam(
          { 'Content-Type': 'application/json' },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    filesUpload,
    getFileById,
    deleteFile,
    removeEmpty,
    removeFiles,
  });
}

module.exports = makeFileController;
