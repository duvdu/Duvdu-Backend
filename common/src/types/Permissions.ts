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

  // roles
  createRoleHandler = 'create-role',
  updateRoleHandler = 'update-role',
  listRoles = 'list-roles',
  removeRoleHandler = 'remove-role',
  getAllPermissions = 'get-all-permissions',

  //message
  listMessagesFromTo = 'list-messages-from-to',
  sendNotificationToUsers = 'send-notification-to-users',

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

  bookmarks = 'bookmarks',

  createTicket = 'create ticket',
  getAllTickets = 'get-all-tickets',
  updateTicket = 'update-ticket',
  removeTicket = 'remove-ticket',
  getTicket = 'get-ticket',
  createTerm = 'create-term',
  updateTerm = 'update-term',

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
  // rank
  createRankHandler = 'create rank',
  updateRankHandler = 'update rank',
  deleteRankHandler = 'delete rank',

  //setting
  createSettingHandler = 'create setting',
  updateSettingHandler = 'update setting',
  deleteSettingHandler = 'delete setting',

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
  messages: [PERMISSIONS.listMessagesFromTo, PERMISSIONS.sendNotificationToUsers],
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
  projectReview: [
    PERMISSIONS.listProjectReviews,
    PERMISSIONS.deleteProjectReviews,
  ],
  contractReview: [
    PERMISSIONS.listContractsReviews,
    PERMISSIONS.deleteContractsReviews,
  ],

  

  bookmarks: [PERMISSIONS.bookmarks],

  ticket: [
    PERMISSIONS.createTicket,
    PERMISSIONS.getTicket,
    PERMISSIONS.getAllTickets,
    PERMISSIONS.removeTicket,
    PERMISSIONS.updateTicket,
  ],
  terms: [PERMISSIONS.createTerm, PERMISSIONS.updateTerm],
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
  rank: [
    PERMISSIONS.createRankHandler,
    PERMISSIONS.updateRankHandler,
    PERMISSIONS.deleteRankHandler,
  ],
  setting: [
    PERMISSIONS.createSettingHandler,
    PERMISSIONS.updateSettingHandler,
    PERMISSIONS.deleteSettingHandler,
  ],
  producer: [PERMISSIONS.getProducerAnalysis],
  dashboard: [PERMISSIONS.accessDashboard],
  producerPlatform: [
    PERMISSIONS.getProducerAnalysis,
    PERMISSIONS.createPlatform,
    PERMISSIONS.updatePlatform,
  ],
};
