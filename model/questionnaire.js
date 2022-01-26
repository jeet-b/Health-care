function makeModel(mongoose, ...dependencies) {
  if (!mongoose.models.questionnaire) {
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
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: "specialisation",
        },
        sectionId: {
          type: Schema.Types.ObjectId,
          ref: "section",
        },
        // subTitleId:{
        //   type:Schema.Types.ObjectId,
        //   ref:'master',
        //   default:null
        // },
        page: {
          type: Number,
        },
        sequence: {
          type: Number,
        },
        optionsPerLine: {
          type: Number,
        },
        question: {
          question: {
            type: String,
          },
          isRequired: {
            type: Boolean,
          },
          description: {
            type: String,
          },
          type: {
            type: String,
          },
          validation: {
            type: Number,
          },
          specifyOthers: {
            type: Boolean,
          },
        },
        answer: [
          {
            answer: {
              type: String,
              default: null,
            },
            sequence: {
              type: Number,
            },
            description: {
              type: String,
            },
            imageId: {
              _id: {
                type: Schema.Types.ObjectId,
                ref: "file",
              },
              name: {
                type: String,
              },
              type: {
                type: String,
              },
              uri: {
                type: String,
              },
            },
          },
        ],
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

    const questionnaire = mongoose.model(
      "questionnaire",
      schema,
      "questionnaire"
    );
    return questionnaire;
  } else {
    return mongoose.models.questionnaire;
  }
}
module.exports = makeModel;
