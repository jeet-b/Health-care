function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.order){
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
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
    
        appointmentId: {
          type: Schema.Types.ObjectId,
          ref: "appointment",
        },
        // appointmentSummaryId: {
        //   type: Schema.Types.ObjectId,
        //   ref: "appointmentSummary",
        // },
        providerId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
    
        createdBy: {
          type: Object,
        },
    
        isActive: {
          type: Boolean,
          default: true,
        },
    
        isDelete: {
          type: Boolean,
          default: false,
        },
    
        isDeleted: Boolean,
    
        patientId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
    
        statusHistory: [
          {
            date: {
              type: Date,
            },
            reason: {
              type: String,
            },
            status: {
              type: String,
            },
          },
        ],
        specialisationId: {
              type: Schema.Types.ObjectId,
              ref: "specialisation",
            },

        status: {
          type: Schema.Types.ObjectId,
          ref: "master",        
        },
        penalty: {
          type: Number
        },
    
        subTotal: {
          type: Number,
        },
    
        taxAmount: {
          type: Number,
        },
        transactionId: {
          type: Schema.Types.ObjectId,
          ref: "transaction",
        },
    
        total: {
          type: Number,
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

    const order = mongoose.model('order',schema,'order');
    return order;
  }
  else {
    return mongoose.models.order;
  }
}
module.exports = makeModel;