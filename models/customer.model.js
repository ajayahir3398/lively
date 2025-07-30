module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define("lp_customer", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    login_id: {
      type: Sequelize.INTEGER,
      comment: 'Customer login record'
    },
    country_of_birth_id: {
      type: Sequelize.INTEGER,
      comment: 'Country of birth'
    },
    nationality_id: {
      type: Sequelize.INTEGER,
      comment: 'Country of nationality'
    },
    residency_id: {
      type: Sequelize.INTEGER,
      comment: 'Country of residency'
    },
    national_id_type_id: {
      type: Sequelize.INTEGER,
      comment: 'Primary ID type'
    },
    other_id_type_id: {
      type: Sequelize.INTEGER,
      comment: 'Other ID type'
    },
    race_id: {
      type: Sequelize.INTEGER,
      comment: 'Race'
    },
    activated_by: {
      type: Sequelize.INTEGER,
      comment: 'Activated by'
    },
    suspended_by: {
      type: Sequelize.INTEGER,
      comment: 'Suspended by'
    },
    reason_suspended_id: {
      type: Sequelize.INTEGER,
      comment: 'Reason for suspension'
    },
    uplifted_by: {
      type: Sequelize.INTEGER,
      comment: 'Uplifted by'
    },
    create_uid: {
      type: Sequelize.INTEGER,
      comment: 'Created by'
    },
    write_uid: {
      type: Sequelize.INTEGER,
      comment: 'Last Updated by'
    },
    name: {
      type: Sequelize.STRING(60),
      comment: 'Customer name'
    },
    code: {
      type: Sequelize.STRING(20),
      comment: 'Customer code'
    },
    email1: {
      type: Sequelize.STRING(40),
      comment: 'Primary email'
    },
    email2: {
      type: Sequelize.STRING(40),
      comment: 'Alternate email'
    },
    mobile_phone1: {
      type: Sequelize.STRING(20),
      comment: 'Primary mobile no'
    },
    mobile_phone2: {
      type: Sequelize.STRING(20),
      comment: 'Alternate mobile no'
    },
    home_phone: {
      type: Sequelize.STRING(20),
      comment: 'Home phone'
    },
    work_phone: {
      type: Sequelize.STRING(20),
      comment: 'Work phone'
    },
    work_phone_ext: {
      type: Sequelize.STRING,
      comment: 'Extension'
    },
    main_phone: {
      type: Sequelize.STRING,
      comment: 'Primary phone'
    },
    cust_age: {
      type: Sequelize.STRING,
      comment: 'No. Of Years'
    },
    gender: {
      type: Sequelize.STRING,
      comment: 'Gender'
    },
    marital_status: {
      type: Sequelize.STRING,
      comment: 'Marital status'
    },
    national_id_no: {
      type: Sequelize.STRING(20),
      comment: 'Primary ID number'
    },
    other_id_no: {
      type: Sequelize.STRING(20),
      comment: 'Other ID number'
    },
    stage: {
      type: Sequelize.STRING,
      comment: 'Stage'
    },
    login_name: {
      type: Sequelize.STRING(100),
      comment: 'Login name'
    },
    date_of_birth: {
      type: Sequelize.DATEONLY,
      comment: 'Date of birth'
    },
    national_id_expiry: {
      type: Sequelize.DATEONLY,
      comment: 'Primary ID expiry'
    },
    other_id_expiry: {
      type: Sequelize.DATEONLY,
      comment: 'Other ID expiry date'
    },
    comments: {
      type: Sequelize.TEXT,
      comment: 'Comments'
    },
    date_signed_up: {
      type: Sequelize.DATE,
      comment: 'Date/time signed up'
    },
    date_activated: {
      type: Sequelize.DATE,
      comment: 'Date/time activated'
    },
    date_suspended: {
      type: Sequelize.DATE,
      comment: 'Date/time suspended'
    },
    date_uplifted: {
      type: Sequelize.DATE,
      comment: 'Date/time suspension uplifted'
    },
    date_dormant: {
      type: Sequelize.DATE,
      comment: 'Date/time dormant'
    },
    last_activity_date: {
      type: Sequelize.DATE,
      comment: 'Last activity date'
    },
    create_date: {
      type: Sequelize.DATE,
      comment: 'Created on'
    },
    write_date: {
      type: Sequelize.DATE,
      comment: 'Last Updated on'
    },
    state: {
      type: Sequelize.STRING,
      comment: 'Status'
    }
  }, {
    tableName: 'lp_customer',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date'
  });

  return Customer;
}; 