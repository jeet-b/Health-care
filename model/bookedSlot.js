function makeModel (mongoose,...dependencies){
    
    if (!mongoose.models.bookedSlot){
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
            providerId: {
                type: Schema.Types.ObjectId,
                ref: 'user',
              },
              patientId: {
                type: Schema.Types.ObjectId,
                ref: 'user',
              },
              startTime: {
                type: Date,
              },
              endTime: {
                type: Date,
              },
              duration: {
                type: Number,
              },
              slotId: {
                type: Schema.Types.ObjectId,
                ref: "availableSlot"
              },
              slot: {
                type: Object
              },
              isConfirmed: {
                type: Boolean,
                default: false
              },
              isCompleted: {
                type: Boolean,
                default: false
              },
              dayOfWeek: {
                type: Number,
              },
              createdBy: {
                type: Object,
              },
              updatedBy: {
                type: Object,
              },
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
  
      const bookedSlot = mongoose.model('bookedSlot',schema,'bookedSlot');
      return bookedSlot;
    }
    else {
      return mongoose.models.bookedSlot;
    }
  }
  module.exports = makeModel;