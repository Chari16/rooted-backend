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
    await queryInterface.addColumn("temp_subscriptions", "cuisineChoice", {
      type: Sequelize.JSON, // Change to JSON type
      allowNull: true,
    });
    await queryInterface.addColumn("subscriptions", "cuisineChoice", {
      type: Sequelize.JSON, // Change to JSON type
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
