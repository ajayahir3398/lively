module.exports = (sequelize, Sequelize) => {
  const TokenBlacklist = sequelize.define("lp_token_blacklist", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: 'JWT token to be blacklisted'
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'User ID who owns this token'
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'Token expiration time'
    },
    blacklisted_at: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'When token was blacklisted'
    },
    reason: {
      type: Sequelize.STRING(255),
      comment: 'Reason for blacklisting (logout, security, etc.)'
    },
    create_date: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'Created on'
    },
    write_date: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'Last Updated on'
    }
  }, {
    tableName: 'lp_token_blacklist',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date',
    indexes: [
      {
        name: 'lp_token_blacklist_expires_at',
        fields: ['expires_at']
      },
      {
        name: 'lp_token_blacklist_token',
        fields: ['token']
      },
      {
        name: 'lp_token_blacklist_user_id',
        fields: ['user_id']
      }
    ]
  });

  return TokenBlacklist;
};
