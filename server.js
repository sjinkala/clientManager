const Hapi = require('hapi');
const Good = require('good');
var mysql = require('mysql');




const server = new Hapi.Server();
server.connection({
    port: process.env.PORT || 3000 
});

server.register({
	register: require('./base-route')
})

server.register({
	register: require('./myplugin')
})

server.route({
	method:'POST',
	path:'/data',
	handler:function(request,reply){
		// var payload = request.payload,
		// console.log(payload);
		var connection = mysql.createConnection({
			host:'localhost',
			user:'root',
			password:'Closeme1!',
			database: 'clients',
		});
		console.log(request.payload, "testing the payload");
		console.log(request.payload.clientName);
		reply({results:request.payload});
		connection.connect(function(err){
			if(err) throw err;
			console.log("Connected!");
			var dataValues = [request.payload.clientName, request.payload.referredBy, request.payload.creditBalance];
			console.log(dataValues);
			var sql = 'INSERT INTO clients (clientName, referral, balance) VALUES(?,?,?)';
			connection.query(sql,dataValues,function(err,results){
				if (err) throw err;
				console.log("Number of records inserted: " + results.affectedRows);
			});
		});

	}	
})

server.route({
	method:'POST',
	path:'/purchasedata',
	handler:function(request,reply){
		var connection = mysql.createConnection({
			host:'localhost',
			user:'root',
			password:'Closeme1!',
			database: 'clients'
		});
		console.log(request.payload, "purchasedata");
		reply({results:request.payload});
		console.log(request.payload.creditBalance + "testing payload balance");
		connection.connect(function(err){
			if(err) throw err;
			var purchaseDataValues = [request.payload.clientName,request.payload.creditBalance];
			console.log(purchaseDataValues);

		})
	}	
});

server.route({
	method:'GET',
	path:'/sup/{valueFromBrowser}',
	handler: function(request, reply){
		var browserValue = request.params.valueFromBrowser;
		console.log(browserValue);
		var replySentence = "Hey there " + browserValue + " , sup?";
		reply({message:replySentence});
	}
});

server.route({
	method:'GET',
	path:'/multiply_one_by_the_other/{multiplyThis}/{byThis}',
	handler: function(request, reply){
		var multiply_this = request.params.multiplyThis * 1;
		var by_this = request.params.byThis * 1;
		var result = multiply_this * by_this;
		console.log("multiply_this: ", multiply_this);
		console.log("by_this: ", by_this);
		console.log("result: ", result);
		reply({result:result});
	}
});

server.route({
	method:'GET',
	path:'/happy',
	handler: function(request, reply){
		reply({message : "hello browser"});
	}
});

server.register(require('inert'), function (err){

	if (err) {
		throw err;
	}

	server.route({
		method:'GET',
		path:'/hello',
		handler: function(request,reply){
			reply.file('./public/clientManager.html');
		}
	});
});

server.register({
	register: Good,
	options: {
		reporters:{
			console: [{
				module:'good-squeeze',
				name:'Squeeze',
				args: [{
					response: '*',
					log: '*',
				}]
			}, {
				module: 'good-console'
			}, 'stdout']
			
		}
	}
},(err) => {

	if(err){
		throw err;
	}
	
	server.start((err) =>{
	
		if(err) {
		throw err;
		}
		server.log('info', 'Server running at: ' + server.info.uri);
	});
});
