
//agree_box_1 公告合約
$(function(){

	function showAgreen(){
		$(".agree_box_1").addClass("active");
		if($(".agree_box_1").hasClass("active")){
			$("body").addClass("noscroll");
		}
	}
	$(".btn_right").on("click", function(){
		$("body").removeClass("noscroll");
		$(".agree_box_1").fadeOut();
		$(".agree_box_1").removeClass("active");
	});

	//showAgree();

	//cookie
	if( !$.cookie("t1") ){ showAgreen() };
		$.cookie("t1", "aa", {expires:1});

});


//授權合約agree_box_2
$(function(){
	$(".btn_give").on("click", function(e){
		e.preventDefault();
		$(".agree_box_2").fadeIn();
		$("body").addClass("noscroll");//防止閱讀時同時滾動
	});

	$(".agree_box_2 .btn_close").on("click", function(){
		$(".agree_box_2").fadeOut();
		$(".agree_box_2").removeClass("show");
		$("body").removeClass("noscroll");
	});
});

//fabric 外掛
$(function(){

	//編輯框的樣式
	fabric.Object.prototype.set({
		//hasControls:false, //不能編輯
		//selectable:false,//是否被選取
		borderColor: "rgba(255,255,255,.7)", //編輯框色
		borderOpacityWhenMoving: .2, //編輯框 移動中 透明度
		borderScaleFactor: 4, //編輯框寬
		borderDashArray: [10, 5], //編輯框虛線
		padding: 10,//編輯框內距
		transparentCorners: false, //false 編輯把手才能填滿
		cornerColor: "#000",//編輯把手
		cornerStrokeColor: "#fff", // 控制點邊框色
		cornerSize: 10, //編輯把手,
		//cornerStyle: "circle" //編輯把手 圓形
	});

	//初始畫布寬高
	let oldFabricW = 1050; 
	let oldFabricH = 1575; 

	//創建畫布
	let myFabric = new fabric.Canvas("myCanvas", {
		width:oldFabricW,
		height:oldFabricH,
		backgroundColor: "#fff", // 背景色
	});

	myFabric.preserveObjectStacking = true; //維持元件堆疊的順序

	//畫布RWD
	$(window).on("resize", function () {
		let canvasBoxW = $(".canvas_box").innerWidth();
		let canvasBoxH = canvasBoxW * 1.5; // 2:3

		//更新畫布尺寸
		myFabric.setDimensions({
			width: canvasBoxW,
			height: canvasBoxH
		});

		//每次縮小的比率
		let tmpRatio = canvasBoxW / oldFabricW;

		//所有子元件
		var sonArr = myFabric.getObjects();
		sonArr.forEach(item => {
			item.set({
				left: item.left * tmpRatio,
				top: item.top * tmpRatio,
				scaleX: item.scaleX * tmpRatio,
				scaleY: item.scaleY * tmpRatio
			});
		});

		//寫入畫布寬 (舊寬=新寬)
		oldFabricW = canvasBoxW;

		myFabric.renderAll();

	}).trigger("resize");

	//input file 批次讀取
	function fnFileLoad(evt, cb) {
		var files = evt.target.files; 
		console.log(files[0].type.match('image.*'));

		if(files[0].type.match('image.*') === null){
			alert("錯誤!! 這不是圖片檔。");
			return false;
		}
		//讀取器
		let fr = new FileReader();
		//轉換成 base64碼 
		fr.readAsDataURL(files[0]);
		//讀取完成
		fr.onload = function(){
			cb(fr.result); //callback
		}
	}

	//input file onChange 換圖
	$("#inputFile").on("change", function(e){
		fnFileLoad(e, fnDrawPhoto);
		$(".step_icon ul li").removeClass("current");//current取消

		//如果有框時 移除現有選的框
		if(myImg !== null){
			myFabric.remove(myImg); 
		}

		//重新加入預設圖案
		fabric.util.loadImage("images/default.png", function (argImg) {
			myImg = new fabric.Image(argImg, {
				left: 0,
				top: 0,
				originX: "center",
				originY: "center",
				selectable: false, //禁選
				hasControls: false //禁編輯
		});
		
			myFabric.add(myImg);
			myImg.scaleToWidth(myFabric.width * 1.12); //等比縮放
			myFabric.centerObject(myImg); //置中物件
			myImg.sendBackwards();

		});

	});

	//選圖進入
	let	myPhoto_1;
	function fnDrawPhoto(argData64){

		//清掉舊圖
		if(myPhoto_1){
			myFabric.remove(myPhoto_1); 
		}	
		
		let elTmpImg = document.createElement("img");
		elTmpImg.src = argData64;
		
		elTmpImg.onload = () => {

			myPhoto_1 = new fabric.Image(elTmpImg, {
				left: 0,
				top: 0,
				originX: "center",
				originY: "center",
			});

			//禁用旋轉 等比
			myPhoto_1.setControlsVisibility({
				mt: false, // 上中
				mr: false, // 中右
				mb: false, // 下中
				ml: false, // 中左
				mtr: true // 旋轉控制鍵
			});

			myFabric.add(myPhoto_1);
			myFabric.centerObject(myPhoto_1); //置中物件 
			myPhoto_1.scaleToWidth(myFabric.width * 1.13); //等比縮放
		}

		//點選框以後 圖片不可編輯
		$(".step_icon").on("click", function(){
			myPhoto_1.set({
				hasControls:false, 
				selectable:false, 
			});
			myFabric.renderAll();
		});
	}

	

	//預設圖
	var myImg = null;

	fabric.util.loadImage("images/default.png", function (argImg) {

		myImg = new fabric.Image(argImg, {
			left: 0,
			top: 0,
			originX: "center",
			originY: "center",
			selectable: false, //禁選
			hasControls: false, //禁編輯
			
		});
		
		myFabric.add(myImg);
		myImg.scaleToWidth(myFabric.width * 1.02); //等比縮放
		myFabric.centerObject(myImg); //置中物件
		myImg.bringForward();
	});	


	//更新圖片
	let tmpIdx = null;
	$(".step_icon").on("click", "ul li", function () {

		$(".step_icon ul li").removeClass("current").filter(this).addClass("current");
		let tmpUrl = $(this).data("pic");
		tmpIdx = $(this).data("idx");//第幾款

		console.log(tmpIdx);
		
		fabric.util.loadImage(`${tmpUrl}`, function (newImg) {

			myImg.setElement(newImg);
			myImg.scaleToWidth(myFabric.width * 1.08); //等比縮放
			myFabric.centerObject(myImg); //置中物件 
			myFabric.renderAll();
			myImg.bringForward();

		});
		
	});

	//check 切換 disabled
	$("input.myCheck").on("change", function(){
		if($(this).prop("checked")){
			$(".btn_agree").prop("disabled", false);
		}else{
			$(".btn_agree").prop("disabled", true);
		}
	});

	//按鈕 完成
	let myDataUrl;
	$(".btn_submit").on("click", function(){
		var bCheck = $('input.myCheck').prop("checked");

		if(myPhoto_1 == null){
			alert('請上傳一張圖片');
			return false;
		}

		if(bCheck === false){
			alert('請勾選「我已詳閱並同意 相關網站活動辦法與隱私聲明」');
		}else{
			//自訂最後輸出的寬
			let cropSize = 1050;//1050
			myDataUrl = myFabric.toDataURL({
				width: myFabric.width,
				height: myFabric.height,
				left: 0,
				top: 0,
				format: "jpeg",
				quality: 0.9,
				multiplier: cropSize / myFabric.width, //換算縮放倍數
			});

			$(".step_result").show();

			//完成圖
			$(".step_result .pic img").attr("src", myDataUrl);

			//送資料庫 64+框序
			fnSubmit(myDataUrl, tmpIdx);
		}
	});


	//重新作畫
	$(".btn_delete, .btn_again").on("click", function(){
		window.location.reload();
	});


});
