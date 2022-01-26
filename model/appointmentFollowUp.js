function makeModel(mongoose, ...dependencies) {

  if (!mongoose.models.appointmentFollowUp) {
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
        appointmentId: {
          type: Schema.Types.ObjectId,
          ref: 'appointment'
        },
        // followupDate: { 
        //   startDate: { type: Date }, 
        //   endDate: { type: Date } 
        // },
        followUpFromDate:{
          type:Date
        },
        followUpToDate:{
          type:Date
        },
        uniqueCode:{
          type: String
        },
        isActive: {
          type: Boolean,
          default: true
        },
        isDelete: {
          type: Boolean,
          default: false
        },
        isDeleted: Boolean,
        patientId: {
          type: Schema.Types.ObjectId,
          ref: 'user'
        },
        providerId: {
          type: Schema.Types.ObjectId,
          ref: 'user'
        },
        isLinkUsed:{
          type:Boolean,
          default: false
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

    const appointmentFollowUp = mongoose.model('appointmentFollowUp', schema, 'appointmentFollowUp');
    return appointmentFollowUp;
  }
  else {
    return mongoose.models.appointmentFollowUp;
  }
}
module.exports = makeModel;