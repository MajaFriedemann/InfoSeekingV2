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

    //default variables
    var backendConfidence = 50;
    var correctResponse;
    var sliderActive = true;
    var displayedConfidence = 0;
    var secondTimeAround = false;  // set to true when more info is sought and the stimuli are shown a second time
    var start_timer;
    var confidences = [];
    var RTs = [];
    var choice_timer;
    var confidence_timer;

    // prevent context menu from opening on right click
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);


    // disable the cursor
    $('.jspsych-content').css('cursor', 'none');


    // determine the parameters for the squircles
    var total_circles = 8;
    var radius = 60;

    var color_means = [.15, .35, .55, .75];
    var color_mean = randInt(0, 3);
    color_mean = color_means[color_mean];

    var color_sds = [.0333, .1];
    var color_sd = randInt(0, 1);
    color_sd = color_sds[color_sd];

    var color_mean_differences = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03];
    var color_mean_difference = randInt(0, 5);
    color_mean_difference = color_mean_differences[color_mean_difference];


    var moreRedSide;
    var randomiser = Math.random();
    if (randomiser > 0.5) {
        moreRedSide = 'left';
    } else {
        moreRedSide = 'right';
    }

    console.log(color_mean);
    console.log(color_sd);
    console.log(color_mean+color_mean_difference);
    console.log(moreRedSide);

    //draw the squircle stimuli
    drawSquircleStimuli(parent, canvasID, canvasWidth, canvasHeight, total_circles, radius,
        color_mean, color_sd, color_mean_difference, moreRedSide);

    // which buttons to show (make this dependent on the condition)
    yellowButtonEnabled = true;
    redButtonEnabled = false;
    greenButtonEnabled = true;

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

    // draw the slider
    var response_area = createGeneral(
        response_area,
        parent,
        'div',
        'response-area',
        'response-area',
        ''
    );

    //draw the confidence slider
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


    //cover half of the stimuli
    var cover1 = createGeneral(
        cover1,
        document.getElementById('jspsych-canvas-sliders-response-stimulus'),
        'div',
        'grid-cover cover-left',
        'grid-cover-left',
        ''
    );

    var cover2 = createGeneral(
        cover2,
        document.getElementById('jspsych-canvas-sliders-response-stimulus'),
        'div',
        'grid-cover cover-right',
        'grid-cover-right',
        ''
    );

    $('.grid-cover').css('width', radius+20);
    $('.grid-cover.cover-right').css('right', radius+22);
    $('.grid-cover').css('visibility', 'visible');

    //draw the stimulus masks
    setTimeout(function () {
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

        $('.grid-mask').css('visibility', 'visible');

        //hide the stimulus covers (so they are not there the second time around)
        $('.grid-cover').css('visibility', 'hidden');

        // reset the event loggers
        $('.mask-left').off('click');
        $('.mask-right').off('click');
        $('.escape-button').off('click');
        $('.submit-button').off('click');
        $('.more-button').off('click');
        $('.scale-row').off('mousemove').off('click');


        //show the response area
        setTimeout(function () {
            $('.confidence-question').css('visibility', 'visible');
            $('.response-area').css('visibility', 'visible');
            $('.jspsych-content').css('cursor', 'auto');

            //enable the cursor
            $('.jspsych-content').css('cursor', 'auto');

            // start the trial timer
            start_timer = Date.now();
        }, transitionPeriod);


        function recordRating(backendConfidence, moreRedSide, type) {
            if (backendConfidence !== undefined) {
                // record correct/incorrect confidence
                if (moreRedSide === 'left') {
                    var invertedConfidence = 100 - backendConfidence;
                    confidences.push(invertedConfidence);

                    if (invertedConfidence > 50) {
                        correctResponse = true;
                    } else {
                        correctResponse = false;
                    }

                    if (!isTutorialMode && type === "submit") {
                        cumulativeScore += reverseBrierScore(invertedConfidence, correctResponse);
                    }
                } else {
                    confidences.push(backendConfidence);

                    if (backendConfidence > 50) {
                        correctResponse = true;
                    } else {
                        correctResponse = false;
                    }

                    if (!isTutorialMode && type === "submit") {
                        cumulativeScore += reverseBrierScore(backendConfidence, correctResponse);
                    }
                }
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
                // not needed
                case 'exit':
                    sliderActive = true;
                    break;

                // yellow button for More Info is clicked
                case 'seeMore':
                    secondTimeAround = true;
                    recordRating(backendConfidence, moreRedSide, type);

                    // reset the trial timer
                    start_timer = Date.now();

                    // set options for 'See Again' based on specified parameter

                    // same grid (simple mask-lifting)

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

                    break;

                default:
                    recordRating(backendConfidence, moreRedSide, type);

                    if (secondTimeAround) {
                        trialDataVariable['moreAsked'].push(true);

                        // cancel the wait time
                        if (isTutorialMode) {
                            var waitTime = 1000;
                        } else {
                            var waitTime = 0;
                        }

                    } else {
                        trialDataVariable['moreAsked'].push(false);

                        // calculate the wait time
                        var waitTime = fixationPeriod + stimulusPeriod + transitionPeriod + RT;
                        if (waitTime > waitTimeLimit) {
                            waitTime = waitTimeLimit;
                        }
                    }

                    trialDataVariable['waitTimes'].push(waitTime);
                    trialDataVariable['isCorrect'].push(correctResponse); // this is for calculating the bonus
                    trialDataVariable['moreRedMean'].push(color_mean+color_mean_difference);
                    trialDataVariable['moreBlueMean'].push(color_mean);
                    trialDataVariable['colorMeanDifference'].push(color_mean_difference);
                    trialDataVariable['colorSD'].push(color_sd);

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
                        }, 1000);
                    } else {
                        // clear the display directly
                        document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
                        document.getElementById('response-area').remove();
                        totalTrials++;
                    }

                    if (trialCounterVariable < trialCount) {
                        // draw the fixation dot
                        setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, upperColor, lowerColor, tooltipLabels, endLabels, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName); }, waitTime);

                    } else {
                        // evaluate accuracy
                        setTimeout(function () {
                            var accuracy = round(mean(trialDataVariable['isCorrect']), 2) * 100;
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
                                        permanentDataVariable['moreRedMean'].push(trialDataVariable["moreRedMean"]);
                                        permanentDataVariable['moreBlueMean'].push(trialDataVariable["moreBlueMean"]);
                                        permanentDataVariable['colorMeanDifference'].push(trialDataVariable["colorMeanDifference"]);
                                        permanentDataVariable['colorSD'].push(trialDataVariable["coloSD"]);
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
                                        drawFixation(parent, canvasWidth, canvasHeight, upperColor, lowerColor, tooltipLabels, endLabels, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName);
                                        return;
                                    });
                                }
                            } else {
                                // if not in tutorial mode
                                permanentDataVariable["accuracy"].push(accuracy);
                                permanentDataVariable["isTutorialMode"].push(trialDataVariable["isTutorialMode"]);
                                permanentDataVariable['moreRedMean'].push(trialDataVariable["moreRedMean"]);
                                permanentDataVariable['moreBlueMean'].push(trialDataVariable["moreBlueMean"]);
                                permanentDataVariable['colorMeanDifference'].push(trialDataVariable["colorMeanDifference"]);
                                permanentDataVariable['colorSD'].push(trialDataVariable["coloSD"]);
                                permanentDataVariable["moreRedSide"].push(trialDataVariable["moreRedSide"]);
                                permanentDataVariable["confidences"].push(trialDataVariable["confidences"]);
                                permanentDataVariable["moreAsked"].push(trialDataVariable["moreAsked"]);
                                permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
                                permanentDataVariable["RTs"].push(trialDataVariable["RTs"]);
                                permanentDataVariable["waitTimes"].push(trialDataVariable["waitTimes"]);

                                totalCorrect += trialDataVariable.isCorrect.filter(Boolean).length;
                                blockCount++;

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
                        $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(10,128,128)'); //color of confidence slider indicator
                        $('#scale-left-fill, #confidence-value-left').css('width', '0vmin').css('border-left', '5px solid rgba(0,0,0,0)');
                    } else if (backendConfidence < 50) {
                        $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(10,128,128)'); //color of confidence slider indicator
                        $('#scale-right-fill, #confidence-value-right').css('width', '0vmin').css('border-right', '5px solid rgba(0,0,0,0)');
                    }
                }
            },
            click: function () {
                sliderActive = false;

                // show buttons
                if (!sliderActive) {
                    $('.scale-button').removeClass('invisible');
                }
                // record data
                confidence_timer = Date.now();
                var RT = calculateRT(start_timer, confidence_timer);
                RTs.push(RT);
                recordRating(backendConfidence, moreRedSide, 'initial');
            },
        });

        $('.escape-button').on('click', function () {
            buttonBackend('exit');
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
