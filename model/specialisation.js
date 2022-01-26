function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.specialisation){
    const mongoosePaginate = require('mongoose-paginate-v2');
    const idvalidator = require('mongoose-id-validator');
    const uniqueValidator = require('mongoose-unique-validator');
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
        createdBy:{ type:Object },
        description:{
          type:String,
        },
        file:{
          type:Schema.Types.ObjectId,
          ref:'file',
        },
        isComingSoon: {
          type:Boolean,
          default:false
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
        isFree:{
          type:Boolean,
          default:false
        },
        name:{
          type:String,
          required:true,
          // unique: true
        },
        price:{ type:Number },
        sequence:{ type:Number },
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
    schema.plugin(uniqueValidator);

    const specialisation = mongoose.model('specialisation',schema,'specialisation');
    return specialisation;
  }
  else {
    return mongoose.models.specialisation;
  }
}
module.exports = makeModel;