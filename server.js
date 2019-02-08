const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const app = express();
const port = process.env.PORT;

app.all('/', function (req, res) {
	res.send("API");
});

app.all('/login', function(req, res) {
	var tmp = req.query;
	var user = tmp.username;
	var password = crypto.createHash("sha512").update(tmp.password).digest('hex');
	delete tmp.password;
	delete req.query.password;
	var response = {};
	var db = JSON.parse(fs.readFileSync('/var/www/calicode/data/users.json'));
	if (db.indexOf(user) != -1) {
		if (password == db[user]['passhash']) {
			var good = false;
			while (!good) {
				hash = crypto.randomBytes(15).toString('hex');
				if (!fs.existsSync('/var/www/calicode/sessions/'+hash)) {
					var date = new Date();
					date = date.getTime();
					good = true;
					fs.writeFileSync('/var/www/calicode/sessions/'+hash, '{"username":"' + username + '", "session-date":"' + date + '", "loginip":"' + tmp['REQIP'] + '"}');
					response.status = "good";
					response.sess = hash;
				}
			}
		}
	} else {
		response.status = "error";
		response.reason = "user_dne";
	}
	res.send(response);
});

app.all('/register', function(req, res) {
	var date = new Date();
	var tmp = req.query;
	var user = tmp.username;
	var password = crypto.createHash("sha512").update(tmp.password).digest('hex');
	var email = tmp.email;
	var country = tmp.country;
	delete tmp.password;
	delete req.query.password;
	var response = {};
	var db = JSON.parse(fs.readFileSync('/var/www/calicode/data/users.json'));
	if (db.indexOf(user) == -1) {
		var usert = {};
		usert.passhash = password;
		usert.email = email
		usert.about = "";
		usert.country = country;
		usert.verified = false;
		usert.projects = [];
		usert.studios = [];
		usert.joined = date.getDate();
		usert.followers = [];
		usert.following = [];
		db[user] = usert;
		fs.writeFileSync('/var/www/calicode/data/users.json',JSON.stringify(db));
		response.status = "good";
	} else {
		response.status = "error";
		response.reason = "user_ex";
	}
	res.send(response);
});

app.all('/user/:id', function(req, res) {
	var id = req.params.id;
	var db = JSON.parse(fs.readFileSync('/var/www/calicode/data/users.json'));
	var dbc = JSON.parse(fs.readFileSync('/var/www/calicode/data/uc.json'));
	var response = {};
	if (id in db) {
		var user = db[id];
		delete user.passhash;
		user['comments'] = dbc[id];
		response = user;
	} else {
		response.status = "error";
		response.reason = "user_dne";
	}
	res.send(response);
});

app.all('/studio/:id', function(req, res) {
	var id = req.params.id;
	var db = JSON.parse(fs.readFileSync('/var/www/calicode/data/studios.json'));
	var dbc = JSON.parse(fs.readFileSync('/var/www/calicode/data/sc.json'));
	var response = {};
	if (db[tmp['id']-1] != undefined) {
		var studio = db[id-1];
		studio['comments'] = dbc[id-1];
		response = studio;
	} else {
		response.status = "error";
		response.reason = "studio_dne";
	}
	res.send(response);
});

app.all('/project/:id', function(req, res) {
	var id = req.params.id;
	var db = JSON.parse(fs.readFileSync('/var/www/calicode/data/projects.json'));
	var dbc = JSON.parse(fs.readFileSync('/var/www/calicode/data/pc.json'));
	var response = {};
	if (db[id-1] != undefined) {
		var project = db[id-1];
		project['comments'] = dbc[id-1];
		response = project;
	} else {
		response.status = "error";
		response.reason = "project_dne";
	}
	res.send(response);
});

app.listen(port);
