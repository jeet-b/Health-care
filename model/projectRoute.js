function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.projectRoute){
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
        isActive:Boolean,
        isDeleted:Boolean,
        method:{
          type:String,
          required:true
        },
        route_name:{
          type:String,
          required:true
        },
        uri:{
          type:String,
          required:true
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

    const projectRoute = mongoose.model('projectRoute',schema,'projectRoute');
    return projectRoute;
  }
  else {
    return mongoose.models.projectRoute;
  }
}
module.exports = makeModel;