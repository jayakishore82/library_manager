var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
const Patron = require('../models').Patron;
const Loan = require('../models').Loan;

/*Render form for creating ne patron*/
router.get('/new',function(req, res, next) {
  res.render('new_patron', {patron: Patron.build(),
                            title: 'New Patron' });
});

/*Create New patron*/
router.post('/', function(req, res, next) {
  Patron.create(req.body)
        .then(function() {
          res.redirect('/patrons/all');
         })

        .catch(function(err) {
           if (err.name === "SequelizeValidationError") {
             res.render('new_patron', {patron: Patron.build(req.body),
                                       errors: err.errors,
                                       title: 'New Patron' });
          }
          else {
           throw err;
          }
        })

        .catch(function(err){
           res.send(500);
        })

});

/*Get all patrons*/
router.get('/all', function(req, res, next) {
  Patron.findAll()
      .then(function(patrons) {

         res.render('all_patron', {patrons: patrons, title: 'Library Manager' });
        })

      .catch(function(err){
        res.send(500);
        })

});

/*Get patron details by patron id*/
router.get('/:id',function(req, res, next) {
  Patron.findOne({
    where: {id: req.params.id },
    include:[
      {
        model:Loan,
        include: [
          {
            model:Book
          }
        ]
      }
    ]
    })

    .then(patron => {
      res.render('patron_detail', {patron:patron,
                                   loans:patron.Loans,
                                   title: patron.first_name });
    })

});

/*Update Patron details*/
router.put("/:id", function(req, res, next){
    Patron.findById(req.params.id)
          .then(patron => {
             return patron.update(req.body);
           })
          .then(function(patron) {
             res.redirect('/patrons/all');
           })
          .catch(function(err) {
             if (err.name === "SequelizeValidationError") {
                Patron.findOne({
                  where: {id: req.params.id },
                  include:[
                    {
                      model:Loan,
                      include: [
                        {
                          model:Book
                        }
                      ]
                    }
                  ]
                  })

                      .then(patron => {

                          patron.first_name = req.body.first_name;
                          patron.last_name = req.body.last_name;
                          patron.address = req.body.address;
                          patron.email = req.body.email;
                          patron.library_id = req.body.library_id;
                          patron.zip_code = req.body.zip_code;
                          res.render('patron_detail', {patron:patron,
                                                       loans:patron.Loans,
                                                       errors: err.errors,
                                                  title: patron.first_name });
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
