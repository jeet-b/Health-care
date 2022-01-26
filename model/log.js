function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.log){
    const mongoosePaginate = require('mongoose-paginate-v2');
    const idvalidator = require('mongoose-id-validator');
    const Schema = mongoose.Schema;
    const schema = new Schema(
      {
        data:{ type: Object},
        type:{type: Number},
        name: {type:String},
      },
      {
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt' 
        } 
      }
    );

    schema.method('toJSON', function () {
      const {
        __v, _id, ...object 
      } = this.toObject();
      object.id = _id;
      return object;
    });
    schema.plugin(mongoosePaginate);
    schema.plugin(idvalidator);

    const log = mongoose.model('log',schema,'log');
    return log;
  }
  else {
    return mongoose.models.log;
  }
}
module.exports = makeModel;