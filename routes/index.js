var express = require('express');
var router = express.Router();
const userModel = require("../model/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy(userModel.authenticate()));

const expenseModel = require("../model/expenseModel");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {admin: req.user});
});

/* GET search page. */
router.get('/search', function(req, res, next) {
  res.render('search', {admin: req.user});
});

/* GET delete route. */
router.get('/delete/:id', async function(req, res, next) {
  try {
    await expenseModel.findByIdAndDelete({ _id: req.params.id, user: req.user._id });
    res.redirect("/dashboard");
  } catch (error) {
    res.send(error);
  }
});

/* GET update page. */
router.get('/update/:id', async function(req, res, next) {
  let expense = await expenseModel.findById(req.params.id);
  res.render('update', {admin: req.user, expense: expense});
});

/* GET update post route. */
router.post('/update/:id', async function(req, res, next) {
  try {
    // Split the tags string into an array
    req.body.Tags = req.body.Tags.split(',').map(tag => tag.trim());

    // Convert the categories from a string to an array
    req.body.Categories = req.body.Categories.split(',').map(category => category.trim());

    await expenseModel.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/dashboard");
  } catch (error) {
    res.send(error);
  }
});

/* GET add expense page. */
router.get('/addexpense', isLoggedIn, function(req, res, next) {
  res.render('addexpense', {admin: req.user});
});
/* GET add expense post route. */
router.post('/addexpense', isLoggedIn, async function(req, res, next) {
  try {
     // Set the user field to the current user's ID
    req.body.user = req.user._id;

    // Split the tags string into an array
    req.body.Tags = req.body.Tags.split(',').map(tag => tag.trim());

    // Convert the categories from a string to an array
    req.body.Categories = req.body.Categories.split(',').map(category => category.trim());

    // Insert the new expense into the database
    await expenseModel.create(req.body);

    res.redirect("/dashboard");
  } catch (error) {
    res.send(error.message);
  }
});

/* GET Dashboard page. */
router.get('/dashboard', isLoggedIn, async function(req, res, next) {
  try {
    let expenses = await expenseModel.find({ user: req.user._id });
    res.render('dashboard', {admin: req.user, expenses: expenses});
  } catch (error) {
    res.send(error.message);
  }
});

/* GET SignUp page. */
router.get('/signup', function(req, res, next) {
  res.render('signup', {admin: req.user});
});
/* GET SignUp post route. */
router.post('/signup', async function(req, res, next) {
  try {
    await userModel.register({
    username: req.body.username,
    email: req.body.email,
    contactNumber: req.body.contactNumber
  },
  req.body.password
  );
  res.redirect("/signin");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

/* GET Signin page. */
router.get('/signin', function(req, res, next) {
  res.render('signin', {admin: req.user});
});
/* GET Signin post route. */
router.post(
  '/signin',
  passport.authenticate("local",{
    successRedirect: "/profile",
    failureRedirect: "/signin"
  }),
   function(req, res, next) {});

/* GET profile page. */
router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('profile', {admin: req.user});
});

/* GET signout route. */
router.get('/signout', isLoggedIn, function(req, res, next) {
  req.logOut(()=>{
    res.redirect("/signin")
  });
});

/* GET forget Password page. */
router.get('/forget', function(req, res, next) {
  res.render('forget', {admin: req.user});
});

/* GET forget Password post route. */
router.post('/forget', async function(req, res, next) {
  try {
    const user = await userModel.findOne({username: req.body.username});
    if(!user){
      return res.send("<h1>User not found!</h1> <a href='/forget'>Try Again.</a>");
    }
    await user.setPassword(req.body.newPassword);
    await user.save();
    res.redirect("/signin");
  } catch (error) {
    res.send(error);
  }
});

/* GET reset password page. */
router.get('/reset', isLoggedIn, function(req, res, next) {
  res.render('reset', {admin: req.user});
});
/* GET reset password post route. */
router.post('/reset', isLoggedIn, async function(req, res, next) {
  try {
    await req.user.changePassword(
      req.body.oldPassword,
      req.body.newPassword
    );
    await req.user.save();
    res.redirect("/profile");
  } catch (error) {
    res.send(error)
  }
});

/* POST search route. */
router.post('/search', isLoggedIn, async function(req, res, next) {
  try {
      const searchTerm = req.body.search;
      // Implement your search logic based on the searchTerm
      // You can use a regular expression or other search criteria
      let searchResults = await expenseModel.find({
          $or: [
              { Title: { $regex: searchTerm, $options: 'i' } },
              { Description: { $regex: searchTerm, $options: 'i' } },
              // Add more fields as needed for search
          ],
          user: req.user._id
      });
      res.render('result', { admin: req.user, expenses: searchResults });
  } catch (error) {
      res.send(error.message);
  }
});

/* POST filter route. */
router.post('/filter', isLoggedIn, async function(req, res, next) {
  try {
      const filterDate = req.body.Date;
      const filterCategory = req.body.Categories;
      const filterTags = req.body.Tags;

      console.log('Filter Date:', filterDate);
      console.log('Filter Category:', filterCategory);
      console.log('Filter Tags:', filterTags);


      let filterQuery = { user: req.user._id };

      // Check if date is provided for filtering
      if (filterDate) {
          filterQuery.Date = filterDate;
      }

      // Check if category is provided for filtering
      if (filterCategory) {
          filterQuery.Categories = filterCategory;
      }

      // Check if tags are provided for filtering
      if (filterTags) {
          filterQuery.Tags = filterTags;
        
        console.log('Filter Tags:', filterTags);

    }
    console.log('Filter Query:', filterQuery);

    // Implement your filtering logic based on filterQuery
    let filterResults = await expenseModel.find(filterQuery);
    console.log('Filter Results:', filterResults);

      res.render('result', { admin: req.user, expenses: filterResults });
  } catch (error) {
      res.send(error.message);
  }
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else{
    res.redirect("/signin");
  }
}

module.exports = router;
