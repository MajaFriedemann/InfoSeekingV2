/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-overconfident-feedback'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'jspsych-overconfident-feedback',
        parameters: {
            askStrategy: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true
            }
        }
    };

    plugin.trial = function (display_element, trial) {
        var technicalExpanded = false;
        // clear display element and apply page default styles
        display_element.innerHTML = '';
        $('body')
            .css('height', 'auto')
            .css('background-color', 'black')
            .css('overflow', 'auto');
        $.scrollify.destroy();

        var options = 10;

        /* change these parameters to adjust the survey matrix appearance (CSS) */
        var containerWidth = 50;
        var quarterContainerWidth = 0.25 * containerWidth;
        var questionWidth = containerWidth;
        var opterWidth = containerWidth;
        var optionWidth = opterWidth / options;
        var questionHeight = 20;
        var doubleQuestionHeight = 2 * questionHeight;

        document.body.style.setProperty('--containerWidth', containerWidth + 'vw');
        document.body.style.setProperty('--quarterContainerWidth', quarterContainerWidth + 'vw');
        document.body.style.setProperty('--questionWidth', questionWidth + 'vw');
        document.body.style.setProperty('--opterWidth', opterWidth + 'vw');
        document.body.style.setProperty('--optionWidth', optionWidth + 'vw');
        document.body.style.setProperty('--questionHeight', questionHeight + 'vh');
        document.body.style.setProperty('--doubleQuestionHeight', doubleQuestionHeight + 'vh');

        var container = createGeneral(
            container,
            display_element,
            'div',
            '',
            'feedback-container',
            ''
        );

        var header = createGeneral(
            header,
            container,
            'div',
            'question',
            'feedback-title',
            '<h2>What did you think about your partner...</h2>'
        );

        var feedbackPoll = createGeneral(
            feedbackPoll,
            container,
            'div',
            'surveyMatrix centered-poll',
            'feedbackPoll',
            ''
        );

        createSurveyMatrix(
            feedbackPoll,
            '',
            'feedbackPoll-overconf-gender',
            ['Do you think your partner was male or female?'],
            ['male', 'female']
        );

        createSurveyMatrix(
            feedbackPoll,
            '',
            'feedbackPoll-overconf-likeablity',
            [
                'How much did you like your partner?'
            ],
            ['1<br>not at all', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>very much']
        );
        createSurveyMatrix(
            feedbackPoll,
            '',
            'feedbackPoll-overconf-accuracy',
            [
                'How accurate do you think your partner was compared to yourself?'
            ],
            ['1<br>much less accurate', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>much more accurate']
        );

        createSurveyMatrix(
            feedbackPoll,
            '',
            'feedbackPoll-overconf-confidence',
            [
                'How confident do you think your partner was compared to yourself?'
            ],
            ['1<br>much less confident', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>much more confident']
        );


        var feedbackCaption = createGeneral(
            feedbackCaption,
            container,
            'div',
            'question feedback-text',
            'feedbackPoll-overconf-comments',
            'Got any additional comments and feedback about your partner? Tell us here!'
        );
        $('#feedbackQuestion-comments').css('text-align', 'center');

        var feedbackText = createGeneral(
            feedbackText,
            container,
            'textarea',
            'question textarea',
            'feedbackText-overconf-comments',
            ''
        );


        $('#jspsych-content').on('click', '#feedbackPoll .surveyMatrix-option', function () {
            var name = $(this).children('input').attr('name');
            var value = $(this).children('input').prop('value');
            dataObject[name] = value;
        });

        var continueButton = createGeneral(
            continueButton,
            container,
            'button',
            'default-green-button',
            'feedback-continue-button',
            'CONTINUE'
        );

        continueButton.onclick = function () {
            dataObject["overconf_comments"] = feedbackText.value;
            jsPsych.finishTrial();
        };
    };

    return plugin;
})();
