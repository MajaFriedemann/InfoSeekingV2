/**
     * @function drawSquircles()
     * @param {Object} parent - parent div
     * @param {string} canvasID - ID for the canvas object
     * @param {int} dotCount - minimum dot count
     * @param {Object} dotsStaircase
     * @param {boolean} moreRight - the greater dot count on the right?
     * @param {string} upperColor - colour for the right side of the scale
     * @param {string} lowerColor - colour for the left side of the scale
     * @param {Array} tooltipLabels
     * @param {Array} endLabels
     * @param {boolean} showPercentage = show percentage on scale?
     * @param {string} seeMore - options for the "SEE MORE" button: 'same', 'similar', 'easier'
     * @param {int} waitTimeLimit - maximum wait time
     * @param {int} fixationPeriod
     * @param {int} stimulusPeriod
     * @param {int} transitionPeriod
     * @param {int} trialCount
     * @param {int} trialCounterVariable
     * @param {Object} trialDataVariable
     * @param {Object} permanentDataVariable
     * @param {boolean} isTutorialMode
     * @param {int} accuracyThreshold
     */

function drawSquircles(parent, canvasID, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, tooltipLabels, endLabels, showPercentage, seeMore, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled) {

  // default variables
  var backendConfidence;
  var correctResponse;
  var sliderActive = true;
  var secondTimeAround = false;
  var start_timer;
  var meanColorPairs = [];
  var confidences = [];
  var RTs = [];
  var choice_timer;
  var confidence_timer;

  // determine which buttons to show
  if (defaultOptionEnabled) {
    yellowButtonEnabled = false;
    greenButtonEnabled = false;
  } else {
    redButtonEnabled = false;
  }

  // set a random default option
  var defaultRandomiser = Math.random();
  if (defaultOptionEnabled && defaultRandomiser >= 0.5) {
    redButtonName = 'SKIP INSTEAD';
    permanentDataVariable['defaultOption'].push('seeMore');
  } else if (defaultOptionEnabled) {
    redButtonName = 'SEE MORE INSTEAD';
    permanentDataVariable['defaultOption'].push('skip');
  } else {
    redButtonName = 'ESCAPE';
    permanentDataVariable['defaultOption'].push('NA');
  }

  // record button names
  var buttonsToShow = {};
  if (redButtonEnabled) {
    buttonsToShow['escape'] = redButtonName;
  }
  if (yellowButtonEnabled) {
    buttonsToShow['moreInfo'] = yellowButtonName;
  }
  if (greenButtonEnabled) {
    buttonsToShow['submit'] = greenButtonName;
  }
  console.log(buttonsToShow);

  // determine the parameters for the dot grids
  var low = dotCount;
  var high = Math.round(dotCount + dotsStaircase.getLast('logSpace'));

  var randomiser = Math.random();
  if (randomiser > 0.5) {
    var dots = [low, high];
    var moreRedSide = 'right';
  } else {
    var dots = [high, low];
    var moreRedSide = 'left';
  }
  trialDataVariable['moreRedSide'].push(moreRedSide);
  meanColorPairs.push(dots);

  // draw the grid
  let grid = new DoubleDotGrid(dots[0], dots[1], {
    spacing: 100,
    paddingX: 6
  }
  );
  grid.draw(canvasID);

  // draw the slider
  var response_area = createGeneral(
    response_area,
    parent,
    'div',
    'response-area',
    'response-area',
    ''
  );

  var confidence_question = createGeneral(
    confidence_question,
    response_area,
    'div',
    'confidence-question',
    'confidence-question',
    '<h1>Which box contained more dots?</h1> (click on scale to select)'
  );

  var confidence_meter = noDragSlider('slider', response_area, tooltipLabels, endLabels, buttonsToShow);

  $('.response-area').css('visibility', 'hidden');

  setTimeout(function () {

    // draw the selection highlight masks
    var mask1 = createGeneral(
      mask1,
      document.getElementById('jspsych-canvas-sliders-response-stimulus'),
      'div',
      'grid-mask mask-left',
      'grid-mask-left',
      ''
    );

    var mask2 = createGeneral(
      mask2,
      document.getElementById('jspsych-canvas-sliders-response-stimulus'),
      'div',
      'grid-mask mask-right',
      'grid-mask-right',
      ''
    );

    // reset the event loggers
    $('.mask-left').off('click');
    $('.mask-right').off('click');
    $('.escape-button').off('click');
    $('.submit-button').off('click');
    $('.more-button').off('click');
    $('.scale-row').off('mousemove').off('click');

    // add keypress option

    //$(document).off('click');
    $(document).on('click', function(event) {
      console.log(event.keyCode);
      if (event.which == 0) {
        $('.mask-left').css('border', '5px solid rgb(13,255,146');
        $('.mask-right').css('border', '5px solid rgba(0,0,0,0)');
      } else if (event.which == 2) {
        $('.mask-left').css('border', '5px solid rgba(0,0,0,0)');
        $('.mask-right').css('border', '5px solid rgb(13,255,146');
      }
    });


    setTimeout(function () {
      $('.confidence-question').css('visibility', 'visible');
      $('.response-area').css('visibility', 'visible');
      $('.jspsych-content').css('cursor', 'auto');
      // start the trial timer
      start_timer = Date.now();
    }, transitionPeriod);

    /* $('.mask-left').on('click', function() {
      console.log('left grid clicked!');
      // record the RT
      choice_timer = Date.now();
      // turn off these event handlers
      $('.mask-left').off('click');
      $('.mask-right').off('click');
      $('.grid-mask').css('cursor', 'auto');
      // highlight the chosen box
      $('.mask-left').css('border', '5px solid rgb(13,255,146');
      $('.mask-right').css('border', '5px solid rgba(0,0,0,0)');
      // make response area visible
      $('.confidence-question').css('visibility', 'visible');
      $('.response-area').css('visibility', 'visible');
    });

    $('.mask-right').on('click', function() {
      console.log('right grid clicked!');
      // record the RT
      choice_timer = Date.now();
      // turn off these event handlers
      $('.mask-left').off('click');
      $('.mask-right').off('click');
      $('.grid-mask').css('cursor', 'auto');
      // highlight the chosen box
      $('.mask-left').css('border', '5px solid rgba(0,0,0,0)');
      $('.mask-right').css('border', '5px solid rgb(13,255,146');
      // make response area visible
      $('.confidence-question').css('visibility', 'visible');
      $('.response-area').css('visibility', 'visible');
    });
*/

    function recordRating(backendConfidence, moreRedSide, type) {
      if (backendConfidence !== undefined) {
        // record correct/incorrect confidence
        if (moreRedSide == 'left') {
          var invertedConfidence = 100 - backendConfidence;
          confidences.push(invertedConfidence);

          if (invertedConfidence > 50) {
            correctResponse = true;
          } else {
            correctResponse = false;
          }

          if (!isTutorialMode && type == 'submit') {
            cumulativeScore += reverseBrierScore(invertedConfidence, correctResponse);
          }
        } else {
          confidences.push(backendConfidence);

          if (backendConfidence > 50) {
            correctResponse = true;
          } else {
            correctResponse = false;
          }

          if (!isTutorialMode && type == 'submit') {
            cumulativeScore += reverseBrierScore(backendConfidence, correctResponse);
          }
        }
        console.log(meanColorPairs);
        console.log(confidences);
      }
    }

    function buttonBackend(type) {
      // turn off the button options
      $('.scale-button').addClass('invisible');

      // record RT and reset the timer
      confidence_timer = Date.now();
      var RT = calculateRT(start_timer, confidence_timer);
      RTs.push(RT);


      // other options
      switch (type) {
        case 'exit':
          sliderActive = true;
          break;

        case 'seeMore':
          secondTimeAround = true;
          recordRating(backendConfidence, moreRedSide, type);

          // update the staircase based on this first response
          dotsStaircase.next(correctResponse);
          staircaseSteps++;

          // reset the trial timer
          start_timer = Date.now();

          // set options for 'SEE MORE' based on specified parameter

          // same grid (simple mask-lifting)
          if (seeMore == 'same') {
            // save data
            meanColorPairs.push(dots);

            $('.response-area').css('visibility', 'hidden');
            $('.confidence-question').css('visibility', 'hidden');
            $('.grid-mask').css('visibility', 'hidden');
            $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'hidden');

            var fixationCross = createGeneral(
              fixationCross,
              document.getElementById('jspsych-canvas-sliders-response-wrapper'),
              'div',
              'fixation-cross see-again',
              'fixation-cross',
              '+'
            );

            setTimeout(function () {
              document.getElementById('fixation-cross').remove();
              $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');

              setTimeout(function () {
                $('.grid-mask').css('visibility', 'visible');

                setTimeout(function () {
                  sliderActive = true;
                  $('.confidence-question').css('visibility', 'visible');
                  $('.response-area').css('visibility', 'visible');
                  document.getElementById('more-button').remove();
                  $('.submit-button').css('margin-left', '0');
                }, transitionPeriod);
              }, stimulusPeriod);
            }, fixationPeriod);

            // same dot counts, different grid
          } else if (seeMore == 'similar') {
            // save data
            meanColorPairs.push(dots);

            // clear the grids
            var canvas = document.getElementById('jspsych-canvas-sliders-response-canvas');
            var context = dotCanvas.getContext('2d');
            context.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
            context.beginPath();

            // hide masks and response areas
            $('.response-area').css('visibility', 'hidden');
            $('.confidence-question').css('visibility', 'hidden');
            $('.grid-mask').css('visibility', 'hidden');
            $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'hidden');

            var fixationCross = createGeneral(
              fixationCross,
              document.getElementById('jspsych-canvas-sliders-response-wrapper'),
              'div',
              'fixation-cross see-again',
              'fixation-cross',
              '+'
            );

            setTimeout(function () {
              document.getElementById('fixation-cross').remove();
              $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');
              // redraw the canvas with new dot values
              var gridNew = new DoubleDotGrid(dots[0], dots[1], {
                spacing: 100,
                paddingX: 6
              });
              gridNew.draw(canvasID);

              setTimeout(function () {
                $('.grid-mask').css('visibility', 'visible');

                setTimeout(function () {
                  sliderActive = true;
                  $('.confidence-question').css('visibility', 'visible');
                  $('.response-area').css('visibility', 'visible');
                  document.getElementById('more-button').remove();
                  $('.submit-button').css('margin-left', '0');
                }, transitionPeriod);
              }, stimulusPeriod);
            }, fixationPeriod);

          } else { // (i.e., easier dot counts)

            // clear the grids
            var dotCanvas = document.getElementById('jspsych-canvas-sliders-response-canvas');
            console.log('width: ' + dotCanvas.width + ' height: ' + dotCanvas.height);
            var context = dotCanvas.getContext('2d');
            context.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
            context.beginPath();

            // hide masks and response areas
            $('.response-area').css('visibility', 'hidden');
            $('.confidence-question').css('visibility', 'hidden');
            $('.grid-mask').css('visibility', 'hidden');
            $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'hidden');

            // update the dot difference
            high = dotCount + Math.E ** (Math.log(dotsStaircase.getLast('logSpace')) + 0.5);
            console.log(high);
            if (randomiser > 0.5) {
              dots = [low, high];
            } else {
              dots = [high, low];
            }
            meanColorPairs.push(dots);

            // redraw the fixation cross, etc.
            var fixationCross = createGeneral(
              fixationCross,
              document.getElementById('jspsych-canvas-sliders-response-wrapper'),
              'div',
              'fixation-cross see-again',
              'fixation-cross',
              '+'
            );

            setTimeout(function () {
              document.getElementById('fixation-cross').remove();
              $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');
              // redraw the canvas with new dot values
              var gridNew = new DoubleDotGrid(dots[0], dots[1], {
                spacing: 100,
                paddingX: 6
              });
              gridNew.draw(canvasID);

              setTimeout(function () {
                $('.grid-mask').css('visibility', 'visible');

                setTimeout(function () {
                  sliderActive = true;
                  $('.confidence-question').css('visibility', 'visible');
                  $('.response-area').css('visibility', 'visible');
                  document.getElementById('more-button').remove();
                  $('.submit-button').css('margin-left', '0');
                }, transitionPeriod);
              }, stimulusPeriod);
            }, fixationPeriod);
          }

          // clear the display and start a new trial
          /*
          document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
          document.getElementById('response-area').remove();
          console.log('display cleared: success!');
          jsPsych.finishTrial();
          */
          break;

        default:
          recordRating(backendConfidence, moreRedSide, type);

          if (secondTimeAround) {
            trialDataVariable['moreAsked'].push(true);
          } else {
            trialDataVariable['moreAsked'].push(false);

            // update the staircase because it is the first response
            dotsStaircase.next(correctResponse);
            staircaseSteps++;

            // calculate the wait time
            var waitTime = fixationPeriod + stimulusPeriod + transitionPeriod + RT;
            if (waitTime <= waitTimeLimit) {
              console.log('waitTime is ' + waitTime);
            } else {
              waitTime = waitTimeLimit;
              console.log('waitTime is ' + waitTime);
            }
          }

          trialDataVariable['waitTimes'].push(waitTime);
          trialDataVariable['isCorrect'].push(correctResponse); // this is for calculating the bonus
          trialDataVariable['meanColorPairs'].push(meanColorPairs);
          trialDataVariable['confidences'].push(confidences);
          trialDataVariable['RTs'].push(RTs);
          trialDataVariable['isTutorialMode'].push(isTutorialMode);
          trialCounterVariable++;

          // give feedback
          if (isTutorialMode) {
            if (correctResponse) {
              document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(13,255,146)">CORRECT</h1>';
            } else {
              document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,51)">INCORRECT</h1>';
            }
            setTimeout(function () {
              // clear the display on a timer
              document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
              document.getElementById('response-area').remove();
              console.log('dot display cleared: success!')
              console.log('that was trial ' + trialCounterVariable + ' of ' + trialCount);
            }, 1000);
          } else {
            // clear the display directly
            document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
            document.getElementById('response-area').remove();
            console.log('dot display cleared: success!')
            console.log('that was trial ' + trialCounterVariable + ' of ' + trialCount);

            totalTrials++;
          }

          if (trialCounterVariable < trialCount) {
            // draw the fixation dot
            setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, tooltipLabels, endLabels, showPercentage, seeMore, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled); }, waitTime);

          } else {
            // evaluate accuracy
            setTimeout(function () {
              accuracy = round(mean(trialDataVariable['isCorrect']), 2) * 100;
              console.log('accuracy: ' + accuracy);

              if (isTutorialMode) {
                if (accuracy >= accuracyThreshold) {
                  var section4_text = 'Congratulations, your accuracy during the last set of practice trials was ' + accuracy + '%.';
                  var section4_button = 'CONTINUE';
                } else {
                  var section4_text = 'Your accuracy during these practice trials was ' + accuracy + '%, which is below the required accuracy threshold. Please click "Repeat" below to repeat the practice round.';
                  var section4_button = 'REPEAT';
                }

                // set up feedback page
                $('.jspsych-content-wrapper')
                  .css('width', '100%');

                var section4 = createGeneral(
                  section4,
                  parent,
                  'section',
                  'tutorial-section section4',
                  'dots-tutorial-section4',
                  ''
                );

                var section4_title = createGeneral(
                  section4_title,
                  section4,
                  'div',
                  'tutorial-text',
                  'dots-tutorial-text4',
                  section4_text
                );

                $('#dots-tutorial-text4').css('font-size', '3vmax');

                var section4_button = createGeneral(
                  section4_button,
                  section4,
                  'button',
                  'default-white-button glowy-box',
                  'dots-tutorial-continue',
                  '<div>' + section4_button + '</div>'
                );

                if (accuracy >= accuracyThreshold) {
                  $('#dots-tutorial-continue').on('click', function () {
                    console.log(trialDataVariable);
                    permanentDataVariable["accuracy"].push(accuracy);
                    permanentDataVariable["meanColorPairs"].push(trialDataVariable["meanColorPairs"]);
                    permanentDataVariable["moreRedSide"].push(trialDataVariable["moreRedSide"]);
                    permanentDataVariable["confidences"].push(trialDataVariable["confidences"]);
                    permanentDataVariable["moreAsked"].push(trialDataVariable["moreAsked"]);
                    permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
                    permanentDataVariable["RTs"].push(trialDataVariable["RTs"]);
                    permanentDataVariable["waitTimes"].push(trialDataVariable["waitTimes"]);

                    $('body').css('cursor', 'auto');
                    jsPsych.finishTrial();
                    return;
                  });
                } else {
                  $('#dots-tutorial-continue').on('click', function () {
                    drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, tooltipLabels, endLabels, showPercentage, seeMore, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, isTutorialMode, accuracyThreshold, yellowButtonEnabled, redButtonEnabled, redButtonName, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled);
                    return;
                  });
                }
              } else {
                // if not in tutorial mode
                permanentDataVariable["accuracy"].push(accuracy);
                permanentDataVariable["isTutorialMode"].push(trialDataVariable["isTutorialMode"]);
                permanentDataVariable["meanColorPairs"].push(trialDataVariable["meanColorPairs"]);
                permanentDataVariable["moreRedSide"].push(trialDataVariable["moreRedSide"]);
                permanentDataVariable["confidences"].push(trialDataVariable["confidences"]);
                permanentDataVariable["moreAsked"].push(trialDataVariable["moreAsked"]);
                permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
                permanentDataVariable["RTs"].push(trialDataVariable["RTs"]);
                permanentDataVariable["waitTimes"].push(trialDataVariable["waitTimes"]);

                totalCorrect += trialDataVariable.isCorrect.filter(Boolean).length;
                blockCount++;
                permanentDataVariable["block_count"].push(blockCount);

                $('body').css('cursor', 'auto');
                jsPsych.finishTrial();
                return;
              }
            }, 1500);
          }
      }
    }


    $('.scale-row').on({
      mousemove: function (event) {
        var scaleOffsetLeft = cumulativeOffset(document.getElementById('scale')).left;
        var scaleWidth = document.getElementById('scale').offsetWidth;
        var Xmin = scaleOffsetLeft;

        if (sliderActive) {
          backendConfidence = Math.round(((event.pageX - Xmin) / scaleWidth) * 100);

          if (backendConfidence >= 100) {
            backendConfidence = 100;
            displayedConfidence = backendConfidence;
            document.body.style.setProperty('--displayedColor', upperColor);
          } else if (backendConfidence < 100 && backendConfidence >= 51) {
            backendConfidence = backendConfidence;
            displayedConfidence = backendConfidence;
            document.body.style.setProperty('--displayedColor', upperColor);
          } else if (backendConfidence < 51 && backendConfidence >= 49) {
            backendConfidence = backendConfidence;
            displayedConfidence = 51;
            if (backendConfidence >= 50) {
              document.body.style.setProperty('--displayedColor', upperColor);
            } else {
              document.body.style.setProperty('--displayedColor', lowerColor);
            }
          } else if (backendConfidence < 49 && backendConfidence > 0) {
            backendConfidence = backendConfidence;
            displayedConfidence = 100 - backendConfidence;
            document.body.style.setProperty('--displayedColor', lowerColor);
          } else {
            backendConfidence = 0;
            displayedConfidence = 100 - backendConfidence;
            document.body.style.setProperty('--displayedColor', lowerColor);
          }

          var barWidth = Math.abs((displayedConfidence - 50) * 0.5);
          if (backendConfidence >= 50) {
            $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(255,50,50)');
            $('#scale-left-fill, #confidence-value-left').css('width', '0vmin').css('border-left', '5px solid rgba(0,0,0,0)');
          } else if (backendConfidence < 50) {
            $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(255,50,50)');
            $('#scale-right-fill, #confidence-value-right').css('width', '0vmin').css('border-right', '5px solid rgba(0,0,0,0)');
          }

          if (showPercentage) {
            if (backendConfidence > 45) {
              document.getElementById('confidence-value-right').innerHTML = displayedConfidence + '%';
              document.getElementById('confidence-value-left').innerHTML = '';
            } else if (backendConfidence <= 45) {
              document.getElementById('confidence-value-left').innerHTML = displayedConfidence + '%';
              document.getElementById('confidence-value-right').innerHTML = '';
            }
          }
        }
      },
      click: function () {
        sliderActive = false;

        // show buttons
        if (!sliderActive) {
          $('.scale-button').removeClass('invisible');
        }

        if (defaultOptionEnabled) {
          // record data
          confidence_timer = Date.now();
          var RT = calculateRT(start_timer, confidence_timer);
          RTs.push(RT);
          recordRating(backendConfidence, moreRedSide, 'initial');

          // wipe the slate and show the default option with timer if first time
          if (!secondTimeAround) {
            // clear the grids
            var dotCanvas = document.getElementById('jspsych-canvas-sliders-response-canvas');
            console.log('width: ' + dotCanvas.width + ' height: ' + dotCanvas.height);
            var context = dotCanvas.getContext('2d');
            context.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
            context.beginPath();

            // hide masks and response areas
            $('.response-area, .confidence-question, .grid-mask, #jspsych-canvas-sliders-response-canvas').css('visibility', 'hidden');

            var defaultQuestionValue = '';
            if (redButtonName == 'SKIP INSTEAD') {
              defaultQuestionValue = 'SEE MORE?';
            } else if (redButtonName == 'SEE MORE INSTEAD') {
              defaultQuestionValue = 'Continue?';
            }

            var defaultQuestion = createGeneral(
              defaultQuestion,
              document.getElementById('jspsych-canvas-sliders-response-wrapper'),
              'div',
              'fixation-cross see-again',
              'default-question',
              defaultQuestionValue
            );

            // draw a central timer
            countdownTimer(document.getElementById('jspsych-canvas-sliders-response-wrapper'), 3, 3000);

            $('.response-area, #tooltip-row-bottom').css('visibility', 'visible');
            $('#tooltip-row-top, #tooltip-arrow-top, #scale-row').css('visibility', 'hidden');

            setTimeout(function () {
              document.getElementById('countdown').remove();
              document.getElementById('default-question').remove();
              $('.response-area, #tooltip-row-bottom').css('visibility', 'hidden');
              $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');

              if (defaultQuestionValue == 'SEE MORE?' && !secondTimeAround) {
                buttonBackend('seeMore');
              } else {
                buttonBackend('submit');
              }
            }, 3000);

          // wipe the slate and end trial if second time
          } else {

          }
        } else {
          //
        }
      },
    });

    $('.escape-button').on('click', function () {
      if (redButtonName == 'SKIP INSTEAD') {
        buttonBackend('submit');
      } else if (redButtonName == 'SEE MORE INSTEAD') {
        buttonBackend('seeMore');
      } else {
        buttonBackend('exit');
      }
    });

    $('.more-button').on('click', function () {
      buttonBackend('seeMore');
    });

    $('.submit-button').on('click', function () {
      buttonBackend('submit');
    });
  }, stimulusPeriod);
}

/**
     * @function drawFixation()
     * @param {Object} parent - parent div
     * @param {Object} canvasID - canvas object in which to draw grids
     * @param {int} canvasWidth - width of the canvas for dot grids
     * @param {int} canvasHeight - height of the canvas for dot grids
     * @param {int} dotCount - minimum dot count
     * @param {Object} dotsStaircase
     * @param {boolean} moreRight - the greater dot count on the right?
     * @param {string} upperColor - colour for the right side of the scale
     * @param {string} lowerColor - colour for the left side of the scale
     * @param {Array} tooltipLabels
     * @param {Array} endLabels
     * @param {boolean} showPercentage = show percentage on scale?
     * @param {string} seeMore - options for the "SEE MORE" button: 'same', 'similar', 'easier'
     * @param {int} waitTimeLimit - maximum wait time
     * @param {int} fixationPeriod - duration of fixation period
     * @param {int} stimulusPeriod
     * @param {int} transitionPeriod
     * @param {int} trialCount
     * @param {int} trialCounterVariable
     * @param {Object} trialDataVariable
     * @param {Object} permanentDataVariable
     * @param {boolean} isTutorialMode
     * @param {int} accuracyThreshold
     */

function drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, tooltipLabels, endLabels, showPercentage, seeMore, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled) {

  // set style defaults for page
  parent.innerHTML = '';
  $('body')
    .css('display', 'block')
    .css('height', '100%')
    .css('background-color', 'black')
    .css('overflow', 'hidden')
    .css('cursor', 'none');
  $('.jspsych-display-element')
    .css('display', 'flex')
    .css('margin', 'auto')
    .css('justify-content', 'center')
    .css('align-items', 'center')
    .css('flex-wrap', 'wrap')
    .css('wrap-direction', 'column');
  $.scrollify.destroy();

  var fixationCross = createGeneral(
    fixationCross,
    parent,
    'div',
    'fixation-cross',
    'fixation-cross',
    '+'
  );
  setTimeout(function () {
    // clear the fixation cross display
    document.getElementById('fixation-cross').remove();
    // draw the canvas for the dots grid
    var canvasID = 'jspsych-canvas-sliders-response-canvas';
    var canvas = '<canvas id="' + canvasID + '" height="' + canvasHeight +
      '" width="' + canvasWidth + '"></canvas>';

    let html = '<div id="jspsych-canvas-sliders-response-wrapper" class="jspsych-sliders-response-wrapper">';
    html += '<div id="jspsych-canvas-sliders-response-stimulus" style="display:flex">' + canvas + '</div>';

    parent.innerHTML += html;

    // call the draw dots function
    drawSquircles(parent, canvasID, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, tooltipLabels, endLabels, showPercentage, seeMore, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled);
  }, fixationPeriod);
}