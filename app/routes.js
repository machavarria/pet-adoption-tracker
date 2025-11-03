// watched video to help understand how to use ObjectId in my code https://youtu.be/3dyXNde3JuI?si=36bPWYbx6Uobj2X2

//Used code from savage auth and plugged in what was needed in order to have my project work

const ObjectId = require('mongodb').ObjectId;
module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('pets').find({userId: req.user._id}).toArray((err, pets) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            pets: pets
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// pet routes ===============================================================

// Used website https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial to help with some of my code and used chatgpt with setting up the api code for the database
// I had an api before that worked with all different kind of animals but the api ended up breaking so had to use just a dog api instead

app.post('/pets', (req, res) => {
  const breed = req.body.breed;
  const age = req.body.age;

  const apiKey = 'live_Hx18KlzOexO55RjtYyf2G2QvgTMjPInZAHoakcrvmWpVykKHjLd4JyKe3DU6ANYs';

  fetch(`https://api.thedogapi.com/v1/breeds/search?q=${breed}`, {
    headers: { 'x-api-key': apiKey }
  })
  .then(response => response.json())
  .then(breedData => {
    let type = 'Dog';
    let photo = '';

    if (breedData.length > 0) {
      type = breedData[0].name || 'Dog';
      if (breedData[0].image && breedData[0].image.url) {
        photo = breedData[0].image.url;
      }
    }

    db.collection('pets').insertOne({
      userId: req.user._id,
      type,
      breed,
      age,
      photo
    }, (err, result) => {
      if (err) {
        console.log(err);
        return res.redirect('/profile');
      }
      console.log('Saved pet with photo from Dog API');
      res.redirect('/profile');
    });
  })
  .catch(err => {
    console.log('Error fetching from Dog API:', err);
    // Save pet without photo if API fails
    db.collection('pets').insertOne({
      userId: req.user._id,
      type: 'Dog',
      breed,
      age,
      photo: ''
    }, (err, result) => {
      if (err) console.log(err);
      res.redirect('/profile');
    });
  });
});


    app.delete('/pets', (req, res) => {
      db.collection('pets').findOneAndDelete({_id: ObjectId(req.body.id), userId: req.user._id}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('pet removed!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
