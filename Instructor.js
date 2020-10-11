/********
MIT License

Copyright (c) 2020 mokubado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
********/
if (typeof Instructor == "undefined"){
  Instructor = function Instructor(gameInstance, dojo){
    this.game = gameInstance;
    this.dojo = dojo;
    this.instMap = {};
    this.currentIndex = 0;

    this.windowList = null;
    this.fadeInAnimation = null;
    this.fadeOutAnimation = null;

    this.dojo.connect(window, "onresize", this, "resizeInstruction");
  };

  Instructor.prototype.showInstruction = function showInstruction(instLabel, instList)
  {
    if(this.instMap[instLabel]){
      //Already show the instruction.
      return;
    }

    var player = this.game.getPlayerInfo(this.game.player_id);
    if( (!player || !player.beginner)
       // && false
     ){
      return;
    }

    if(this.fadeInAnimation){
      this.dojo.connect(this.fadeInAnimation, "onEnd", () => {
        this.showInstruction(instLabel, instList);
      });

      return;
    }

    if(this.fadeOutAnimation){
      this.dojo.connect(this.fadeOutAnimation, "onEnd", () => {
        this.showInstruction(instLabel, instList);
      });

      return;
    }

    this.currentIndex = -1;
    this.messageList = instList;
    this.instMap[instLabel] = instLabel;

    this.nextInstruction();
  }

  Instructor.prototype.endInstruction = function endInstruction()
  {
    if(!this.messageList){
      return;
    }

    this.currentIndex = this.messageList.length - 1;
    this.stepNext();
  }

  Instructor.prototype.nextInstruction = function nextInstruction()
  {
    if(!this.messageList){
      return;
    }

    var fromBlackout = false;

    // targetDOM, textMessage;
    if(this.currentIndex < 0){
      fromBlackout = true;
    }

    if(this.currentIndex + 1 >= this.messageList.length){
      this.messageList = null;
      return;
    }

    ++this.currentIndex;

    console.log(this.messageList[this.currentIndex].message);

    var func = () => {
      if(fromBlackout){
        this.dojo.place('<div class="tutorial_blackout" id="tutorial_blackout"></div>', $("ebd-body"));

        var blackoutDOM = $('tutorial_blackout');
        this.dojo.connect(blackoutDOM, 'onclick', this, 'stepOnClick');

        this.dojo.animateProperty({
          node: "tutorial_blackout",
          duration: 450,
          properties: {
            opacity: 0.5
          }
        }).play();
      }

      var info = this.messageList[this.currentIndex];

      this.dojo.place('<div class="tutorial_window" id="tutorial_window"></div>', $("ebd-body"));

      this.dojo.addClass(info.target, 'tutorial_appeal');
      this.resizeEvent = this.dojo.connect(info.target, "onresize", this, "resizeInstruction");

      this.dojo.place(`<div class="tutorial_window tutorial_message" id="tutorial_message"><div>${info.message}</div><div align="right"><a href='#' id="tutorial_ok" class='bgabutton bgabutton_blue'>OK</a></div></div>`, $("ebd-body"));
      this.dojo.connect($('tutorial_ok'), 'onclick', this, 'stepOnClick');

      this.dojo.fadeIn({
        node: "tutorial_window",
        duration: 450
      }).play();

      var animationHandle = this.dojo.fadeIn({
        node: "tutorial_message",
        duration: 500,
        onEnd: () => {
          this.fadeInAnimation = null;
        }
      });

      this.fadeInAnimation = animationHandle;
      animationHandle.play();

      this.resizeInstruction();
    };

    if(fromBlackout){
      window.setTimeout(func, 1000);
    }else{
      func();
    }
  }

  Instructor.prototype.resizeInstruction = function resizeInstruction()
  {
    if(!this.messageList || this.currentIndex < 0){
      return;
    }

    var windowDOM = $("tutorial_window");
    if(!windowDOM){
      return;
    }

    var info = this.messageList[this.currentIndex];

    var targetRect = info.target.getBoundingClientRect();

    this.dojo.style(windowDOM, "width", `${targetRect.width}px`);
    this.dojo.style(windowDOM, "height", `${targetRect.height}px`);

    this.game.placeOnObject(windowDOM, info.target);

    var messageDOM = $("tutorial_message");
    var windowRect = this.dojo.getContentBox(windowDOM);

    this.dojo.style(messageDOM, "top", `${8 + windowRect.t + windowRect.h}px`);
    this.dojo.style(messageDOM, "left", `${windowRect.l}px`);
    this.dojo.style(messageDOM, "max-width", `${targetRect.width + 80}px`);
  }

  Instructor.prototype.stepOnClick = function stepOnClick()
  {
    if(!this.messageList){
      return;
    }

    if(this.fadeOutAnimation || this.fadeInAnimation){
      return;
    }

    this.stepNext();
  }

  Instructor.prototype.stepNext = function stepNext()
  {
    if(!this.messageList){
      return;
    }

    if(this.currentIndex + 1 >= this.messageList.length){
      //End of the instruction
      this.dojo.fadeOut({
        node: "tutorial_blackout",
        duration: 500,
        onEnd: () => {
          this.dojo.destroy("tutorial_blackout");
        },
      }).play();
    }

    var info = this.messageList[this.currentIndex];

    this.dojo.fadeOut({
      node: "tutorial_message",
      duration: 500,
      onEnd: () => {
        this.dojo.destroy("tutorial_message");
      },
    }).play();

    var nextAnimation = this.dojo.fadeOut({
      node: "tutorial_window",
      duration: 550,
      onEnd: () => {
        this.dojo.destroy("tutorial_window");
        this.dojo.disconnect(this.resizeEvent);

        this.dojo.removeClass(info.target, 'tutorial_appeal');
        this.fadeOutAnimation = null;

        this.nextInstruction();
      },
    });
    this.fadeOutAnimation = nextAnimation;
    nextAnimation.play();
  }
}
