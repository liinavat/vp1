const express = require("express");
const dtEt = require("./dateTimeEt");
const fs = require("fs");
const bodyparser =require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
//päringu lahtiharutamieks POST päringu puhul
app.use(bodyparser.urlencoded({extended: false}));


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


app.listen(5110);