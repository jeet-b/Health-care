function makeModel (mongoose,...dependencies){
    
    if (!mongoose.models.section){
      const mongoosePaginate = require('mongoose-paginate-v2');
      const idvalidator = require('mongoose-id-validator');
    //   const uniqueValidator = require('mongoose-unique-validator');

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
          code:{
            type:String,
          },
          createdBy:{ type:Object },
          deletedAt:{ type:Date },
          deletedBy:{ type:Object },
        //   fileId:{ type:Object },
          isActive:{
            type:Boolean,
            default:true
          },
          isDelete:{
            type:Boolean,
            default:false
          },
          isDeleted:Boolean,
          name:{
            type:String,
          },
        //   parentId:{
        //     type:Schema.Types.ObjectId,
        //     ref:'master'
        //   },
          sequence:{
              type: Number
          },
          subTitle:{
            type: String
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
    //   schema.plugin(uniqueValidator);
      const section = mongoose.model('section',schema,'section');
      return section;
    }
    else {
      return mongoose.models.section;
    }
  }
  module.exports = makeModel;