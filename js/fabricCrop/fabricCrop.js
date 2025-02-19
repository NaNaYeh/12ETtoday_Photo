/*
	■■■■ fnFabricCrop() 裁圖模組 ■■■■
	■ genWidth 最後輸出的寬
	■ ratio 長寬比[4:3]0.75 [3:4]1.33 [16:9]0.56 [9:16]1.77
	■ callback 接收 blob 連結
*/
function fnFabricCrop(argOpt, cbCropSuccess) {
	//有dom就不初始
	if ($(".fabricCrop").length > 0) return;

	//組件html
	let fabricCropHtml = /*html*/ `
				<!--fabricCrop 開始-->
				<div class="fabricCrop">

					<button class="btn_close" title="關閉模組"></button>

					<!--inner 開始-->
					<div class="inner">
						<!--拖拉上傳模組 開始-->
						<div class="dropOn">
							<input id="myInputFile" multiple="true" name="files[]" type="file" />
						</div>
						<!--拖拉上傳模組 結束-->

						<!--myCanvasCrop 開始-->
						<canvas id="myCanvasCrop"></canvas>
						<!--myCanvasCrop 結束-->
						<button class="btn_crop">✂️ 確定裁切</button>
					</div>
					<!--inner 結束-->

					
				</div>
				<!--fabricCrop 結束-->
			`;
	$("body").append(fabricCropHtml);

	//input file 批次讀取
	function fnFileLoad(evt, cbReadSuccess) {
		var files = evt.target.files;

		if (files[0].type.match("image.*") === null) {
			alert("錯誤!! 這不是圖片檔。");
			return false;
		}

		//讀取器
		let fr = new FileReader();

		//轉換成 base64碼
		fr.readAsDataURL(files[0]);

		//讀取完成
		fr.onload = function () {
			cbReadSuccess(fr.result); //callback
		};
	}

	//input file 感應區
	$(document).on("dragenter", ".fabricCrop #myInputFile", function () {
		$(".fabricCrop .dropOn").addClass("active");
	});

	$(document).on(
		"dragleave dragend mouseout drop",
		".fabricCrop #myInputFile",
		function () {
			$(".fabricCrop .dropOn").removeClass("active");
		}
	);

	//input file onChange
	$(document).on("change", ".fabricCrop #myInputFile", function (e) {
		//送進裁切
		fnFileLoad(e, fnDrawPhoto);
	});

	//關閉模組
	$(document).on("click", ".fabricCrop .btn_close", function () {
		$(".fabricCrop").remove();
	});

	//fabric元件 照片
	let myPhoto_1;
	function fnDrawPhoto(argData64) {
		//清掉舊圖
		if (myPhoto_1) {
			myFabricCrop.remove(myPhoto_1);
		}

		let elTmpImg = document.createElement("img");
		elTmpImg.src = argData64;

		elTmpImg.onload = () => {
			myPhoto_1 = new fabric.Image(elTmpImg, {
				left: 0,
				top: 0,
				originX: "center",
				originY: "center",
				selectable: false, //禁選
			});
			myFabricCrop.add(myPhoto_1);
			myFabricCrop.centerObject(myPhoto_1); //置中物件

			const imaRatio = elTmpImg.width / elTmpImg.height;
			const fabricRatio = myFabricCrop.width / myFabricCrop.height;

			if (imaRatio >= fabricRatio) {
				myPhoto_1.scaleToWidth(myFabricCrop.width); //橫圖
			} else {
				myPhoto_1.scaleToHeight(myFabricCrop.height); //直圖
			}
			myPhoto_1.sendToBack(); //置底
		};
	}

	//fabric　畫布 裁圖
	let myFabricCrop = new fabric.Canvas("myCanvasCrop", {
		width: $(".fabricCrop .inner").innerWidth(),
		height: $(".fabricCrop .inner").innerWidth(),
		backgroundColor: "#555",
	});

	//維持元件堆疊的順序
	myFabricCrop.preserveObjectStacking = true;

	//cropIcon svg 圖檔
	let cropIconSvgBase64 = `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 27.8.1, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.0' id='圖層_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Crect x='169.33' class='st0' width='4' height='512'/%3E%3Crect x='0.01' y='-0.13' class='st0' width='4' height='512'/%3E%3Crect x='338.67' class='st0' width='4' height='512'/%3E%3Crect x='508' class='st0' width='4' height='512'/%3E%3Crect x='254' y='84.67' transform='matrix(6.123234e-17 -1 1 6.123234e-17 -84.6667 596.6667)' class='st0' width='4' height='512'/%3E%3Crect x='254' y='254' transform='matrix(6.123234e-17 -1 1 6.123234e-17 -254 766)' class='st0' width='4' height='512'/%3E%3Crect x='254' y='-84.67' transform='matrix(6.123234e-17 -1 1 6.123234e-17 84.6667 427.3333)' class='st0' width='4' height='512'/%3E%3Crect x='254' y='-254' transform='matrix(6.123234e-17 -1 1 6.123234e-17 254 258)' class='st0' width='4' height='512'/%3E%3Cpolygon points='100,0 12,0 0,0 0,12 0,100 12,100 12,12 100,12 '/%3E%3Cpolygon points='412,512 500,512 512,512 512,500 512,412 500,412 500,500 412,500 '/%3E%3Cpolygon points='512,100 512,12 512,0 500,0 412,0 412,12 500,12 500,100 '/%3E%3Cpolygon points='0,412 0,500 0,512 12,512 100,512 100,500 12,500 12,412 '/%3E%3C/svg%3E`;

	//fabric元件 裁切框
	let corpIcon = null;
	fabric.loadSVGFromURL(cropIconSvgBase64, (objects, options) => {
		corpIcon = fabric.util.groupSVGElements(objects, options);
		//corpIcon.scaleToWidth(myFabricCrop.width * .8);
		corpIcon.set({
			left: 0,
			top: 0,
			cornerStrokeColor: "#000",
			cornerColor: "#fff",
			borderColor: "transparent",
			transparentCorners: false,
		});

		//裁切寬的比例
		let tmpZoom = argOpt.ratio <= 1 ? 0.5 : 0.3;
		corpIcon.set({ scaleX: tmpZoom, scaleY: tmpZoom * argOpt.ratio });

		//禁用旋轉 等比
		corpIcon.setControlsVisibility({
			mt: false, // 上中
			mr: false, // 中右
			mb: false, // 下中
			ml: false, // 中左
			mtr: false, // 旋轉控制鍵
		});

		myFabricCrop.add(corpIcon);
		myFabricCrop.setActiveObject(corpIcon);
		myFabricCrop.centerObject(corpIcon); //置中物件
		myFabricCrop.renderAll();
	});

	//片段 fnBase64ToBlob(b64Data, contentType, sliceSize) (base64字串, 檔案類型, 片段大小)
	//有data:image/png;base64,的話切檔頭 myBase64.split(',')[1]
	function fnBase64ToBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || "";
		sliceSize = sliceSize || 512;
		var byteCharacters = atob(b64Data);
		var byteArrays = [];
		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);
			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			var byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
		var blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}

	//按鈕 裁切
	$(document).on("click", ".fabricCrop .btn_crop", function () {
		let cropSize = argOpt.genWidth; //要裁切的寬

		let cropBoundingRect = corpIcon.getBoundingRect(); //裁切範圍

		corpIcon.opacity = 0; //裁切框隱藏
		let tmpDataUrl = myFabricCrop.toDataURL({
			width: cropBoundingRect.width,
			height: cropBoundingRect.height,
			left: cropBoundingRect.left,
			top: cropBoundingRect.top,
			format: "jpeg",
			quality: 0.9,
			multiplier: cropSize / cropBoundingRect.width, //縮放倍數
		});
		corpIcon.opacity = 1; //裁切框出現

		//轉blob
		let tmpBlob = fnBase64ToBlob(tmpDataUrl.split(",")[1], "image/png");
		let tmpSrc = URL.createObjectURL(tmpBlob); //建立blob連結

		//callback fn
		cbCropSuccess(tmpSrc);

		//關閉模組
		$(".fabricCrop").remove();
	});
}
