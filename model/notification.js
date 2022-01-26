function makeModel(mongoose, ...dependencies) {
  if (!mongoose.models.notification) {
    const mongoosePaginate = require("mongoose-paginate-v2");
    const idvalidator = require("mongoose-id-validator");
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
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        content: { type: String },
        createdBy: { type: Object },
        isActive: {
          type: Boolean,
          default: true,
        },
        isDelete: {
          type: Boolean,
          default: false,
        },
        userId: { type: Schema.Types.ObjectId, ref: "user" },
        seen: {
          type: Boolean,
          default: false,
        },
        seenAt: { type: Date },
        title: { type: String },
        updatedBy: { type: Object },
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
      this.isActive = true;
      next();
    });
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    schema.plugin(mongoosePaginate);
    schema.plugin(idvalidator);

    const notification = mongoose.model("notification", schema, "notification");
    return notification;
  } else {
    return mongoose.models.notification;
  }
}
module.exports = makeModel;
