const express =  require('express');
const router =  express.Router();
router.use('/device/auth',require('./auth'));
router.use(require('./educationContentRoutes'));
router.use(require('./chatRequestRoutes'));
router.use(require('./chatRoutes'));
router.use(require('./messagesRoutes'));
router.use(require('./invoiceRoutes'));
router.use(require('./roleRoutes'));
router.use(require('./userActivityRoutes'));
router.use(require('./appointmentSummaryRoutes'));
router.use(require('./notificationRoutes'));
router.use(require('./orderRoutes'));
router.use(require('./formRoutes'));
router.use(require('./appointmentRoutes'));
router.use(require('./ratingReviewRoutes'));
router.use(require('./transactionRoutes'));
router.use(require('./providerSlotRoutes'));
router.use(require('./faqsRoutes'));
router.use(require('./cityRoutes'));
router.use(require('./postalCodeRoutes'));
router.use(require('./specialisationRoutes'));
router.use(require('./countryRoutes'));
router.use(require('./provinceRoutes'));
router.use(require('./pagesRoutes'));
router.use(require('./addressRoutes'));
router.use(require('./fileRoutes'));
router.use(require('./masterRoutes'));
router.use(require('./userRoutes'));
router.use(require('./stripeRoutes'));
router.use(require('./questionnaireRoutes'));
router.use(require('./questionnaireResponseRoutes'));
router.use(require('./paymentRoutes'));
router.use(require('./videoCallRoutes'));
router.use(require('./treatmentRoutes'));
router.use(require('./dashboardRoutes'));




module.exports = router;
