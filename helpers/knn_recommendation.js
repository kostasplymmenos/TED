var mongoose = require("mongoose");
var User = require('./../models/user.js');
var Post = require('./../models/post.js');
var Comment = require('./../models/comment.js')
const _ = require('underscore');
const Sync = require('sync');


module.exports = {
  //user is the user logged in(auth)
  //top k users of userArr will be the result of knn
  kNearestNeighboors: function(k,user) {
    var candidates_ids = new Array();
    var user_scoreArr = new Array();

    //find connected in users that have mutual friends with user1 (potential candidates)
    //and store them in candidates array
User.findOne({_id: user._id},function(err,user1){
      user1.populate("friends", function(err, populatedUser1){
        //candidates are users who have a friend with user
        //for every friend of user1
        populatedUser1.friends.forEach(function(friend){
          // for every friend of user1's friends
          friend.friends.forEach(function(user2_id){
            //candidate should not be friends with user1
            //candidate shuld not be included already in candidates
            //candidate should not be user1
            if(!candidates_ids.find(candidateid => user2_id.toString() == candidateid) && user2_id != user1._id.toString() && !user1.friends.find(friend => user2_id.toString() == friend._id) ){
              //candidate is legit
              candidates_ids.push(user2_id);
            }
          });
        });
        //find mutual friends of user1 and user2(candidate) and their posts
        console.log("User1:" + user1.firstname + " id:" + user1._id + "\n");
        User.find({_id: {$in: candidates_ids}},function (err, candidates){
          var mutuals = new Array();
          candidates.forEach(function(candidate){
            console.log("Candidate: " + candidate.firstname + "\n");
            //take only the ids from the populated friends array
            var user1Friends = user1.friends.map(a => a._id);

            //find mutual friends between candidate and user1
            user1Friends.forEach(function(user1friend){
              candidate.friends.forEach(function (user2friend){
                if(user2friend.toString() == user1friend.toString())
                  mutuals.push(user1friend);
              });
            });
            console.log("Mutuals:");
            console.log(mutuals);
            console.log(mutuals.length);
            //make the user vectors
            var user1_vector = [];
            var user2_vector = [];
            mutuals.forEach(function(mutual){
              console.log("~~~~~~~~~~~~~\nMutual:");
              console.log(mutual);
              // find all posts of mutual friend
              Post.find({author: mutual}).populate("comments").exec(function(err,foundPosts){
                //for each post find likes and comments of user1 and user2
                foundPosts.forEach(function(foundPost){
                  console.log("\nfoundPost:");
                  console.log(foundPost);
                  // interest 0: no like no comment, 1: like or comment 2: both like and comment
                  var user1_interest = 0;
                  var user2_interest = 0;

                  if(foundPost.likes){
                    var foundlike_user1 = foundPost.likes.find(like => like == user1._id.toString());
                    if(foundlike_user1)
                      user1_interest++;

                    var foundlike_user2 = foundPost.likes.find(like => like == candidate._id.toString());
                    if(foundlike_user2)
                      user2_interest++;
                  }
                  if(foundPost.comments){
                    var foundcomment_user1 = foundPost.comments.find(comment => comment.user == user1._id.toString());
                    if(foundcomment_user1)
                      user1_interest++;

                    var foundcomment_user2 = foundPost.comments.find(comment => comment.user == candidate._id.toString());
                    if(foundcomment_user2)
                      user2_interest++;
                  }

                  //push scores to vectors
                  user1_vector.push(user1_interest);
                  user2_vector.push(user2_interest);

                });
                console.log("\nfinal vectors:");
                console.log(user1_vector);
                console.log(user2_vector);
                //calculate distance between user1 and candidate normalize etc..
                var dist = 0;
                for(var i = 0; i < user1_vector.length; i++)
                  dist += user1_vector[i]*user2_vector[i];

                dist = dist / user1_vector.length;
                //push user and score
                user_scoreArr.push( [candidate._id,dist] );

              });
            }); // edw teleiwnei to foreach mutual
            console.log("Done with Candidate");
          });
          //sort and pick top k
          console.log("Scores:");
          console.log(user_scoreArr);
        });
      });

    });
  }
}




// user -> mutual_friends <- usersArr[i]

// 8eloume ta k pio kontina dianysmata sto dianysma tou auth
//  | user1 | user2 | mutualpost1 | mutualpost2 | ....
//     id1     id2

//ftiaxnoume to vector tou user1 me ta interest=(like+comment) se kathe post twn koinwn filwn me ton user2

//user_id | common_post_id | metric1 |


// user vector | user2 vector


//metric = dot product  kai kanonikopoiisi me arithmo koinwn filwn h arithmo post koinwn filwn


//user1 |  ,0,1 10 1 0 0 0 1 1
//user2 | 10 11 01 1 0 0 0 1 1
// }
//
// function mutual_friends() {
//
// }
