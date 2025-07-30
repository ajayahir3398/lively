module.exports = (sequelize, Sequelize) => {
  const Customer_Login = sequelize.define("lp_customer_login", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    login_count: {
      type: Sequelize.INTEGER,
      comment: 'Login count'
    },
    ytd_login_count: {
      type: Sequelize.INTEGER,
      comment: 'YTD login count'
    },
    failed_login_count: {
      type: Sequelize.INTEGER,
      comment: 'Failed login last count'
    },
    failed_login_total: {
      type: Sequelize.INTEGER,
      comment: 'Failed login total count'
    },
    reset_count: {
      type: Sequelize.INTEGER,
      comment: 'Number of times password resetted'
    },
    blocked_count: {
      type: Sequelize.INTEGER,
      comment: 'Number of times blocked'
    },
    disabled_by: {
      type: Sequelize.INTEGER,
      comment: 'Disabled by'
    },
    enabled_by: {
      type: Sequelize.INTEGER,
      comment: 'Enabled by'
    },
    create_uid: {
      type: Sequelize.INTEGER,
      comment: 'Created by'
    },
    write_uid: {
      type: Sequelize.INTEGER,
      comment: 'Last Updated by'
    },
    login_domain: {
      type: Sequelize.STRING,
      unique: true,
      comment: 'Login domain'
    },
    login_pwd: {
      type: Sequelize.STRING,
      comment: 'Login password'
    },
    customer_name: {
      type: Sequelize.STRING,
      comment: 'Customer name'
    },
    email: {
      type: Sequelize.STRING(40),
      comment: 'Primary email'
    },
    temp_pwd: {
      type: Sequelize.STRING,
      comment: 'Temporary password'
    },
    state: {
      type: Sequelize.STRING,
      comment: 'Status'
    },
    blocked_note: {
      type: Sequelize.TEXT,
      comment: 'Why blocked'
    },
    initial_login: {
      type: Sequelize.BOOLEAN,
      comment: 'Initial login required'
    },
    login_disabled: {
      type: Sequelize.BOOLEAN,
      comment: 'Login disabled'
    },
    valid_until: {
      type: Sequelize.DATE,
      comment: 'When valid until'
    },
    last_login: {
      type: Sequelize.DATE,
      comment: 'When last logged in'
    },
    temp_pwd_issued: {
      type: Sequelize.DATE,
      comment: 'Temporary password date'
    },
    temp_pwd_expiry: {
      type: Sequelize.DATE,
      comment: 'Temporary password expiry'
    },
    reset_date: {
      type: Sequelize.DATE,
      comment: 'When reset password requested'
    },
    blocked_date: {
      type: Sequelize.DATE,
      comment: 'When last blocked'
    },
    disabled_date: {
      type: Sequelize.DATE,
      comment: 'When login disabled'
    },
    enabled_date: {
      type: Sequelize.DATE,
      comment: 'When login enabled'
    },
    create_date: {
      type: Sequelize.DATE,
      comment: 'Created on'
    },
    write_date: {
      type: Sequelize.DATE,
      comment: 'Last Updated on'
    }
  }, {
    tableName: 'lp_customer_login',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date'
  });

  return Customer_Login;
};