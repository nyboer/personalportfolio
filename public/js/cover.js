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

//because buttons are added dynamically, we use 'on()' instead of 'click()'

  //click on thumbnail
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
 
   //render text:
 
});

  //click on project button
$(document).on('click','.page',function(e){
  var pid = $(this).attr('id');
  var id = pid.split("_");
  //exclude label
  if(id.length>1){
    $('.page').each(function(){
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

//fill up the project area and thumnails with project content
var currentproject = "";

function renderProject(pname){
  var thumblabels = ["problem","solution","tech","watch"];
  currentproject = pname;
  console.log('rendering project '+pname);
  if(!textiscollapsed){
    $('#descriptitle').trigger('click');
  }
  //clear out the thumbs div
  $('#thumbs').empty();
  
  //iter through all the thumbnail images in the thumbs array:
  var i = 0;
  $('#thumbs').append('<div class="detail thumb" id="tn_blank">&nbsp;</div>');
  for (t in proj[pname].thumbs){
    thumbimg = proj[pname].thumbs[t];
    var id = 'tn_'+i;
    $('#thumbs').append('<div class="thumb detail" id="'+id+'"><img src="'+thumbimg+'" class="tn"></div>');
    $('#'+id).append('<span class="thumbnum">'+thumblabels[i]+'</span>');
    i++;
  };
  /*
  var vid = proj[pname].video;
  
  */
  //load first image into main image area:
  renderMain(0);
  //load text into text overlay
  //renderText();
  //load title into overlay
  renderTitle(pname);
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
	    $('#mainImage').css( "width", '720px' );
	  }
    $('#mainImage').fadeTo(200,0, function() {
        $(this).attr('src',imsrc);
    }).fadeTo(200,1);
//  $('#mainImage').attr('src', imsrc);
    doempty = 0;
  }
}

var deferTextCollapse = 1;

function renderText(){
  var text = proj[currentproject].projectText;
  if(!textiscollapsed){
    $('#projectText').fadeTo(50,0, function() {
      $(this).html(text);
    }).delay(50).fadeTo(1200,1);
  } else {
    deferTextCollapse = 1;
  }
}

function renderTitle(text){
  $('#projectTitle').fadeTo(200,0.1, function() {
      $(this).html(text);
      var introtext = proj[currentproject].intro;
      $('#intro').html(introtext);
  }).fadeTo(200,1);
  
//  $('#projectTitle').html(text);
}

//create the projects row content based on database
var projectnames = []; //convenient
function renderProjectsRow() {
  if(!isEmpty(proj)){  
    var i=0;
    var smallWin = ( window.innerWidth < 768 );
    //first clear the projects div
    $('#projects').empty();
    //now fill it up
    for (ptitle in proj){
      $('#projects').append( '<div class="proj page" id="project_'+i+'"><a href="#">'+ptitle+'</a></div>' );
      projectnames[i]=ptitle;
      i++;
      console.log(i+' '+ptitle);
    }
    if(smallWin){
      $('.proj').css('float','none');
      $('#projects').css('position','fixed');
      $('#projects').css('right',0);
    }
  }
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
//listeners to collapse state. if we call renderText when collapsed, things get wacky.
var textiscollapsed = 1;
 $('#projectText').on('hide.bs.collapse', function(){
    textiscollapsed = 1;
    $('#descripmore').html('(...more...)');
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
    $('#descripmore').html('(...less...)');
//     $('.glyphicon').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
    console.log('------VISIBLE');
  });