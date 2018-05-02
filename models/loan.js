'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    id: {type: DataTypes.INTEGER,
        primaryKey: true},
    book_id: {type: DataTypes.INTEGER,
              allowNull: false},
    patron_id: {type: DataTypes.INTEGER,
              allowNull: false},
    loaned_on: {type: DataTypes.DATE,
      validate: {
        isDate: {
          msg: "Loaned on is Invalid"
        }
      }},
    return_by: {type: DataTypes.DATE,
      validate: {
        isDate: {
          msg: "Return by is Invalid"
        }
      }},
    returned_on: DataTypes.DATE
  }, {timestamps: false,
   underscored: true});
  Loan.associate = function(models) {
    // associations can be defined here
  Loan.belongsTo(models.Book);
  Loan.belongsTo(models.Patron);

  };
  return Loan;
};
