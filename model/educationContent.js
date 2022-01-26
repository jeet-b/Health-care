function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.educationContent){
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
        createdBy:{ type:Object },
        deletedBy:{ type:Object },
        description:{ type:String },
        files:[{
          type:Schema.Types.ObjectId,
          ref:'file'
        }],
        isActive:{
          type:Boolean,
          default:true
        },
        isDeleted:{
          type:Boolean,
          default:false
        },
        title:{ type:String },
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

    const educationContent = mongoose.model('educationContent',schema,'educationContent');
    return educationContent;
  }
  else {
    return mongoose.models.educationContent;
  }
}
module.exports = makeModel;