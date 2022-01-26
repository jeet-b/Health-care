function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.invoice){
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
        invoiceNumber: {
          type: String,
        },
        uri: {
          type: String,
        },
        appointmentId:{
          type:Schema.Types.ObjectId,
          ref:'appointment'
        },
        createdBy:{ type:Object },
        isActive:{
          type:Boolean,
          default:true
        },
        isDelete:{
          type:Boolean,
          default:false
        },
        isDeleted:Boolean,
        orderId:{
          type:Schema.Types.ObjectId,
          ref:'order'
        },
        patientId:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        providerId:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        totalAmount:{ type:Number },
        transactionId:{
          type:Schema.Types.ObjectId,
          ref:'transaction'
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

    const invoice = mongoose.model('invoice',schema,'invoice');
    return invoice;
  }
  else {
    return mongoose.models.invoice;
  }
}
module.exports = makeModel;