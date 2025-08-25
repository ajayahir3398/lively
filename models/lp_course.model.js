module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define("lp_course", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_ref_id: {
      type: Sequelize.INTEGER,
      comment: 'Course Reference'
    },
    activity_id: {
      type: Sequelize.INTEGER,
      comment: 'Customer Courses'
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
      comment: 'Course name'
    },
    code: {
      type: Sequelize.STRING(20),
      comment: 'Customer code'
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
    tableName: 'lp_course',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date',
    indexes: [
      {
        name: 'lp_course_code_index',
        fields: ['code']
      },
      {
        name: 'lp_course_activity_id_index',
        fields: ['activity_id']
      },
      {
        name: 'lp_course_name_index',
        fields: ['name']
      }
    ]
  });

  // Define associations
  Course.associate = function(models) {
    // Foreign key association for activity_id referencing lp_activity
    if (models.activity) {
      Course.belongsTo(models.activity, {
        foreignKey: 'activity_id',
        as: 'activity',
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      });
    }

    // Association with attachments
    if (models.ir_attachment) {
      Course.hasMany(models.ir_attachment, {
        foreignKey: 'res_id',
        as: 'attachments',
        scope: {
          res_model: 'lp.course'
        }
      });
    }

    // Foreign key association for course_ref_id referencing lp_common_code
    // Uncomment when lp_common_code model is available:
    // if (models.lp_common_code) {
    //   Course.belongsTo(models.lp_common_code, {
    //     foreignKey: 'course_ref_id',
    //     as: 'courseReference',
    //     onUpdate: 'NO ACTION',
    //     onDelete: 'RESTRICT'
    //   });
    // }

    // Foreign key associations for create_uid and write_uid referencing res_users
    // Uncomment when res_users model is available:
    // if (models.res_users) {
    //   Course.belongsTo(models.res_users, {
    //     foreignKey: 'create_uid',
    //     as: 'creator',
    //     onUpdate: 'NO ACTION',
    //     onDelete: 'SET NULL'
    //   });
      
    //   Course.belongsTo(models.res_users, {
    //     foreignKey: 'write_uid',
    //     as: 'updater',
    //     onUpdate: 'NO ACTION',
    //     onDelete: 'SET NULL'
    //   });
    // }
  };

  return Course;
};
