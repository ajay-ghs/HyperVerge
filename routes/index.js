var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test');
var ADMIN="root";
var PASSWORD="1234"
var Schema = mongoose.Schema;

var ticketData = new Schema({
	seatNumber : {type : Number, required : true},
	name: {type: String, required: true},
	age: {type: Number, required: true},
	gender: {type: String, required: true}
});

var userdata = mongoose.model('userdata', ticketData);

const tickets=40;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BusApp' });
});

router.get('/api/openTickets',function(req,res,next){
	userdata.estimatedDocumentCount(function(err,result){
		if(err){
			res.send(err);
		}
		else{
			res.send("available tickets = " + (tickets-result).toString());
		}
	});
});

router.get('/api/ticketDetails',function(req,res,next){
	
	userdata.findOne({_id:req.body._id},function(err,doc){
		if(err){
			res.send(err);
		}
		else{
			if(!doc){
				res.send("no such booking found");
			}
			else{
				res.send(doc);
			}
		}
	});
});

router.get('/api/closedTickets',function(req,res,next){
	userdata.find()
		.then(function(doc){
			if(!doc.length){
				res.send("no bookings yet");
			}
			else{
				res.send(doc);
			}
			
		});
});

router.post('/api/book',function(req,res,next){

	userdata.estimatedDocumentCount(function(err,result){
		if(err){
			res.send(err);
		}
		else{
				if(tickets-result > 0){
			var booking = {
			seatNumber : result+1,
			age : req.body.age,
			name : req.body.name,
			gender : req.body.gender
		};
			var data = new userdata(booking);
			data.save();
			res.send("data saved" + data);
		}
		else
			{
				res.send("no seats available");
		}
	}
});


});

router.put('/api/updateBooking',function(req,res,next){
	userdata.findOne({_id: req.body._id},function(err,foundobject){
		if(err){
			res.status(500).send();
		}
		else{
			if(!foundobject){
				res.send(" no such booking found");
			}
			else{
				if(req.body.name){
					foundobject.name=req.body.name;
				}
				if(req.body.age){
					foundobject.age = req.body.age;
				}
				if(req.body.gender){
					foundobject.gender = req.body.gender;
				}


				foundobject.save(function(err, updatedobject){
			if(err){
				res.status(500).send();
			}
			else {
				res.send(updatedobject);
			}
		});

			}
		}
	
});
});

router.delete('/api/adminReset',function(req,res,next){
	var admin=req.body.admin;
	var password=req.body.password;
	if(admin===ADMIN && password===PASSWORD){
		userdata.deleteMany({}, function(err){});
		res.send("data reset");
	}
	else{
		res.send("invalid admin or password");
	}
	
});

router.delete('/api/deleteBooking',function(req,res,next){
	userdata.deleteOne({_id: req.body._id},function(err){
		if(err){
			res.send(err);
		}
		else{
			res.send("deleted booking");
		}
	});
});


router.get('/api/ticketStatus/:seat',function(req,res,next){
	userdata.findOne({seatNumber : req.params.seat},function(err,founddoc){
		if(err){
			res.send(err);
		}
		else{
			if(!founddoc){
				res.send("ticket is open");
			}
			else{
				res.send("ticket closed " + founddoc)
			}
		}
	})
})
module.exports = router;
