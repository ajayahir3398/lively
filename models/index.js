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

module.exports = db;
