const db = require("../config/db");
const async = require("async");
const User = require("../model/user")(db);
const Role = require("../model/role")(db);
const ProjectRoute = require("../model/projectRoute")(db);
const RouteRole = require("../model/routeRole")(db);
const UserRole = require("../model/userRole")(db);
const Master = require("../model/master")(db);
const Section = require("../model/section")(db);
const Specialization = require("../model/specialisation")(db);
const Slot = require("../model/slot")(db);
const Questionnaire = require("../model/questionnaire")(db);
const Treatment = require("../model/treatment")(db);
const Pharmacy = require("../model/pharmacy")(db);
const moment = require("moment");
const { replaceAll } = require("../utils/common");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const user = require("../config/constant/user");
const Address = require("../model/address")(db);
const addressService = require("../services/address");

const { USER_ROLE } = require("../config/authConstant");

async function seedRole() {
  const roles = ["User", "Admin", "User", "Physician", "patient"];
  for (let i = 0; i < roles.length; i++) {
    let result = await Role.findOne({ name: roles[i] });
    if (!result) {
      await Role.create({
        name: roles[i],
        code: roles[i].toUpperCase(),
        weight: 1,
      });
    }
  }
  console.info("Role model seeded 🍺");
}
async function insertChildren(recordId, children, modelName) {
  await Promise.all(
    _.map(children, async (r) => {
      r.parentId = recordId;
      try {
        let child = await Master.create(r);
        await Master.update(
          { _id: recordId },
          { $push: { subMasters: child._id } }
        );
      } catch (e) {
        console.log("error while seeding", e);
      }
    })
  );
}
async function seedSpecializations() {
  let data = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../seeders/specializations.json"),
      "utf8"
    )
  );
  for (let i = 0; i < data.length; i++) {
    let result = await Specialization.findOne({ name: data[i].name });
    if (!result) {
      await Specialization.create(data[i]);
    }
  }
  console.info("Specialization model seeded 🍺");
}
async function seedMaster() {
  try {
    let data = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../seeders/masters.json"),
        "utf8"
      )
    );
    let uniqueField = "code";
    let uniqueDataFieldsData = _.map(data, uniqueField);
    let records = await Master.find({
      [uniqueField]: uniqueDataFieldsData,
    });
    /** if model already have records why would we seed them, it's stupid**/

    if (records && _.size(records) > 0) {
      for (let record of records) {
        let index = _.findIndex(data, {
          [uniqueField]: record[uniqueField],
        });

        if (index > -1) {
          let dataRecord = data[index];

          if (dataRecord.children) {
            let children = _.clone(dataRecord.children);

            let uniqueDataFieldsChildData = _.map(children, uniqueField);
            let childRecords = await Master.find({
              [uniqueField]: uniqueDataFieldsChildData,
            });
            if (childRecords && _.size(childRecords) > 0) {
              for (let childRecord of childRecords) {
                let childIndex = _.findIndex(children, {
                  [uniqueField]: childRecord[uniqueField],
                });
                if (childIndex > -1) {
                  children.splice(childIndex, 1);
                }
              }
            }
            if (children && _.size(children) > 0) {
              await insertChildren(record.id, children, "Master");
            }
          }
          data.splice(index, 1);
        }
      }
    }

    /** add each record one after one**/
    await Promise.all(
      _.map(data, async (record) => {
        let children;
        if (record.children) {
          children = _.clone(record.children);
          delete record.children;
        }
        try {
          let addedRecord = await Master.create(record);
          /** if has child add them and map parentId key **/
          if (children && _.size(children) > 0) {
            await insertChildren(addedRecord.id, children, "Master");
          }
        } catch (e) {
          console.log("error while seeding", e);
        }
      })
    );
    console.log("Master seeded successfully.");
  } catch (e) {
    console.log(e);
    return { error: e };
  }
}
async function seedProjectRoutes(routes) {
  if (routes && routes.length) {
    for (let i = 0; i < routes.length; i++) {
      const routeMethods = routes[i].methods;
      for (let j = 0; j < routeMethods.length; j++) {
        const routeObj = {
          uri: routes[i].path.toLowerCase(),
          method: routeMethods[j],
          route_name: `${replaceAll(
            routes[i].path.toLowerCase().substring(1),
            "/",
            "_"
          )}`,
        };
        let result = await ProjectRoute.findOne(routeObj);
        if (!result) {
          await ProjectRoute.create(routeObj);
        }
      }
    }
    console.info("ProjectRoute model seeded 🍺");
  }
}

async function seedRouteRole() {
  let routeRoles = [];
  let projectRoutes = await ProjectRoute.find();
  //CREATE ROUTES FOR PROJECT_ROUTES
  for (let i = 0; i < projectRoutes.length; i++) {
    if (projectRoutes[i].uri.includes("admin/")) {
      routeRoles.push({
        route: projectRoutes[i].uri,
        method: projectRoutes[i].method,
        role: USER_ROLE.Admin,
      });
    }
    if (projectRoutes[i].uri.includes("device/")) {
      routeRoles.push(
        {
          route: projectRoutes[i].uri,
          method: projectRoutes[i].method,
          role: USER_ROLE.Patient,
        },
        {
          route: projectRoutes[i].uri,
          method: projectRoutes[i].method,
          role: USER_ROLE.Physician,
        }
      );
    }
  }

  //FIND ROLES
  let newRoutes = [];
  let roles = await Role.find();
  for (let j = 0; j < routeRoles.length; j++) {
    let getRole = roles.find(
      (item) => item.code === routeRoles[j].role.toUpperCase()
    );
    if (getRole && getRole._id) {
      let getProjectRoute = await ProjectRoute.findOne({
        uri: routeRoles[j].route.toLowerCase(),
        method: routeRoles[j].method,
      }).select("_id");
      if (getProjectRoute && getProjectRoute._id) {
        let getRouteRole = await RouteRole.findOne({
          roleId: getRole._id,
          routeId: getProjectRoute._id,
        });
        if (getRouteRole == null) {
          newRoutes.push({
            roleId: getRole._id,
            routeId: getProjectRoute._id,
            isActive: true,
            isDeleted: false,
          });
        }
      }
    }
  }

  if (newRoutes.length > 0) {
    console.log(`New Routes: ${newRoutes.length}`);
    await RouteRole.insertMany(newRoutes);
  }
  console.info("RouteRole model seeded 🍺");
}
async function seedUserRole() {
  let user = await User.findOne(
    {
      username: "admin@mailinator.com",
      email: "admin@mailinator.com",
    },
    { id: 1 }
  );
  let role = await Role.findOne({ code: "User" }, { id: 1 });
  if (user && role) {
    await UserRole.create({
      userId: user.id,
      roleId: role.id,
    });
    console.info("UserRole model seeded 🍺");
  }
}

async function seedAdminUsers() {
  let data = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../seeders/users.json"), "utf8")
  );
  let roleAdmin = await Role.findOne({ code: "ADMIN" });
  for (let dataObj of data) {
    dataObj.roleIds = [roleAdmin._id];
    let existingUser = await User.findOne({
      email: dataObj.email,
      phone: dataObj.phone,
    });
    if (!existingUser) {
      await User.create(dataObj);
    }
  }

  console.info("users model seeded 🍺");
}

async function seedSlot() {
  try {
    const slotSeeder = require("../seeder/slotSeeder.json");
    for (let i = 0; i <= 6; i++) {
      let startTime = moment(slotSeeder[i].startTime, "HH:mm");
      let endTime = moment(slotSeeder[i].endTime, "HH:mm");
      let interval = 30;
      let startDateTime = moment(startTime).add(interval, "minutes");
      let num = 1;
      result = await Slot.deleteMany({ dayOfWeek: i });
      while (startDateTime <= endTime) {
        let startDate = moment(startTime).format("HH:mm");
        startTime.add(interval, "minutes");
        startDateTime.add(interval, "minutes");
        let endDate = moment(startTime).format("HH:mm");
        let data = new Slot({
          dayOfWeek: slotSeeder[i].dayOfWeek,
          startTime: startDate,
          endTime: endDate,
          slotId: num,
        });

        await Slot.create(data);
        num++;
      }
    }
    console.log("Slots seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error in seedSlots!", error);
  }
}

async function seedQuestionnaire() {
  try {
    const questionnaireSeeder = require("../seeder/questionnaireSeeder.json");
    // result = await Questionnaire.deleteMany()
    for (let i = 0; i < questionnaireSeeder.length; i++) {
      let questionnaireData = await Questionnaire.findOne({
        "question.question": questionnaireSeeder[i].question.question,
        "question.type": questionnaireSeeder[i].question.type,
      });
      if (questionnaireData) {
        break;
      }
      let specialisation = await Specialization.findOne({
        name: questionnaireSeeder[i].serviceId,
      });
      questionnaireSeeder[i].serviceId = specialisation._id;
      let section = await Section.findOne({
        name: questionnaireSeeder[i].section,
        sequence: questionnaireSeeder[i].sectionSequence,
      });
      questionnaireSeeder[i].sectionId = section._id;
      await Questionnaire.create(questionnaireSeeder[i]);
    }
    console.log("Questionnaire seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error in seedQuestionnaire!", error);
  }
}
async function seedTreatment() {
  try {
    const treatmentSeeder = require("../seeder/treatmentSeeder.json");
    result = await Treatment.deleteMany();
    for (let i = 0; i < treatmentSeeder.length; i++) {
      await Treatment.create(treatmentSeeder[i]);
    }
    console.log("Treatment seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error in seedTreatment!", error);
  }
}

async function seedPharmacy() {
  try {
    let pharmacySeeder = require("../seeder/pharmacySeeder.json");
    let addressData;
    let address = [];
    let addressId;
    for (let i = 0; i < pharmacySeeder.length; i++) {
      let pharmacyData = await Pharmacy.findOne({
        name: pharmacySeeder[i].name,
      });
      if (pharmacyData) {
        break;
      }
      for (let j = 0; j < pharmacySeeder[i].address.length; j++) {
        addressData = await addressService.checkRequest(
          pharmacySeeder[i].address[j]
        );
        addressId = await Address.create(addressData);
        address.push(addressId._id);
      }
      pharmacySeeder[i].addressIds = pharmacySeeder[i].address;
      delete pharmacySeeder[i].address;
      await Pharmacy.create(pharmacySeeder[i]);
    }
    console.log("Pharmacy seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error in seedPharmacy!", error);
  }
}

async function seedSection() {
  try {
    const sectionSeeder = require("../seeder/sectionSeeder.json");
    for (let i = 0; i < sectionSeeder.length; i++) {
      let sectionData = await Section.findOne({
        name: sectionSeeder[i].name,
        subTitle: sectionSeeder[i].subTitle,
      });
      if (sectionData) {
        break;
      }
      await Section.create(sectionSeeder[i]);
    }
    console.log("Section seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error in seedService!", error);
  }
}

async function seedData(allRegisterRoutes) {
  await seedSection();
  await seedRole();
  await seedAdminUsers();
  await seedProjectRoutes(allRegisterRoutes);
  await seedRouteRole();
  await seedMaster();
  await seedSpecializations();
  await seedSlot();
  await seedQuestionnaire();
  // await seedTreatment();
  await seedPharmacy();
}

module.exports = seedData;
