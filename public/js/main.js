// 
// $( window ).resize(function() {
//   console.log('window width: '+ $( window ).width());
// });

//get database of project media
var proj = {};
$.getJSON('js/projects.json', function(p) {
    console.log('getting projects');
    proj = p;
  })
  .success(function() {
    console.log('projects loaded');
    setupProjects();
    renderProjectsRow();
    //renderProject(projectnames[0]);
    $('#project_0').trigger('click');
  })
  .fail(function() {
    console.log('projects JSON error');
  });


var projToRender = [];
//use a 'punchcard' variable in the url to only render some of the projects from the JSON, such as http://myportfolio.com/index.html?proj='10110101':
function setupProjects(){
  var renderThese = $.urlParam('proj');
  var i = 0;
  var k = 0;
  projToRender = [];
  //if no variable is used, render all projects
  if( isEmpty(renderThese) ){
    //render all the projects
    for (ptitle in proj){
      projToRender[i] = ptitle;
      i++;
    }
  }else{
    //render some projects
    for (ptitle in proj){
      var j = i+1; //first item in string from url is blank, so we start at 1
      if(renderThese[j]>0){
        projToRender[k] = ptitle;
        k++;
      }
      i++;
    }
  }
}

//create the projects row content based on JSON database
var projectnames = []; //convenient
function renderProjectsRow() {
  if(!isEmpty(proj)){ 
    //first clear the projects div
    $('#projects').empty();
    //now fill it up
    var i=0;
    for (i in projToRender){
      var ptitle = projToRender[i];
      var somehtml = '<li class="proj projpage" id="project_'+i+'"><ahref="#">'+ptitle+'</a></li>'
      $('#projects').append(somehtml);
      projectnames[i]=ptitle;
      i++;
    }
  }
  console.log('showing projects: '+projectnames);
}

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
  var div = document.getElementById('carouselItems');
  
  //a very generic test. Of course, if you use an iframe for some other reason than holding a movie, this won't work.
  var test = $('iframe').length;
  
  //play the movie if entering the movie slide, pause if leaving the movie slide
  if(test>0){
    var iframe = div.getElementsByTagName('iframe')[0].contentWindow;
    if (currentslide===3){
      //vidstate = 'playVideo'; //uncomment to autoplay video 
    }else{
      vidstate = 'pauseVideo';
    }
    iframe.postMessage('{"event":"command","func":"' + vidstate + '","args":""}','*');
  }
})

//fill up the project area with project content
var currentproject = '';
//when a project name is clicked on:
function renderProject(pname){
  currentproject = pname;
  console.log('rendering project '+pname);
  if(!textiscollapsed){
    $('#descriptitle').trigger('click');
  }
  hidetoolstext();
  
  //put all the images into the carousel
  renderCarousel();
  
  //load title into overlay
  renderTitle(pname);
}

function renderCarousel(){
  $('#carouselItems').empty();
  $('#carouselIndicators').empty();
  for (i in proj[currentproject].mains){
    //indicator bullet points:
    var indid = 'carouselInd_'+i
    var indhtml = '<li data-target="#carousel-example-generic" data-slide-to="'+i+'" id="'+indid+'"></li>';
    $('#carouselIndicators').append(indhtml);
    
    //images for carousel:
    var content = proj[currentproject].mains[i];
    console.log ('carousel content: '+content);
    var yout = content.split('youtube.com').length;
    var imgid = 'main_'+i;
    //deal with youtube embeds a bit differently:
    if(yout>1){
      var hash = content.split('/').pop();
      var movhtml = '<div class="item embed-responsive embed-responsive-16by9 mainimg" id="'+imgid+'"><iframe id="videoframe" src="http://www.youtube.com/embed/'+hash+'?version=3&amp;enablejsapi=1"></iframe></div>';
      $('#carouselItems').append(movhtml);
    }else{
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
  //get the text for the project
  var text = proj[currentproject].projectText;
  //only render the text if the text panel is visible. otherwise defer it until the panel is visible:
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
      //tools text take a bit of adjustment
      if (introtype == 'tools' && introtext!==''){
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

//listen to collapse state of full text. if we call renderText when collapsed, things get wacky, so we have some workarounds:
var textiscollapsed = 1;
 $('#projectText').on('hide.bs.collapse', function(){
    textiscollapsed = 1;
    $('#descripmore').html('(...more...)');
    $('#descripmore').css( 'color','rgb(232,220,141)' );
    $(this).html("");
    deferTextCollapse = 1;
    $('.description').removeClass('darken');
//     console.log('------COLLAPSED');
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
//     console.log('------VISIBLE');
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
