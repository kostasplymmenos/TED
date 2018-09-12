module.exports = {
  //checks if user is logged in; if he's not, he's redirected to "/"
  isLoggedIn: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/');
  },
  //checks if user is authorized to view what he requested
  userAccess: function(req,res,next){
    if(req.params.id != req.session.Auth._id){
      res.render("err.ejs",{error:"Forbidden access"});
    }
    else{
      next();
    }
  }
}
