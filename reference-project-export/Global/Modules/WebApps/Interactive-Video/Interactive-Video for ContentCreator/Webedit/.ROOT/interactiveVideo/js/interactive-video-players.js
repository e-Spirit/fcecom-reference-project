(function(){

  function YouTubeLoader() {
    var _this = this;
    _this.state = -1;
    _this._load = [];

    _this.test = function(url) {
      return url.search(/\/\/[^\/]*youtu\.?be/) !== -1;
    };
    
    _this.load = function(url, $container, onLoad, onTimeupdate) {
      if (url) {
        _this._load.push({ url: url, $container: $container, onLoad: onLoad, onTimeupdate: onTimeupdate });
      }

      if (_this.state !== 1) {
        if (_this.state === -1) {
          _this.state = 0;
          window.onYouTubeIframeAPIReady = function() {
            _this.state = 1;
            _this.load();
          };
          document.head.appendChild(document.createElement('script')).src = 'https://www.youtube.com/iframe_api';
        }
      } else {
        _this._load.splice(0, _this._load.length).forEach(function(options){
          new YouTubePlayer(options);
        });
      }
    };
  }

  function YouTubePlayer(options) {
    var _this = this, player = new YT.Player(options.$container, {
      videoId: options.url.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)[1],
      width: 1600, height: 1000,
      host: 'https://www.youtube-nocookie.com',
      events: {
        onReady: function() {
          options.onLoad(_this, player.getDuration());
        },
        onStateChange: function onStateChange() {
          options.onTimeupdate(player.getCurrentTime());

          if (player.getPlayerState() === YT.PlayerState.PLAYING){
            window.setTimeout(onStateChange, 200);
          }
        }
      }
    });

    _this.play = function() {
      player.playVideo();
    };
    _this.pause = function() {
      player.pauseVideo();
    };
    _this.seekTo = function(seconds) {
      player.seekTo(seconds, true);
      options.onTimeupdate(seconds);
    };
    _this.seekBy = function(secondsDelta) {
      _this.seekTo(player.getCurrentTime() + secondsDelta);
    };
  }

  function VimeoLoader() {
    var _this = this;
    _this.state = -1;
    _this._load = [];

    _this.test = function(url) {
      return url.search(/\/\/[^\/]*vimeo/) !== -1;
    };

    _this.load = function(url, $container, onLoad, onTimeupdate) {
      if (url) {
        _this._load.push({ url: url, $container: $container, onLoad: onLoad, onTimeupdate: onTimeupdate });
      }

      if (_this.state !== 1) {
        if (_this.state === -1) {
          _this.state = 0;
          document.head.appendChild(document.createElement('script')).src = 'https://player.vimeo.com/api/player.js';
          window.setTimeout(function(){ _this.load(); }, 100);
        } else {
          if ('Vimeo' in window) {
            _this.state = 1;
            _this.load();
          } else {
            window.setTimeout(function(){ _this.load(); }, 100);
          }
        }
      } else {
        _this._load.splice(0, _this._load.length).forEach(function(options){
          new VimeoPlayer(options);
        });
      }
    };
  }

  function VimeoPlayer(options) {
    var _this = this, player = new Vimeo.Player(options.$container, {
      url: options.url,
      width: 1600, height: 1000
    });

    player.on('loaded', function(){
      player.getDuration().then(function(duration){
        options.onLoad(_this, duration);
      });
    });
    player.on('timeupdate', function(state){
      options.onTimeupdate(state.seconds);
    });

    _this.play = function() {
      player.play();
    };
    _this.pause = function() {
      player.pause();
    };
    _this.seekTo = function(seconds) {
      player.setCurrentTime(seconds);
      options.onTimeupdate(seconds);
    };
    _this.seekBy = function(secondsDelta) {
      player.getCurrentTime().then(function(seconds){
        _this.seekTo(seconds + secondsDelta);
      });
    };
  }

  function SimpleHtml5Loader() {
    var _this = this;

    _this.test = function(url) {
      return true;
    };

    _this.load = function(url, $container, onLoad, onTimeupdate) {
      return new SimpleHtml5Player({ url: url, $container: $container, onLoad: onLoad, onTimeupdate: onTimeupdate });
    }
  }

  function SimpleHtml5Player(options) {
    var _this = this, player = options.$container.appendChild(document.createElement('video'));
    player.controls = 'controls';
    player.width = 1600;
    player.height = 1000;
    player.src = options.url;
    player.addEventListener('loadedmetadata', function(){
      options.onLoad(_this, player.duration);
    });
    player.addEventListener('timeupdate', function(){
      options.onTimeupdate(player.currentTime);
    });

    _this.play = function() {
      player.play();
    };
    _this.pause = function() {
      player.pause();
    };
    _this.seekTo = function(seconds) {
      player.currentTime = seconds;
    };
    _this.seekBy = function(secondsDelta) {
      player.currentTime += secondsDelta;
    };
  }

  function DailyMotionLoader(){
    var _this = this;
    this.state = -1;
    this._load = [];

    _this.test = function(url) {
      return url.search('dailymotion') !== -1;
    };

    _this.load = function(url, $container, onLoad, onTimeupdate) {
      if (url) {
        _this._load.push({ url: url, $container: $container, onLoad: onLoad, onTimeupdate: onTimeupdate });
      }

      if (_this.state !== 1) {
        if (_this.state === -1) {
          _this.state = 0;
          document.head.appendChild(document.createElement('script')).src = 'https://api.dmcdn.net/all.js';
          window.setTimeout(function(){ _this.load(); }, 100);
        } else {
          if ('DM' in window) {
            _this.state = 1;
            _this.load();
          } else {
            window.setTimeout(function(){ _this.load(); }, 100);
          }
        }
      } else {
        _this._load.splice(0, _this._load.length).forEach(function(options){
          new DailyMotionPlayer(options);
        });
      }
    };
  }

  function DailyMotionPlayer(options){
    var _this = this, player = new DM.player(options.$container, {
      video: options.url.match(/.*(?:dailymotion\/|v\/|u\/\w\/|embed\/video\/)([^#\&\?]*).*/)[1],
      width: 1600,
      height: 1000
    });

    player.addEventListener('loadedmetadata', function(){
      options.onLoad(_this, player.duration);
    });

    player.addEventListener('timeupdate', function(){
      options.onTimeupdate(player.currentTime);
    });

    _this.play = function() {
      player.play();
    };
    _this.pause = function() {
      player.pause();
    };
    _this.seekTo = function(seconds) {
      player.seek(seconds);
    };
    _this.seekBy = function(secondsDelta) {
      player.seek(player.currentTime + secondsDelta);
    };
  }

  function IVPlayers() {
    var loaders = [];

    this.load = function(url, $container, onLoad, onTimeupdate) {
      for (var i=0,ln=loaders.length; i<ln; i++) {
        if (loaders[i].test(url) === true) {
          return loaders[i].load(url, $container, onLoad, onTimeupdate);
        }
      }
    };

    loaders.push(new YouTubeLoader());
    loaders.push(new VimeoLoader());
    loaders.push(new DailyMotionLoader());
    loaders.push(new SimpleHtml5Loader());
  }

  if (!('ivPlayers' in window)) {
    window.ivPlayers = new IVPlayers();
  }

})();