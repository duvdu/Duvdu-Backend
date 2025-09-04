export enum PERMISSIONS {
  //category
  createCategory = 'create-category',
  updateCategory = 'update-category',
  removeCategory = 'remove-category',
  listCategories = 'list-categories',

  //user
  createUser = 'create-user',
  updateUser = 'update-user',
  blockUser = 'block-user',
  unBlockUser = 'un-block-user',
  listUsers = 'list-users',
  removeUser = 'remove-user',
  
  // admin
  listAdmins = 'list-admins',
  createAdmin = 'create-admin',
  updateAdmin = 'update-admin',
  unBlockAdmin = 'un-block-admin',
  blockAdmin = 'block-admin',
  removeAdmin = 'remove-admin',


  // roles
  createRoleHandler = 'create-role',
  updateRoleHandler = 'update-role',
  listRoles = 'list-roles',
  removeRoleHandler = 'remove-role',
  getAllPermissions = 'get-all-permissions',

  //message
  listMessagesFromTo = 'list-messages-from-to',
  sendNotificationToUsers = 'send-notification-to-users',
  listMessages = 'list-messages',

  // project
  listProjects = 'list-projects',
  updateProject = 'update-project',
  removeProject = 'remove-project',
  getProjectAnalysis = 'get-project-analysis',

  // withdraw
  listWithdrawMethods = 'list-withdraw-methods',
  updateWithdrawMethod = 'update-withdraw-method',

  // complaint
  listComplaints = 'list-complaints',
  updateComplaint = 'update-complaint',
  closeComplaint = 'close-complaint',

  // contract
  listContracts = 'list-contracts',
  listContractsAnalysis = 'list-contracts-analysis',
  listCancelContracts = 'list-cancel-contracts',
  acceptCancelContract = 'accept-cancel-contract',
  deleteCancelContract = 'delete-cancel-contract',

  // project review
  listProjectReviews = 'list-project-reviews',
  deleteProjectReviews = 'delete-project-reviews',

  // contract review
  listContractsReviews = 'list-contracts-reviews',
  deleteContractsReviews = 'delete-contracts-reviews',

  // ticket
  listTickets = 'list-tickets',
  updateTicket = 'update-ticket',
  removeTicket = 'remove-ticket',

  // report
  listReports = 'list-reports',
  getReport = 'get-report',
  updateReport = 'update-report',
  deleteReport = 'delete-report',

  // pages
  createPage = 'create-page',
  updatePage = 'update-page',
  deletePage = 'delete-page',
  listPages = 'list-pages',

  // transactions
  listTransactions = 'list-transactions',
  fundTransactions = 'fund-transactions',
  createFundTransactions = 'create-fund-transactions',
  listFundTransactions = 'list-fund-transactions',
  updateFundTransactions = 'update-fund-transactions',

  // settings
  createSetting = 'create-setting',
  updateSetting = 'update-setting',
  deleteSetting = 'delete-setting',
  listSettings = 'list-settings',

  // rank
  createRank = 'create-rank',
  updateRank = 'update-rank',
  deleteRank = 'delete-rank',
  listRanks = 'list-ranks',

  // user analysis
  listUserAnalysis = 'list-user-analysis',

  // payment analysis
  listPaymentAnalysis = 'list-payment-analysis',

  bookmarks = 'bookmarks',


  // plan
  createPlanHandler = 'create plan',
  updatePlanHandler = 'update plan',
  getPlanHandler = 'get plan',
  getAllPlansHandler = 'get all plans',
  removePlanHandler = 'remove plan',

  // copyrights
  createCopyrightHandler = 'create copyright project',
  updateCopyrightHandler = 'update copyright project',
  removeCopyrightHandler = 'remove copyright project',
  getCrmCopyrightsHandlers = 'get crm copyright projects',
  getCopyrightAnalysisHandler = 'get copyright analysis handler',
  // Rental-booking
  createRentalProjectHandler = 'create Rental project',
  updateRentalProjectHandler = 'update Rental project',
  removeRentalProjectHandler = 'remove Rental project',
  getCrmRentalProject = 'get crm rental projects',
  getRentalAnalysisHandler = 'get Rental analysis handler',
  // reports
  getAllReportsHandler = 'get all reports',
  getReportHandler = 'get report',
  updateReportHandler = 'update report',
  deleteReportHandler = 'delete report',
  // book project
  booking = 'booking',
  // team project
  getCrmTeamProjectHandler = 'get crm team project crm',
  getTeamProjectAnalysisHandler = 'get team project analysis',
  deleteTeamProjectCreativeHandler = 'delete team project creative',
  updateTeamProjectCreativeHandler = 'update team project creative',
  createTeamProjectHandler = 'create team project',
  updateTeamProjectHandler = 'update team project',
  deleteTeamProjectHandler = 'delete team project',
  // producer
  getProducerAnalysis = 'get producer analysis',

  // dashboard
  accessDashboard = 'access dashboard',

  // producer platform
  createPlatform = 'create producer platform',
  updatePlatform = 'update producer platform',
  getPlatform = 'get producer platform',
}

export const permissions = {
  all: [
    PERMISSIONS.createCategory,
    PERMISSIONS.updateCategory,
    PERMISSIONS.updateCategory,
    PERMISSIONS.removeCategory,
    PERMISSIONS.listCategories,
    PERMISSIONS.listRoles,
    PERMISSIONS.createRoleHandler,
    PERMISSIONS.updateRoleHandler,
    PERMISSIONS.updateRoleHandler,
    PERMISSIONS.removeRoleHandler,
    PERMISSIONS.getAllPermissions,
    PERMISSIONS.listUsers,
    PERMISSIONS.createUser,
    PERMISSIONS.updateUser,
    PERMISSIONS.blockUser,
    PERMISSIONS.unBlockUser,
    PERMISSIONS.listMessagesFromTo,
    PERMISSIONS.listProjects,
    PERMISSIONS.updateProject,
    PERMISSIONS.removeProject,
    PERMISSIONS.getProjectAnalysis,
    PERMISSIONS.listWithdrawMethods,
    PERMISSIONS.updateWithdrawMethod,
    PERMISSIONS.removeUser,
    PERMISSIONS.sendNotificationToUsers,
    PERMISSIONS.listComplaints,
    PERMISSIONS.updateComplaint,
    PERMISSIONS.closeComplaint,
    PERMISSIONS.listContracts,
    PERMISSIONS.listContractsAnalysis,
    PERMISSIONS.listCancelContracts,
    PERMISSIONS.acceptCancelContract,
    PERMISSIONS.deleteCancelContract,
    PERMISSIONS.listProjectReviews,
    PERMISSIONS.deleteProjectReviews,
    PERMISSIONS.listContractsReviews,
    PERMISSIONS.deleteContractsReviews,
    PERMISSIONS.listTickets,
    PERMISSIONS.updateTicket,
    PERMISSIONS.removeTicket,
    PERMISSIONS.listReports,
    PERMISSIONS.getReport,
    PERMISSIONS.updateReport,
    PERMISSIONS.deleteReport,
    PERMISSIONS.createPage,
    PERMISSIONS.updatePage,
    PERMISSIONS.deletePage,
    PERMISSIONS.listPages,
    PERMISSIONS.createSetting,
    PERMISSIONS.updateSetting,
    PERMISSIONS.deleteSetting,
    PERMISSIONS.listSettings,
    PERMISSIONS.createRank,
    PERMISSIONS.updateRank,
    PERMISSIONS.deleteRank,
    PERMISSIONS.listRanks,
    PERMISSIONS.createFundTransactions,
    PERMISSIONS.listFundTransactions,
    PERMISSIONS.fundTransactions,
    PERMISSIONS.listTransactions,
    PERMISSIONS.updateFundTransactions,
    PERMISSIONS.listUserAnalysis,
    PERMISSIONS.listAdmins,
    PERMISSIONS.listMessages,
    PERMISSIONS.createAdmin,
    PERMISSIONS.updateAdmin,
    PERMISSIONS.blockAdmin,
    PERMISSIONS.unBlockAdmin,
    PERMISSIONS.removeAdmin,
  ],
  category: [
    PERMISSIONS.createCategory,
    PERMISSIONS.updateCategory,
    PERMISSIONS.updateCategory,
    PERMISSIONS.removeCategory,
    PERMISSIONS.listCategories,
  ],
  roles: [
    PERMISSIONS.listRoles,
    PERMISSIONS.createRoleHandler,
    PERMISSIONS.updateRoleHandler,
    PERMISSIONS.updateRoleHandler,
    PERMISSIONS.removeRoleHandler,
    PERMISSIONS.getAllPermissions,
  ],
  users: [
    PERMISSIONS.listUsers,
    PERMISSIONS.createUser,
    PERMISSIONS.updateUser,
    PERMISSIONS.blockUser,
    PERMISSIONS.unBlockUser,
    PERMISSIONS.removeUser,
  ],
  admins: [PERMISSIONS.listAdmins , PERMISSIONS.createAdmin, PERMISSIONS.updateAdmin, PERMISSIONS.blockAdmin, PERMISSIONS.unBlockAdmin, PERMISSIONS.removeAdmin],
  messages: [PERMISSIONS.listMessagesFromTo, PERMISSIONS.sendNotificationToUsers, PERMISSIONS.listMessages],
  projects: [
    PERMISSIONS.listProjects,
    PERMISSIONS.updateProject,
    PERMISSIONS.removeProject,
    PERMISSIONS.getProjectAnalysis,
  ],
  withdrawMethods: [PERMISSIONS.listWithdrawMethods, PERMISSIONS.updateWithdrawMethod],
  complaint: [PERMISSIONS.listComplaints, PERMISSIONS.updateComplaint, PERMISSIONS.closeComplaint],
  contract: [
    PERMISSIONS.listContracts,
    PERMISSIONS.listContractsAnalysis,
    PERMISSIONS.listCancelContracts,
    PERMISSIONS.acceptCancelContract,
    PERMISSIONS.deleteCancelContract,
  ],
  projectReview: [PERMISSIONS.listProjectReviews, PERMISSIONS.deleteProjectReviews],
  contractReview: [PERMISSIONS.listContractsReviews, PERMISSIONS.deleteContractsReviews],
  tickets: [PERMISSIONS.listTickets, PERMISSIONS.updateTicket, PERMISSIONS.removeTicket],
  reports: [
    PERMISSIONS.listReports,
    PERMISSIONS.getReportHandler,
    PERMISSIONS.updateReportHandler,
    PERMISSIONS.deleteReportHandler,
  ],
  pages: [
    PERMISSIONS.createPage,
    PERMISSIONS.updatePage,
    PERMISSIONS.deletePage,
    PERMISSIONS.listPages,
  ],
  settings: [
    PERMISSIONS.createSetting,
    PERMISSIONS.updateSetting,
    PERMISSIONS.deleteSetting,
    PERMISSIONS.listSettings,
  ],
  ranks: [
    PERMISSIONS.createRank,
    PERMISSIONS.updateRank,
    PERMISSIONS.deleteRank,
    PERMISSIONS.listRanks,
  ],
  fundTransactions: [
    PERMISSIONS.createFundTransactions,
    PERMISSIONS.listFundTransactions,
    PERMISSIONS.fundTransactions,
    PERMISSIONS.updateFundTransactions,
  ],
  userAnalysis: [PERMISSIONS.listUserAnalysis],

  bookmarks: [PERMISSIONS.bookmarks],


  plans: [
    PERMISSIONS.getPlanHandler,
    PERMISSIONS.createPlanHandler,
    PERMISSIONS.getAllPlansHandler,
    PERMISSIONS.removePlanHandler,
    PERMISSIONS.updatePlanHandler,
  ],

  copyrights: [
    PERMISSIONS.createCopyrightHandler,
    PERMISSIONS.updateCopyrightHandler,
    PERMISSIONS.removeCopyrightHandler,
    PERMISSIONS.getCrmCopyrightsHandlers,
    PERMISSIONS.getCopyrightAnalysisHandler,
  ],
  RentalBooking: [
    PERMISSIONS.createRentalProjectHandler,
    PERMISSIONS.updateRentalProjectHandler,
    PERMISSIONS.removeRentalProjectHandler,
    PERMISSIONS.getRentalAnalysisHandler,
    PERMISSIONS.getCrmRentalProject,
  ],
  booking: [PERMISSIONS.booking],
  teamProject: [
    PERMISSIONS.createTeamProjectHandler,
    PERMISSIONS.deleteTeamProjectCreativeHandler,
    PERMISSIONS.getTeamProjectAnalysisHandler,
    PERMISSIONS.getCrmTeamProjectHandler,
    PERMISSIONS.updateTeamProjectCreativeHandler,
    PERMISSIONS.deleteTeamProjectHandler,
    PERMISSIONS.updateTeamProjectHandler,
  ],
  producer: [PERMISSIONS.getProducerAnalysis],
  dashboard: [PERMISSIONS.accessDashboard],
  producerPlatform: [
    PERMISSIONS.getProducerAnalysis,
    PERMISSIONS.createPlatform,
    PERMISSIONS.updatePlatform,
  ],
};
