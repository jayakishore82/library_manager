'use strict';
module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define('Book', {
    id: {type: DataTypes.INTEGER,
        primaryKey: true},
    title: {type: DataTypes.STRING,
            validate: {
              notEmpty: {
                msg: "Title is Required"
              }
            }},
    author: {type: DataTypes.STRING,
            validate: {
                notEmpty: {
                  msg: "Author is Required"
                }
              }},
    genre: {type: DataTypes.STRING,
      validate: {
          notEmpty: {
            msg: "Genre is Required"
          }
        }},
    first_published: DataTypes.INTEGER
  }, {timestamps: false,
   underscored: true});
  Book.associate = function(models) {
    Book.hasMany(models.Loan,{ foreignKey: 'book_id' });
  };
  return Book;
};
