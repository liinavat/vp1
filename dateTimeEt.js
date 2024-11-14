const weekdayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];


const dateFormatted = function(){	
	let timeNow = new Date();
	//let specDate = new Date("12-27-1939");
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	return dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
}

const givenDateFormatted = function(gDate){
	let specDate = new Date(gDate);
	console.log(monthNamesEt[specDate.getMonth()]);
	return specDate.getDate() + ". " + monthNamesEt[specDate.getMonth()] + " " + specDate.getFullYear();	
}

const weekDay = function(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	return weekdayNamesEt[dayNow];
}

const timeFormatted = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	return hourNow + ":" + minuteNow + ":" + secondNow;
}

const partOfDay = function(){
	let dPart = "suvaline aeg";
	let hourNow = new Date().getHours();
	//   OR   ||   AND  &&
	// >   <    >=  <=    !=   ==    ===
	if(hourNow > 8 && hourNow <= 16){
		dPart = "kooliaeg"; 
	}
	return dPart;
}

const daysBetween = function(gDate){
	notice = "teadmata";
	let today = new Date();
	let anotherDay = new Date(gDate);
	let diff = today - anotherDay;
	let diffDays = Math.floor(diff / (1000*3600*24));
	if (today == anotherDay){
		notice = "täna";
	}
	else if(today < anotherDay){
		notice = Math.abs(diffDays) + "Päeva pärast";
	}
	else {
		notice = diffDays + "päeva tagasi";
	}
	return notice;
}

//esimene on mida expordin ja teine on, mis välja läheb
module.exports = {dateFormatted: dateFormatted, weekDay: weekDay, timeFormatted: timeFormatted, weekdayNames: weekdayNamesEt, monthNames: monthNamesEt, dayPart: partOfDay, givenDateFormatted: givenDateFormatted, daysBetween: daysBetween};

//tee funktioon, mis tagastab vastava kuupäeva semestri algusest möödas olevast ajast. nt googles "javascript compare two dates/ dates between two dates" : getTime() käsklus. Lahutustehe. Math.round (difference_in_time / (1000*3600*24))