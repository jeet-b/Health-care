function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.routeRole){
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
        roleId:{
          type:Schema.Types.ObjectId,
          ref:'role'
        },
        routeId:{
          type:Schema.Types.ObjectId,
          ref:'projectRoute',
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

    const routeRole = mongoose.model('routeRole',schema,'routeRole');
    return routeRole;
  }
  else {
    return mongoose.models.routeRole;
  }
}
module.exports = makeModel;