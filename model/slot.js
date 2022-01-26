function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.slot){
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
        slotId: {
          type: Number
        },
        dayOfWeek:{
          type: Number
        },
        startTime: {
              type: String
          },
        endTime: {
              type: String
          },
          isActive: {
              type: Boolean
          }
                },
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

    const slot = mongoose.model('slot',schema,'slot');
    return slot;
  }
  else {
    return mongoose.models.slot;
  }
}
module.exports = makeModel;