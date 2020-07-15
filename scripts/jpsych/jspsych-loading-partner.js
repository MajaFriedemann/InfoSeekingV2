/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-loading-partner'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'jspsych-loading-partner',
        prettyName: 'Loading Partner',
        parameters: {
            colors_list: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'possible colours',
                default: ['#9AD5CA', '#9984D4', '#62BFED', '#E637BF', '#FE5F55'],
                description: 'ARRAY OBJECT: the colors cycled between in the block. Default is the 80s colour scheme.'
            },
            subjectID: {
                type: jsPsych.plugins.parameterType.STRING,
                default: undefined
            },
            checkParticipated: {
                type: jsPsych.plugins.parameterType.BOOLEAN,
                default: true
            },
            accessCodeRequired: {
                type: jsPsych.plugins.parameterType.BOOLEAN,
                default: true
            },
            overrideEnabled: {
                type: jsPsych.plugins.parameterType.BOOLEAN,
                default: true
            }
        }
    };

    plugin.trial = function (display_element, trial) {

        // clear display element and apply page default styles
        display_element.innerHTML = '';
        $('body')
            .css('height', 'auto')
            .css('background-color', 'black')
            .css('overflow', 'hidden')
        $.scrollify.destroy();

        setCookie('UIDMUL-IST-progress', '0', 365);

        var loadingContainer = createGeneral(
            loadingContainer,
            display_element,
            'section',
            'loading',
            'loading-container',
            ''
        );

        ISTloading(loadingContainer, [11, 12, 13, 16, 17, 18, 21, 22, 23], trial.colors_list);

        var loadingMessage = createGeneral(
            loadingMessage,
            loadingContainer,
            'div',
            'loading main-message',
            'loading-main-message',
            'selecting your partner'
        );

        // checks if participant has a cookie indicating previous experiment completion. returns boolean: true or false.
        function participatedBefore() {
            var startedBefore = getCookie('UIDMUL-IST-started');
            var finishedBefore = false;
            var previousSubjectID = getCookie('UIDMUL-IST-subjectID');
            var subjectIdentifier;

            if (previousSubjectID) {
                subjectIdentifier = previousSubjectID;
            } else {
                subjectIdentifier = trial.subjectID;
            }

            if (finishedBefore) {
                loadingMessage.innerHTML = 'Sorry, looks like you\'ve already taken part in this experiment! <br><br> Please <a href="mailto:oxacclab@gmail.com">email us</a> with reference to your personal identification code <u><highlight style="color: rgb(0,200,150)">' + subjectIdentifier + '</highlight></u> if you believe this is an error.'
                $('#loader').css('display', 'none');
                return true;
            } else {
                return false;
            }
        }

        // presents loading page "checking your browser compatibility". if successful, changes message to "loading game now" and passes control to access() after 3000 ms. if unsuccessful, changes message to sorry message with contact details.
        function passModernizr() {
            $('#loader').css('display', 'block');
            $('#loading-main-message').css('display', 'inline');
            loadingMessage.innerHTML = 'selecting your partner';

            setTimeout(function() {
                var tests = Modernizr.addTest({});
                delete tests.inputtypes;
                delete tests.hiddenscroll;
                delete tests.cssgridlegacy;
                delete tests.wrapflow;
                // console.log(Modernizr.addTest({}));

                var keysArray = Object.keys(tests);
                var passModernizrTest;

                for (i = 0; i < keysArray.length; i++) {
                    if (tests[keysArray[i]] == false) {
                        passModernizrTest = false;
                    }
                }
                if (passModernizrTest == undefined) {
                    passModernizrTest = true;
                }

                if (passModernizrTest) {
                    loadingMessage.innerHTML = 'checking for similar performance levels';
                    setTimeout(function () { access(); }, 3000);
                } else {
                    loadingMessage.innerHTML = 'Sorry, looks like you don\'t meet our browser requirements for the experiment!<br><br>Maybe try again in an updated browser?';
                    $('#loader').css('display', 'none');
                }
            }, 1000);
        }

        // presents access code page if participatedBefore() was true; otherwise, should skip directly to next trial in jsPsych timeline (calls jsPsych.finishTrial()).
        function access() {
            if (participatedBefore() == false) {
                loadingMessage.innerHTML = 'loading the game';
                setTimeout(function() {
                    $('#loader').css('display', 'none');
                    $('#loading-main-message').css('display', 'none');
                    jsPsych.finishTrial();
                }, 3500);
            } else {
                loadingMessage.innerHTML = '';

                var accessInput = createGeneral(
                    accessInput,
                    loadingContainer,
                    'div',
                    'question demographics-question',
                    'access-input',
                    '<h2>' + 'Please enter your access code:' + '</h2>'
                    + '<input id="access" type="text" name="access" size="2">'
                );

                $('#access-input').on('change', function () {
                    // console.log(document.getElementById('access').value);
                    if (document.getElementById('access').value == 'ALLACCESS') {
                        $('#access-input').css('display', 'none');

                        $('#loader').css('display', 'block');
                        $('#loading-main-message').css('display', 'inline');
                        loadingMessage.innerHTML = 'you\'re good to go :)'

                        setTimeout(function() { jsPsych.finishTrial(); }, 1500);
                    }
                });
            }
        }

        // able to override checks
        function override(e) {
            if (e.keyCode == 27) {
                $('#loader').css('display', 'none');
                $('#loading-main-message').css('display', 'none');

                var overrideInput = createGeneral(
                    overrideInput,
                    loadingContainer,
                    'div',
                    'question demographics-question',
                    'override-input',
                    '<h2>' + 'Please enter your override code:' + '</h2>'
                    + '<input id="override" type="text" name="override" size="2">'
                );

                $('#override-input').on('change', function () {
                    // console.log(document.getElementById('override').value);
                    if (document.getElementById('override').value == 'ALLACCESS') {
                        $('#override-input').css('display', 'none');
                        passModernizr();
                    }
                });
            }
        }

        // call first check: participation (participatedBefore()). if successful, will pass on to browser compatibility check (passModernizr()) and then access check (access()) in turn.
        setTimeout(function() {
            participatedBefore();
            // console.log(participatedBefore());
            if (participatedBefore() == false) {
                passModernizr();
            }
        }, 3000);

        // listen for override called by ESC
        $(window).on('keydown', function(e) {
            override(e);
        });
    };

    return plugin;
})();
