function makeModel(mongoose, ...dependencies) {

  if (!mongoose.models.chat) {
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
        fromId: {
          type: Schema.Types.ObjectId,
          ref: 'user',
          required: true
        },
        toId: {
          type: Schema.Types.ObjectId,
          ref: 'user',
          required: true
        },
        file: {
          type: Schema.Types.ObjectId,
          ref: 'file'
        },
        content: { type: String },
        type: {
          type: String,
          default: 'normal',
          enum: ['normal', 'lastMessage']
        },
        isActive: {
          type: Boolean,
          default: true
        },
        isDeleted: {
          type: Boolean,
          default: false
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

    const chat = mongoose.model('chat', schema, 'chat');
    return chat;
  }
  else {
    return mongoose.models.chat;
  }
}
module.exports = makeModel;