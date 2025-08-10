module.exports = (sequelize, Sequelize) => {
  const SessionLogs = sequelize.define("lp_session_logs", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'User ID who owns this session'
    },
    refresh_token: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: 'Refresh token for this session'
    },
    refresh_token_expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'When refresh token expires'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      comment: 'Whether session is active'
    },
    device_info: {
      type: Sequelize.TEXT,
      comment: 'Device/browser information'
    },
    ip_address: {
      type: Sequelize.STRING(45),
      comment: 'IP address when session was created'
    },
    user_agent: {
      type: Sequelize.TEXT,
      comment: 'User agent string'
    },
    last_used_at: {
      type: Sequelize.DATE,
      comment: 'When session was last used'
    },
    revoked_at: {
      type: Sequelize.DATE,
      comment: 'When session was revoked'
    },
    revoked_reason: {
      type: Sequelize.STRING(255),
      comment: 'Reason for revoking session'
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
    tableName: 'lp_session_logs',
    timestamps: false,
    createdAt: 'create_date',
    updatedAt: 'write_date',
    indexes: [
      {
        name: 'lp_session_logs_expires_at',
        fields: ['refresh_token_expires_at']
      },
      {
        name: 'lp_session_logs_is_active',
        fields: ['is_active']
      },
      {
        name: 'lp_session_logs_refresh_token',
        fields: ['refresh_token']
      },
      {
        name: 'lp_session_logs_user_id',
        fields: ['user_id']
      }
    ]
  });

  return SessionLogs;
};
