function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.pages){
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
        deletedAt:{ type:Date },
        deletedBy:{ type:Object },
        isActive:Boolean,
        isDeleted:Boolean,
        name:{
          type:String,
          required:true
        },
        seoDetails:[{
          types:{ type:String },
          name:{ type:String },
          key:{ type:String }
        }],
        slug:{
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

    const pages = mongoose.model('pages',schema,'pages');
    return pages;
  }
  else {
    return mongoose.models.pages;
  }
}
module.exports = makeModel;