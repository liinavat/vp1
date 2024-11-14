const express = require("express");
const dtEt = require("./dateTimeEt");
const fs = require("fs");
//päringu lahtiharutamieks POST päringu puhul
const bodyparser =require("body-parser");
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");
//failide üleslaadimine multeri liite abil
const multer = require("multer");
const sharp = require("sharp"); //pildi manipulatasiooniks/suuruse muutmiseks sharp
const bcrypt = require("bcrypt"); //parooli krüpteerimiseks on bcrypt
const session = require("express-session");//sessiooni haldur

const app = express();
app.use(session({secret: "myLittlePony", saveUninitialized: true, resave: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
//päringu URL-i parandamine, false kui ainult tekst, true kui muud ka
app.use(bodyparser.urlencoded({extended: true})); 
//seadistame vahevara multer fotode laadimiseks kindlasse kataloogi
const upload = multer({dest: "./public/gallery/orig/"})

//loon andmebaasi ühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
	
});

const checkLogin = function(req, res, next){
	if(req.session != null){
		if(req.session.userId){
			console.log("Login,sees kasutaja:" + req.session.userId);
			next();
		}
		else{
			console.log("Login not detected");
			res.redirect("/signin");
		}
	}
	else {
		console.log("Session not detected");
		res.redirect("/signin");
	}
}

app.get("/", (req, res)=>{
	//res.send("Ekspress läks täiesti käima!")
	res.render("index",{days: dtEt.daysBetween("9-2-2024")});
});

app.get("/signin", (req, res)=>{
	let notice = ""
	res.render("signin", {notice: notice});
});

app.get("/logout", (req, res)=>{
	req.session.destroy();
	console.log("Välja logitud")
	res.redirect("/");
});

app.post("/signin", (req, res)=>{
	let notice = "";
	if(!req.body.emailInput || !req.body.passwordInput){
		console.log("Andmeid on puudu");
		notice = "Sisselogimise andmeid on puudu!";
		res.render("signin", {notice: notice});
	}
	else {
		let sqlReq = "SELECT id, password FROM users WHERE email = ?";
		conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
			if(err){
				console.log("Viga andmebaasist lugemisel!" + err);
				notice = "Tehniline viga, sisselogimine ebaõnnestus!";
				res.render("signin", {notice: notice});
			}
			else {
				if(result[0] != null){
					//kasutaja on olemas, kontrollime parooli
					bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
						if(err){
							notice = "Tehniline viga, sisselogimine ebaõnnestus!";
							res.render("signin", {notice: notice});
						}
						else {
							//kontrollime parooli, õige v vale
							if(compareresult){
								//notice = "Oled sisse logitud"							
								//res.render("signin", {notice: notice});
								req.session.userId = result[0].id;
								res.redirect("/home");
							}
							else {
								notice = "Kasutajatunnus ja/või parool on vale!"
								res.render("signin", {notice: notice});
							}
						}
					});
				}
				else {
					notice = "Kasutajatunnus ja/või parool on vale!"
					res.render("signin", {notice: notice});
				}//kui kasutajat ei leitud
			}
		});//conn execute lõppeb
	}
});

app.get("/home", checkLogin, (req, res)=>{
	console.log("Seest on kasutaja: " + req.session.userId);
	res.render("home");
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

app.get("/signup", (req,res)=>{
	res.render("signup")});
	
app.post("/signup", (req,res)=>{
	let notice = "Ootan andmeid!"
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.genderInput || !req.body.emailInput || req.body.passwordInput.length < 8 || req.body.passwordInput !== req.body.confirmPasswordInput){
		console.log("Andmeid on puudu, või paroolid ei kattu!");
		notice = "Andmeid on puudu, parool liiga lühike või paroolid ei kattu!";
		res.render("signup", {notice: notice});
	}//<=kui andmetes viga...lõppeb
	else {
		notice = "Andmed sisestatud!";
		//loome parooli räsi:
		bcrypt.genSalt(10, (err, salt)=> {
			if(err){
				notice = "Tehniline viga parooli krüpteerimisel, kasutajat ei loodud";
				res.render("signup", {notice: notice});
			}
			else {
				//krüteerimine
				bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash)=> {
					if (err){
						notice = "Tehniline viga, kasutajat ei loodud";
						res.render("signup", {notice: notice});
					}
					else {
						let sqlReq = "INSERT INTO users (first_name, last_name, birth_date, gender, email, password) VALUES(?,?,?,?,?,?)";
						conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result)=>{
							if(err){
								notice = "Tehniline viga andmebaasi kirjutamisel, kasutajat ei loodud";
								res.render("signup", {notice: notice});
							}
							else {
								notice = "Kasutaja " + req.body.emailInput + "on edukalt loodud!";
								res.render("signup", {notice: notice});
							}
						});//conn execute lõppeb
					}
				});//hash lõppeb
			}
			
		});//genSalt lõppeb
		
	}
});
	//res.render("signup")});
	

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
	let persons = [];
	conn.query(sqlReq, (err, sqlres)=>{
		if(err){
			throw err;
		}
		else {
			//console.log(sqlres);
			//persons = sqlres
			//for i algab 0 piiriks sqlres.length
			//tsükli sees lisame persons listile uue elementdi, mis on ise objekt {first_name: sqlres[i].first_name}
			//listi lisamiseks on käsk
			//push.persons(lisatav element);
			for (let i = 0; i < sqlres.length; i ++){
				persons.push({first_name: sqlres[i].first_name, last_name: sqlres[i].last_name, birth_date: dtEt.givenDateFormatted(sqlres[i].birth_date)});
			}
			console.log(persons)
			res.render("tegelased", {persons: persons});
		}
	});
	//res.render("tegelased");
});

app.get("/addnews",(req, res)=>{
	res.render("addnews");
});



app.get("/gallery", (req, res)=>{
	let sqlReq = "SELECT id, file_name, alt_text FROM photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
	const privacy = 3;
	let photoList = [];
	conn.query(sqlReq, [privacy], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({id: result[i].id,  href: "/gallery/thumb/", filename: result[i].file_name, alt: result[i].alt_text});
			}
			res.render("gallery", {listData: photoList});
		}
	});
	//res.render("gallery");
});

app.get("/photoupload",(req, res)=>{
	res.render("photoupload");
});

app.post("/photoupload", upload.single("photoInput"), (req, res)=>{
	console.log(req.body);
	console.log(req.file);
	//genereerin oma failinime
	const fileName = "vp_" + Date.now() + ".jpg";
	//nimetame üleslaetud faili ümber
	fs.rename(req.file.path, req.file.destination + fileName, (err)=>{
		console.log(err);
	});
	//teeme 2 eri suurust
	sharp(req.file.destination + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName)
	sharp(req.file.destination + fileName).resize(100,100).jpeg({quality: 90}).toFile("./public/gallery/thumb/" + fileName)
	//teeme andmebaasi piltide hoiustamiseks
	let sqlReq = "INSERT INTO photos(file_name, org_name, alt_text, privacy, user_id) VALUES(?,?,?,?,?)";
	const userId = 1;
	conn.query(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			res.render("photoupload");
		}
	});
	//res.render("photoupload")
	res.render("photoupload");
});



app.listen(5190);