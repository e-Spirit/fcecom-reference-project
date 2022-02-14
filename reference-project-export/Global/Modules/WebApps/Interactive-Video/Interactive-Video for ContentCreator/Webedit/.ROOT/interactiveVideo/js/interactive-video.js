(function(){

  var instance;
  window.InteractiveVideo = function(callback, title, videoUrl, templates, markers) {
    instance = new InteractiveVideoEditor(title, videoUrl, templates, markers);
    instance.callback = callback;
  };
  window.InteractiveVideoUpdate = function(callback, markers) {
    instance.renderMarkers(markers);
    instance.callback = callback;
  };


  function createEl($parent, className, tag) {
    var $el = $parent.appendChild(document.createElement(tag||'div'));
    if (className) $el.className = className;
    return $el;
  }


  function InteractiveVideoEditor(title, videoUrl, templates, markers) {
    var editor = this;
    editor.callback = null;
    editor.selected = null;

    var $container = createEl(document.body, 'interactive-video-editor');

    var vr = 16 / 10; // open dialog with a margin of 50 100 50 100 and 16:10 video player
    var pw = 24 /* dialog borders */, ph = 118 /* dialog borders */ + 41 /* video controls */;
    var mw = window.innerWidth - 500 - pw, mh = window.innerHeight - 100 - ph;
    var height = (mw/mh > vr ? mh : mw / vr) + ph;
    var width  = (mw/mh > vr ? mh * vr : mw) + pw;

    editor.dialog = WE_API.Common.createDialog();
    editor.dialog.setSize(width, height);
    editor.dialog.setTitle(title);
    editor.dialog.setContent($container);
    editor.dialog.addButton('Close', function(){
      editor.callback(null);
      editor.dialog.hide();
      instance = null;
    });
    editor.dialog.show();

    var $video = createEl($container, 'video-container');
    var $controls = createEl($container, 'video-controls');
    createEl($controls, 'button step-backward').addEventListener('click', function(){
      editor.player.pause();
      editor.player.seekBy(-0.25);
    });
    createEl($controls, 'button step-forward').addEventListener('click', function(){
      editor.player.pause();
      editor.player.seekBy(+0.25);
    });

    var $add = createEl($controls, 'button add');
    $add.addEventListener('click', function(){
      editor.player.pause();
      editor.select(null);
    });
    if (templates.length > 1) {
      var $dropdown = createEl($add, 'dropdown');
      $dropdown.style.display = 'none';
      templates.forEach(function(template){
        var $entry = createEl($dropdown);
        $entry.innerHTML = template.label;
        $entry.addEventListener('click', function(){
          $dropdown.style.display = 'none';
          editor.callback({ create: template.value, time: editor.seeker.getTime() });
        });
      });

      $dropdown.addEventListener('mouseleave', function(){
        $dropdown.style.display = 'none';
      });

      $add.addEventListener('click', function(){
        $dropdown.style.display = 'block';
      });
    } else if (templates.length === 1) {
      $add.addEventListener('click', function(){
        editor.callback({ create: templates[0].value, time: editor.seeker.getTime() });
      });
    }

    $itemControls = createEl($controls, 'selected-item');
    $itemControls.setAttribute('data-disabled', 'true');
    createEl($itemControls, 'button scoped edit').addEventListener('click', function(){
      if (editor.selected !== null) {
        editor.player.pause();
        editor.callback({ edit: editor.selected, time: editor.seeker.getTime() });
      }
    });
    createEl($itemControls, 'button scoped move').addEventListener('click', function(){
      if (editor.selected !== null) {
        editor.player.pause();
        editor.callback({ move: editor.selected, time: editor.seeker.getTime() });
        editor.select(null);
      }
    });
    createEl($itemControls, 'button scoped remove').addEventListener('click', function(){
      if (editor.selected !== null) {
        editor.player.pause();
        editor.callback({ remove: editor.selected });
        editor.select(null);
      }
    });

    var $timebar = createEl($controls, 'timebar');
    var $labels = createEl($timebar, 'labels');
    var $markers = createEl($timebar, 'markers');
    createEl($controls).style.clear = 'both';

    editor.seeker = new InteractiveVideoEditor.Seeker(createEl($timebar, 'current-time', 'span'));

    editor.select = function(selected) {
      var $selected = $markers.querySelector('.selected');
      if ($selected) {
        $selected.classList.remove('selected');
      }

      editor.selected = selected;
      $itemControls.setAttribute('data-disabled', editor.selected === null ? 'true' : 'false');
      if (editor.selected !== null) {
        $selected = $markers.querySelector('.idx-' + editor.selected);
        $selected.classList.add('selected');
        editor.seeker.setText($selected.getAttribute('title'));
      } else {
        editor.seeker.setText('');
      }
    };

    editor.renderMarkers = function(markers) {
      var selected = null;
      $markers.innerHTML = '';
      markers.forEach(function(marker){
        selected = selected === null && marker.index === editor.selected ? marker.index : selected;
        var $marker = createEl($markers, 'idx-' + marker.index, 'span');
        $marker.style.left = editor.seeker._percent(marker.time);
        $marker.title = marker.name;
        $marker.addEventListener('click', function(e){
          e.stopPropagation();
          editor.player.pause();
          editor.player.seekTo(marker.time);
          editor.select(marker.index);
        });
      });

      editor.select(selected);
    };

    function init(player, duration) {
      editor.player = player;
      editor.seeker.init(duration);

      var interval = duration < 90 ? 15 : (duration < 150 ? 30 : 60);
      for (var i = 0, ln = Math.floor(duration / interval); i <= ln; i++) {
        var $time = createEl($labels, null, 'span');
        $time.style.left = ((interval * i) / duration * 100) +'%';
        $time.innerHTML = editor.seeker._format(interval * i);
      }

      $timebar.addEventListener('click', function(e){
        var rect = $timebar.getBoundingClientRect(), offsetX = e.clientX - rect.left;
        editor.player.seekTo(duration * offsetX / rect.width);
      });

      editor.renderMarkers(markers);
    };

    ivPlayers.load(videoUrl, createEl($video), init, editor.seeker.setTime);
  }

  InteractiveVideoEditor.Seeker = function($seeker) {
    var seeker = this, _seconds, _duration;
    var $currentTime = createEl($seeker, 'lft', 'span');

    seeker.init = function(duration) {
      _duration = duration;
      seeker.setTime(0);
    };

    seeker.setText = function(text) {
      $currentTime.innerHTML = text;
    };
    seeker.setTime = function(seconds) {
      if (seconds !== _seconds) {
        _seconds = seconds;

        $seeker.style.left = seeker._percent(_seconds);
        $currentTime.className = _seconds / _duration <= .5 ? 'lft' : 'rgt';
        //$currentTime.innerHTML = seeker._format(_seconds, true);
      }
    };
    seeker.getTime = function(){
      return _seconds;
    };

    seeker._percent = function(seconds) {
      return (seconds / _duration * 100) + '%';
    };

    seeker._format = function(seconds, showMillis) {
      return Math.floor(seconds / 60) + ':' + (seconds % 60 < 10 ? '0' : '') + (seconds % 60).toFixed(showMillis ? 3 : 0);
    };
  };

})();