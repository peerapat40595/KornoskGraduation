$('.sidebar-controls').children()[1].click();
setInterval(function(){
	try{
		$('.modal-footer.ng-scope').children()[0].click();
	}catch(err){}
},1000);
setInterval(function(){
	if($('.icon.icon-refresh')[1].parentNode.parentNode.parentNode.children[0].children[1].innerText == "Kornraphop Kawintiranon ADMIN"){
		if($('.family-members').children()[2].children[1].children[2].className == "ng-hide") {
			var text = $('.family-members').children()[2].children[1].children[1].innerText;
			var obj = {lat: parseFloat(text.split("\n")[0].substring(text.split("\n")[0].indexOf(" ")+1)), lng: parseFloat(text.split("\n")[1].substring(text.split("\n")[1].indexOf(" ")+1)), time: Date.now()};
			if(obj.lat > 13.733766 && obj.lat < 13.743240 && obj.lng > 100.527844 && obj.lng < 100.536406) {
				updateJSON(JSON.stringify(obj))
			} else {
				console.log(JSON.stringify(obj) + " OUTSIDE CHULA!");
			}
			$('.icon.icon-refresh')[1].parentNode.click();
		}
	}else{
		console.log("error");
	}
},10000);
function updateJSON(x){
	$.ajax({
    		url:"https://api.myjson.com/bins/2f5ag",
    		type:"PUT",
    		data: x,
    		contentType:"application/json; charset=utf-8",
    		dataType:"json",
    		success: function(data, textStatus, jqXHR){
			console.log(x + " updated!");
    		}
	});
}