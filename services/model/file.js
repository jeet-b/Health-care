const db = require('../../config/db');
let User = require('../../model/user')(db);
const UtilService = require('../util')
const userConstant = require('../../config/constant/user')
const {
    MESSAGE
} = require("../../config/message")
const moment = require("moment")
const {
    sendOTP,
    resendOTP
} = require("../../config/sms")
const {COUNTRYCODE}=require("../../config/authConstant")

module.exports = {
    async fileUpload(data) {
        try {
           let result;
           let files = req.files.file;
           const folder = req.body.folder;
           if (!req.body.hasOwnProperty('folder')) {
                   return utils.failureResponse({message: 'Folder field is required.'}, res);
             }
           if (Array.isArray(files) === false) {
                  const data = await fileData(files, folder);
                  result = await service.createDocument(File, data);
             } else {
                 result = [];
                 await Promise.all(_.map(files, async (file) => {
                    const data = await fileData(file, folder);
                    result.push(await service.createDocument(File, data))
                 })
                    )
                }
                return utils.successResponse(result, res);
            
        } catch (error) {
            console.error(error)
            throw new Error(error)
            //return {result: null, status : false}
        }
    }
}