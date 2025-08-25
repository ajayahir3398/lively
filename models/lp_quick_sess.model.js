module.exports = (sequelize, Sequelize) => {
  const QuickSession = sequelize.define("lp_quick_sess", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sess_ref_id: {
      type: Sequelize.INTEGER,
      comment: 'Session Reference'
    },
    activity_id: {
      type: Sequelize.INTEGER,
      comment: 'Customer Sessions'
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
      comment: 'Session name'
    },
    code: {
      type: Sequelize.STRING(20),
      comment: 'Session code'
    },
    description: {
      type: Sequelize.TEXT,
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
    tableName: 'lp_quick_sess',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date',
    indexes: [
      {
        name: 'lp_quick_sess_code_index',
        fields: ['code']
      },
      {
        name: 'lp_quick_sess_name_index',
        fields: ['name']
      },
      {
        name: 'lp_quick_sess_activity_id_index',
        fields: ['activity_id']
      }
    ]
  });

  // Define associations
  QuickSession.associate = function(models) {
    // Foreign key association for activity_id referencing lp_activity
    if (models.activity) {
      QuickSession.belongsTo(models.activity, {
        foreignKey: 'activity_id',
        as: 'activity',
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      });
    }

    // Association with attachments
    if (models.ir_attachment) {
      QuickSession.hasMany(models.ir_attachment, {
        foreignKey: 'res_id',
        as: 'attachments',
        scope: {
          res_model: 'lp.quick_sess'
        }
      });
    }

    // Foreign key association for sess_ref_id referencing lp_common_code
    // Uncomment when lp_common_code model is available:
    // if (models.lp_common_code) {
    //   QuickSession.belongsTo(models.lp_common_code, {
    //     foreignKey: 'sess_ref_id',
    //     as: 'sessionReference',
    //     onUpdate: 'NO ACTION',
    //     onDelete: 'RESTRICT'
    //   });
    // }

    // Foreign key associations for create_uid and write_uid referencing res_users
    // Uncomment when res_users model is available:
    // if (models.res_users) {
    //   QuickSession.belongsTo(models.res_users, {
    //     foreignKey: 'create_uid',
    //     as: 'creator',
    //     onUpdate: 'NO ACTION',
    //     onDelete: 'SET NULL'
    //   });
      
    //   QuickSession.belongsTo(models.res_users, {
    //     foreignKey: 'write_uid',
    //     as: 'updater',
    //     onUpdate: 'NO ACTION',
    //     onDelete: 'SET NULL'
    //   });
    // }
  };

  return QuickSession;
};
