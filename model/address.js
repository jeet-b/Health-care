function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.address){
    const mongoosePaginate = require('mongoose-paginate-v2');
    const idvalidator = require('mongoose-id-validator');
    const myCustomLabels = {
      totalDocs: 'itemCount',
      docs: 'data',
      limit: 'perPage',
      page: 'currentPage',
      nextPage: 'next',
      prevPage: 'prev',
      totalPages: 'pageCount',
      pagingCounter: 'slNo',
      meta: 'paginator',
    };
    mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
    const Schema = mongoose.Schema;
    const schema = new Schema(
      {
        addedBy:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        addressLine1:{ type:String },
        addressLine2:{ type:String },
        cityId:{
          type:Schema.Types.ObjectId,
          ref:'city'
        },
        countryId:{
          type:Schema.Types.ObjectId,
          ref:'country'
        },
        isActive:{
          type:Boolean,
          default:true
        },
        isDelete:{
          type:Boolean,
          default:false
        },
        isDeleted:Boolean,
        postalCodeId:{
          type:Schema.Types.ObjectId,
          ref:'postalCode'
        },
        provinceId:{
          type:Schema.Types.ObjectId,
          ref:'province'
        }
      },
      {
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt' 
        } 
      }
    );

    schema.pre('save', async function (next) {
      this.isDeleted = false;
      this.isActive = true;
      next();
    });
    schema.method('toJSON', function () {
      const {
        __v, _id, ...object 
      } = this.toObject();
      object.id = _id;
      return object;
    });
    schema.plugin(mongoosePaginate);
    schema.plugin(idvalidator);

    const address = mongoose.model('address',schema,'address');
    return address;
  }
  else {
    return mongoose.models.address;
  }
}
module.exports = makeModel;