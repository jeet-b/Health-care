function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.providerSlot){
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
          ref: "user",
        },
        durations: [
          {
            durationNumber: {
              type: Number
            },
            startTime: {
              type: String,
            },
            endTime: {
              type: String,
            },
            duration: {
              type: String,
            },
          },
        ],
    
        type: {
          type: String,
        },
    
        repeatDate: {
          type: String,
        },
        repeatUntil: {
          type: Boolean,
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

    const providerSlot = mongoose.model('providerSlot',schema,'providerSlot');
    return providerSlot;
  }
  else {
    return mongoose.models.providerSlot;
  }
}
module.exports = makeModel;