//get database of project media
var proj = {};
$.getJSON('js/projects.json', function(p) {
    console.log('getting projects');
    proj = p;
  })
  .success(function() {
    console.log('projects loaded');
    renderProjectsRow();
  })
  .fail(function() {
    console.log('projects JSON error');
  });

//because project buttons are added dynamically, we use on instead of click
  //click on thumbnail
/*$(document).on('click','.tn',function(e){
  $('.tn').each(function(){
    $( this ).removeClass('on');
  });
  $( this ).addClass('on');
  var mainsrc = $(this).attr('src').replace('tn', 'main'); 
  var img_id = $(this).attr('src').split('_tn')[1];
  
  console.log('main source img: '+mainsrc+ 'id: '+img_id);
  //replace main image:
  renderMain(mainsrc);
});
*/
$(document).on('click','.thumb',function(e){
  var thisid = $(this).attr('id');
  var sel = '#'+thisid+' > img';
  $('.thumb').each(function(){
    var selim = '#'+$(this).attr('id')+' > img';
    $( selim ).removeClass('on');
  });
  $( sel ).addClass('on');
  //use thumbnail ID number to retrieve corresponding main image from proj object:
  var img_id = $(this).attr('id').split('_')[1];
  //replace main image:
  renderMain(img_id);
});

  //click on project button
$(document).on('click','.page',function(e){
  var pid = $(this).attr('id');
  var id = pid.split("_");
  console.log('click '+id);
  //exclude label
  if(id.length>1){
    $('.page').each(function(){
      $( this ).removeClass('on');
    });
    $( this ).addClass('on');
    var pname = projectnames[ id[1] ]
    renderProject(pname)
  }
});

//fill up the project area and thumnails with project content
var currentproject = "";
function renderProject(pname){
  currentproject = pname;
  console.log('rendering project '+pname);
    $('#thumbs').empty();
    $('#thumbs').append('<div class="detail" id="tn_0">details:</div>');
    //iter through all the thumbnail images in the thumbs array:
  var i = 0;
  for (t in proj[pname].thumbs){
    thumbimg = proj[pname].thumbs[t];
    console.log('thumbs '+thumbimg);
    $('#thumbs').append('<div class="detail thumb" id="tn_'+i+'"><img src="'+thumbimg+'" class="tn"></div>');
    i++;
  };
  //load first image into main image area:
  renderMain(0);
  //load text into text overlay
  renderText();
  //load title into overlay
  renderTitle(pname);
}

//load the main image from thumbnail click:
function renderMain(img_id){
  var imsrc = proj[currentproject].mains[img_id];
  $('#mainImage').attr('src', imsrc);
}

function renderText(){
  var text = proj[currentproject].projectText;
  $('#projectText').html(text);
}
function renderTitle(text){
  $('#projectTitle').html(text);
}

//create the projects row content based on database
var projectnames = []; //convenient
function renderProjectsRow() {
  if(!isEmpty(proj)){  
    var i=0;
    $('#projects').empty();
    $('#projects').append( '<div class="col-md-1 page" id="projectlabel">projects:</div>' );
    //<div class="col-md-1 page">p1</div>
    for (ptitle in proj){
      $('#projects').append( '<div class="col-md-1 page" id="project_'+i+'">'+ptitle+'</div>' );
      projectnames[i]=ptitle;
      i++;
      console.log(i+' '+ptitle);
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