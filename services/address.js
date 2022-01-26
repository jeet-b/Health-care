const db = require('../config/db');
const addressModel = require('../model/address')(db);
const province = require('../model/province')(db);
const country = require('../model/country')(db);
const city = require('../model/city')(db);
const postalCode = require('../model/postalCode')(db);

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
module.exports = {
    checkRequest: checkRequest,
}