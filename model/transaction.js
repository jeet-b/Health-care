function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.transaction){
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
        amount:{ type:Number },
        appointmentId:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        card:{
          last4:{ type:Number },
          expMonth:{ type:Number },
          expYear:{ type:Number },
          brand:{ type:String }
        },
        type: {
          type: String
        },
        chargeType: {
          type:String
        },
        createdBy:{ type:Object },
        fees:{
          totalFee:{ type:Number },
          stripeFee:{ type:Number },
          tax:{ type:Number }
        },
        isActive:{
          type:Boolean,
          default:true
        },
        isDelete:{
          type:Boolean,
          default:false
        },
        isDeleted:Boolean,
        isRefunded:{
          type:Boolean,
          default:false
        },
        orderId:{
          type:Schema.Types.ObjectId,
          ref:'order'
        },
        patient:{
          _id:{
            type:Schema.Types.ObjectId,
            ref:'user'
          },
          name: {
            type: String,
          },
          email: {
            type: String,
          },
          phone: {
            type: String,
          }              
        },
        provider:{
          _id:{
            type:Schema.Types.ObjectId,
            ref:'user'
          },
          name: {
            type: String,
          },
          email: {
            type: String,
          },
          phone: {
            type: String,
          }              
        },
        // patientName: {
        //   type: String,
        // },  
        // providerName: {
        //   type: String,
        // }, 
        taxAmount: {
          type: Number,
        },
        penalty: {
          type: Number,
          default:0
        },
        subTotal: {
          type: Number,
        },
        physicianAmount:{
          type:Number,
        },
        paymentTransactionId:{ type:String },
        providerId:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        patientId:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        remark:{ type:String },
        status:{               
          type: Schema.Types.ObjectId,
          ref: "master", 
        },
        statusTrack:[{
          reason:{ type:String },
          Date:{ type:Date },
          status:{ type:String }
        }],
        transactionBy:{
          type:Schema.Types.ObjectId,
          ref:'user'
        },
        transactionType:{
          type:Schema.Types.ObjectId,
          ref:'master'
        },
        invoice: {
          type: String,
          default: ""
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

    const transaction = mongoose.model('transaction',schema,'transaction');
    return transaction;
  }
  else {
    return mongoose.models.transaction;
  }
}
module.exports = makeModel; 