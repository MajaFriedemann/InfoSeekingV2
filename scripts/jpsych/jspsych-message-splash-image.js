jsPsych.plugins['jspsych-message-splash-image'] = (function(){

    var plugin = {};

    plugin.info = {
        name: 'jspsych-message-splash-image',
        prettyName: 'Message Splash with Image',
        parameters: {
            text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Text',
                description: 'STRING: text for message'
            },
            img_id: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Image ID',
                description: 'STRING: HTML object ID for image object in section 2.'
            },
            buttonText: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button text',
                default: 'CONTINUE',
                description: 'STRING: text for trial finish button.'
            }
        }
    };

    plugin.trial = function(display_element, trial){
        // clear display element and apply page default styles
        display_element.innerHTML = '';
        // need to call directly on the display_element
        display_element.style.backgroundColor = trial.backgroundColor;
        $('body')
            .css('height', 'auto')
            .css('color', trial.textColor)
            .css('overflow', 'hidden');
        $.scrollify.destroy();

        //create the page elements
        var page = createGeneral(
            page,
            display_element,
            'section',
            'tutorial-section section2',
            'notice-section2',
            ''
        );

        var page_image = createGeneral(
            page_image,
            page,
            'div',
            'gameboard-gif',
            trial.img_id,
            ''
        );

        var page_title = createGeneral(
            page_title,
            page,
            'div',
            'tutorial-text',
            'notice-text2',
            '<div id="section2-text">' + trial.text + '</div>'
        );

        $('.section2 .tutorial-text').css('font-size', '2vmax');
        //$('.section2 .tutorial-text').css('margin-top', '50vh');
        $('.section2 .tutorial-text').css('line-height', '4vmax');


        var continueButton = createGeneral(
            continueButton,
            page,
            'button',
            'default-green-button',
            trial.name + '-' + trial.buttonText + '-button',
            trial.buttonText
        );

        continueButton.onclick = function() {
            jsPsych.finishTrial();
        };


        // make sure page starts at the top every time
        $(document).ready(function () {
            $(this).scrollTop(0);
        });
    };

    return plugin;

})();