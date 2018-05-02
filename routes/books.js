var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

/* Render the form for creating new book*/
router.get('/new',function(req, res, next) {
  res.render('new_book', {book: Book.build(),
                          title: 'New Book' });
});

/*Create New book*/
router.post('/', function(req, res, next) {

  Book.create(req.body)
      .then(function() {
         res.redirect('/books/all');
       })

      .catch(function(err) {
         if (err.name === "SequelizeValidationError") {
           res.render('new_book', {book: Book.build(req.body),
                                   errors: err.errors,
                                   title: 'New Book' });
         }
         else {
           throw err;
         }
       })

      .catch(function(err){
        res.send(500);
       })

});

/*List all Books*/
router.get('/all', function(req, res, next) {
  Book.findAll()
      .then(function(books) {

         res.render('all_book', {books: books, title: 'Books' });
        })

      .catch(function(err){
        res.send(500);
        })

});

/*List checked out books*/
router.get('/checked', function(req, res, next) {
  Loan.findAll({
    where: {returned_on: null},
    include:[
      {
        model:Book
      }
    ]
  })
      .then((loans) => {

         res.render('checked_books', {loans: loans, title: 'Books' });
       })

      .catch(function(err){
         res.send(500);
        })

  });

 /*List Overdue books*/
router.get('/overdue', function(req, res, next) {
  const Op = Sequelize.Op;
  let today = moment();
  Loan.findAll({
    where: {returned_on: null,
            return_by :{[Op.lt] :today}
           },
    include:[
      {
        model:Book
      }
    ]
  })
      .then((loans) => {
         res.render('overdue_books', {loans: loans, title: 'Books' });
       })
      .catch(function(err){
         res.send(500);
        })
  });

/*Get book detail by ID*/
router.get('/:id',function(req, res, next) {
  Book.findOne({
    where: {id: req.params.id },
    include:[
      {
        model:Loan,
        include: [
          {
            model:Patron
          }
        ]
      }
    ]
    })
      .then(book => {
         res.render('book_detail', {book:book,
                                    title: book.title });
       })

});

/*Update book details*/
router.put("/:id", function(req, res, next){
  Book.findById(req.params.id).then(book => {
    return book.update(req.body);
  })
      .then(function(book) {
        res.redirect('/books/all');
       })
      .catch(function(err) {

         if (err.name === "SequelizeValidationError") {
            Book.findOne({
              where: {id: req.params.id },
              include:[
                {
                  model:Loan,
                  include: [
                    {
                      model:Patron
                    }
                  ]
                }
              ]
              })
                .then(book => {
                   book.title = req.body.title;
                   book.author = req.body.author;
                   book.genre = req.body.genre;
                   book.first_published = req.body.first_published;

                   res.render('book_detail', {book:book,
                                          errors: err.errors,
                                           title: book.title });
                 })

         }
         else {
           throw err;
         }
       })

      .catch(function(err){
         res.send(500);
       })

});


module.exports = router;
