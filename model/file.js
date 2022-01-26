function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.file){
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
        alt:{ type:String },
        createdBy:{ type:Object },
        deletedAt:{ type:Date },
        deletedBy:{ type:Object },
        file_size:{ type:String },
        height:{ type:String },
        isActive:{
          type:Boolean,
          default:true
        },
        isDelete:{
          type:Boolean,
          default:false
        },
        isDeleted:Boolean,
        link:{ type:String },
        mime_type:{ type:String },
        name:{
          type:String,
          required:true
        },
        slug:{ type:String },
        status:{ type:String },
        title:{ type:String },
        type:{ type:String },
        updatedBy:{ type:Object },
        uri:{ type:String },
        width:{ type:String },
        viewType:{type: String}
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

    const file = mongoose.model('file',schema,'file');
    return file;
  }
  else {
    return mongoose.models.file;
  }
}
module.exports = makeModel;