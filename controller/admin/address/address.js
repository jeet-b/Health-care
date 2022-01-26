const message = require('../../../utils/messages');
const responseCode = require('../../../utils/responseCode');
const db = require('../../../config/db');
const addressModel = require('../../../model/address')(db);
const province = require('../../../model/province')(db);
const country = require('../../../model/country')(db);
const city = require('../../../model/city')(db);
const postalCode = require('../../../model/postalCode')(db);
const {
  MESSAGE
} = require("../../../config/message")

function makeAddressController ({
  addressService,makeAddress
})
{

const searchName = async (model, id) => {
    try {
        const address = await model.findById(id)
        return address.code
    } catch (error) {
      console.log("error", error);
        throw new Error(error)
    }
}
const search = async (model, query) => {
    let resultId = await model.distinct("_id", query)
    if (resultId.length !== 0) {
        resultId = resultId[0].toString()
        return resultId
    } else {
        let data = {
            isActive: false,
            isDelete: false,
        }
        if (model === country) {
            data.name = query.name
            data.code = query.name
        } else if (model === province && query.countryId !== undefined) {
           data.name = query.name,
           data.code = await searchName(country, query.countryId) + "_" + query.name,
           data.countryId = query.countryId
        } else if (model === city && query.provinceId !== undefined) {
              data.name = query.name,
              data.code = await searchName(province, query.provinceId) + "_" + query.name,
              data.provinceId = query.provinceId
       } else if (model === postalCode && query.cityId !== undefined) {
             data.postalCode = query.postalCode,
             data.cityId = query.cityId,
             isDeliverable = false
        }
        resultId = await model.create(data)
        return resultId.id
    }

}
const checkRequest = async (body) => {
  try {
      let countryId, provinceId, cityId, postalCodeId;
      if (body.country !== undefined) {
          countryId = await search(country, {
            name: body.country
          })
          delete body.country
          body.countryId = countryId
          
      }
      if (body.city !== undefined && body.province !== undefined && body.postalCode !== undefined) {
          provinceId = await search(province, {
              name: body.province,
              countryId: body.countryId
          })

          cityId = await search(city, {
              name: body.city,
              provinceId: provinceId
          })

          postalCodeId = await search(postalCode, {
              postalCode: body.postalCode,
              cityId: cityId
          })

          delete body.city
          delete body.province
          delete body.postalCode

          body.cityId = cityId
          body.provinceId = provinceId
          body.postalCodeId = postalCodeId

      }
      return body
  } catch (error) {
    console.log("error", error);
      throw new Error(error)
  }

}
const addAddress = async ({ data }) => {
    try {
      const originalData = data;
      const body = await checkRequest(originalData)
      const address = makeAddress(body,'insertAddressValidator');
      let createdAddress = await addressService.createDocument(address);
      const addressObj = await findAddress(createdAddress.id)
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        addressObj,
        MESSAGE.ADDRESS_CREATED
      );

    } catch (error){
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
  const findAllAddress = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly){
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await addressService.countDocument(query);
        if (result) {
          result = { totalRecords: result };  
        } else {
          return message.recordNotFound(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            []
          );
        }
      } else { 
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (options.populate){
          delete options.populate;
        }
        if (data.query !== undefined){
          query = { ...data.query };
        }
        result = await addressService.getAllDocuments(query,options);
      }
           
      if (result){
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          result
        );
      } else {
        return message.badRequest(
          { 'Content-Type': 'application/json' },
          responseCode.badRequest,
          {}
        );
      }
            
    }
    catch (error){
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const findAddress = async (addressId)=> {
      const populate = [
        {path:'postalCodeId', select:'postalCode cityId'},
        {path:'provinceId', select:'name code countryId'},
        {path:'countryId', select:'name code'},
        {path:'cityId', select:'name code provinceId'},
      ]
      return await addressModel.findById(addressId).populate(populate)
  };
  const getAddressById = async (id) =>{
    try {
      if (id){
        const address = await findAddress(id)
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          address
        );
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest
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
  const updateAddress = async (data,id) =>{
    try {
      if (id && data){
        const originalData = data;
        const body = await checkRequest(originalData)
        const address = makeAddress(body,'updateAddressValidator');
        const filterData = removeEmpty(address);
        let updatedAddress = await addressService.findOneAndUpdateDocument({ _id:id },filterData,{ new:true });
        const addressObj = await findAddress(id)
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          addressObj,
          MESSAGE.ADDRESS_UPDATED
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
  const softDeleteAddress = async (id) => {
    try {
      const deleteDependentService = require('../../../utils/deleteDependent');
      let pos = [
        {
          model: 'user',
          refId: 'practiceAddressId' 
        },
        {
          model: 'user',
          refId: 'shippingAddress' 
        }
      ];
      await addressService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteAddress({ _id: id });
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        result);
            
    } catch (error){
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
 
  const deleteAddress = async (data,id) => {
    try {
      let possibleDependent = [
        {
          model: 'user',
          refId: 'practiceAddressId' 
        },
        {
          model: 'user',
          refId: 'shippingAddress' 
        }
      ];
      const deleteDependentService = require('../../../utils/deleteDependent');
      if (data.isWarning) {
        let all = await deleteDependentService.countAddress({ _id:id });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteAddress({ _id: id });
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
    addAddress,
    findAllAddress,
    getAddressById,
    updateAddress,
    softDeleteAddress,
    deleteAddress,
    removeEmpty,
  });
}

module.exports = makeAddressController;
