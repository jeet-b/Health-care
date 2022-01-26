function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.ratingReview){
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
        appointmentId:{
          type:Schema.Types.ObjectId,
          ref:'appointment'
        },
        createdBy:{ type:Object },
        from:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        isActive:{
          type:Boolean,
          default:false
        },
        isDelete:{
          type:Boolean,
          default:false
        },
        isDeleted:Boolean,
        rating:{ type:Number },
        review:{ type:String },
        providerId:{
          type:Schema.Types.ObjectId,
          ref:'user',
          default: null
        },
        // type:{
        //   type:Schema.Types.ObjectId,
        //   ref:'master'
        // },
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

    const ratingReview = mongoose.model('ratingReview',schema,'ratingReview');
    return ratingReview;
  }
  else {
    return mongoose.models.ratingReview;
  }
}
module.exports = makeModel;