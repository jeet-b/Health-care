function makeModel(mongoose, ...dependencies) {
  if (!mongoose.models.appointmentSummary) {
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
        allergies: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        appointmentId: {
          type: Schema.Types.ObjectId,
          ref: "appointment",
        },
        createdBy: { type: Object },
        diagnosis: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        followupDate: {
          startDate: { type: Date },
          endDate: { type: Date },
        },
        furtherInstructions: { type: String },
        isActive: {
          type: Boolean,
          default: true,
        },
        isDelete: {
          type: Boolean,
          default: false,
        },
        isDeleted: Boolean,
        medication: [
          {
            type: String,
          },
        ],
        note: { type: String },
        patientId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        pregnancyStatus: { type: Boolean },
        providerId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        treatmentIds: [
          {
            type: Schema.Types.ObjectId,
            ref: "treatment",
          },
        ],
        treatment: [
          {
            treatmentId: {
              type: Schema.Types.ObjectId,
              ref: "treatment",
            },
            treatmentDetails: {
              type: Object,
            },
            duration: {
              type: String,
            },
            instructionByProvider: {
              type: String,
            },
          },
        ],
        pharmacyId: {
          type: Schema.Types.ObjectId,
          ref: "pharmacy",
        },
        // treatmentInvoice: {
        //   type: Schema.Types.ObjectId,
        //   ref: "invoice",
        // },
        treatmentInvoice: {
          type: String
        },
        treatmentAmount: {
          type: Number,
        },
        orderId: {
          type: Schema.Types.ObjectId,
          ref: "order",
        },
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

    const appointmentSummary = mongoose.model(
      "appointmentSummary",
      schema,
      "appointmentSummary"
    );
    return appointmentSummary;
  } else {
    return mongoose.models.appointmentSummary;
  }
}
module.exports = makeModel;
