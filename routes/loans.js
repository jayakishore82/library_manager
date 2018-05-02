var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const Book = require('../models').Book;
const Loan = require('../models').Loan;
const Patron = require('../models').Patron;
const moment = require('moment-timezone');
const sequelize = require('sequelize');
const Op = sequelize.Op;

let today = moment().format("YYYY-MM-DD");
let returnDate = moment().add(7, 'd').format("YYYY-MM-DD");
let checked_book_id = [];

/* Render the form for creating the loan*/
router.get('/new',function(req, res, next) {
  let checked_book_id = [];
  Loan.findAll ({                 /*Get books which are not checked*/
    attributes: ['book_id'],
    where : { returned_on: null}
  })
      .then(loans => {
         loans.forEach(loan =>
           checked_book_id.push(loan.book_id) )
         return checked_book_id;
       })
      .then(checked_book_id => {
         Book.findAll({
           where : {id : {[Op.notIn] :checked_book_id
           }}
         })
             .then(books => {
               Patron.findAll()
                     .then(patrons => {
                        res.render('new_loan', {loan: Loan.build(),
                                        books: books,
                                        patrons: patrons,
                                        date: today,
                                        returnDate: returnDate,
                                        title: 'New Loan' });
                      })
              })


       })

});

/*Create New loan*/
router.post('/', function(req, res, next) {

  Loan.create(req.body)
      .then(function() {
         res.redirect('/loans/all');
       })

      .catch(function(err) {
         console.log(err.name);
         if (err.name === "SequelizeValidationError") {

           Loan.findAll ({                 /*Get books which are not checked*/
             attributes: ['book_id'],
             where : { returned_on: null}
           })
               .then(loans => {
                  loans.forEach(loan =>
                    checked_book_id.push(loan.book_id) )
                  return checked_book_id;
                })
               .then(checked_book_id => {
                  Book.findAll({
                    where : {id : {[Op.notIn] :checked_book_id
                    }}
                  })
                      .then(books => {
                        Patron.findAll()
                              .then(patrons => {
                                 res.render('new_loan', {loan: Loan.build(req.body),
                                                 books: books,
                                                 patrons: patrons,
                                                 date: today,
                                                 returnDate: returnDate,
                                                 errors: err.errors,
                                                 title: 'New Loan' });
                               })
                       })


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

/*Get all Loans*/
router.get('/all', function(req, res, next) {
  Loan.findAll({
    include:[
      {
        model:Book
      },
      {
        model:Patron

      }
    ]
    })
      .then(function(loans) {
               res.render('all_loan', {loans: loans, title: 'Loans' });
        })

      .catch(function(err){
        res.send(500);
        })

});

/*Get all checked out loans*/
router.get('/checked', function(req, res, next) {
  Loan.findAll({
    where: {returned_on: null},
    include:[
      {
        model:Book

      },
      {
        model:Patron

      }

    ]
  })
      .then((loans) => {

         res.render('checked_loans', {loans: loans, title: 'Checked Out Books' });
       })

      .catch(function(err){
         res.send(500);
        })

  });

/*Get all overdue loans*/
router.get('/overdue', function(req, res, next) {


  Loan.findAll({
    where: {returned_on: null,
            return_by :{[Op.lt] :today
            }
           },
    include:[
      {
        model:Book

      },
      {
        model:Patron

      }

    ]
  })
      .then((loans) => {

         res.render('overdue_loans', {loans: loans, title: 'Checked Out Books' });
       })

      .catch(function(err){
         res.send(500);
        })

  });

/*Render form for Return a book*/
router.get('/:id',function(req, res, next) {
  Loan.findOne({
    where: {id: req.params.id },
    include:[
      {
        model:Book
      },
      {
        model:Patron

      }
        ]

  })
  .then(loan => {

    res.render('return_book',{loan:loan,date:today})
  })
  .catch(function(err){
     res.send(500);
    })

});

/*Return a book*/
router.post('/:id',function(req, res, next) {

  let returnedDate = moment(req.body.returned_on,'YYYY-MM-DD',true);

  if(returnedDate.isValid() && req.body.returned_on === today ) {
    req.body.returned_on = moment(req.body.returned_on).tz("America/Los_Angeles").format("dddd MMMM D YYYY h:mm:ss [GMT]ZZ (z) ");
    Loan.findById(req.params.id)
        .then(loan => {
         loan.update(req.body)
              .then(loan => {
                 res.redirect('/loans/all');
               })
         })

  }
  else {
    let err = [{}];
    err[0].message = "Invalid Date";

    Loan.findOne({
      where: {id: req.params.id },
      include:[
        {
          model:Book
        },
        {
          model:Patron

        }
          ]

    })
        .then(loan => {

          res.render('return_book',{loan:loan,
                                    date:today,
                                    errors:err})
        })
        .catch(function(err){
           res.send(500);
        })

  }

})
module.exports = router;
