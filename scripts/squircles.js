/**
 * @function drawSquircles()
 * @param {Object} parent - parent div
 * @param {string} canvasID - ID for the canvas object
 * @param {int} canvasWidth
 * @param {int} canvasHeight
 * @param {string} upperColor - colour for the right side of the scale
 * @param {string} lowerColor - colour for the left side of the scale
 * @param {Array} tooltipLabels
 * @param {Array} endLabels
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
 * @param {boolean} redButtonEnabled
 * @param {string} redButtonName
 * @param {boolean} yellowButtonEnabled
 * @param {string} yellowButtonName
 * @param {boolean} greenButtonEnabled
 * @param {string} greenButtonName
 */

function drawSquircles(parent, canvasID, canvasWidth, canvasHeight, upperColor, lowerColor, tooltipLabels, endLabels,  waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName) {

    // prevent context menu from opening on right click
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);


    // disable the cursor
    $('.jspsych-content').css('cursor', 'none');


    // determine the parameters for the squircles
    var total_circles = 8;
    var radius = 60;

    var difference = 2;
    var moreRedMean = 2;
    var moreBlueMean = 2+difference;
    var moreRedSide;
    var meanColors;

    var randomiser = Math.random();
    if (randomiser > 0.5) {
        meanColors = [moreRedMean, moreBlueMean];
        moreRedSide = 'left';
    } else {
        meanColors = [moreBlueMean, moreRedMean];
        moreRedSide = 'right';
    }
    trialDataVariable['moreRedSide'].push(moreRedSide);

    //draw stimuli accordingly!

    //draw the squircle stimuli
    var canvas = document.getElementById(canvasID);
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "red";

    var cy = canvas.height/2;
    var cxl = canvas.width / 2 - canvas.width / 3;
    var cxr = canvas.width / 2 + canvas.width / 3;


    //draw the left stimulus
    for (i = 0; i < total_circles; i++) {
      var angle = i * 2 * Math.PI / total_circles;
      var xl = cxl + Math.cos(angle) * radius;
      var y = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(xl, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }

    //draw the right stimulus
    for (i = 0; i < total_circles; i++) {
      var angle = i * 2 * Math.PI / total_circles;
      var xr = cxr + Math.cos(angle) * radius;
      var y = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(xr, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }

    //draw the stimulus masks
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

    // draw the slider
    var response_area = createGeneral(
        response_area,
        parent,
        'div',
        'response-area',
        'response-area',
        ''
    );

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

    var confidence_meter = noDragSlider('slider', response_area, tooltipLabels, endLabels, buttonsToShow);


    //draw the confidence question
    var confidence_question = createGeneral(
        confidence_question,
        response_area,
        'div',
        'confidence-question',
        'confidence-question',
        '<h1>Which side was more red?</h1>'
    );

    //hide the response area
    $('.response-area').css('visibility', 'hidden');

    // reset the event loggers
    $('.mask-left').off('click');
    $('.mask-right').off('click');
    $('.escape-button').off('click');
    $('.submit-button').off('click');
    $('.more-button').off('click');
    $('.scale-row').off('mousemove').off('click');


    //hide the masks (ie show the stimulus for the stimulusPeriod)
    $('.grid-mask').css('visibility', 'hidden');
    setTimeout(function () {
        $('.grid-mask').css('visibility', 'visible');

        //show the response area
        setTimeout(function () {
            $('.confidence-question').css('visibility', 'visible');
            $('.response-area').css('visibility', 'visible');
            $('.jspsych-content').css('cursor', 'auto');

            //enable the cursor
            $('.jspsych-content').css('cursor', 'auto');

            // start the trial timer
            start_timer = Date.now();

            //function to make confidence slider work
            var backendConfidence = 50;
            var sliderActive = true;
            var displayedConfidence = 0;

            $('.scale-row').on('mousemove', function(event) {

                // get the position of the mouse on the confidence scale
                let scaleOffsetLeft = cumulativeOffset(document.getElementById('scale')).left;
                let scaleWidth = document.getElementById('scale').offsetWidth;
                let Xmin = scaleOffsetLeft;

                // convert the mouse position into a backendConfidence value (recorded for the experiment) and a displayedConfidence value (for subsequent visual changes to the confidence bar that the user sees)
                if (sliderActive) {
                    backendConfidence = Math.round(((event.pageX - Xmin) / scaleWidth) * 100);
                    // raw confidence value (from scaleWidth conversion) over 100
                    if (backendConfidence >= 100) {
                        backendConfidence = 100;
                        displayedConfidence = backendConfidence;
                        document.body.style.setProperty('--displayedColor', upperColor);
                        // raw confidence value (from scaleWidth conversion) between 51 and 100
                    } else if (backendConfidence < 100 && backendConfidence >= 51) {
                        backendConfidence = backendConfidence;
                        displayedConfidence = backendConfidence;
                        document.body.style.setProperty('--displayedColor', upperColor);
                        // raw confidence value (from scaleWidth conversion) between 49 and 51
                    } else if (backendConfidence < 51 && backendConfidence >= 49) {
                        backendConfidence = backendConfidence;
                        displayedConfidence = 51;
                        if (backendConfidence >= 50) {
                            document.body.style.setProperty('--displayedColor', upperColor);
                        } else {
                            document.body.style.setProperty('--displayedColor', lowerColor);
                        }
                        // raw confidence value (from scaleWidth conversion) between 0 and 49
                    } else if (backendConfidence < 49 && backendConfidence > 0) {
                        backendConfidence = backendConfidence;
                        displayedConfidence = 100 - backendConfidence;
                        document.body.style.setProperty('--displayedColor', lowerColor);
                        // raw confidence value (from scaleWidth conversion) under 0
                    } else {
                        backendConfidence = 0;
                        displayedConfidence = 100 - backendConfidence;
                        document.body.style.setProperty('--displayedColor', lowerColor);
                    }

                    // convert the displayedConfidence value into a visual bar width value and update confidence bar element accordingly
                    let barWidth = Math.abs((displayedConfidence - 50) * 0.5);
                    if (backendConfidence >= 50) {
                        $('#scale-right-fill, #confidence-value-right')
                            .css('width', barWidth.toString() + 'vmin')
                            .css('border-right', '5px solid rgb(255,255,255)');
                        $('#scale-left-fill, #confidence-value-left')
                            .css('width', '0vmin')
                            .css('border-left', '5px solid rgba(0,0,0,0)');
                    } else if (backendConfidence < 50) {
                        $('#scale-left-fill, #confidence-value-left')
                            .css('width', barWidth.toString() + 'vmin')
                            .css('border-left', '5px solid rgb(255,255,255)');
                        $('#scale-right-fill, #confidence-value-right')
                            .css('width', '0vmin')
                            .css('border-right', '5px solid rgba(0,0,0,0)');
                    }

                }
            });

            //click on confidence slider
            $('.scale-row').on('click', function(event) {
                // prevent clicking if it has class 'unclickable' (applied in IntroJS tutorial)
                if (!$(event.currentTarget).hasClass('unclickable')) {
                    // freeze the slider
                    sliderActive = false;
                }

                // show buttons
                if (!sliderActive) {
                    $('.scale-button').removeClass('invisible');
                }

                //record data
                var confidence_timer = Date.now();
                var RT = calculateRT(start_timer, confidence_timer);
                RTs.push(RT);

                function recordRating(backendConfidence, moreRedSide) {
                    if (backendConfidence !== undefined) {
                        // record correct/incorrect confidence
                        var confidences = [];
                        var correctResponse;
                        if (moreRedSide === 'left') {
                            var invertedConfidence = 100 - backendConfidence;
                            confidences.push(invertedConfidence);

                            if (invertedConfidence > 50) {
                                correctResponse = true;
                            } else {
                                correctResponse = false;
                            }

                            if (!isTutorialMode) {
                                cumulativeScore += reverseBrierScore(invertedConfidence, correctResponse);
                            }
                        } else {
                            confidences.push(backendConfidence);

                            if (backendConfidence > 50) {
                                correctResponse = true;
                            } else {
                                correctResponse = false;
                            }

                            if (!isTutorialMode) {
                                cumulativeScore += reverseBrierScore(backendConfidence, correctResponse);
                            }
                        }
                    }
                }

            });



        }, transitionPeriod);

    }, stimulusPeriod);

//

//     // button name
//     var buttonsToShow = {};
//     buttonsToShow['submit'] = greenButtonName;
//
//

//
//
//     // reset the event loggers
//     $('.submit-button').off('click');
//     $('.scale-row').off('mousemove').off('click');
//
//
//     // hide the response area
//     $('.confidence-question').css('visibility', 'hidden');
//     $('.response-area').css('visibility', 'hidden');
//
//
//     // hide the masks (i.e. show the stimulus)
//     $('.grid-mask').css('visibility', 'hidden');
//     // start the timer
//     start_timer = Date.now();
//
//
//     // left or right mouse-click for decision
//     var initialChoice;
//     $(document).on('mousedown', function (event) {
//
//         // turn off this event handler
//         $(document).off('mousedown');
//
//         // record the reaction time
//         choice_timer = Date.now();
//         var RT = calculateRT(start_timer, choice_timer);
//         RTs = RT;
//
//         //skip some of the steps if we are in practice1 which is only used for staircasing (if (seeAgain != "practice1"))
//
//         //time out for presenting blue box around chosen option (and confidence slider) as changes in screen can affect EEG signal
//
//         setTimeout(function () {
//             // enable the cursor
//             $('.jspsych-content').css('cursor', 'auto');
//             $('.grid-mask').css('cursor', 'auto');
//
//             //restrict confidence slider to chosen side
//             var sliderMask = createGeneral(
//                 sliderMask,
//                 document.getElementById('scale'),
//                 'div',
//                 '',
//                 'sliderMask',
//                 ''
//             );
//
//             //disable cursor for masked slider
//             $('#sliderMask').click(function(event){
//                 event.preventDefault();
//                 return false;
//             });
//
//
//
//             // make response area visible
//             if (seeAgain !== "practice1") {
//                 $('.confidence-question').css('visibility', 'visible');
//                 document.getElementById("confidence-question").innerHTML = "<h1>Indicate your confidence with the slider below</h1>";
//                 $('.response-area').css('visibility', 'visible');
//             } else {
//                 //use initial response rather than confidence rating to for "correct response" as fed into function when continue button is clicked
//                 if (initialChoice === moreRedSide) {
//                     correctResponse = true;
//                 } else {
//                     correctResponse = false;
//                 }
//                 //automatically trigger click on continue button
//                 setTimeout(function () {
//                     buttonBackend('submit');
//                 }, 600)
//             }
//         }, 700);
//     });
//
//
//     // participant clicks on continue button
//     function buttonBackend(type) {
//         // turn off the button options
//         $('.scale-button').addClass('invisible');
//
//
//
//         // calculate the wait time (this is from stimulus presentation until clicking continue, whereas RT is from stimulus presentation to initial choice via mouse-lick
//         confidence_timer = Date.now();
//         var waitTime = calculateRT(start_timer, confidence_timer);
//
//
//         // clear the display on a timer
//         setTimeout(function () {
//             document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
//             document.getElementById('response-area').remove();
//             console.log('that was trial ' + trialCounterVariable + ' of ' + trialCount);
//         }, 500);
//
//
//         //record trial data
//         trialDataVariable['waitTimes'].push(waitTime);
//         trialDataVariable['isCorrect'].push(correctResponse);
//         trialDataVariable['meanColorPairs'].push(JSON.stringify(meanColorPairs));
//         trialDataVariable['confidences'].push(confidences);
//         trialDataVariable['RTs'].push(RTs);
//         trialDataVariable['isTutorialMode'].push(isTutorialMode);
//         trialCounterVariable++;
//         totalTrials++;
//         trialDataVariable['trial_count'].push(totalTrials);
//
//
//         // if current trial-number is less than total trial-number, call the drawFixation function and begin new trial
//         if (trialCounterVariable < trialCount) {
//             setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, tooltipLabels, endLabels, showPercentage, seeAgain, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled, partner); }, 400);
//
//
//         // if current trial-number is equal to total trial-number, then evaluate accuracy and end the block
//         } else {
//             // evaluate accuracy
//             setTimeout(function () {
//                 accuracy = round(mean(trialDataVariable['isCorrect']), 2) * 100;
//
//                 //if we are in tutorial mode, practice trials need to be repeated in case accuracy is below accuracy threshold
//                 if (isTutorialMode) {
//                     if (accuracy >= accuracyThreshold) {
//                         var section4_button = 'CONTINUE';
//                         var section4_text = 'Congratulations, your accuracy during the last set of trials was ' + accuracy + '%.';
//                         if (seeAgain !== "practice1") {
//                             blockCount = 0;
//                         } else {
//                             blockCount = -1;
//                         }
//                     } else {
//                         var section4_button = 'REPEAT';
//                         var section4_text = 'Your accuracy during these trials was ' + accuracy + '%, which is below the required accuracy threshold. Please click "repeat" below to repeat the practice round.';
//                     }
//
//                     // set up feedback page
//                     $('.jspsych-content-wrapper')
//                         .css('width', '100%');
//
//                     var section4 = createGeneral(
//                         section4,
//                         parent,
//                         'section',
//                         'tutorial-section section4',
//                         'dots-tutorial-section4',
//                         ''
//                     );
//
//                     var section4_title = createGeneral(
//                         section4_title,
//                         section4,
//                         'div',
//                         'tutorial-text',
//                         'dots-tutorial-text4',
//                         section4_text
//                     );
//
//                     $('#dots-tutorial-text4').css('font-size', '3vmax');
//
//                     var section4_button = createGeneral(
//                         section4_button,
//                         section4,
//                         'button',
//                         'default-white-button glowy-box',
//                         'dots-tutorial-continue',
//                         '<div>' + section4_button + '</div>'
//                     );
//
//
//                     // if practice block was successful
//                     if (accuracy >= accuracyThreshold) {
//
//                         // we save the data
//
//                         $('#dots-tutorial-continue').on('click', function () {
//                             permanentDataVariable["accuracy"].push(accuracy);
//                             permanentDataVariable["trial_count"].push(trialDataVariable["trial_count"]);
//                             permanentDataVariable["meanColorPairs"].push(trialDataVariable["meanColorPairs"]);
//                             permanentDataVariable["moreRedSide"].push(trialDataVariable["moreRedSide"]);
//                             permanentDataVariable["confidences"].push(trialDataVariable["confidences"]);
//                             permanentDataVariable["moreAsked"].push(trialDataVariable["moreAsked"]);
//                             permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
//                             permanentDataVariable["RTs"].push(trialDataVariable["RTs"]);
//                             permanentDataVariable["waitTimes"].push(trialDataVariable["waitTimes"]);
//                             permanentDataVariable["block_count"].push(blockCount);
//
//                             saveCSV(subjectID, currentAttempt);
//
//                             // enable cursor for whole screen
//                             $('body').css('cursor', 'auto');
//
//                             // finish the trial
//                             jsPsych.finishTrial();
//                             return;
//                         });
//
//
//                     // if the practice block was not successful, we do not save the data and start a new block of trials
//                     } else {
//                         totalTrials = 0;
//                         trialCounterVariable = 0;
//                         // reset trial data variable
//                         trialDataVariable = {
//                             trial_count: [],
//                             meanColorPairs: [],
//                             moreRedSide: [],
//                             confidences: [],
//                             moreAsked: [],
//                             isCorrect: [],
//                             isTutorialMode: [],
//                             firstIsCorrect: [],
//                             RTs: [],
//                             waitTimes: []
//                         };
//                         $('#dots-tutorial-continue').on('click', function () {
//                             setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, tooltipLabels, endLabels, showPercentage, seeAgain, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled, partner); }, 400);
//                         });
//                     }
//
//
//                 // if we are not in tutorial mode
//                 } else {
//                     // we save the data
//
//                     permanentDataVariable["accuracy"].push(accuracy);
//                     permanentDataVariable["trial_count"].push(trialDataVariable["trial_count"]);
//                     permanentDataVariable["isTutorialMode"].push(trialDataVariable["isTutorialMode"]);
//                     permanentDataVariable["meanColorPairs"].push(trialDataVariable["meanColorPairs"]);
//                     permanentDataVariable["moreRedSide"].push(trialDataVariable["moreRedSide"]);
//                     permanentDataVariable["confidences"].push(trialDataVariable["confidences"]);
//                     permanentDataVariable["moreAsked"].push(trialDataVariable["moreAsked"]);
//                     permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
//                     permanentDataVariable["RTs"].push(trialDataVariable["RTs"]);
//                     permanentDataVariable["waitTimes"].push(trialDataVariable["waitTimes"]);
//
//                     saveCSV(subjectID, currentAttempt);
//
//
//                    // increase the block count
//                     totalCorrect += trialDataVariable.isCorrect.filter(Boolean).length;
//                     blockCount++;
//                     permanentDataVariable["block_count"].push(blockCount);
//
//                     // enable the cursor for the whole screen
//                     $('body').css('cursor', 'auto');
//
//                     // finish the trial
//                     jsPsych.finishTrial();
//                     return;
//                 }
//             }, 1500);
//         }
//     }
//
//
//     // enables slider
//     $('.scale-row').on({
//         mousemove: function (event) {
//             var scaleOffsetLeft = cumulativeOffset(document.getElementById('scale')).left;
//             var scaleWidth = document.getElementById('scale').offsetWidth;
//             var Xmin = scaleOffsetLeft;
//
//             if (sliderActive) {
//                 backendConfidence = Math.round(((event.pageX - Xmin) / scaleWidth) * 100);
//
//                 // style code
//                 if (backendConfidence >= 100) {
//                     backendConfidence = 100;
//                     displayedConfidence = backendConfidence;
//                     document.body.style.setProperty('--displayedColor', upperColor);
//                 } else if (backendConfidence < 100 && backendConfidence >= 51) {
//                     backendConfidence = backendConfidence;
//                     displayedConfidence = backendConfidence;
//                     document.body.style.setProperty('--displayedColor', upperColor);
//                 } else if (backendConfidence < 51 && backendConfidence >= 49) {
//                     backendConfidence = backendConfidence;
//                     displayedConfidence = 51;
//                     if (backendConfidence >= 50) {
//                         document.body.style.setProperty('--displayedColor', upperColor);
//                     } else {
//                         document.body.style.setProperty('--displayedColor', lowerColor);
//                     }
//                 } else if (backendConfidence < 49 && backendConfidence > 0) {
//                     backendConfidence = backendConfidence;
//                     displayedConfidence = 100 - backendConfidence;
//                     document.body.style.setProperty('--displayedColor', lowerColor);
//                 } else {
//                     backendConfidence = 0;
//                     displayedConfidence = 100 - backendConfidence;
//                     document.body.style.setProperty('--displayedColor', lowerColor);
//                 }
//
//                 var barWidth = Math.abs((displayedConfidence - 50) * 0.5);
//                 if (backendConfidence >= 50) {
//                     $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(13, 219, 255)');
//                     $('#scale-left-fill, #confidence-value-left').css('width', '0vmin').css('border-left', '5px solid rgba(0,0,0,0)');
//                 } else if (backendConfidence < 50) {
//                     $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(13, 219, 255)');
//                     $('#scale-right-fill, #confidence-value-right').css('width', '0vmin').css('border-right', '5px solid rgba(0,0,0,0)');
//                 }
//
//                 if (showPercentage) {
//                     if (backendConfidence > 45) {
//                         document.getElementById('confidence-value-right').innerHTML = displayedConfidence + '%';
//                         document.getElementById('confidence-value-left').innerHTML = '';
//                     } else if (backendConfidence <= 45) {
//                         document.getElementById('confidence-value-left').innerHTML = displayedConfidence + '%';
//                         document.getElementById('confidence-value-right').innerHTML = '';
//                     }
//                 }
//             }
//         },
//
//
//         // when participant clicks on slider to indicate their confidence
//         click: function () {
//             //avoid double clicks by disabling click event for slider
//             document.getElementById('scale-row').style.pointerEvents = 'none';
//
//             // disable the slider
//             sliderActive = false;
//
//
//             // confidence is stored as "confidence in the correct answer"
//             // i.e. if a person has confidence of 4% in their response but it is the incorrect one, this will be stored as 46% (confidence in the correct choice)
//             var participantConfidenceCorrect;
//
//             function recordRating(backendConfidence, moreRedSide, type) {
//                 if (backendConfidence !== undefined) {
//                     console.log("majority side " + moreRedSide);
//                     // record correct/incorrect confidence
//                     if (moreRedSide == 'left') {
//                         var invertedConfidence = 100 - backendConfidence;
//                         participantConfidenceCorrect = invertedConfidence;
//                         confidences = invertedConfidence;
//
//                         if (invertedConfidence > 50) {
//                             correctResponse = true;
//                         } else {
//                             correctResponse = false;
//                         }
//
//                         if (!isTutorialMode && type == 'submit') {
//                             cumulativeScore += reverseBrierScore(invertedConfidence, correctResponse); //this is false for the joint decision making but I don't use Brier Score anyways
//                         }
//                     } else {
//                         participantConfidenceCorrect = backendConfidence;
//                         confidences = backendConfidence;
//
//                         if (backendConfidence > 50) {
//                             correctResponse = true;
//                         } else {
//                             correctResponse = false;
//                         }
//
//                         if (!isTutorialMode && type == 'submit') {
//                             cumulativeScore += reverseBrierScore(backendConfidence, correctResponse);
//                         }
//                     }
//                 }
//             }
//
//             recordRating(backendConfidence, moreRedSide, 'initial');
//
//
//
//
//             // the stored confidence values in the data object are confidences in the correct choice;
//             // the normal confidences are on a scale of 0-50 regardless of left/right correct/wrong choice; they are necessary to compare who had higher confidence in the case that participant and partner choose different sides
//             // the confidence scores for the markers are on a scale from 0-100 going from left to right on the confidence scale
//
//
//             //automatically trigger click on continue button more quickly when there is no partner to wait for
//             setTimeout(function () {
//                 buttonBackend('submit');
//             }, 1000)
//         },
//     });
//
//
//     // when continue button is clicked, the above specified function is called
//     $('.submit-button').on('click', function () {
//         buttonBackend('submit');
//     });
//
//
//     // hide the stimulus again for the next trial
//     setTimeout(function () {
//         // unhide the masks
//         $('.grid-mask').css('visibility', 'visible');
//         $('.confidence-question').css('visibility', 'visible');
//     }, stimulusPeriod);
//
//
}

/**
 * @function drawFixation()
 * @param {Object} parent - parent div
 * @param {Object} canvasID - canvas object in which to draw grids
 * @param {int} canvasWidth - width of the canvas for dot grids
 * @param {int} canvasHeight - height of the canvas for dot grids
 * @param {string} upperColor - colour for the right side of the scale
 * @param {string} lowerColor - colour for the left side of the scale
 * @param {Array} tooltipLabels
 * @param {Array} endLabels
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
 * @param {boolean} redButtonEnabled
 * @param {string} redButtonName
 * @param {boolean} yellowButtonEnabled
 * @param {string} yellowButtonName
 * @param {boolean} greenButtonEnabled
 * @param {string} greenButtonName
 */

//the script starts with the drawFixation function which is called in the jspsych-squircles (this is also where all the necessary variable values are specified!)
function drawFixation(parent, canvasWidth, canvasHeight, upperColor, lowerColor, tooltipLabels, endLabels, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName) {

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

    //create the fixation cross
    var fixationCross = createGeneral(
        fixationCross,
        parent,
        'div',
        'fixation-cross',
        'fixation-cross',
        '+'
    );

    //timeout function clears the fixation cross, then draws the canvas for the dots grid, and then calls the drawSquircles function
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
        drawSquircles(parent, canvasID, canvasWidth, canvasHeight, upperColor, lowerColor, tooltipLabels, endLabels,  waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName);
    }, fixationPeriod);
}
