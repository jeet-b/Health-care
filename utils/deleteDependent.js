const db = require('../config/db');
let EducationContent = require('../model/educationContent')(db);
let Chat = require('../model/chat')(db);
let Messages = require('../model/messages')(db);
let Invoice = require('../model/invoice')(db);
let Role = require('../model/role')(db);
let UserActivity = require('../model/userActivity')(db);
let AppointmentSummary = require('../model/appointmentSummary')(db);
let Notification = require('../model/notification')(db);
let Order = require('../model/order')(db);
let Form = require('../model/form')(db);
let Appointment = require('../model/appointment')(db);
let RatingReview = require('../model/ratingReview')(db);
let Transaction = require('../model/transaction')(db);
let ProviderSlot = require('../model/providerSlot')(db);
let Faqs = require('../model/faqs')(db);
let City = require('../model/city')(db);
let PostalCode = require('../model/postalCode')(db);
let Specialisation = require('../model/specialisation')(db);
let Country = require('../model/country')(db);
let Province = require('../model/province')(db);
let Pages = require('../model/pages')(db);
let Address = require('../model/address')(db);
let File = require('../model/file')(db);
let Master = require('../model/master')(db);
let User = require('../model/user')(db);
let ProjectRoute = require('../model/projectRoute')(db);
let RouteRole = require('../model/routeRole')(db);
let UserRole = require('../model/userRole')(db);

const deleteEducationContent = async (filter) =>{
  try {
    return await EducationContent.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteChat = async (filter) =>{
  try {
    return await Chat.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteMessages = async (filter) =>{
  try {
    return await Messages.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteInvoice = async (filter) =>{
  try {
    return await Invoice.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteRole = async (filter) =>{
  try {
    let role = await Role.find(filter, { _id:1 });
    if (role){
      role = role.map((obj) => obj._id);
      const userActivityFilter4769 = { 'roleId': { '$in': role } };
      const userActivity7232 = await deleteUserActivity(userActivityFilter4769);
      const userFilter6927 = { 'roleIds': { '$in': role } };
      const user2617 = await deleteUser(userFilter6927);
      const routeRoleFilter7934 = { 'roleId': { '$in': role } };
      const routeRole5832 = await deleteRouteRole(routeRoleFilter7934);
      const userRoleFilter3846 = { 'roleId': { '$in': role } };
      const userRole0317 = await deleteUserRole(userRoleFilter3846);
      return await Role.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteUserActivity = async (filter) =>{
  try {
    return await UserActivity.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteAppointmentSummary = async (filter) =>{
  try {
    return await AppointmentSummary.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteNotification = async (filter) =>{
  try {
    return await Notification.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteOrder = async (filter) =>{
  try {
    let order = await Order.find(filter, { _id:1 });
    if (order){
      order = order.map((obj) => obj._id);
      const invoiceFilter7620 = { 'orderId': { '$in': order } };
      const invoice1147 = await deleteInvoice(invoiceFilter7620);
      const transactionFilter4855 = { 'orderId': { '$in': order } };
      const transaction4155 = await deleteTransaction(transactionFilter4855);
      return await Order.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteForm = async (filter) =>{
  try {
    let form = await Form.find(filter, { _id:1 });
    if (form){
      form = form.map((obj) => obj._id);
      const appointmentFilter2613 = { 'form': { '$in': form } };
      const appointment6556 = await deleteAppointment(appointmentFilter2613);
      const appointmentFilter8265 = { 'patientIntakeFormId': { '$in': form } };
      const appointment6217 = await deleteAppointment(appointmentFilter8265);
      return await Form.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteAppointment = async (filter) =>{
  try {
    let appointment = await Appointment.find(filter, { _id:1 });
    if (appointment){
      appointment = appointment.map((obj) => obj._id);
      const invoiceFilter3272 = { 'appointmentId': { '$in': appointment } };
      const invoice7700 = await deleteInvoice(invoiceFilter3272);
      const appointmentSummaryFilter8834 = { 'appointmentId': { '$in': appointment } };
      const appointmentSummary6342 = await deleteAppointmentSummary(appointmentSummaryFilter8834);
      const orderFilter7019 = { 'appointmentId': { '$in': appointment } };
      const order3360 = await deleteOrder(orderFilter7019);
      return await Appointment.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteRatingReview = async (filter) =>{
  try {
    return await RatingReview.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteTransaction = async (filter) =>{
  try {
    let transaction = await Transaction.find(filter, { _id:1 });
    if (transaction){
      transaction = transaction.map((obj) => obj._id);
      const invoiceFilter2466 = { 'transactionId': { '$in': transaction } };
      const invoice4658 = await deleteInvoice(invoiceFilter2466);
      return await Transaction.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteProviderSlot = async (filter) =>{
  try {
    let providerSlot = await ProviderSlot.find(filter, { _id:1 });
    if (providerSlot){
      providerSlot = providerSlot.map((obj) => obj._id);
      const appointmentFilter3003 = { 'timeSlotId': { '$in': providerSlot } };
      const appointment7928 = await deleteAppointment(appointmentFilter3003);
      return await ProviderSlot.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteFaqs = async (filter) =>{
  try {
    return await Faqs.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteCity = async (filter) =>{
  try {
    let city = await City.find(filter, { _id:1 });
    if (city){
      city = city.map((obj) => obj._id);
      const postalCodeFilter4785 = { 'cityId': { '$in': city } };
      const postalCode0722 = await deletePostalCode(postalCodeFilter4785);
      const addressFilter6741 = { 'cityId': { '$in': city } };
      const address5486 = await deleteAddress(addressFilter6741);
      return await City.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deletePostalCode = async (filter) =>{
  try {
    let postalCode = await PostalCode.find(filter, { _id:1 });
    if (postalCode){
      postalCode = postalCode.map((obj) => obj._id);
      const addressFilter8734 = { 'postalCodeId': { '$in': postalCode } };
      const address5064 = await deleteAddress(addressFilter8734);
      return await PostalCode.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteSpecialisation = async (filter) =>{
  try {
    let specialisation = await Specialisation.find(filter, { _id:1 });
    if (specialisation){
      specialisation = specialisation.map((obj) => obj._id);
      const formFilter0048 = { 'specialisationIds': { '$in': specialisation } };
      const form2962 = await deleteForm(formFilter0048);
      const appointmentFilter5231 = { 'specialisationId': { '$in': specialisation } };
      const appointment2775 = await deleteAppointment(appointmentFilter5231);
      const userFilter4232 = { 'specialisations': { '$in': specialisation } };
      const user3027 = await deleteUser(userFilter4232);
      return await Specialisation.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteCountry = async (filter) =>{
  try {
    let country = await Country.find(filter, { _id:1 });
    if (country){
      country = country.map((obj) => obj._id);
      const provinceFilter4460 = { 'countryId': { '$in': country } };
      const province9346 = await deleteProvince(provinceFilter4460);
      const addressFilter5762 = { 'countryId': { '$in': country } };
      const address7945 = await deleteAddress(addressFilter5762);
      return await Country.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteProvince = async (filter) =>{
  try {
    let province = await Province.find(filter, { _id:1 });
    if (province){
      province = province.map((obj) => obj._id);
      const cityFilter8603 = { 'provinceId': { '$in': province } };
      const city9304 = await deleteCity(cityFilter8603);
      const addressFilter4155 = { 'provinceId': { '$in': province } };
      const address6021 = await deleteAddress(addressFilter4155);
      return await Province.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deletePages = async (filter) =>{
  try {
    return await Pages.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteAddress = async (filter) =>{
  try {
    let address = await Address.find(filter, { _id:1 });
    if (address){
      address = address.map((obj) => obj._id);
      const userFilter0587 = { 'practiceAddressId': { '$in': address } };
      const user6539 = await deleteUser(userFilter0587);
      const userFilter5066 = { 'shippingAddress': { '$in': address } };
      const user7412 = await deleteUser(userFilter5066);
      return await Address.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteFile = async (filter) =>{
  try {
    let file = await File.find(filter, { _id:1 });
    if (file){
      file = file.map((obj) => obj._id);
      const educationContentFilter9820 = { 'files': { '$in': file } };
      const educationContent7953 = await deleteEducationContent(educationContentFilter9820);
      const messagesFilter0183 = { 'files': { '$in': file } };
      const messages6688 = await deleteMessages(messagesFilter0183);
      const appointmentSummaryFilter7799 = { 'treatmentIds': { '$in': file } };
      const appointmentSummary9856 = await deleteAppointmentSummary(appointmentSummaryFilter7799);
      const specialisationFilter9772 = { 'file': { '$in': file } };
      const specialisation6234 = await deleteSpecialisation(specialisationFilter9772);
      const userFilter3777 = { 'profilePictureId': { '$in': file } };
      const user6266 = await deleteUser(userFilter3777);
      const userFilter3602 = { 'libraryPhotos': { '$in': file } };
      const user8562 = await deleteUser(userFilter3602);
      return await File.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteMaster = async (filter) =>{
  try {
    let master = await Master.find(filter, { _id:1 });
    if (master){
      master = master.map((obj) => obj._id);
      const appointmentSummaryFilter0242 = { 'diagnosis': { '$in': master } };
      const appointmentSummary2488 = await deleteAppointmentSummary(appointmentSummaryFilter0242);
      const appointmentSummaryFilter0541 = { 'allergies': { '$in': master } };
      const appointmentSummary4065 = await deleteAppointmentSummary(appointmentSummaryFilter0541);
      const appointmentSummaryFilter3500 = { 'referTo': { '$in': master } };
      const appointmentSummary3439 = await deleteAppointmentSummary(appointmentSummaryFilter3500);
      const notificationFilter4646 = { 'type': { '$in': master } };
      const notification9694 = await deleteNotification(notificationFilter4646);
      const appointmentFilter6345 = { 'appointmentType': { '$in': master } };
      const appointment8006 = await deleteAppointment(appointmentFilter6345);
      const appointmentFilter7327 = { 'callMode': { '$in': master } };
      const appointment0403 = await deleteAppointment(appointmentFilter7327);
      const ratingReviewFilter8440 = { 'type': { '$in': master } };
      const ratingReview6161 = await deleteRatingReview(ratingReviewFilter8440);
      const transactionFilter4984 = { 'transactionType': { '$in': master } };
      const transaction9959 = await deleteTransaction(transactionFilter4984);
      const transactionFilter6114 = { 'chargeType': { '$in': master } };
      const transaction3677 = await deleteTransaction(transactionFilter6114);
      const providerSlotFilter7344 = { 'type': { '$in': master } };
      const providerSlot4913 = await deleteProviderSlot(providerSlotFilter7344);
      const masterFilter0628 = { 'parentId': { '$in': master } };
      const master7691 = await deleteMaster(masterFilter0628);
      const userFilter0563 = { 'genderId': { '$in': master } };
      const user7774 = await deleteUser(userFilter0563);
      const userFilter9222 = { 'languageIds': { '$in': master } };
      const user9947 = await deleteUser(userFilter9222);
      // const userFilter6001 = { 'occupation': { '$in': master } };
      // const user7829 = await deleteUser(userFilter6001);
      const userFilter4853 = { 'hearAboutUs': { '$in': master } };
      const user7585 = await deleteUser(userFilter4853);
      const userFilter0444 = { 'deactivationReason': { '$in': master } };
      const user4227 = await deleteUser(userFilter0444);
      return await Master.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteUser = async (filter) =>{
  try {
    let user = await User.find(filter, { _id:1 });
    if (user){
      user = user.map((obj) => obj._id);
      const chatFilter6231 = { 'fromId': { '$in': user } };
      const chat3966 = await deleteChat(chatFilter6231);
      const messagesFilter2106 = { 'fromId': { '$in': user } };
      const messages4386 = await deleteMessages(messagesFilter2106);
      const invoiceFilter4584 = { 'patientId': { '$in': user } };
      const invoice3001 = await deleteInvoice(invoiceFilter4584);
      const invoiceFilter0547 = { 'providerId': { '$in': user } };
      const invoice6119 = await deleteInvoice(invoiceFilter0547);
      const userActivityFilter5115 = { 'userId': { '$in': user } };
      const userActivity3293 = await deleteUserActivity(userActivityFilter5115);
      const userActivityFilter3792 = { 'adminId': { '$in': user } };
      const userActivity9770 = await deleteUserActivity(userActivityFilter3792);
      const appointmentSummaryFilter4352 = { 'patientId': { '$in': user } };
      const appointmentSummary3805 = await deleteAppointmentSummary(appointmentSummaryFilter4352);
      const appointmentSummaryFilter5484 = { 'providerId': { '$in': user } };
      const appointmentSummary2044 = await deleteAppointmentSummary(appointmentSummaryFilter5484);
      const orderFilter6874 = { 'patientId': { '$in': user } };
      const order5955 = await deleteOrder(orderFilter6874);
      const orderFilter2645 = { 'providerId': { '$in': user } };
      const order3739 = await deleteOrder(orderFilter2645);
      const appointmentFilter4856 = { 'cancelledBy': { '$in': user } };
      const appointment1524 = await deleteAppointment(appointmentFilter4856);
      const appointmentFilter5425 = { 'providerId': { '$in': user } };
      const appointment7195 = await deleteAppointment(appointmentFilter5425);
      const ratingReviewFilter1777 = { 'to': { '$in': user } };
      const ratingReview4183 = await deleteRatingReview(ratingReviewFilter1777);
      const ratingReviewFilter1795 = { 'from': { '$in': user } };
      const ratingReview8748 = await deleteRatingReview(ratingReviewFilter1795);
      const ratingReviewFilter8506 = { 'appointmentId': { '$in': user } };
      const ratingReview0846 = await deleteRatingReview(ratingReviewFilter8506);
      const transactionFilter9161 = { 'transactionBy': { '$in': user } };
      const transaction9633 = await deleteTransaction(transactionFilter9161);
      const transactionFilter4534 = { 'providerId': { '$in': user } };
      const transaction4032 = await deleteTransaction(transactionFilter4534);
      const transactionFilter8640 = { 'appointmentId': { '$in': user } };
      const transaction3173 = await deleteTransaction(transactionFilter8640);
      const providerSlotFilter8266 = { 'userId': { '$in': user } };
      const providerSlot9274 = await deleteProviderSlot(providerSlotFilter8266);
      const userRoleFilter1058 = { 'userId': { '$in': user } };
      const userRole4612 = await deleteUserRole(userRoleFilter1058);
      return await User.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteProjectRoute = async (filter) =>{
  try {
    let projectRoute = await ProjectRoute.find(filter, { _id:1 });
    if (projectRoute){
      projectRoute = projectRoute.map((obj) => obj._id);
      const routeRoleFilter8383 = { 'routeId': { '$in': projectRoute } };
      const routeRole2931 = await deleteRouteRole(routeRoleFilter8383);
      return await ProjectRoute.deleteMany(filter);
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteRouteRole = async (filter) =>{
  try {
    return await RouteRole.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteUserRole = async (filter) =>{
  try {
    return await UserRole.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const countEducationContent = async (filter) =>{
  try {
    const educationContentCnt =  await EducationContent.countDocuments(filter);
    return { educationContent : educationContentCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countChat = async (filter) =>{
  try {
    const chatCnt =  await Chat.countDocuments(filter);
    return { chat : chatCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countMessages = async (filter) =>{
  try {
    const messagesCnt =  await Messages.countDocuments(filter);
    return { messages : messagesCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countInvoice = async (filter) =>{
  try {
    const invoiceCnt =  await Invoice.countDocuments(filter);
    return { invoice : invoiceCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countRole = async (filter) =>{
  try {
    let role = await Role.find(filter, { _id:1 });
    if (role){
      role = role.map((obj) => obj._id);
      const userActivityFilter0904 = { 'roleId': { '$in': role } };
      const userActivity9688Cnt = await countUserActivity(userActivityFilter0904);
      const userFilter0709 = { 'roleIds': { '$in': role } };
      const user8318Cnt = await countUser(userFilter0709);
      const routeRoleFilter4846 = { 'roleId': { '$in': role } };
      const routeRole8354Cnt = await countRouteRole(routeRoleFilter4846);
      const userRoleFilter6618 = { 'roleId': { '$in': role } };
      const userRole1970Cnt = await countUserRole(userRoleFilter6618);
      const roleCnt =  await Role.countDocuments(filter);
      let response = { role : roleCnt  };
      response = {
        ...response,
        ...userActivity9688Cnt,
        ...user8318Cnt,
        ...routeRole8354Cnt,
        ...userRole1970Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countUserActivity = async (filter) =>{
  try {
    const userActivityCnt =  await UserActivity.countDocuments(filter);
    return { userActivity : userActivityCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countAppointmentSummary = async (filter) =>{
  try {
    const appointmentSummaryCnt =  await AppointmentSummary.countDocuments(filter);
    return { appointmentSummary : appointmentSummaryCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countNotification = async (filter) =>{
  try {
    const notificationCnt =  await Notification.countDocuments(filter);
    return { notification : notificationCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countOrder = async (filter) =>{
  try {
    let order = await Order.find(filter, { _id:1 });
    if (order){
      order = order.map((obj) => obj._id);
      const invoiceFilter8218 = { 'orderId': { '$in': order } };
      const invoice4326Cnt = await countInvoice(invoiceFilter8218);
      const transactionFilter5439 = { 'orderId': { '$in': order } };
      const transaction2889Cnt = await countTransaction(transactionFilter5439);
      const orderCnt =  await Order.countDocuments(filter);
      let response = { order : orderCnt  };
      response = {
        ...response,
        ...invoice4326Cnt,
        ...transaction2889Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countForm = async (filter) =>{
  try {
    let form = await Form.find(filter, { _id:1 });
    if (form){
      form = form.map((obj) => obj._id);
      const appointmentFilter6723 = { 'form': { '$in': form } };
      const appointment3982Cnt = await countAppointment(appointmentFilter6723);
      const appointmentFilter3296 = { 'patientIntakeFormId': { '$in': form } };
      const appointment2548Cnt = await countAppointment(appointmentFilter3296);
      const formCnt =  await Form.countDocuments(filter);
      let response = { form : formCnt  };
      response = {
        ...response,
        ...appointment3982Cnt,
        ...appointment2548Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countAppointment = async (filter) =>{
  try {
    let appointment = await Appointment.find(filter, { _id:1 });
    if (appointment){
      appointment = appointment.map((obj) => obj._id);
      const invoiceFilter0967 = { 'appointmentId': { '$in': appointment } };
      const invoice9249Cnt = await countInvoice(invoiceFilter0967);
      const appointmentSummaryFilter4314 = { 'appointmentId': { '$in': appointment } };
      const appointmentSummary9134Cnt = await countAppointmentSummary(appointmentSummaryFilter4314);
      const orderFilter7657 = { 'appointmentId': { '$in': appointment } };
      const order0837Cnt = await countOrder(orderFilter7657);
      const appointmentCnt =  await Appointment.countDocuments(filter);
      let response = { appointment : appointmentCnt  };
      response = {
        ...response,
        ...invoice9249Cnt,
        ...appointmentSummary9134Cnt,
        ...order0837Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countRatingReview = async (filter) =>{
  try {
    const ratingReviewCnt =  await RatingReview.countDocuments(filter);
    return { ratingReview : ratingReviewCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countTransaction = async (filter) =>{
  try {
    let transaction = await Transaction.find(filter, { _id:1 });
    if (transaction){
      transaction = transaction.map((obj) => obj._id);
      const invoiceFilter7233 = { 'transactionId': { '$in': transaction } };
      const invoice5900Cnt = await countInvoice(invoiceFilter7233);
      const transactionCnt =  await Transaction.countDocuments(filter);
      let response = { transaction : transactionCnt  };
      response = {
        ...response,
        ...invoice5900Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countProviderSlot = async (filter) =>{
  try {
    let providerSlot = await ProviderSlot.find(filter, { _id:1 });
    if (providerSlot){
      providerSlot = providerSlot.map((obj) => obj._id);
      const appointmentFilter9530 = { 'timeSlotId': { '$in': providerSlot } };
      const appointment6419Cnt = await countAppointment(appointmentFilter9530);
      const providerSlotCnt =  await ProviderSlot.countDocuments(filter);
      let response = { providerSlot : providerSlotCnt  };
      response = {
        ...response,
        ...appointment6419Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countFaqs = async (filter) =>{
  try {
    const faqsCnt =  await Faqs.countDocuments(filter);
    return { faqs : faqsCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countCity = async (filter) =>{
  try {
    let city = await City.find(filter, { _id:1 });
    if (city){
      city = city.map((obj) => obj._id);
      const postalCodeFilter1114 = { 'cityId': { '$in': city } };
      const postalCode3370Cnt = await countPostalCode(postalCodeFilter1114);
      const addressFilter3164 = { 'cityId': { '$in': city } };
      const address2153Cnt = await countAddress(addressFilter3164);
      const cityCnt =  await City.countDocuments(filter);
      let response = { city : cityCnt  };
      response = {
        ...response,
        ...postalCode3370Cnt,
        ...address2153Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countPostalCode = async (filter) =>{
  try {
    let postalCode = await PostalCode.find(filter, { _id:1 });
    if (postalCode){
      postalCode = postalCode.map((obj) => obj._id);
      const addressFilter6586 = { 'postalCodeId': { '$in': postalCode } };
      const address3870Cnt = await countAddress(addressFilter6586);
      const postalCodeCnt =  await PostalCode.countDocuments(filter);
      let response = { postalCode : postalCodeCnt  };
      response = {
        ...response,
        ...address3870Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countSpecialisation = async (filter) =>{
  try {
    let specialisation = await Specialisation.find(filter, { _id:1 });
    if (specialisation){
      specialisation = specialisation.map((obj) => obj._id);
      const formFilter5806 = { 'specialisationIds': { '$in': specialisation } };
      const form3544Cnt = await countForm(formFilter5806);
      const appointmentFilter1654 = { 'specialisationId': { '$in': specialisation } };
      const appointment9243Cnt = await countAppointment(appointmentFilter1654);
      const userFilter8752 = { 'specialisations': { '$in': specialisation } };
      const user9193Cnt = await countUser(userFilter8752);
      const specialisationCnt =  await Specialisation.countDocuments(filter);
      let response = { specialisation : specialisationCnt  };
      response = {
        ...response,
        ...form3544Cnt,
        ...appointment9243Cnt,
        ...user9193Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countCountry = async (filter) =>{
  try {
    let country = await Country.find(filter, { _id:1 });
    if (country){
      country = country.map((obj) => obj._id);
      const provinceFilter4844 = { 'countryId': { '$in': country } };
      const province6584Cnt = await countProvince(provinceFilter4844);
      const addressFilter1452 = { 'countryId': { '$in': country } };
      const address8442Cnt = await countAddress(addressFilter1452);
      const countryCnt =  await Country.countDocuments(filter);
      let response = { country : countryCnt  };
      response = {
        ...response,
        ...province6584Cnt,
        ...address8442Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countProvince = async (filter) =>{
  try {
    let province = await Province.find(filter, { _id:1 });
    if (province){
      province = province.map((obj) => obj._id);
      const cityFilter9498 = { 'provinceId': { '$in': province } };
      const city9718Cnt = await countCity(cityFilter9498);
      const addressFilter9773 = { 'provinceId': { '$in': province } };
      const address8590Cnt = await countAddress(addressFilter9773);
      const provinceCnt =  await Province.countDocuments(filter);
      let response = { province : provinceCnt  };
      response = {
        ...response,
        ...city9718Cnt,
        ...address8590Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countPages = async (filter) =>{
  try {
    const pagesCnt =  await Pages.countDocuments(filter);
    return { pages : pagesCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countAddress = async (filter) =>{
  try {
    let address = await Address.find(filter, { _id:1 });
    if (address){
      address = address.map((obj) => obj._id);
      const userFilter3314 = { 'practiceAddressId': { '$in': address } };
      const user5138Cnt = await countUser(userFilter3314);
      const userFilter8915 = { 'shippingAddress': { '$in': address } };
      const user2829Cnt = await countUser(userFilter8915);
      const addressCnt =  await Address.countDocuments(filter);
      let response = { address : addressCnt  };
      response = {
        ...response,
        ...user5138Cnt,
        ...user2829Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countFile = async (filter) =>{
  try {
    let file = await File.find(filter, { _id:1 });
    if (file){
      file = file.map((obj) => obj._id);
      const educationContentFilter9847 = { 'files': { '$in': file } };
      const educationContent4846Cnt = await countEducationContent(educationContentFilter9847);
      const messagesFilter9781 = { 'files': { '$in': file } };
      const messages3265Cnt = await countMessages(messagesFilter9781);
      const appointmentSummaryFilter2425 = { 'treatmentIds': { '$in': file } };
      const appointmentSummary8967Cnt = await countAppointmentSummary(appointmentSummaryFilter2425);
      const specialisationFilter1109 = { 'file': { '$in': file } };
      const specialisation0827Cnt = await countSpecialisation(specialisationFilter1109);
      const userFilter7520 = { 'profilePictureId': { '$in': file } };
      const user5367Cnt = await countUser(userFilter7520);
      const userFilter6199 = { 'libraryPhotos': { '$in': file } };
      const user7727Cnt = await countUser(userFilter6199);
      const fileCnt =  await File.countDocuments(filter);
      let response = { file : fileCnt  };
      response = {
        ...response,
        ...educationContent4846Cnt,
        ...messages3265Cnt,
        ...appointmentSummary8967Cnt,
        ...specialisation0827Cnt,
        ...user5367Cnt,
        ...user7727Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countMaster = async (filter) =>{
  try {
    let master = await Master.find(filter, { _id:1 });
    if (master){
      master = master.map((obj) => obj._id);
      const appointmentSummaryFilter2873 = { 'diagnosis': { '$in': master } };
      const appointmentSummary2879Cnt = await countAppointmentSummary(appointmentSummaryFilter2873);
      const appointmentSummaryFilter1687 = { 'allergies': { '$in': master } };
      const appointmentSummary1473Cnt = await countAppointmentSummary(appointmentSummaryFilter1687);
      const appointmentSummaryFilter9918 = { 'referTo': { '$in': master } };
      const appointmentSummary2895Cnt = await countAppointmentSummary(appointmentSummaryFilter9918);
      const notificationFilter5588 = { 'type': { '$in': master } };
      const notification3882Cnt = await countNotification(notificationFilter5588);
      const appointmentFilter6247 = { 'appointmentType': { '$in': master } };
      const appointment8165Cnt = await countAppointment(appointmentFilter6247);
      const appointmentFilter3630 = { 'callMode': { '$in': master } };
      const appointment5539Cnt = await countAppointment(appointmentFilter3630);
      const ratingReviewFilter8765 = { 'type': { '$in': master } };
      const ratingReview1903Cnt = await countRatingReview(ratingReviewFilter8765);
      const transactionFilter3896 = { 'transactionType': { '$in': master } };
      const transaction2508Cnt = await countTransaction(transactionFilter3896);
      const transactionFilter3338 = { 'chargeType': { '$in': master } };
      const transaction7112Cnt = await countTransaction(transactionFilter3338);
      const providerSlotFilter7010 = { 'type': { '$in': master } };
      const providerSlot3049Cnt = await countProviderSlot(providerSlotFilter7010);
      const masterFilter9117 = { 'parentId': { '$in': master } };
      const master2807Cnt = await countMaster(masterFilter9117);
      const userFilter7240 = { 'genderId': { '$in': master } };
      const user9133Cnt = await countUser(userFilter7240);
      const userFilter5646 = { 'languageIds': { '$in': master } };
      const user3902Cnt = await countUser(userFilter5646);
      // const userFilter9346 = { 'occupation': { '$in': master } };
      // const user0040Cnt = await countUser(userFilter9346);
      const userFilter6974 = { 'hearAboutUs': { '$in': master } };
      const user0776Cnt = await countUser(userFilter6974);
      const userFilter1121 = { 'deactivationReason': { '$in': master } };
      const user9626Cnt = await countUser(userFilter1121);
      const masterCnt =  await Master.countDocuments(filter);
      let response = { master : masterCnt  };
      response = {
        ...response,
        ...appointmentSummary2879Cnt,
        ...appointmentSummary1473Cnt,
        ...appointmentSummary2895Cnt,
        ...notification3882Cnt,
        ...appointment8165Cnt,
        ...appointment5539Cnt,
        ...ratingReview1903Cnt,
        ...transaction2508Cnt,
        ...transaction7112Cnt,
        ...providerSlot3049Cnt,
        ...master2807Cnt,
        ...user9133Cnt,
        ...user3902Cnt,
        ...user0040Cnt,
        ...user0776Cnt,
        ...user9626Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countUser = async (filter) =>{
  try {
    let user = await User.find(filter, { _id:1 });
    if (user){
      user = user.map((obj) => obj._id);
      const chatFilter9955 = { 'fromId': { '$in': user } };
      const chat7599Cnt = await countChat(chatFilter9955);
      const messagesFilter8316 = { 'fromId': { '$in': user } };
      const messages9292Cnt = await countMessages(messagesFilter8316);
      const invoiceFilter7675 = { 'patientId': { '$in': user } };
      const invoice4887Cnt = await countInvoice(invoiceFilter7675);
      const invoiceFilter6609 = { 'providerId': { '$in': user } };
      const invoice4695Cnt = await countInvoice(invoiceFilter6609);
      const userActivityFilter9225 = { 'userId': { '$in': user } };
      const userActivity4347Cnt = await countUserActivity(userActivityFilter9225);
      const userActivityFilter9965 = { 'adminId': { '$in': user } };
      const userActivity6710Cnt = await countUserActivity(userActivityFilter9965);
      const appointmentSummaryFilter0549 = { 'patientId': { '$in': user } };
      const appointmentSummary6322Cnt = await countAppointmentSummary(appointmentSummaryFilter0549);
      const appointmentSummaryFilter9794 = { 'providerId': { '$in': user } };
      const appointmentSummary3531Cnt = await countAppointmentSummary(appointmentSummaryFilter9794);
      const orderFilter6291 = { 'patientId': { '$in': user } };
      const order9810Cnt = await countOrder(orderFilter6291);
      const orderFilter5890 = { 'providerId': { '$in': user } };
      const order9662Cnt = await countOrder(orderFilter5890);
      const appointmentFilter9620 = { 'cancelledBy': { '$in': user } };
      const appointment9607Cnt = await countAppointment(appointmentFilter9620);
      const appointmentFilter5625 = { 'providerId': { '$in': user } };
      const appointment3288Cnt = await countAppointment(appointmentFilter5625);
      const ratingReviewFilter4285 = { 'to': { '$in': user } };
      const ratingReview6955Cnt = await countRatingReview(ratingReviewFilter4285);
      const ratingReviewFilter3262 = { 'from': { '$in': user } };
      const ratingReview6063Cnt = await countRatingReview(ratingReviewFilter3262);
      const ratingReviewFilter9452 = { 'appointmentId': { '$in': user } };
      const ratingReview6896Cnt = await countRatingReview(ratingReviewFilter9452);
      const transactionFilter9221 = { 'transactionBy': { '$in': user } };
      const transaction7440Cnt = await countTransaction(transactionFilter9221);
      const transactionFilter5814 = { 'providerId': { '$in': user } };
      const transaction2432Cnt = await countTransaction(transactionFilter5814);
      const transactionFilter4413 = { 'appointmentId': { '$in': user } };
      const transaction0316Cnt = await countTransaction(transactionFilter4413);
      const providerSlotFilter5661 = { 'userId': { '$in': user } };
      const providerSlot8088Cnt = await countProviderSlot(providerSlotFilter5661);
      const userRoleFilter5796 = { 'userId': { '$in': user } };
      const userRole5384Cnt = await countUserRole(userRoleFilter5796);
      const userCnt =  await User.countDocuments(filter);
      let response = { user : userCnt  };
      response = {
        ...response,
        ...chat7599Cnt,
        ...messages9292Cnt,
        ...invoice4887Cnt,
        ...invoice4695Cnt,
        ...userActivity4347Cnt,
        ...userActivity6710Cnt,
        ...appointmentSummary6322Cnt,
        ...appointmentSummary3531Cnt,
        ...order9810Cnt,
        ...order9662Cnt,
        ...appointment9607Cnt,
        ...appointment3288Cnt,
        ...ratingReview6955Cnt,
        ...ratingReview6063Cnt,
        ...ratingReview6896Cnt,
        ...transaction7440Cnt,
        ...transaction2432Cnt,
        ...transaction0316Cnt,
        ...providerSlot8088Cnt,
        ...userRole5384Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countProjectRoute = async (filter) =>{
  try {
    let projectRoute = await ProjectRoute.find(filter, { _id:1 });
    if (projectRoute){
      projectRoute = projectRoute.map((obj) => obj._id);
      const routeRoleFilter9741 = { 'routeId': { '$in': projectRoute } };
      const routeRole7174Cnt = await countRouteRole(routeRoleFilter9741);
      const projectRouteCnt =  await ProjectRoute.countDocuments(filter);
      let response = { projectRoute : projectRouteCnt  };
      response = {
        ...response,
        ...routeRole7174Cnt,
      };
      return response;
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countRouteRole = async (filter) =>{
  try {
    const routeRoleCnt =  await RouteRole.countDocuments(filter);
    return { routeRole : routeRoleCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countUserRole = async (filter) =>{
  try {
    const userRoleCnt =  await UserRole.countDocuments(filter);
    return { userRole : userRoleCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteEducationContent = async (filter) =>{
  try {
    return await EducationContent.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteChat = async (filter) =>{
  try {
    return await Chat.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteMessages = async (filter) =>{
  try {
    return await Messages.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteInvoice = async (filter) =>{
  try {
    return await Invoice.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteRole = async (filter) =>{
  try {
    let role = await Role.find(filter, { _id:1 });
    if (role){
      role = role.map((obj) => obj._id);
      const userActivityFilter9248 = { 'roleId': { '$in': role } };
      const userActivity7683 = await softDeleteUserActivity(userActivityFilter9248);
      const userFilter4597 = { 'roleIds': { '$in': role } };
      const user9766 = await softDeleteUser(userFilter4597);
      const routeRoleFilter4049 = { 'roleId': { '$in': role } };
      const routeRole5874 = await softDeleteRouteRole(routeRoleFilter4049);
      const userRoleFilter5463 = { 'roleId': { '$in': role } };
      const userRole9761 = await softDeleteUserRole(userRoleFilter5463);
      return await Role.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteUserActivity = async (filter) =>{
  try {
    return await UserActivity.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteAppointmentSummary = async (filter) =>{
  try {
    return await AppointmentSummary.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteNotification = async (filter) =>{
  try {
    return await Notification.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteOrder = async (filter) =>{
  try {
    let order = await Order.find(filter, { _id:1 });
    if (order){
      order = order.map((obj) => obj._id);
      const invoiceFilter6071 = { 'orderId': { '$in': order } };
      const invoice9959 = await softDeleteInvoice(invoiceFilter6071);
      const transactionFilter6709 = { 'orderId': { '$in': order } };
      const transaction7285 = await softDeleteTransaction(transactionFilter6709);
      return await Order.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteForm = async (filter) =>{
  try {
    let form = await Form.find(filter, { _id:1 });
    if (form){
      form = form.map((obj) => obj._id);
      const appointmentFilter5117 = { 'form': { '$in': form } };
      const appointment5201 = await softDeleteAppointment(appointmentFilter5117);
      const appointmentFilter4232 = { 'patientIntakeFormId': { '$in': form } };
      const appointment9794 = await softDeleteAppointment(appointmentFilter4232);
      return await Form.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteAppointment = async (filter) =>{
  try {
    let appointment = await Appointment.find(filter, { _id:1 });
    if (appointment){
      appointment = appointment.map((obj) => obj._id);
      const invoiceFilter1373 = { 'appointmentId': { '$in': appointment } };
      const invoice9521 = await softDeleteInvoice(invoiceFilter1373);
      const appointmentSummaryFilter7278 = { 'appointmentId': { '$in': appointment } };
      const appointmentSummary9960 = await softDeleteAppointmentSummary(appointmentSummaryFilter7278);
      const orderFilter7356 = { 'appointmentId': { '$in': appointment } };
      const order8717 = await softDeleteOrder(orderFilter7356);
      return await Appointment.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteRatingReview = async (filter) =>{
  try {
    return await RatingReview.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteTransaction = async (filter) =>{
  try {
    let transaction = await Transaction.find(filter, { _id:1 });
    if (transaction){
      transaction = transaction.map((obj) => obj._id);
      const invoiceFilter6436 = { 'transactionId': { '$in': transaction } };
      const invoice9782 = await softDeleteInvoice(invoiceFilter6436);
      return await Transaction.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteProviderSlot = async (filter) =>{
  try {
    let providerSlot = await ProviderSlot.find(filter, { _id:1 });
    if (providerSlot){
      providerSlot = providerSlot.map((obj) => obj._id);
      const appointmentFilter3764 = { 'timeSlotId': { '$in': providerSlot } };
      const appointment0601 = await softDeleteAppointment(appointmentFilter3764);
      return await ProviderSlot.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteFaqs = async (filter) =>{
  try {
    return await Faqs.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteCity = async (filter) =>{
  try {
    let city = await City.find(filter, { _id:1 });
    if (city){
      city = city.map((obj) => obj._id);
      const postalCodeFilter5676 = { 'cityId': { '$in': city } };
      const postalCode3241 = await softDeletePostalCode(postalCodeFilter5676);
      const addressFilter9153 = { 'cityId': { '$in': city } };
      const address5515 = await softDeleteAddress(addressFilter9153);
      return await City.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeletePostalCode = async (filter) =>{
  try {
    let postalCode = await PostalCode.find(filter, { _id:1 });
    if (postalCode){
      postalCode = postalCode.map((obj) => obj._id);
      const addressFilter1791 = { 'postalCodeId': { '$in': postalCode } };
      const address8164 = await softDeleteAddress(addressFilter1791);
      return await PostalCode.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteSpecialisation = async (filter) =>{
  try {
    let specialisation = await Specialisation.find(filter, { _id:1 });
    if (specialisation){
      specialisation = specialisation.map((obj) => obj._id);
      const formFilter6995 = { 'specialisationIds': { '$in': specialisation } };
      const form0471 = await softDeleteForm(formFilter6995);
      const appointmentFilter1230 = { 'specialisationId': { '$in': specialisation } };
      const appointment2837 = await softDeleteAppointment(appointmentFilter1230);
      const userFilter9495 = { 'specialisations': { '$in': specialisation } };
      const user1270 = await softDeleteUser(userFilter9495);
      return await Specialisation.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteCountry = async (filter) =>{
  try {
    let country = await Country.find(filter, { _id:1 });
    if (country){
      country = country.map((obj) => obj._id);
      const provinceFilter6278 = { 'countryId': { '$in': country } };
      const province8036 = await softDeleteProvince(provinceFilter6278);
      const addressFilter4488 = { 'countryId': { '$in': country } };
      const address1447 = await softDeleteAddress(addressFilter4488);
      return await Country.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteProvince = async (filter) =>{
  try {
    let province = await Province.find(filter, { _id:1 });
    if (province){
      province = province.map((obj) => obj._id);
      const cityFilter6685 = { 'provinceId': { '$in': province } };
      const city0673 = await softDeleteCity(cityFilter6685);
      const addressFilter5258 = { 'provinceId': { '$in': province } };
      const address7028 = await softDeleteAddress(addressFilter5258);
      return await Province.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeletePages = async (filter) =>{
  try {
    return await Pages.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteAddress = async (filter) =>{
  try {
    let address = await Address.find(filter, { _id:1 });
    if (address){
      address = address.map((obj) => obj._id);
      const userFilter2313 = { 'practiceAddressId': { '$in': address } };
      const user3183 = await softDeleteUser(userFilter2313);
      const userFilter5384 = { 'shippingAddress': { '$in': address } };
      const user3766 = await softDeleteUser(userFilter5384);
      return await Address.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteFile = async (filter) =>{
  try {
    let file = await File.find(filter, { _id:1 });
    if (file){
      file = file.map((obj) => obj._id);
      const educationContentFilter2889 = { 'files': { '$in': file } };
      const educationContent0374 = await softDeleteEducationContent(educationContentFilter2889);
      const messagesFilter5418 = { 'files': { '$in': file } };
      const messages2916 = await softDeleteMessages(messagesFilter5418);
      const appointmentSummaryFilter7360 = { 'treatmentIds': { '$in': file } };
      const appointmentSummary0113 = await softDeleteAppointmentSummary(appointmentSummaryFilter7360);
      const specialisationFilter8947 = { 'file': { '$in': file } };
      const specialisation8756 = await softDeleteSpecialisation(specialisationFilter8947);
      const userFilter5854 = { 'profilePictureId': { '$in': file } };
      const user7216 = await softDeleteUser(userFilter5854);
      const userFilter5459 = { 'libraryPhotos': { '$in': file } };
      const user7194 = await softDeleteUser(userFilter5459);
      return await File.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteMaster = async (filter) =>{
  try {
    let master = await Master.find(filter, { _id:1 });
    if (master){
      master = master.map((obj) => obj._id);
      const appointmentSummaryFilter8824 = { 'diagnosis': { '$in': master } };
      const appointmentSummary6849 = await softDeleteAppointmentSummary(appointmentSummaryFilter8824);
      const appointmentSummaryFilter9150 = { 'allergies': { '$in': master } };
      const appointmentSummary3714 = await softDeleteAppointmentSummary(appointmentSummaryFilter9150);
      const appointmentSummaryFilter7276 = { 'referTo': { '$in': master } };
      const appointmentSummary5369 = await softDeleteAppointmentSummary(appointmentSummaryFilter7276);
      const notificationFilter1152 = { 'type': { '$in': master } };
      const notification9067 = await softDeleteNotification(notificationFilter1152);
      const appointmentFilter3286 = { 'appointmentType': { '$in': master } };
      const appointment0755 = await softDeleteAppointment(appointmentFilter3286);
      const appointmentFilter2657 = { 'callMode': { '$in': master } };
      const appointment7244 = await softDeleteAppointment(appointmentFilter2657);
      const ratingReviewFilter0794 = { 'type': { '$in': master } };
      const ratingReview2984 = await softDeleteRatingReview(ratingReviewFilter0794);
      const transactionFilter2379 = { 'transactionType': { '$in': master } };
      const transaction3616 = await softDeleteTransaction(transactionFilter2379);
      const transactionFilter9863 = { 'chargeType': { '$in': master } };
      const transaction5406 = await softDeleteTransaction(transactionFilter9863);
      const providerSlotFilter7538 = { 'type': { '$in': master } };
      const providerSlot2472 = await softDeleteProviderSlot(providerSlotFilter7538);
      const masterFilter9175 = { 'parentId': { '$in': master } };
      const master2507 = await softDeleteMaster(masterFilter9175);
      const userFilter8462 = { 'genderId': { '$in': master } };
      const user8535 = await softDeleteUser(userFilter8462);
      const userFilter9882 = { 'languageIds': { '$in': master } };
      const user5322 = await softDeleteUser(userFilter9882);
      // const userFilter5264 = { 'occupation': { '$in': master } };
      // const user0988 = await softDeleteUser(userFilter5264);
      const userFilter0075 = { 'hearAboutUs': { '$in': master } };
      const user1503 = await softDeleteUser(userFilter0075);
      const userFilter4268 = { 'deactivationReason': { '$in': master } };
      const user6586 = await softDeleteUser(userFilter4268);
      return await Master.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteUser = async (filter) =>{
  try {
    let user = await User.find(filter, { _id:1 });
    if (user){
      user = user.map((obj) => obj._id);
      const chatFilter5036 = { 'fromId': { '$in': user } };
      const chat0539 = await softDeleteChat(chatFilter5036);
      const messagesFilter0284 = { 'fromId': { '$in': user } };
      const messages5764 = await softDeleteMessages(messagesFilter0284);
      const invoiceFilter1398 = { 'patientId': { '$in': user } };
      const invoice3154 = await softDeleteInvoice(invoiceFilter1398);
      const invoiceFilter8046 = { 'providerId': { '$in': user } };
      const invoice3345 = await softDeleteInvoice(invoiceFilter8046);
      const userActivityFilter9878 = { 'userId': { '$in': user } };
      const userActivity1445 = await softDeleteUserActivity(userActivityFilter9878);
      const userActivityFilter7930 = { 'adminId': { '$in': user } };
      const userActivity3956 = await softDeleteUserActivity(userActivityFilter7930);
      const appointmentSummaryFilter4203 = { 'patientId': { '$in': user } };
      const appointmentSummary7820 = await softDeleteAppointmentSummary(appointmentSummaryFilter4203);
      const appointmentSummaryFilter0875 = { 'providerId': { '$in': user } };
      const appointmentSummary4099 = await softDeleteAppointmentSummary(appointmentSummaryFilter0875);
      const orderFilter8153 = { 'patientId': { '$in': user } };
      const order9849 = await softDeleteOrder(orderFilter8153);
      const orderFilter8509 = { 'providerId': { '$in': user } };
      const order2902 = await softDeleteOrder(orderFilter8509);
      const appointmentFilter9886 = { 'cancelledBy': { '$in': user } };
      const appointment8787 = await softDeleteAppointment(appointmentFilter9886);
      const appointmentFilter4993 = { 'providerId': { '$in': user } };
      const appointment8250 = await softDeleteAppointment(appointmentFilter4993);
      const ratingReviewFilter4947 = { 'to': { '$in': user } };
      const ratingReview8567 = await softDeleteRatingReview(ratingReviewFilter4947);
      const ratingReviewFilter8534 = { 'from': { '$in': user } };
      const ratingReview2023 = await softDeleteRatingReview(ratingReviewFilter8534);
      const ratingReviewFilter7980 = { 'appointmentId': { '$in': user } };
      const ratingReview3499 = await softDeleteRatingReview(ratingReviewFilter7980);
      const transactionFilter3599 = { 'transactionBy': { '$in': user } };
      const transaction0100 = await softDeleteTransaction(transactionFilter3599);
      const transactionFilter0792 = { 'providerId': { '$in': user } };
      const transaction4233 = await softDeleteTransaction(transactionFilter0792);
      const transactionFilter6713 = { 'appointmentId': { '$in': user } };
      const transaction4772 = await softDeleteTransaction(transactionFilter6713);
      const providerSlotFilter7779 = { 'userId': { '$in': user } };
      const providerSlot9121 = await softDeleteProviderSlot(providerSlotFilter7779);
      const userRoleFilter7762 = { 'userId': { '$in': user } };
      const userRole9512 = await softDeleteUserRole(userRoleFilter7762);
      return await User.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteProjectRoute = async (filter) =>{
  try {
    let projectRoute = await ProjectRoute.find(filter, { _id:1 });
    if (projectRoute){
      projectRoute = projectRoute.map((obj) => obj._id);
      const routeRoleFilter4786 = { 'routeId': { '$in': projectRoute } };
      const routeRole7091 = await softDeleteRouteRole(routeRoleFilter4786);
      return await ProjectRoute.updateMany(filter, { isDeleted:true });
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteRouteRole = async (filter) =>{
  try {
    return await RouteRole.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteUserRole = async (filter) =>{
  try {
    return await UserRole.updateMany(filter, { isDeleted:true });
  } catch (error){
    throw new Error(error.message);
  }
};

module.exports = {
  deleteEducationContent,
  deleteChat,
  deleteMessages,
  deleteInvoice,
  deleteRole,
  deleteUserActivity,
  deleteAppointmentSummary,
  deleteNotification,
  deleteOrder,
  deleteForm,
  deleteAppointment,
  deleteRatingReview,
  deleteTransaction,
  deleteProviderSlot,
  deleteFaqs,
  deleteCity,
  deletePostalCode,
  deleteSpecialisation,
  deleteCountry,
  deleteProvince,
  deletePages,
  deleteAddress,
  deleteFile,
  deleteMaster,
  deleteUser,
  deleteProjectRoute,
  deleteRouteRole,
  deleteUserRole,
  countEducationContent,
  countChat,
  countMessages,
  countInvoice,
  countRole,
  countUserActivity,
  countAppointmentSummary,
  countNotification,
  countOrder,
  countForm,
  countAppointment,
  countRatingReview,
  countTransaction,
  countProviderSlot,
  countFaqs,
  countCity,
  countPostalCode,
  countSpecialisation,
  countCountry,
  countProvince,
  countPages,
  countAddress,
  countFile,
  countMaster,
  countUser,
  countProjectRoute,
  countRouteRole,
  countUserRole,
  softDeleteEducationContent,
  softDeleteChat,
  softDeleteMessages,
  softDeleteInvoice,
  softDeleteRole,
  softDeleteUserActivity,
  softDeleteAppointmentSummary,
  softDeleteNotification,
  softDeleteOrder,
  softDeleteForm,
  softDeleteAppointment,
  softDeleteRatingReview,
  softDeleteTransaction,
  softDeleteProviderSlot,
  softDeleteFaqs,
  softDeleteCity,
  softDeletePostalCode,
  softDeleteSpecialisation,
  softDeleteCountry,
  softDeleteProvince,
  softDeletePages,
  softDeleteAddress,
  softDeleteFile,
  softDeleteMaster,
  softDeleteUser,
  softDeleteProjectRoute,
  softDeleteRouteRole,
  softDeleteUserRole,
};
