'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // await queryInterface.addColumn("temp_subscriptions", "cuisineChoice", {
    //   type: Sequelize.JSON, // Change to JSON type
    //   allowNull: true,
    // });
    // await queryInterface.addColumn("subscriptions", "cuisineChoice", {
    //   type: Sequelize.JSON, // Change to JSON type
    //   allowNull: true,
    // });
    // await queryInterface.addColumn("subscriptions", "deliveryType", {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });
    // await queryInterface.sequelize.query(`
    //   UPDATE subscriptions
    //   SET deliveryType = 'lunch'
    //   WHERE deliveryType IS NULL;
    // `);
    // await queryInterface.addColumn("temp_subscriptions", "deliveryType", {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });
    // await queryInterface.sequelize.query(`
    //   UPDATE temp_subscriptions
    //   SET deliveryType = 'lunch'
    //   WHERE deliveryType IS NULL;
    // `);

    await queryInterface.addColumn("subscriptions", "selectedDates", {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn("temp_subscriptions", "selectedDates", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
