module.exports = (sequelize, Sequelize) => {
  const IrAttachment = sequelize.define("ir_attachment", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    res_id: {
      type: Sequelize.INTEGER,
      comment: 'Resource ID'
    },
    company_id: {
      type: Sequelize.INTEGER,
      comment: 'Company'
    },
    file_size: {
      type: Sequelize.INTEGER,
      comment: 'File Size'
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
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'Name'
    },
    res_model: {
      type: Sequelize.STRING,
      comment: 'Resource Model'
    },
    res_field: {
      type: Sequelize.STRING,
      comment: 'Resource Field'
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'Type'
    },
    url: {
      type: Sequelize.STRING(1024),
      comment: 'Url'
    },
    access_token: {
      type: Sequelize.STRING,
      comment: 'Access Token'
    },
    store_fname: {
      type: Sequelize.STRING,
      comment: 'Stored Filename'
    },
    checksum: {
      type: Sequelize.STRING(40),
      comment: 'Checksum/SHA1'
    },
    mimetype: {
      type: Sequelize.STRING,
      comment: 'Mime Type'
    },
    description: {
      type: Sequelize.TEXT,
      comment: 'Description'
    },
    index_content: {
      type: Sequelize.TEXT,
      comment: 'Indexed Content'
    },
    public: {
      type: Sequelize.BOOLEAN,
      comment: 'Is public document'
    },
    create_date: {
      type: Sequelize.DATE,
      comment: 'Created on'
    },
    write_date: {
      type: Sequelize.DATE,
      comment: 'Last Updated on'
    },
    db_datas: {
      type: Sequelize.BLOB,
      comment: 'Database Data'
    },
    original_id: {
      type: Sequelize.INTEGER,
      comment: 'Original (unoptimized, unresized) attachment'
    }
  }, {
    tableName: 'ir_attachment',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date'
  });

  return IrAttachment;
};
