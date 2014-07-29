var Utils = {
    "getCookie": function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
        }
        return "";
    }
};

// Set Global Configs/Objects
var FFP = {
    debug: false,
    $menu: {}, // Instance of the menu
    $courses: {}, // Contains all wrapped courses
    // Functions
    counters: {
        rawCoursesAttempts: 1,
        maxRawCoursesAttempts: 10,
        waitForMin: 1,
        waitForMax: 10
    },
    fn: {
        init: function(){}, // Init the app
        buildMenu: function(){}, // Builds the menu
        wrapCourses: function(){}, // Wrap All courses for easy manipulation
        menu: {
            toggleInactives: function(){} // Shows/Hides inactive courses
        },
        setPerks: function(){}
    }
};
// Set Application Strings
FFP.strings = {
    menu: {
        btnToggleInactives: {
            on: 'Ocultar Inactivos', // If Inactives are on, option is Hide
            off: 'Mostrar Inactivos' // If Inactives are off, option is Show
        }
    }
};

FFP.fn.waitFor = function(callback) {
    callback = typeof callback === 'function' ? callback : function(){};
    var $r = $.Deferred(),
        i = FFP.counters.waitForMin;
    setTimeout(function() {
        // Try up to FFP.counters.maxRawCoursesAttempts times to get the courses list
        while(i < FFP.counters.waitForMax) {
            FFP.$courses = $('[data-bind="foreach: courses"]');
            if(FFP.$courses.children().length) {
                // It means that children were found
                $r.resolve();
                break;
            }
            i++;
        }
    }, 200);
    return $r.promise();
};

/**
 * Initialize the application
 */
FFP.fn.init = function() {
    // Wrap all courses
    FFP.fn.wrapCourses();
    // Build the app menu
    FFP.fn.buildMenu();
    // Init hiding inactive courses
    FFP.fn.menu.toggleInactives();
};

/**
 * Initializes the menu
 */
FFP.fn.buildMenu = function() {
    // Add Custom Menu
    FFP.$menu = $('<div />')
		.attr({'id': 'ffp-menu'})
		.append([
			$('<span />').attr({'id': 'toggle-inactives'})
		])
		.appendTo('.row.encabezado-cursos');
    // Make links clickable
    FFP.$menu.find('> span').attr({'class': 'ffp-menu-link'}).css({'cursor': 'pointer'});

    // Bind Menu Actions
    FFP.$menu.find('#toggle-inactives').click(FFP.fn.menu.toggleInactives);
};

/**
 * Wraps all courses for easy manipulation
 */
FFP.fn.wrapCourses = function() {
    // Wrap every course into a div.ffp-course for easy handling
    FFP.$courses.find('div.row.indicador-curso').each(function () {
        var $course = $(this).add($(this).nextUntil('div.row.indicador-curso'));
        $course.wrapAll('<div class="ffp-course" />');
    });

    // Get the new tidy wrapped courses
    FFP.$courses = $('div.ffp-course');
};

/**
 * Shows/Hides the inactive courses
 */
FFP.fn.menu.toggleInactives = function() {
    // Get the Toggle Inactives button
    var $btn = FFP.$menu.find('#toggle-inactives');

    // Check toggle state of the link
    var areInactivesHidden = $btn.data('inactives') === 'off';

    // Iterate over the list of courses
    FFP.$courses.each(function () {
        var $course = $(this);
        // Check if the current course is inactive
        var isInactive = $course.find('div.row').eq(3).find('div')
            .eq(1).text().trim().toLowerCase() === 'inactive';

        // Hides Inactives
        if (isInactive && !areInactivesHidden) {
            $course.addClass('inactive').hide();
        }
        // Shows Inactives
        else {
            $course.removeClass('inactive').show();
        }
    });

    // Update the Caption for the next toggle state
    if(areInactivesHidden)
        $btn.text(FFP.strings.menu.btnToggleInactives.on).data('inactives', 'on');
    else
        $btn.text(FFP.strings.menu.btnToggleInactives.off).data('inactives', 'off');
};

FFP.fn.getRawCourses = function() {
    var $r = $.Deferred();
    setTimeout(function() {
        // Try up to FFP.counters.maxRawCoursesAttempts times to get the courses list
        while(FFP.counters.rawCoursesAttempts < FFP.counters.maxRawCoursesAttempts) {
            FFP.$courses = $('[data-bind="foreach: courses"]');
            if(FFP.$courses.children().length) {
                // It means that children were found
                $r.resolve();
                break;
            }
            FFP.counters.rawCoursesAttempts++;
        }
    }, 200);
    return $r.promise();
};

/**
 * Set Perks
 */
FFP.fn.setPerks = function() {
    var perks = [
        // [function() {}, true|false ]
    ];
    // Execute all perks
    $.each(perks, function(){
        if(this[1] && typeof this[0] === 'function') this[0]();
    });
};

/**
 * Disable Welcome Tour dialog
 */
(function() {
    var c = Utils.getCookie("epic-welcome-tour");

    if(c !== 'forget') {
        document.cookie = "epic-welcome-tour=forget; expires=session; path=/Learn";
        location.reload();
    }

})();

$(document).ready(function () {
    // Since some times content loads async it may not be available yet so try again
    FFP.fn.getRawCourses()
        .done(FFP.fn.init)
        .fail(function(){
            FFP.debug && console.log('Fail');
        }
    );
});
