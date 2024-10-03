const express = require("express");
const dtEt = require("./dateTimeEt");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("Public"));

app.get("/",(req, res)=>{
	//res.send("Express läks käima!");
	res.render("index.ejs");
});

app.get("/timenow", (req, res)=>{
	const weekdayNow = dtEt.weekDay();
	const dateNow = dtEt.dateFormatted();
	const timeNow = dtEt.timeFormatted();
	res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow});
)};

app.listen(5100);