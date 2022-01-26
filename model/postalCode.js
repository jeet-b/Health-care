function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.postalCode){
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
        cityId:{
          type:Schema.Types.ObjectId,
          ref:'city'
        },
        createdBy:{ type:Object },
        deletedAt:{ type:Date },
        deletedBy:{ type:Object },
        isActive:{
          type:Boolean,
          default:true
        },
        isDelete:{
          type:Boolean,
          default:false
        },
        isDeleted:Boolean,
        isDeliverable:{
          type:Boolean,
          default:true
        },
        postalCode:{
          type:String,
          required:true
        },
        updatedBy:{ type:Object }
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

    const postalCode = mongoose.model('postalCode',schema,'postalCode');
    return postalCode;
  }
  else {
    return mongoose.models.postalCode;
  }
}
module.exports = makeModel;