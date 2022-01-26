function makeModel (mongoose,...dependencies){
    
  if (!mongoose.models.questionnaireResponse){
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
        serviceId: {
          type:Schema.Types.ObjectId,
          ref:'specialisation'        
        },
        questionId: {
          type: Schema.Types.ObjectId,
          ref:'questionnaire' 
        },
        answerIds: [{
          type: Object
        }], 
        answerImageIds: [{
          type: Schema.Types.ObjectId,
          ref: 'file'
        }],
        answerText: {
          type: String
        },
        userId:{
          type: Schema.Types.ObjectId,
          ref:'user' 
        },
        answerGiven:{
          type: Boolean
        },
        appointmentId: {
          type:Schema.Types.ObjectId,
          ref:'appointment' 
        },
        isActive:{
          type:Boolean,
          default:true
        },
        isDeleted:{
          type:Boolean,
          default:false
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

    const questionnaireResponse = mongoose.model('questionnaireResponse',schema,'questionnaireResponse');
    return questionnaireResponse;
  }
  else {
    return mongoose.models.questionnaireResponse;
  }
}
module.exports = makeModel;