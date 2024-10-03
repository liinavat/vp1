const dayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];


const dateEt = function(){
	let timeNow = new Date();
	//console.log("Praegu on:" + timeNow);
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	//console.log("Praegu on:" + dateNow + "." + monthNow + yearNow)
	//console.log("Praegu on:" + dateNow + "." + monthNamesEt[monthNow] + "." + yearNow);
	const dayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
	const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
	let dateNowEt = dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
	return dateNowEt;
}

const getCurrentTime = function(){
	const now = new Date();
	let hours = now.getHours();
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();
	let Kell = hours + ":" + minutes + ":" + seconds;
	return Kell;
}
const getCurrentDay = function(){
	let now = new Date();
	let dayIndex = now.getDay();
	let Days = dayNamesEt[dayIndex];
	return Days;
}

const partOfDay = function(){
	let dayPart = "suvaline hetk";
	let timeNow = new date();
	if(timeNow.getHours >= 8 && timeNow.getHours() <16){
		dayPart = "kooliaeg"; //vahemikul kl 8-16 annab vastuse, et on tegemist "kooliaeg"
	}
	return dayPart;
}

//esimene on mida expordin ja teine on, mis välja läheb
module.exports = {weekDayNamesEt: dayNamesEt, monthsEt: monthNamesEt, dateEt: dateEt, timeEt: getCurrentTime, weekDayEt: getCurrentDay};