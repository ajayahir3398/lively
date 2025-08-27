module.exports = (sequelize, Sequelize) => {
  const Document = sequelize.define("lp_document", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    doc_class_id: {
      type: Sequelize.INTEGER,
      comment: 'Document class'
    },
    doc_type_id: {
      type: Sequelize.INTEGER,
      comment: 'Document type'
    },
    submit_by: {
      type: Sequelize.INTEGER,
      comment: 'Submitted by'
    },
    approve_by: {
      type: Sequelize.INTEGER,
      comment: 'Approved/rejected by'
    },
    archived_by: {
      type: Sequelize.INTEGER,
      comment: 'Archived by'
    },
    download_count: {
      type: Sequelize.INTEGER,
      comment: 'Download/read count'
    },
    list_seq: {
      type: Sequelize.INTEGER,
      comment: 'List sequence'
    },
    company_id: {
      type: Sequelize.INTEGER,
      comment: 'Company'
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
      type: Sequelize.STRING(80),
      comment: 'Document name'
    },
    doc_version: {
      type: Sequelize.STRING(20),
      comment: 'Doc version'
    },
    file_loc: {
      type: Sequelize.STRING,
      comment: 'File location'
    },
    file_name: {
      type: Sequelize.STRING,
      comment: 'File name attachment'
    },
    permission: {
      type: Sequelize.STRING,
      comment: 'Permission'
    },
    state: {
      type: Sequelize.STRING,
      comment: 'Status'
    },
    doc_desc: {
      type: Sequelize.STRING,
      comment: 'Document description'
    },
    list_code: {
      type: Sequelize.STRING,
      comment: 'List code'
    },
    header1: {
      type: Sequelize.STRING,
      comment: 'Header 1'
    },
    header2: {
      type: Sequelize.STRING,
      comment: 'Header 2'
    },
    desc1: {
      type: Sequelize.STRING,
      comment: 'Description 1'
    },
    desc2: {
      type: Sequelize.STRING,
      comment: 'Description 2'
    },
    date_valid: {
      type: Sequelize.DATEONLY,
      comment: 'Valid until'
    },
    doc_date: {
      type: Sequelize.DATEONLY,
      comment: 'Document date'
    },
    notes: {
      type: Sequelize.TEXT,
      comment: 'Notes and comments'
    },
    header1_html: {
      type: Sequelize.TEXT,
      comment: 'Header HTML 1'
    },
    header2_html: {
      type: Sequelize.TEXT,
      comment: 'Header HTML 2'
    },
    desc1_html: {
      type: Sequelize.TEXT,
      comment: 'Description HTML 1'
    },
    desc2_html: {
      type: Sequelize.TEXT,
      comment: 'Description HTML 2'
    },
    main_content_html: {
      type: Sequelize.TEXT,
      comment: 'Main HTML content'
    },
    active: {
      type: Sequelize.BOOLEAN,
      comment: 'Active'
    },
    submit_date: {
      type: Sequelize.DATE,
      comment: 'Date/time submitted'
    },
    approve_date: {
      type: Sequelize.DATE,
      comment: 'Date/time approved/rejected'
    },
    archived_date: {
      type: Sequelize.DATE,
      comment: 'Date/time archived'
    },
    create_date: {
      type: Sequelize.DATE,
      comment: 'Created on'
    },
    write_date: {
      type: Sequelize.DATE,
      comment: 'Last Updated on'
    },
    session_type: {
      type: Sequelize.STRING,
      comment: 'Sessions Type'
    },
    activity_id: {
      type: Sequelize.INTEGER,
      comment: 'Activity Document'
    },
    course_id: {
      type: Sequelize.INTEGER,
      comment: 'Course Document'
    },
    quick_sess_id: {
      type: Sequelize.INTEGER,
      comment: 'Quick Session Document'
    }
  }, {
    tableName: 'lp_document',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date',
    indexes: [
      {
        name: 'lp_document_activity_id_index',
        fields: ['activity_id']
      },
      {
        name: 'lp_document_course_id_index',
        fields: ['course_id']
      },
      {
        name: 'lp_document_list_code_index',
        fields: ['list_code']
      },
      {
        name: 'lp_document_name_index',
        fields: ['name']
      },
      {
        name: 'lp_document_quick_sess_id_index',
        fields: ['quick_sess_id']
      }
    ]
  });

  // Define associations
  Document.associate = function(models) {
    // Association with activity
    if (models.activity) {
      Document.belongsTo(models.activity, {
        foreignKey: 'activity_id',
        as: 'activity',
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      });
    }

    // Association with course
    if (models.course) {
      Document.belongsTo(models.course, {
        foreignKey: 'course_id',
        as: 'course',
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      });
    }

    // Association with quick session
    if (models.quickSession) {
      Document.belongsTo(models.quickSession, {
        foreignKey: 'quick_sess_id',
        as: 'quickSession',
        onUpdate: 'NO ACTION',
        onDelete: 'SET NULL'
      });
    }

    // Association with attachments
    if (models.ir_attachment) {
      Document.hasMany(models.ir_attachment, {
        foreignKey: 'res_id',
        as: 'attachments',
        scope: {
          res_model: 'lp.document'
        }
      });
    }

    // Foreign key associations for user references
    // These reference res_users table which may not be in this project yet
    // Uncomment when res_users model is available:
    
    // Document.belongsTo(models.res_users, {
    //   foreignKey: 'submit_by',
    //   as: 'submitter',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'RESTRICT'
    // });
    
    // Document.belongsTo(models.res_users, {
    //   foreignKey: 'approve_by',
    //   as: 'approver',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'RESTRICT'
    // });
    
    // Document.belongsTo(models.res_users, {
    //   foreignKey: 'archived_by',
    //   as: 'archiver',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'RESTRICT'
    // });
    
    // Document.belongsTo(models.res_users, {
    //   foreignKey: 'create_uid',
    //   as: 'creator',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'SET NULL'
    // });
    
    // Document.belongsTo(models.res_users, {
    //   foreignKey: 'write_uid',
    //   as: 'updater',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'SET NULL'
    // });

    // Foreign key associations for common codes and company
    // Uncomment when these models are available:
    
    // Document.belongsTo(models.lp_common_code, {
    //   foreignKey: 'doc_class_id',
    //   as: 'documentClass',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'RESTRICT'
    // });
    
    // Document.belongsTo(models.lp_common_code, {
    //   foreignKey: 'doc_type_id',
    //   as: 'documentType',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'RESTRICT'
    // });
    
    // Document.belongsTo(models.res_company, {
    //   foreignKey: 'company_id',
    //   as: 'company',
    //   onUpdate: 'NO ACTION',
    //   onDelete: 'SET NULL'
    // });
  };

  return Document;
};
