
//get database of project media
var proj = {};
$.getJSON('js/projects.json', function(p) {
    console.log('getting projects');
    proj = p;
  })
  .success(function() {
    console.log('projects loaded');
    renderProjectsRow();
    //renderProject(projectnames[0]);
    $('#project_0').trigger('click');
  })
  .fail(function() {
    console.log('projects JSON error');
  });


//create the projects row content based on JSON database
var projectnames = []; //convenient
function renderProjectsRow() {
  if(!isEmpty(proj)){  
    var i=0;
    var smallWin = ( window.innerWidth < 768 );
    //first clear the projects div
    $('#projects').empty();
    //now fill it up
    for (ptitle in proj){
      $('#projects').append( '<div class="proj projpage" id="project_'+i+'"><a href="#">'+ptitle+'</a></div>' );
      projectnames[i]=ptitle;
      i++;
      console.log(i+' '+ptitle);
    }
    /*
    if(smallWin){
      $('.proj').css('float','none');
      $('#projects').css('position','fixed');
      $('#projects').css('right',0);
    }
    */
  }
}

//click on project's thumbnail
$(document).on('click','.thumb',function(e){
  var thisid = $(this).attr('id');
  //select the child image in the div:
  var sel = '#'+thisid+' > img';
  //remove all instances of 'on' and 'off' classes, then add 'off' to all. then remove 'off' and add 'on' to the clicked element. weird, but works.
  $('.thumb').each(function(){
    var selim = '#'+$(this).attr('id')+' > img';
    $( selim ).removeClass('on');
    $( selim ).removeClass('off');
    $( selim ).addClass('off');
  });
  $( sel ).removeClass('off');
  $( sel ).addClass('on');
  //use thumbnail ID number to retrieve corresponding main image from proj object:
  var img_id = $(this).attr('id').split('_')[1];
   
  //replace main image:
   renderMain(img_id);
 
   //render intro text as appropriate:
  renderIntro(img_id);
});

//click on project button
$(document).on('click','.projpage',function(e){
  var pid = $(this).attr('id');
  var id = pid.split("_");
  //exclude label
  if(id.length>1){
    $('.projpage').each(function(){
      $( this ).removeClass('on');
      $( this ).removeClass('off');
      $( this ).addClass('off');
    });
    $( this ).removeClass('off');
    $( this ).addClass('on');
    var pname = projectnames[ id[1] ]
    renderProject(pname)
  }
});

var currentslide = 0;
$("#carousel").on('slide.bs.carousel', function(evt) {
  currentslide = $(evt.relatedTarget).index();
  renderIntro(currentslide);
  var vidstate = '';
  var div = document.getElementById("carouselItems");
  var iframe = div.getElementsByTagName("iframe")[0].contentWindow;
  if (currentslide===3){
    vidstate = 'playVideo';
  }else{
    vidstate = 'pauseVideo';
  }
  iframe.postMessage('{"event":"command","func":"' + vidstate + '","args":""}','*');
})

//fill up the project area and thumnails with project content
var currentproject = "";

var thumblabels = ["problem","solution","tools","watch"];
//when a project name is clicked on:
function renderProject(pname){
  //index.html?type=1
  var usethumbs = $.urlParam('type'); //1 is sufficient
  currentproject = pname;
  console.log('rendering project '+pname);
  if(!textiscollapsed){
    $('#descriptitle').trigger('click');
  }
  //clear out the thumbs div
  $('#thumbs').empty();
  hidetoolstext();
  
  if(!usethumbs){
    renderCarousel();
  }else{
    $('#carousel').remove();
    //iter through all the thumbnail images in the thumbs array:
    renderThumbs();
    //load first image into main image area:
    renderMain(0);
  }
  //load title into overlay
  renderTitle(pname);
}

function renderThumbs(){
  var i = 0;
  $('#thumbs').append('<div class="detail thumb" id="tn_blank">&nbsp;</div>');
  for (t in proj[currentproject].thumbs){
    thumbimg = proj[currentproject].thumbs[t];
    var id = 'tn_'+i;
    $('#thumbs').append('<div class="thumb detail" id="'+id+'"><img src="'+thumbimg+'" class="tn"></div>');
    $('#'+id).append('<span class="thumbnum">'+thumblabels[i]+'</span>');
    i++;
  };
}

//load the main image from thumbnail click:
var doempty = 1;
function renderMain(img_id){
  var imsrc = proj[currentproject].mains[img_id];
	//crude but effective check to see if the source is a link to youtube or vimeo
	var yout = imsrc.split("youtube.com").length;
	var vim = imsrc.split("vimeo.com").length;
	var qt = imsrc.split(".mov").length;
	if(yout>1 || vim>1){
	  //show the movie
	  console.log('this is for a movie '+imsrc);
	  $('#mainImageContainer').empty();
	  var domEle = '<div class="embed-responsive embed-responsive-16by9 mainimg"><iframe class="embed-responsive-item" src="'+imsrc+'"></iframe></div>';
 	  $('#mainImageContainer').html(domEle);
 	  //set the switch to empty the main image container next time we load an image
    doempty = 1;
	} else {
	  if(doempty) {
	    $('#mainImageContainer').empty();
      var domEle = '<img src="" class="mainimg" id="mainImage">';
      $('#mainImageContainer').html(domEle);
	  }
	  //not getting @media css adjustments on phone, for whatever reason, so do it the hard way:
	  console.log('image width '+$('.mainimg').css("width"));
    var smallWin = ( window.innerWidth < 768 ) && ( $('#mainImage').css("width") != 720 );
	  if(smallWin){
	    $('#mainImage').css( 'width', '720px' );
	    console.log('main window resized');
	  }
    $('#mainImage').fadeTo(200,0, function() {
        $(this).attr('src',imsrc);
    }).fadeTo(200,1);
//  $('#mainImage').attr('src', imsrc);
    doempty = 0;
  }
}

function renderCarousel(){
  $('#carouselItems').empty();
  $('#carouselIndicators').empty();
  for (i in proj[currentproject].mains){
    var indid = 'carouselInd_'+i
    var indhtml = '<li data-target="#carousel-example-generic" data-slide-to="'+i+'" id="'+indid+'"></li>';
    $('#carouselIndicators').append(indhtml);
    var content = proj[currentproject].mains[i];
    console.log ('carousel content: '+content);
    var yout = content.split('youtube.com').length;
    var imgid = 'main_'+i;
    if(yout>1){
      var hash = content.split('/').pop();
      var movhtml = '<div class="item embed-responsive embed-responsive-16by9 mainimg" id="'+imgid+'"><iframe id="videoframe" src="http://www.youtube.com/embed/'+hash+'?version=3&amp;enablejsapi=1"></iframe></div>';
      $('#carouselItems').append(movhtml);
    }else{
//       var itemhtml = '<div class="item" id="'+imgid+'"><img src="'+content+'" alt="Peter Nyboer portfolio"><div class="carousel-caption thumbnum">'+thumblabels[i]+'</div></div>';
      var itemhtml = '<div class="item" id="'+imgid+'"><img src="'+content+'" alt="Peter Nyboer portfolio"></div>';
      $('#carouselItems').append(itemhtml);
    }
    if(i==0){
      $('#'+imgid).addClass('active');
      $('#'+indid).addClass('active');
    }
  };
}

//put the full description into the projectText div
var deferTextCollapse = 1;
function renderText(){
  console.log('rendering text and text is collapsed? '+textiscollapsed);
  var text = proj[currentproject].projectText;
  if(!textiscollapsed){
    var imgpos = $('#mainImageContainer').position();
    $('#projectText').css('top', imgpos.top);
    $('#projectText').fadeTo(50,0, function() {
      $(this).html(text);
    }).delay(50).fadeTo(1200,1);
  } else {
    deferTextCollapse = 1;
  }
}

//put the title text into the title div
var idtointroname = ['problem','solution','tools'];
function renderTitle(text){
  $('#projectTitle').fadeTo(200,0.1, function() {
      $(this).html(text);
      var introtext = proj[currentproject][idtointroname[0]];
      $('#intro').html(introtext);
  }).fadeTo(200,1);
}

//put text into the intro section for problem, solution, or tools section
function renderIntro(idnum){
  $('#intro').fadeTo(200,0.1, function() {
      var introtype = idtointroname[idnum];
      var introtext = proj[currentproject][introtype];
      if (introtype == 'tools'){
        $('#intro').empty();
        $('#toolsText').empty();
        
        $('#toolsText').append('<p>'); //there's a better way to do this, I'm sure....
        for(i in introtext){
          $('#toolsText').append('• '+introtext[i]+'<br>');
          console.log(introtext[i]);
        }
        $('#toolsText').append('</p>'); //there's a better way to do this, I'm sure....
        $('#toolsText').fadeTo(200,1, function() {          
          console.log('tools visible!');
        });
        $('#descripmore').css('visibility','hidden');
        var imgpos = $('#mainImageContainer').position();
        $('#toolsText').css('top', imgpos.top);
        
      }else{
        $('#intro').html(introtext);
        $('#descripmore').css('visibility','visible');
        hidetoolstext();
      }
  }).fadeTo(200,1);
}

function hidetoolstext(){
        $('#toolsText').fadeOut('fast');
}


//--UTLITIES---------------------------------------------------------------

//from stackoverflow http://stackoverflow.com/questions/4994201/is-object-empty
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}
//listeners to collapse state. if we call renderText when collapsed, things get wacky, so we have some workarounds:
var textiscollapsed = 1;
 $('#projectText').on('hide.bs.collapse', function(){
    textiscollapsed = 1;
    $('#descripmore').html('(...more...)');
    $('#descripmore').css( 'color','rgb(232,220,141)' );
//     $('.glyphicon').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    $(this).html("");
    deferTextCollapse = 1;
    $('.description').removeClass('darken');
    console.log('------COLLAPSED');
  });
  $('#projectText').on('show.bs.collapse', function(){
    textiscollapsed = 0;
    if(deferTextCollapse){
      deferTextCollapse = 0;
      renderText();
    };
    $('.description').addClass('darken');
    $('#descripmore').css( 'color', 'rgb(255,255,255)' );
    $('#descripmore').html('(...less...)');
//     $('.glyphicon').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
    console.log('------VISIBLE');
  });
  
//get url and store as variables
//ex: given "example.com?param1=name" $.urlParam('param1') results in 'name'
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}