function makeModel(mongoose, ...dependencies) {
  if (!mongoose.models.pharmacy) {
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
        name: {
          type: String,
          required: true,
        },
        emails: [
          {
            countryCode: {
              type: String,
              default: "+61",
            },
            email: {
              type: String,
            },
            isPrimary: {
              type: Boolean,
              default: true,
            },
          },
        ],
        phones: [
          {
            countryCode: {
              type: String,
              default: "+61",
            },
            phone: {
              type: String,
            },
            isPrimary: {
              type: Boolean,
              default: true,
            },
          },
        ],
        fax: [
          {
            countryCode: {
              type: String,
              default: "+61",
            },
            faxNumber: {
              type: String,
            },
            isPrimary: {
              type: Boolean,
              default: true,
            },
          },
        ],
        addressIds: [
          {
            id: {
              type: Schema.Types.ObjectId,
              ref: "address",
            },
            isDefault: {
              type: Boolean,
              default: false,
            },
          },
        ],
        location: {
          type: {
            type: String,
            enum: ["Point"],
          },
          coordinates: {
            type: [Number],
          },
        },
        accreditat: {
          type: String,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        isApproved: {
          type: Boolean,
          default: false,
        },
        isActive: {
          type: Boolean,
          default: true,
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

    const pharmacy = mongoose.model("pharmacy", schema, "pharmacy");
    return pharmacy;
  } else {
    return mongoose.models.pharmacy;
  }
}
module.exports = makeModel;
