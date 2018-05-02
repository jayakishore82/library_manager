'use strict';
module.exports = (sequelize, DataTypes) => {
  var Patron = sequelize.define('Patron', {
    id: {type: DataTypes.INTEGER,
        primaryKey: true},
    first_name: {type:DataTypes.STRING,
                  validate: {
        notEmpty: {
          msg: "First name is Required"
        }
      }},
    last_name: {type:DataTypes.STRING,
                validate: {
          notEmpty: {
          msg: "Last name is Required"
          }
          }},
    address: {type:DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Address is Required"
        }
      }},
    email: {type:DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Email is Required"
        }
      }},
    library_id: {type:DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Library id is Required"
        }
      }},
    zip_code: {type:DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Zip is Required"
        }
      }},
  }, {timestamps: false,
   underscored: true});
  Patron.associate = function(models) {
    // associations can be defined here
    Patron.hasMany(models.Loan,{ foreignKey: 'book_id' });
  };
  return Patron;
};
