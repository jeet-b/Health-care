function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.userActivity){
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
        activityName:{ type:String },
        addedBy:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        adminId:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        createdBy:{ type:Object },
        deletedBy:{ type:Object },
        device:{ type:String },
        deviceId:{ type:String },
        frontend_route:{ type:String },
        ip:{ type:String },
        isActive:Boolean,
        isDeleted:Boolean,
        location:{ type:String },
        name:{ type:String },
        requestData:{ type:Object },
        response:{
          httpStatus:{
            type:String
          },
          method:{ type:String },
          message:{ type:String },
          data: { type: String },
        },
        roleId:{
          type:Schema.Types.ObjectId,
          ref:'role'
        },
        route:{
          type:String,
          required:true
        },
        updatedBy:{ type:Object },
        userId:{
          type:Schema.Types.ObjectId,
          ref:'user'
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

    const userActivity = mongoose.model('userActivity',schema,'userActivity');
    return userActivity;
  }
  else {
    return mongoose.models.userActivity;
  }
}
module.exports = makeModel;