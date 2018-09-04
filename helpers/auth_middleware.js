module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      res.redirect('/');
  },
  userAccess: function(req,res,next){
    if(req.params.id != req.session.Auth._id){
      res.render("err.ejs",{error:"Forbidden access"});
    }
    else{
      next();
    }
  }
}
