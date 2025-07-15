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

  // contract cancel
  getContractsCancel = 'get contracts cancel',
  deleteContractCancel = 'delete contract cancel',
  acceptContractCancel = 'accept contract cancel',
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
  messages: [
    PERMISSIONS.listMessagesFromTo,
    PERMISSIONS.sendNotificationToUsers,
  ],
  projects: [
    PERMISSIONS.listProjects,
    PERMISSIONS.updateProject,
    PERMISSIONS.removeProject,
    PERMISSIONS.getProjectAnalysis,
  ],
  withdrawMethods: [
    PERMISSIONS.listWithdrawMethods,
    PERMISSIONS.updateWithdrawMethod,
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
  contractCancel: [
    PERMISSIONS.getContractsCancel,
    PERMISSIONS.deleteContractCancel,
    PERMISSIONS.acceptContractCancel,
  ],
};
