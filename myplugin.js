var myplugin = {
	register: function(server,options,next){
		next()
	}
}  

myplugin.register.attributes = {
	name:'myplugin',
	version: '1.0.0'
}

module.exports = myplugin;
