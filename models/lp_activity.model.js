module.exports = (sequelize, Sequelize) => {
  const Activity = sequelize.define("lp_activity", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      comment: 'Activity name'
    },
    code: {
      type: Sequelize.STRING(20),
      comment: 'Customer code'
    },
    description: {
      type: Sequelize.STRING(20),
      comment: 'Description'
    },
    state: {
      type: Sequelize.STRING,
      comment: 'Status'
    },
    comments: {
      type: Sequelize.TEXT,
      comment: 'Comments'
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
    tableName: 'lp_activity',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date',
    indexes: [
      {
        name: 'lp_activity_code_index',
        fields: ['code']
      },
      {
        name: 'lp_activity_name_index',
        fields: ['name']
      }
    ]
  });

  // Define associations
  Activity.associate = function(models) {
    // Foreign key associations for create_uid and write_uid
    // These reference res_users table which may not be in this project yet
    // Uncomment when res_users model is available:
    
    // Activity.belongsTo(models.res_users, {
    //   foreignKey: 'create_uid',
    //   as: 'creator',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'SET NULL'
    // });
    
    // Activity.belongsTo(models.res_users, {
    //   foreignKey: 'write_uid', 
    //   as: 'updater',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'SET NULL'
    // });
  };

  return Activity;
};
