function makeModel(mongoose, ...dependencies) {
  if (!mongoose.models.user) {
    const mongoosePaginate = require("mongoose-paginate-v2");
    const idvalidator = require("mongoose-id-validator");
    const uniqueValidator = require("mongoose-unique-validator");
    const { convertObjectToEnum } = require("../utils/common");
    const {
      PATIENT_UNIQUE_PREFIX,
      PHYSICIAN_UNIQUE_PREFIX,
    } = require("../config/constant/user");
    const { USER_ROLE, DEFAULT_ROLE } = require("../config/authConstant");
    const bcrypt = require("bcrypt");
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
    mongoosePaginate.paginate.options = {
      customLabels: myCustomLabels,
    };
    const Schema = mongoose.Schema;
    const schema = new Schema(
      {
        APDNumber: {
          type: String,
          default: null,
        },
        medication: {
          type: String,
        },
        accomplishments: {
          type: String,
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        averageRating: {
          type: Number,
          default: 0,
        },
        cards: [
          {
            first4: {
              type: String,
            },
            last4: {
              type: String,
            },
            expMonth: {
              type: Number,
            },
            expYear: {
              type: Number,
            },
            brand: {
              type: String,
            },
            cardHolderName: {
              type: String,
            },
            cardToken: {
              type: String,
            },
            isPrimary: {
              type: Boolean,
            },
            id: {
              type: String,
            },
            fingerprint: {
              type: String,
            },
          },
        ],
        createdBy: {
          type: Object,
        },
        deactivationReason: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        deletedAt: {
          type: Date,
        },
        deletedBy: {
          type: Object,
        },
        dob: {
          type: Date,
        },
        email: {
          type: String,
          trim: true,
          required: true,
          unique: true,
        },
        phone: {
          type: String,
          required: true,
          trim: true,
          unique: true,
        },
        emails: [
          {
            email: {
              type: String,
              trim: true,
              unique: true,
            },
            isApproved: {
              type: Boolean,
              default: false,
            },
            countryCode: {
              type: String,
              default: +1,
            },
            name: {
              type: String,
            },
            verificationCode: {
              type: String,
            },
            codeExpiresOn: {
              type: Date,
            },
            isVerified: {
              type: Boolean,
              default: false,
            },
            isDefault: {
              type: Boolean,
              default: false,
            },
          },
        ],
        temporaryEmails: {
          email: {
            type: String,
            trim: true,
            unique: true,
          },
          verificationCode: {
            type: String,
          },
          codeExpiresOn: {
            type: Date,
          },
          isVerified: {
            type: Boolean,
            default: false,
          },
        },
        name: {
          type: String,
        },
        favouriteActivity: {
          type: String,
        },
        firstName: {
          type: String,
        },
        genderId: {
          type: Schema.Types.ObjectId,
          ref: "master",
          default: null,
        },
        hearAboutUs: {
          type: Schema.Types.ObjectId,
          ref: "master",
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        isApproved: {
          type: Boolean,
          default: false,
        },
        isDelete: {
          type: Boolean,
          default: false,
        },
        isDeleted: Boolean,
        emailVerified: {
          type: Boolean,
          default: false,
        },
        phoneVerified: {
          type: Boolean,
          default: false,
        },
        languageIds: [
          {
            type: Schema.Types.ObjectId,
            ref: "master",
          },
        ],
        lastName: {
          type: String,
        },
        libraryPhotos: [
          {
            type: Schema.Types.ObjectId,
            ref: "file",
          },
        ],
        loginReactiveTime: {
          type: Date,
        },
        loginRetryLimit: {
          type: Number,
          default: 0,
        },
        occupation: {
          type: String,
        },
        password: { type: String },
        phones: [
          {
            phone: {
              type: String,
              trim: true,
              unique: true,
            },
            isApproved: {
              type: Boolean,
            },
            countryCode: {
              type: String,
              default: "+61",
            },
            name: {
              type: String,
            },
            verificationCode: {
              type: String,
            },
            codeExpiresOn: {
              type: Date,
            },
            isVerified: {
              type: Boolean,
              default: false,
            },
            isDefault: {
              type: Boolean,
              default: false,
            },
          },
        ],
        temporaryPhones: {
          phone: {
            type: String,
            trim: true,
            unique: true,
          },
          countryCode: {
            type: String,
            default: "+61",
          },
          verificationCode: {
            type: String,
          },
          codeExpiresOn: {
            type: Date,
          },
          isVerified: {
            type: Boolean,
            default: false,
          },
        },
        //for patient
        stripeCustomerId: {
          type: String,
        },
        practiceAddressId: {
          type: Schema.Types.ObjectId,
          ref: "address",
          default: null,
        },
        preferredTimeZone: {
          type: String,
          default: null,
        },
        profilePictureId: {
          type: Schema.Types.ObjectId,
          ref: "file",
        },
        qualifications_and_current_position: {
          type: String,
        },
        referalBy: {
          type: String,
        },
        referalCode: {
          type: String,
        },
        repeatUntilDate: {
          type: Date,
        },
        loginToken: {
          type: String,
        },
        resetPasswordLink: {
          code: String,
          expireTime: Date,
        },
        resetPasswordLinkUsed: {
          type: Boolean,
          default: true,
        },
        rewarding_part_of_practice: {
          type: String,
        },
        uniquePractitioner: {
          type: String,
        },
        roleIds: [
          {
            type: Schema.Types.ObjectId,
            ref: "role",
          },
        ],
        shippingAddress: {
          type: Schema.Types.ObjectId,
          ref: "address",
        },
        hasSlots: {
          type: Boolean,
          default: false,
        },
        specialisations: [
          {
            type: Schema.Types.ObjectId,
            ref: "specialisation",
          },
        ],
        medication: {
          type: String,
          default: null,
        },
        uniqueId: {
          type: String,
        },
        requestId: {
          type: String,
        },
        updatedBy: {
          type: Object,
        },
        firebaseToken: [{ type: String }],
        androidEndpointArn: [
          {
            imei: {
              type: String,
            },
            arn: {
              type: String,
            },
          },
        ],
        androidPlayerId: [
          {
            type: String,
          },
        ],
        iosEndpointArn: [
          {
            arn: {
              type: String,
            },
            deviceToken: {
              type: String,
            },
          },
        ],
        iosPlayerId: [
          {
            type: {
              type: String,
            },
          },
        ],
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
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 8);
      }
      // const userCount = await mongoose.model("user").find({}).count();
      // if (!this.uniqueId) {
      //   this.uniqueId = USER_UNIQUE_PREFIX + userCount;
      // }
      next();
    });

    schema.methods.isPasswordMatch = async function (password) {
      const user = this;
      return bcrypt.compare(password, user.password);
    };
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
    schema.plugin(mongoosePaginate);
    schema.plugin(idvalidator);

    schema.plugin(uniqueValidator);

    const user = mongoose.model("user", schema, "user");
    return user;
  } else {
    return mongoose.models.user;
  }
}
module.exports = makeModel;
