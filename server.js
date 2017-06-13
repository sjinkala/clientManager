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


function checkDatabase(cb){
	var sql_all = "SELECT * FROM clients";
	var connection = mysql.createConnection({
		host:'localhost',
		user:'root',
		password:'Closeme1!',
		database: 'clients'
	});
	connection.connect(function(err, results){
		if(err){
			console.log("error connecting to database in check database");
			return cb(err);
		} else {
			connection.query(sql_all,function(err, results){
				connection.end()
				if (err){
					console.log(err + "error all clients query");
					cb({err:err});
				} else {
					cb(null, results);
					console.log(results + "results from all clients query");
				}
			});
		}
	})
		
}

server.route({
	method:'POST',
	path:'/database',
	handler:function(request,reply){
		var connection = mysql.createConnection({
			host:'localhost',
			user:'root',
			password:'Closeme1!',
			database: 'clients',
	});
		connection.connect(function(err,results){
			console.log("Connected!");
			var sql_all= "SELECT * FROM clients";
			connection.query(sql_all,function(err,results){
				connection.end();
				if(err){
					reply ({err:err});
				} else {
					reply(results);
				}
			});
		});	
	}	
});

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
		connection.connect(function(err,results){
			console.log("Connected!");
			var dataValues = [request.payload.clientName, request.payload.creditBalance, request.payload.eligibleForDiscount, request.payload.totalTransactions];
			var sql = 'INSERT INTO clients (clientName, balance, eligibleDiscount, totaltransactions) VALUES(?,?,?,?)';
			connection.query(sql,dataValues,function(err,results){
				connection.end();
				if(err){
					reply({err:err});
				} else {
					checkDatabase(function(err, results) {
						if (err) {
							return reply({err:err});
						} else {
							reply(results);
						}
					});
				}
			
				console.log("Number of records inserted: " , results);
			});
		});
	}
});

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
		connection.connect(function(err,results){
			console.log(request.payload, "purchasedata payload");
			var purchaseDataValues = [request.payload.purchaseAmountrequest.payload.clientName];
			var sql = 'UPDATE clients SET balance = balance-? WHERE clientName =?';
			connection.query(sql,purchaseDataValues, function(err, results){
				connection.end();
				if(err){
					reply({err:err});
					console.log(err + "error in /purchasedata");
				} else { 					
					checkDatabase(function(err, results){
						if(err){
							return reply({err: err});
						} else {
							if(results.length > 0){
								reply(results);
							} else {
								reply();
							}
						}
					});
					console.log(results + "results from 2nd query")
				}

			});
		});		
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


