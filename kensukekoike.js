//https://stackoverflow.com/a/10906961

var updateOnSlide = false;

var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('originalImage');
var ctx = canvas.getContext('2d');

var canvas_new = document.getElementById('newImage');
var ctx_new = canvas_new.getContext('2d');

var originalImageData = null;

var img = null;
var img_height = null,
    img_width = null;

var timer = null;
var maxRandomDivider= 50;
var minRandomDivider= 20;
function makeNew(){
    n = Math.floor(Math.random() * maxRandomDivider) + minRandomDivider;
    m = Math.floor(Math.random() * maxRandomDivider) + minRandomDivider;

    w =img_width/n-1
    h =img_height/m-1;

    nSlider.value = parseInt(n);
//    nSlider.oninput();
    mSlider.value = parseInt(m);
//    mSlider.oninput();
    wSlider.value = parseInt(img_width/n-1);
//    wSlider.oninput();
    hSlider.value = parseInt(img_height/m-1);
//    hSlider.oninput();
    cutout();
}
function setDefaultValues(w_val, h_val){

    w =w_val;
    h =h_val;

//    wSlider.value = w_val;
//    wSlider.oninput();
//    hSlider.value = h_val;
//    hSlider.oninput();
    cutout();
}
function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        if(timer != null){
            clearTimeout(timer);
        }
        img = new Image();
        img.onload = function(){

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx_new.clearRect(0, 0, canvas_new.width, canvas_new.height);

            max_size = 500.;
            height = img.height;
            width = img.width;
            frac = 1.
            if (height > width){
                if (height > max_size){
                    frac = height/max_size
                }

            } else if (width > height){
                if (width > max_size){
                    frac = width/max_size
                }
            } else { // equal
                if (height > max_size){
                    frac = height/max_size
                }
            }
            img_height = height/frac
            img_width = width/frac
            ctx.drawImage(img, 0, 0, img_width, img_height);
            img.style.display = 'none';
            originalImageData = ctx.getImageData(0, 0, img_width, img_height);

            hSlider.disabled = false;
            setDefaultValues(parseInt(img_width/n), parseInt(img_height/m));

            if (!fixWidthToHeight){
                wSlider.disabled = false;
            }

            if (!fixWidthStrideToHeightStride){
                wstrideSlider.disabled = false;
            }

            hstrideSlider.disabled = false;

            mSlider.disabled = false;
            nSlider.disabled = false;
            x_offsetSlider.disabled = false;
            y_offsetSlider.disabled = false;
            document.getElementById("fixWidth").disabled = false;
            document.getElementById("fixWidthStride").disabled = false;

            document.getElementById('centerX').disabled = false;
            document.getElementById('centerY').disabled = false;

            loaded = true;

        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function centerX(){
    cutout_width = n*(wstride + w);
    x_offset = Math.floor((img_width - cutout_width)/2.);

    x_offsetText.innerHTML = x_offset;
    x_offsetSlider.value = x_offset;

    if (updateOnSlide) {
        cutout();
    }
}

function centerY(){
    cutout_height = m*(hstride + h);
    y_offset = Math.floor((img_height - cutout_height)/2.);

    y_offsetText.innerHTML = y_offset;
    y_offsetSlider.value = y_offset;

    if (updateOnSlide) {
        cutout();
    }
}


function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}

function generate(){

    if(timer != null){
        clearTimeout(timer);
    }
    cutout();
}
//https://gist.github.com/jxnl/bedfa2382ec1d9faa44aee95fda81127
function cutout(){
    reset();

//    var mm = (hstride + h)*100 / 500
//    console.log('mm : ' + mm);
//    console.log('m : ' + m);
    for (var nr=[],i=0;i<n;i++) nr[i]=i;
    for (var mr=[],j=0;j<m;j++) mr[j]=j;
    // http://stackoverflow.com/questions/962802#962890
    function shuffle(array) {
      var tmp, current, top = array.length;
      if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
      return array;
    }

    mr = shuffle(mr);
    nr = shuffle(nr);

    for (var i=0; i<n; i++){
        for (var j=0; j<m; j++){
            x_o = x_offset + (w + wstride) * i
            y_o = y_offset + (h + hstride) * j

            x_o = w  * i;
            y_o = h * j;

            // Copy into new image
            var pixels = ctx.getImageData(x_o, y_o, w+1, h+1);
            pixeldata = pixels.data;

//            ctx_new.drawImage(img, 0, 0, img_width, img_height);
//            ctx_new.putImageData(pixels, w*nr[i], h*mr[j]);

            ctx_new.globalAlpha = 0.3;

            ctx_new.putImageData(pixels, w*nr[i], h*mr[j]);

//            ctx_new.drawImage(canvas_new, 0,0, ctx_new.width, width.height);

            // White out old image
            for (var pixel = 0; pixel < pixeldata.length; pixel++) {
//                pixeldata[pixel] = Math.floor(Math.random() * 256);
                    pixeldata[pixel] = 255;
            }

            ctx.putImageData(pixels, x_o, y_o, 0, 0, w, 1);
            ctx.putImageData(pixels, x_o, y_o, 0, 0, 1, h);

//            ctx.rect(b_x_o, b_y_o, x_o, y_o);
//            ctx.stroke();
        }
    }

    var temp_canvas = document.getElementById('newImage');
    document.getElementById("theimage").src = temp_canvas.toDataURL();
//    Canvas2Image.saveAsPNG(temp_canvas);

    var canimage = Canvas2Image.convertToImage(temp_canvas);
    // testVision(dataURItoBlob(temp_canvas.toDataURL("image/jpeg")));
    timer = setTimeout(function() {
        makeNew();
        if(maxRandomDivider >= 10){
            maxRandomDivider = maxRandomDivider - 10;
        }
        if(minRandomDivider >= 3){
            minRandomDivider = minRandomDivider - 1;
        }
    }, 3000);

}

var loaded = false;
var fixWidthToHeight = true;
var fixWidthStrideToHeightStride = true;

document.getElementById('fixWidth').disabled = true;
document.getElementById('fixWidthStride').disabled = true;

document.getElementById('centerY').disabled = true;
document.getElementById('centerX').disabled = true;

function fixWidth(){
    w = h;

    fixWidthToHeight = !fixWidthToHeight;
    wSlider.disabled = !wSlider.disabled;
}

function fixWidthStride(){
    wstride = hstride;

    fixWidthStrideToHeightStride = !fixWidthStrideToHeightStride;
    wstrideSlider.disabled = !wstrideSlider.disabled;
}

//function togglePreview(){
//    updateOnSlide = !updateOnSlide;
//}

function reset(){
    ctx.putImageData(originalImageData, 0, 0);
    ctx_new.clearRect(0, 0, canvas_new.width, canvas_new.height);
}

/***********************
 handle sliders start
*************************/


var hSlider = document.getElementById("hSlider");
var hText = document.getElementById("hText");
hText.innerHTML = hSlider.value;
var h = parseInt(hSlider.value);
hSlider.disabled = true;

hSlider.oninput = function() {
    hText.innerHTML = this.value;
    h = parseInt(hSlider.value);
    if (fixWidthToHeight){
        w = h;
        wText.innerHTML = this.value;
        wSlider.value = this.value;
    }
    if (updateOnSlide) {
        cutout();
    }
}

var wSlider = document.getElementById("wSlider");
var wText = document.getElementById("wText");
wText.innerHTML = wSlider.value;
var w = parseInt(wSlider.value);
wSlider.disabled = true;

wSlider.oninput = function() {
    wText.innerHTML = this.value;
    w = parseInt(wSlider.value);
    if (updateOnSlide) {
        cutout();
    }
}

var wstrideSlider = document.getElementById("wstrideSlider");
var wstrideText = document.getElementById("wstrideText");
wstrideText.innerHTML = wstrideSlider.value;
var wstride = parseInt(wstrideSlider.value);
wstrideSlider.disabled = true;

wstrideSlider.oninput = function(){
    wstrideText.innerHTML = this.value;
    wstride = parseInt(wstrideSlider.value);
    if (updateOnSlide) {
        cutout();
    }
}

var hstrideSlider = document.getElementById("hstrideSlider");
var hstrideText = document.getElementById("hstrideText");
hstrideText.innerHTML = hstrideSlider.value;
var hstride = parseInt(hstrideSlider.value);
hstrideSlider.disabled = true;

hstrideSlider.oninput = function(){
    hstrideText.innerHTML = this.value;
    hstride = parseInt(hstrideSlider.value);

    if (fixWidthStrideToHeightStride){
        wstride = hstride;
        wstrideText.innerHTML = this.value;
        wstrideSlider.value = this.value;
    }

    if (updateOnSlide) {
        cutout();
    }
}

var mSlider = document.getElementById("mSlider");
var mText = document.getElementById("mText");
mText.innerHTML = mSlider.value;
var m = parseInt(mSlider.value);

mSlider.disabled = true;

mSlider.oninput = function(){
    mText.innerHTML = this.value;
    m = parseInt(mSlider.value);
    if (updateOnSlide) {
        cutout();
    }
}

var nSlider = document.getElementById("nSlider");
var nText = document.getElementById("nText");
nText.innerHTML = nSlider.value;
var n = parseInt(nSlider.value);
nSlider.disabled = true;

nSlider.oninput = function(){
    nText.innerHTML = this.value;
    n = parseInt(nSlider.value);
    if (updateOnSlide) {
        cutout();
    }
}

var x_offsetSlider = document.getElementById("x_offsetSlider");
var x_offsetText = document.getElementById("x_offsetText");
x_offsetText.innerHTML = x_offsetSlider.value;
var x_offset = parseInt(x_offsetSlider.value);
x_offsetSlider.disabled = true;

x_offsetSlider.oninput = function(){
    x_offsetText.innerHTML = this.value;
    x_offset = parseInt(x_offsetSlider.value);
    if (updateOnSlide) {
        cutout();
    }
}

var y_offsetSlider = document.getElementById("y_offsetSlider");
var y_offsetText = document.getElementById("y_offsetText");
y_offsetText.innerHTML = y_offsetSlider.value;
var y_offset = parseInt(y_offsetSlider.value);
y_offsetSlider.disabled = true;

y_offsetSlider.oninput = function(){
    y_offsetText.innerHTML = this.value;
    y_offset = parseInt(y_offsetSlider.value);
    if (updateOnSlide) {
        cutout();
    }
}

/***********************
 handle sliders start
*************************/

function testVision(image){
    var fd = new FormData();
    fd.append('csrfmiddlewaretoken', token);
    fd.append('artwork_img', image);

    $.ajax({
        url: "vision_api/",
        type: "POST",
        cache: false,
        processData: false,
        contentType: false,
        data: fd,
        success: function (data) {
            console.log(data)

           if(data.length > 0){
                var st = data.join(',');
                $('#imageObj').text(st);
                if(st.indexOf('Person') !== -1 || st.indexOf('Man') !== -1 || st.indexOf('Woman') !== -1){
                    alert('Find!!!');
                    if(timer != null){
                        clearTimeout(timer);
                    }
               }
           }else{
                $('#imageObj').text('Nothing');
           }

//            if (data.res == 'ok') {
//                if(editorHistory) editorHistory.artwork_id = data.id;
//                loadingComplete(function(){
//                    callback(data);
//                });
//            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("err");
        }

    });
}

