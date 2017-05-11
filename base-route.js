var baseRoutes = {
	register: function ( server, options, next){
		server.route({
			method: 'GET',
			path: '/test',
			handler: function(request, reply){
				reply('Hello Future Studio!');
			}
		})

		next()
	}
}

baseRoutes.register.attributes ={
	name:'base-routes',
	version:'1.0.0'
}

module.exports = baseRoutes;