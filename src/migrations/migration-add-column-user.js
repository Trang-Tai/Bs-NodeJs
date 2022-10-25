'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        // queryInterface.addColumn('Users', 'roleId', {
        //   type: Sequelize.DataTypes.STRING,
        // }, { transaction: t }),
        // queryInterface.addColumn('Users', 'phoneNumber', {
        //   type: Sequelize.DataTypes.STRING,
        // }, { transaction: t }),
        // queryInterface.addColumn('Users', 'positionId', {
        //   type: Sequelize.DataTypes.STRING,
        // }, { transaction: t }),
        // queryInterface.addColumn('Users', 'avatar', {
        //   type: Sequelize.DataTypes.STRING,
        // }, { transaction: t }),
        queryInterface.changeColumn('Users', 'image', {
          type: Sequelize.DataTypes.BLOB,
          allowNull: true,
        }, { transaction: t }),
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn('Users', 'image', {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        }, { transaction: t }),
        // queryInterface.removeColumn('Users', 'gender', { transaction: t }),
        // queryInterface.removeColumn('Users', 'roleId', { transaction: t })
      ]);
    });
  }
};

