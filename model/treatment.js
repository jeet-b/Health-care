function makeModel(mongoose, ...dependencies) {

  if (!mongoose.models.treatment) {
    const mongoosePaginate = require('mongoose-paginate-v2');
    const idvalidator = require('mongoose-id-validator');
    const uniqueValidator = require('mongoose-unique-validator');
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
        specialisationId: {
          type: Schema.Types.ObjectId,
          ref: 'specialisation'
        },
        name: {
          type: String,
          require: true,
          // unique: true,
        },
        images: [{
          type: Schema.Types.ObjectId,
          ref: 'file'
        }],
        productDescription: {
          type: String,
          default: ""
        },
        price: {
          type: Number,
          default: 0,
        },
        size: {
          type: String,
          require: true
        },
        patientInstruction: {
          type: String,
          default: ""
        },
        isActive: Boolean,
        isDeleted: Boolean,

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
    schema.plugin(uniqueValidator);

    const treatment = mongoose.model('treatment', schema, 'treatment');
    return treatment;
  }
  else {
    return mongoose.models.treatment;
  }
}
module.exports = makeModel;