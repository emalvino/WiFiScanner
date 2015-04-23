var pcap = require('pcap');
var mongoose = require('mongoose');
var express = require('express');
var q = require('q');
var http = require('http');
var bodyParser = require('body-parser');
var app = express();

// Check args
if(process.argv.length < 3){
	console.log('Missing interface name');
	console.log('Example: node server.js wlan0');
	process.exit();
}
var ifName = process.argv[2];

// CORS
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(bodyParser.json());
// Common
function checkAndHandleError(error, response){
	if(error){
		console.log(error);
		if(response){
			if(response.end){
				// HTTP response
				response.end();
			}
			else if(response.reject){
				// promise
				response.reject(error);
			}
		}
	}
	return error;
}

// Init MongoDB
mongoose.connect('mongodb://localhost/wifi');
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'));
var Entry;
var From;
var Session;
db.once('open', function(){
	var entrySchema = mongoose.Schema({
		from: String,
		to: String,
		strength: Number,
		timestamp: Date,
		ssid: String
	});
	Entry = mongoose.model('entry', entrySchema);
	var fromSchema = mongoose.Schema({
		mac: String,
		vendor: String,
		label: String,
		ssidCount: Number
	});
	From = mongoose.model('from', fromSchema);
	var sessionSchema = mongoose.Schema({
		number: Number,
		label: String,
		from: Date,
		to: Date,
		latitude: String,
		longitude: String
	});
	Session = mongoose.model('session', sessionSchema);
});

// Vendor http lookup
function lookupVendor(mac){
	var deferred = q.defer();
	if(status === ''){
		http.get('http://www.macvendorlookup.com/api/v2/' + mac, function(response){
			var result;
			response.on('data', function(data){
				result = JSON.parse(data)[0].company;
			});
			response.on('end', function(){
				if(result === undefined){
					deferred.reject('Not found');
				}
				else{
					deferred.resolve(result);	
				}
			});
		}).on('error', function(error){
			checkAndHandleError(error, deferred);
		});
	}
	else{
		deferred.reject('Not found');
	}
	return deferred.promise;
}

// Finders
function findOrCreateFrom(mac){
	var deferred = q.defer();
	From.where({ mac: mac }).findOne(function(error, result){
		if(!checkAndHandleError(error, deferred)){
			if(!result){
				result = new From({ mac: mac});
			}
			Entry.where({from: mac}).distinct('ssid').exec(function(error, ssids){
				if(!checkAndHandleError(error)){
					result.ssidCount = ssids.length;
					result.save(function(error, savedResult){
						checkAndHandleError(error,deferred);
					});			
					deferred.resolve(result);
				}
			});
		}
	});
	return deferred.promise;
}

// Scan
function parseSSID(rawPacket, result){
    if(rawPacket[50] === 0){
        var length = rawPacket[51];
        if(length === 0){
            result.ssid = null;
        }
        else{
            result.ssid = '';
            for(var i = 52; i < 52 + length; i++){
                result.ssid += String.fromCharCode(rawPacket[i]);
            }
        }
    }
}
function createNewSession(){
	var deferred = q.defer();
	var date = new Date();
	Session.findOne().sort('number').exec(function(error, result){
		if(!checkAndHandleError(error, deferred)){
			var session = new Session({
				number: result.number + 1,
				from: date,
				to: date
			});
			session.save(function(error, savedResult){
				if(!checkAndHandleError(error, deferred)){
					deferred.resolve(savedResult);
				}
			});
		}
	});
	return deferred.promise;
}
var pcapSession;
var status = {
	status: '',
	signal: {
		previous: 0,
		alpha: 0.1,
		strength: 0,
		add: function(strength){
			this.previous = this.strength;
			this.strength = this.alpha * strength + (1 - this.alpha) * this.previous;
		}
	}
};
function startScanningSSIDs(){
	status.status = 'ssid';
	createNewSession().then(function(session){
		pcapSession = pcap.createSession(ifName, 'wlan type mgt subtype probe-req');
		pcapSession.on('packet', function(rawPacket){
			var packet = pcap.decode.packet(rawPacket);
			var result = new Entry({
				from: packet.link.ieee802_11Frame.shost,
				to: packet.link.ieee802_11Frame.dhost,
				strength: packet.link.ieee802_11Frame.strength,
				timestamp: new Date()
			});
			parseSSID(rawPacket, result);
			if(result.ssid !== null){
				result.save(function(error, savedResult){
					checkAndHandleError(error);
				});
				session.to = result.timestamp;
				session.save(function(error){
					checkAndHandleError(error);
				});
				console.log(result.from + ' ' + result.ssid);
			}
		});
	});
}
function startScanningForSignal(target){
	status.ta = target;
	pcapSession = pcap.createSession(ifName, 'wlan type mgt and wlan addr3 ' + target);
	status.status = 'signal'
	pcapSession.on('packet', function(rawPacket){
		var packet = pcap.decode.packet(rawPacket);
		var strength = packet.link.ieee802_11Frame.strength;
		status.signal.add(strength);
		console.log(strength + ',' + status.signal.strength);
	});
}
function stopScanning(){
	if(pcapSession){
		pcapSession.close();
		pcapSession = undefined;
		status.status = '';
		delete status.ta;
		delete status.strength;
	}
}
function sendStatus(response){
	response.json(status);
}
// GET Endpoints
// Start/stop scanning
app.get('/scan/:type', function(request, response){
	var type = request.param('type');
	if(type === 'ssid'){
		stopScanning();
		startScanningSSIDs();
	}
	else if(type === 'signal'){
		var target = request.param('target');
		stopScanning();
		startScanningForSignal(target);
	}
	else if(type === 'stop'){
		stopScanning();
	}
	else{
		response.status(400).send('Unknown type ' + type);
		return;
	}
	sendStatus(response);
});
// Get current scanning status
app.get('/scan', function(request, response){
	sendStatus(response);
});
// Find all sessions
app.get('/session/:number?', function(request, response){
	var number = request.param('number');
	var session = Session.find();
	if(number){
		session = Session.findOne().where({number: number});
	}
	session.exec(function(error, result){
		if(!checkAndHandleError(error, response)){
			response.json(result);
		}
	});
});
// Save session
app.post('/session/:number', function(request, response){
	var number = request.param('number');
	Session.findOne().where({number: number}).exec(function(error, session){
		if(!checkAndHandleError(error, response)){
			session.label = request.param('label');
			session.latitude = request.param('latitude');
			session.longitude = request.param('longitude');
			session.save(function(error, savedSession){
				if(!checkAndHandleError(error, response)){
					response.json(savedSession);
				}
			});
		}
	});
});
// Find all entries
app.get('/entry/:mac?', function(request, response){
	var mac = request.param('mac');
	var entry = Entry;
	if(mac){
		entry = Entry.where({from: mac});
	}
	entry.find().
	select('from to strength timestamp ssid').
	exec(function(error, results){
		if(!checkAndHandleError(error, response)){
			response.json(results);
		}
	});
});
// Find all from macs
app.get('/from', function(request, response){
	Entry.find().distinct('from', function(error, results){
		if(!checkAndHandleError(error, response)){
			var promises = [];
			results.forEach(function(result){
				promises.push(findOrCreateFrom(result));
			});
			q.all(promises).then(function(results){
				response.json(results);
			});
		}
	});
});
// Find all ssids
app.get('/ssid', function(request, response){
	Entry.find().distinct('ssid', function(error, results){
		if(!checkAndHandleError(error, response)){
			response.json(results);
		}
	});
});
// Find entries for ssid
app.get('/ssid/:ssid', function(request, response){
	var ssid = request.param('ssid');
	Entry.where({ssid: ssid}).find().distinct('from', function(error, results){
		if(!checkAndHandleError(error, response)){
			response.json(results);
		}
	});
});
// Find and update vendor
app.get('/details/:mac', function(request, response){
	var mac = request.param('mac');
	From.where({ mac: mac }).findOne(function(error, result){
		if(!checkAndHandleError(error, response)){
			if(!result.vendor){
				lookupVendor(mac).then(function(vendor){
					result.vendor = vendor;
					result.save(function(error, savedResult){
						if(!checkAndHandleError(error, response)){
							response.json(savedResult);
						}
					});
				});
			}
			else{
				response.json(result);				
			}
		}
	}, function(error){
		checkAndHandleError(error, response);
	});
});
// Update mac details (label)
app.post('/details/:mac', function(request, response){
	var mac = request.param('mac');
	var label = request.param('label');
	From.where({ mac: mac }).findOne(function(error, result){
		if(!checkAndHandleError(error, response)){
			result.label = label;
			result.save(function(error, savedResult){
				if(!checkAndHandleError(error, response)){
					response.json(savedResult);
				}
			});			
		}
	});	
});

var server = app.listen(3000, function(){
	console.log(server.address().address + ' listening at port ' + server.address().port);
});
