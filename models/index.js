const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    port: dbConfig.PORT
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.customer_login = require("./customer_login.model")(sequelize, Sequelize);
db.customer = require("./customer.model")(sequelize, Sequelize);
db.session_logs = require("./lp_session_logs.model")(sequelize, Sequelize);
db.token_blacklist = require("./lp_token_blacklist.model")(sequelize, Sequelize);
db.activity = require("./lp_activity.model")(sequelize, Sequelize);
db.ir_attachment = require("./ir_attachment.model")(sequelize, Sequelize);
db.course = require("./lp_course.model")(sequelize, Sequelize);
db.quickSession = require("./lp_quick_sess.model")(sequelize, Sequelize);

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
