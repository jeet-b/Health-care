const { boolean } = require("joi");

function makeModel(mongoose, ...dependencies) {
  if (!mongoose.models.appointment) {
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
        patientId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        patientName: {
          type: String,
        },
        providerName: {
          type: String,
        },
        specialisationName: {
          type: String,
        },
        appointmentDateTime: { type: Date },
        appointmentEndTime: { type: Date },
        appointmentEndTimeActual: { type: Date },
        appointmentStartTime: { type: Date },
        appointmentStartTimeActual: { type: Date },
        appointmentType: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        parentAppointmentId: {
          type: Schema.Types.ObjectId,
          ref: "appointment",
        },
        cancelledBy: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        createdBy: { type: Object },
        // questionnaireResponse:[{
        //   type:Schema.Types.ObjectId,
        //   ref:'questionnaireResponse'
        // }],
        // formAnswer:{ type:String },
        isActive: {
          type: Boolean,
          default: true,
        },
        isAppointmentStarted: {
          type: Boolean,
          default: false,
        },
        isAppointmentCompleted: {
          type: Boolean,
          default: false,
        },
        // isApproved:{
        //   type:Boolean,
        //   default:false
        // },
        callMode: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        isDelete: {
          type: Boolean,
          default: false,
        },
        // isDeleted:Boolean,
        isRescheduled: {
          type: Boolean,
          default: false,
        },
        rescheduleReason: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        noShow: {
          type: Boolean,
          default: false,
        },
        noShowReason: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        // patientIntakeFormId:{
        //   type:Schema.Types.ObjectId,
        //   ref:'form'
        // },
        providerId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        specialisationId: {
          type: Schema.Types.ObjectId,
          ref: "specialisation",
        },
        slotId: {
          type: Schema.Types.ObjectId,
          ref: "bookedSlot",
        },
        availableSlotId: {
          type: Schema.Types.ObjectId,
          ref: "availableSlot",
        },
        isBooked: {
          type: Boolean,
          default: false,
        },
        isRefunded: {
          type: Boolean,
          default: false,
        },
        orderId: {
          type: Schema.Types.ObjectId,
          ref: "order",
        },
        ratingReviewId: {
          type: Schema.Types.ObjectId,
          ref: "ratingReview",
          default: null,
        },
        isReviewAppointment: {
          type: Boolean,
          default: false,
        },
        rating: {
          type: Number,
          default: null,
        },
        status: {
          appointmentStatus: {
            type: String,
          },
          note: {
            type: String,
          },
        },
        APID: {
          type: String,
        },
        cardId: {
          type: String,
        },
        orderId: {
          type: Schema.Types.ObjectId,
          ref: "order",
        },
        penalty: {
          type: Number,
        },
        isPaid: {
          type: Boolean,
          default: false,
        },
        isTreatmentPaid: {
          type: Boolean,
          default: false,
        },
        isFollowUp: {
          type: Boolean,
          default: false,
        },
        invoiceId: {
          type: Schema.Types.ObjectId,
          ref: "invoice",
        },
        appointmentFollowUpId: {
          type: Schema.Types.ObjectId,
          ref: "appointmentFollowUp",
          default: null,
        },
        appointmentSummaryId: {
          type: Schema.Types.ObjectId,
          ref: "appointmentSummary",
          default: null,
        },
        treatmentAvailable: {
          type: Boolean,
          default: false,
        },
        treatmentAssignedOn: {
          type: Date,
        },
        treatmentPaidOn: {
          type: Date,
        },
        firstTreatmentReminderPaymentMail: {
          type: Date,
        },
        secondTreatmentReminderPaymentMail: {
          type: Date,
        },
        firstFollowUpTreatmentMail: {
          type: Date,
        },
        secondFollowUpTreatmentMail: {
          type: Date,
        },
        followUpBooked:{
          type: Boolean,
          default: false,
        },
        isCancelled: {
          type: Boolean,
          default: false,
        },
        cancellationReason: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        updatedBy: {
          type: Object,
        },
        isInterrupted: {
          type: Boolean,
          default: false,
        },
        canReBook: {
          type: Boolean,
        },
        isPhysicianDisconnected: {
          type: Boolean,
        },
        physicianDisconnectedAt: {
          type: Date,
        },
        isPatientDisconnected: {
          type: Boolean,
        },
        patientDisconnectedAt: {
          type: Date,
        },
        isConnected: {
          type: Boolean,
        },
        patientJoinedAt: {
          type: Date,
        },
        isPatientJoined: {
          type: Boolean,
        },
        physicianJoinedAt: {
          type: Date,
        },
        isPhysicianJoined: {
          type: Boolean,
        },
        sessionToken: {
          type: String,
        },
        sessionId: {
          type: String,
        },
        appointmentHistory: {
          type: String,
        },
        appointmentStatus: {
          type: String,
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

    const appointment = mongoose.model("appointment", schema, "appointment");
    return appointment;
  } else {
    return mongoose.models.appointment;
  }
}
module.exports = makeModel;
