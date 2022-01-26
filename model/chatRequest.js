function makeModel(mongoose, ...dependencies) {
  if (!mongoose.models.chatrequests) {
    const mongoosePaginate = require("mongoose-paginate-v2");
    const idvalidator = require("mongoose-id-validator");
    const uniqueValidator = require("mongoose-unique-validator");
    const myCustomLabels = {
      totalDocs: "itemCount",
      docs: "data",
      limit: "perPage",
      page: "currentPage",
      nextPage: "next",
      prevPage: "prev",
      totalPages: "pageCount",
      pagingCounter: "slNo",
      meta: "paginator",
    };
    mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
    const Schema = mongoose.Schema;
    const schema = new Schema(
      {
        chatWith: {
          type: Schema.Types.ObjectId,
          ref: "user",
          default: null,
        },
        status: {
          enum: ["requested", "accepted", "declined", "closed"],
          type: String,
          default: "requested",
        },
        history: [
          {
            status: String,
            date: { type: Date },
            updatedBy: {
              type: Schema.Types.ObjectId,
              ref: "user",
            },
          },
        ],
        requestedBy: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        user: {
          email: String,
          phone: String,
          name: String,
        },

        isDeleted: {
          type: Boolean,
          default: false,
        },
      },
      {
        timestamps: {
          createdAt: "createdAt",
          updatedAt: "updatedAt",
        },
      }
    );

    schema.pre("save", async function (next) {
      this.isDeleted = false;
      next();
    });
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    schema.plugin(mongoosePaginate);
    schema.plugin(idvalidator);

    schema.plugin(uniqueValidator);

    const chatRequest = mongoose.model("chatrequests", schema, "chatrequests");
    return chatRequest;
  } else {
    return mongoose.models.chatrequests;
  }
}
module.exports = makeModel;
