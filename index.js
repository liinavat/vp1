const express = require("express");
const dtEt = require("./dateTimeEt");
const fs = require("fs");
//päringu lahtiharutamieks POST päringu puhul
const bodyparser =require("body-parser");
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyparser.urlencoded({extended: false}));

//loon andmebaasi ühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
	
});

app.get("/",(req, res)=>{
	//res.send("Express läks käima!");
	res.render("index.ejs");
});

app.get("/timenow", (req, res)=>{
	const weekdayNow = dtEt.weekDayEt();
	const dateNow = dtEt.dateEt();
	const timeNow = dtEt.timeEt();
	res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow});
});

app.get("/vanasonad",(req, res)=>{
	let folkWisdom = [];
	fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
		if(err) {
			//throw err; VÕI
			res.render("justlist", {h2: "Vanasõnad", listData: ["Ei leidnud ühtegi vanasõna!"]});
		}
	else {
		folkWisdom = data.split(";");
		res.render("justlist", {h2: "Vanasõnad", listData: folkWisdom});
	}
	});
});

app.get("/regvisit",(req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	fs.open("public/textfiles/visitlog.txt", "a", (err, file)=>{
		if (err){
			throw err;
		}
		else{
			fs.appendFile("public/textfiles/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ":", (err)=>{
				if(err){
					throw err;
				}
				else {
					console.log("Faili kirjutati!");
					res.render("regvisit");
				}
			});
		}
	});
});
app.get("/regvisitdb",(req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	res.render("regvisitdb", {notice: notice, firstName: firstName, lastName:lastName});
});
app.post("/regvisitdb", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	if(!req.body.firstNameInput || !req.body.lastNameInput){
		firstName = req.body.firstNameInput
		lastName = req.body.lastNameInput
		notice = "Osa andmeid sisestamata!";
		res.render("regvisitdb", {notice: notice, firstName: firstName, lastName:lastName});
	}
	else {
		let sqlreq = "INSERT INTO visitlog (first_name, last_name) VALUES(?,?)";
		conn.query(sqlreq,  [req.body.firstNameInput,  req.body.lastNameInput], (err,sqlres)=>{
			if (err){
				throw err;
			}
			else {
				notice = "Külastus registreeritud!";
				res.render("regvisitdb", {notice: notice, firstName: firstName, lastName:lastName});
			}
		});
	}
})

app.get("/eestifilm",(req, res)=>{
	res.render("filmindex");
});
app.get("/eestifilm/tegelased",(req, res)=>{
	let sqlReq = "SELECT first_name, last_name, birth_date FROM person";
	conn.query(sqlReq, (err, sqlres)=>{
		if(err){
			throw err;
		}
		else {
			console.log(sqlres);
			persons = sqlres
			res.render("tegelased", {persons: persons});
		}
	});
	//res.render("tegelased");
});


app.listen(5110);