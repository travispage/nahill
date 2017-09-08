/* ====== SHARED VARS ====== */

var ua = navigator.userAgent,
    isiPhone = false,
    isiPod = false,
    isAndroidPhone = false,
    android = false,
    iOS = false,
    is_ie = false,
    ieMobile = false,
    isSafari = false,
    isMac = false,
    // useful logs in the console
    globalDebug = false;

(function($, window, undefined) {

    var Chameleon = {
        prepared: false,
        color: null,
        offset: 0,

        prepare: function() {

            var that = this;

            this.offset = parseInt($('.logo').css('top'));
            this.header = $('.header');
            this.sections = $('body').children('.hero, .content, .footer').not('.hero--missing');

            this.sections.each(function(i, section) {

                var $section = $(section);

                if ($section.is('.content')) {
                    $section.data('top', $section.offset().top - parseInt($section.css('marginTop')));
                } else {
                    $section.data('top', $section.offset().top);
                }

                if ($section.is('.content, .hero--dark, .hero--shadowed')) {
                    $section.data('textColor', 'dark');
                } else {
                    $section.data('textColor', 'light');
                }

                if (i == 0) {
                    that.color = $section.data('textColor');
                }

            });

            this.prepared = true;
            this.update();

        },

        update: function() {

            var that = this;

            if (!this.prepared) {
                this.prepare();
                return;
            }

            this.sections.each(function(i, section) {
                var $section = $(section);

                if (latestKnownScrollY + that.offset >= $section.data('top')) {
                    that.color = $section.data('textColor');
                }
            });

            if (this.color == 'light') {
                this.header.addClass('header--inverse');
            } else {
                this.header.removeClass('header--inverse');
            }

        }
    };
    /* --- GMAP Init --- */

    // Overwrite Math.log to accept a second optional parameter as base for logarithm
    Math.log = (function() {
        var log = Math.log;
        return function(n, base) {
            return log(n) / (base ? log(base) : 1);
        };
    })();

    function get_url_parameter(needed_param, gmap_url) {
        var sURLVariables = (gmap_url.split('?'))[1];
        if (typeof sURLVariables === "undefined") {
            return sURLVariables;
        }
        sURLVariables = sURLVariables.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == needed_param) {
                return sParameterName[1];
            }
        }
    }

    function get_newMap_oldUrl_coordinates(url) {
        var coordinates = {},
            temp_coords,
            temp_zoom;

        temp_coords = url.split('!3d');
        temp_coords = temp_coords[1];
        temp_coords = temp_coords.split('!4d');

        // Get the first part of the temp_coords array which is the latitude
        coordinates.latitude = temp_coords[0];

        // Get the second part of the temp_coords, before the zoom level, which is the longitude
        temp_coords[1] = temp_coords[1].split('?')[0];
        coordinates.longitude = temp_coords[1];

        // Get the zoom level
        // Get the whole coordinates including the zoom
        temp_zoom = url.split('@');
        temp_zoom = temp_zoom[1];
        // Remove the part after the coordinates
        temp_zoom = temp_zoom.split('/');
        temp_zoom = temp_zoom[0];
        // Split the coordinates and get only the zoom level
        temp_zoom = temp_zoom.split(',');
        temp_zoom = temp_zoom[2];
        // Take off the z part
        if (temp_zoom.indexOf('z') >= 0) {
            temp_zoom = temp_zoom.substring(0, temp_zoom.length - 1);
        }
        coordinates.zoom = temp_zoom;

        return coordinates;
    }

    function get_newMap_newUrl_coordinates(url) {
        var coordinates = {};

        url = url.split('@')[1];
        url = url.split('z/')[0];
        url = url.split(',');

        coordinates.latitude = url[0];
        coordinates.longitude = url[1];
        coordinates.zoom = url[2];

        if (coordinates.zoom.indexOf('z') >= 0) {
            coordinates.zoom = coordinates.zoom.substring(0, coordinates.zoom.length - 1);
        }

        return coordinates;
    }

    function get_oldMap_coordinates(url) {
        var coordinates = {},
            variables;

        variables = get_url_parameter('ll', url);
        if (typeof variables == "undefined") {
            variables = get_url_parameter('sll', url);
        }

        if (typeof variables == "undefined") {
            return variables;
        }

        variables = variables.split(',');
        coordinates.latitude = variables[0];
        coordinates.longitude = variables[1];

        coordinates.zoom = get_url_parameter('z', url);
        if (typeof coordinates.zoom === "undefined") {
            coordinates.zoom = 10;
        }

        return coordinates;
    }

    var gmapInit = function($element) {
        var $gmaps = $element.find('.gmap'),
            $imageMarkup = $('.js-map-pin').html();

        if ($gmaps.length && typeof google !== 'undefined') {
            if (globalDebug) {
                console.log("GMap Init");
            }

            $gmaps.each(function() {

                var $gmap = $(this),
                    links = {},
                    gmap_style = typeof $gmap.data('customstyle') !== "undefined" ? "style1" : google.maps.MapTypeId.ROADMAP,
                    pins = [],
                    zoom = 10,
                    linksNumber = 0;

                links = $gmap.data('pins');

                $.each(links, function(label, url) {
                    var coordinates;
                    if (url) {
                        coordinates = get_oldMap_coordinates(url);
                        if (typeof variables == "undefined") {
                            coordinates = url.split('!3d')[0] !== url ? get_newMap_oldUrl_coordinates(url) : get_newMap_newUrl_coordinates(url);
                        }
                        if (typeof coordinates !== "undefined" && coordinates.latitude && coordinates.longitude) {
                            pins.push({
                                latLng: [coordinates.latitude, coordinates.longitude],
                                options: {
                                    content: '<div class="gmap__marker"><div class="gmap__marker__btn">' + label + '</div>' + $imageMarkup + '</div>'
                                }
                            });
                            if (coordinates.zoom !== "undefined" && ++linksNumber === 1) {
                                zoom = parseInt(coordinates.zoom);
                            }
                        }
                    }
                });

                // if there were no pins we could handle get out
                if (!pins.length) {
                    return;
                }

                $gmap.gmap3({
                    map: {
                        options: {
                            zoom: zoom,
                            mapTypeId: gmap_style,
                            mapTypeControl: false,
                            panControl: true,
                            panControlOptions: {
                                position: google.maps.ControlPosition.LEFT_CENTER
                            },
                            zoomControl: true,
                            zoomControlOptions: {
                                style: google.maps.ZoomControlStyle.LARGE,
                                position: google.maps.ControlPosition.LEFT_CENTER
                            },
                            scaleControl: true,
                            streetViewControl: true,
                            streetViewControlOptions: {
                                position: google.maps.ControlPosition.LEFT_CENTER
                            },
                            scrollwheel: false
                        }
                    },
                    overlay: {
                        values: pins
                    },
                    styledmaptype: {
                        id: "style1",
                        styles: [{
                            "stylers": [{
                                "saturation": -100
                            }, {
                                "gamma": 0.8
                            }, {
                                "contrast": 1.35
                            }, {
                                "visibility": "simplified"
                            }]
                        }, {
                            "featureType": "administrative",
                            "stylers": [{
                                "visibility": "on"
                            }]
                        }]
                    }
                }, "autofit");

                var map = $gmap.gmap3("get");

                google.maps.event.addListenerOnce(map, 'idle', function() {
                    if (typeof map == "undefined") return;

                    if (1 < pins.length) {
                        map.setZoom(map.getZoom() - 1);
                    } else {
                        map.setZoom(zoom);
                    }
                });

            });

        }
    };

    //global isotope variables

    function isotopeInit() {

        $('.masonry').each(function(i, obj) {

            var $isotope_container = $(obj),
                max_isotope_pages = $isotope_container.data('maxpages'),
                is_everything_loaded = false,
                isotope_page_counter,
                isotope_ready_to_filter, /* will use this variable to determine if we can filter */
                $isotope_pending_filter = null;;


            isotopeRun();

            //force the infinite scroll to wait for the first images to lead before doing it's thing
            if ($isotope_container.hasClass('infinite_scroll')) {
                $isotope_container.imagesLoaded(function() {
                    isotopeInfiniteScrollingInit();
                });
            }

            bindEvents();
            isotopeFilteringInit();


            /* --- Isotope Run --- */

            function isotopeRun() {

                if (!empty($isotope_container) && $isotope_container.length) {

                    if (globalDebug) {
                        console.log("Isotope Initialization (isotopeRun)");
                    }

                    $isotope_container.isotope({
                        speed: 200,
                        easing: 'ease-out',
                        itemSelector: '.masonry__item',
                        layoutMode: 'masonry',
                        isOriginLeft: !$('body').hasClass('rtl'),
                        // control here the style for hiding and showing, see http://isotope.metafizzy.co/beta/options.html
                        transitionDuration: '0.4s',
                        hiddenStyle: {
                            opacity: 0,
                            transform: 'scale(0.5)'
                        },
                        visibleStyle: {
                            opacity: 1,
                            transform: 'scale(1)'
                        }
                    });
                }
            }

            function bindEvents() {
                $isotope_container.isotope('on', 'arrangeComplete', function() {
                    Parallax.initialize();
                });

                $isotope_container.isotope('on', 'layoutComplete', function() {
                    $('.archive-blog').addClass('loaded');
                });
            }

            function infiniteScrollCallback(newElements, data, url) {

                newElements.forEach(function(e) {
                    $(e).css('opacity', 0);
                });

                var $newElems = $(newElements);

                isotope_ready_to_filter = false;

                // ensure that images load before adding to masonry layout
                $newElems.imagesLoaded(function() {

                    $isotope_container.isotope('appended', $newElems);

                    isotope_ready_to_filter = true;

                    isotope_page_counter++;

                    if (isotope_page_counter == max_isotope_pages) {
                        $('.load-more__container').fadeOut('slow');

                        // we've pretty much finished with the infiniteScroll
                        $isotope_container.infinitescroll('destroy');
                    } else {
                        // remove the loading class as we have finished
                        $('.load-more__container .btn').removeClass('loading');
                    }

                    //check if we have a pending filter - fire it if that is the case
                    if (!empty($isotope_pending_filter)) {
                        $isotope_pending_filter.trigger('click');
                    }

                    $('.covers .hero__bg').hide();
                    setTimeout(function() {
                        $('.covers .hero__bg').show();
                        reload();
                    }, 500);
                });

                // rebind animations on hover events
                bindProjectsHover();
            }

            /* -- Isotope Infinite Scrolling Initialization --- */

            function isotopeInfiniteScrollingInit() {
                if (globalDebug) {
                    console.log("Isotope Infinite Scroll Init");
                }

                isotope_page_counter = 1;

                // if all projects are already loaded, no infinite scroll is required
                if ($isotope_container.data('projects-per-page') >= $isotope_container.data('total-posts')) {
                    $isotope_container.siblings('.load-more__container').hide();
                }

                $isotope_container.infinitescroll({
                        navSelector: 'ol.pagination', // selector for the paged navigation
                        nextSelector: 'ol.pagination a.next', // selector for the NEXT link
                        itemSelector: 'article.project', // selector for all items you'll retrieve
                        loading: {
                            finished: undefined,
                            finishedMsg: objectl10n.infscrReachedEnd,
                            img: "",
                            msg: null,
                            msgText: objectl10n.infscrLoadingText,
                            selector: null,
                            speed: 'fast',
                            start: undefined
                        },
                        debug: globalDebug,
                        prefill: false,
                        maxPage: max_isotope_pages,
                        errorCallback: function() {}
                    },
                    infiniteScrollCallback);

                if ($isotope_container.hasClass('infinite_scroll_with_button')) {
                    infiniteScrollingOnClick($isotope_container);
                }
            }

            function infiniteScrollingOnClick($container) {
                // unbind normal behavior. needs to occur after normal infinite scroll setup.
                $(window).unbind('.infscr');

                $('.load-more__container .btn').click(function() {

                    $(this).addClass('loading');
                    $container.infinitescroll('retrieve');

                    return false;
                });

                // remove the paginator when we're done.
                $(document).ajaxError(function(e, xhr, opt) {
                    if (xhr.status == 404) {
                        $('.load-more__container').fadeOut('slow');
                    }
                });
            }

            /* --- Portfolio filtering --- */

            function isotopeFilteringInit() {
                if (globalDebug) {
                    console.log("Isotope Filtering Init");
                }

                isotope_ready_to_filter = true;


                $('.filter, .filter__tags-container').addClass('usable');

                // bind filter buttons on click
                $('#filters').on('click', 'button', function(e) {
                    e.preventDefault();

                    //make sure that we reset the pending filter
                    $isotope_pending_filter = null;

                    if (isotope_ready_to_filter === true) { //only proceed if we are in a ready state

                        var filterValue = $(this).attr('data-filter');

                        //make sure the current filter is marked as selected
                        $('.filter__tags.current button').removeClass('selected');
                        $(this).addClass('selected');

                        //some checks
                        if (max_isotope_pages == isotope_page_counter) {
                            //we have already loaded all the pages
                            is_everything_loaded = true;
                        }

                        if (globalDebug) {
                            console.log("Isotope Page Counter = " + isotope_page_counter + " | Max Pages = " + max_isotope_pages);
                        }

                        if (!is_everything_loaded) { //we need to do some loading
                            if (globalDebug) {
                                console.log("Isotope Filtering - Loading the rest of the pages so we can start filtering");
                            }

                            //we need to force the loading of the next page
                            //first we need to remember this filter button
                            $isotope_pending_filter = $(this);
                            //now fire up the infiniteScroll
                            $(this).addClass('loading');
                            $isotope_container.infinitescroll('retrieve');

                        } else { //all is good, just filter
                            if (globalDebug) {
                                console.log("Isotope Filtering - Filter by " + filterValue);
                            }

                            $isotope_container.isotope({
                                filter: filterValue
                            });
                        }

                    } else {
                        if (globalDebug) {
                            console.log("Isotope Filtering - NOT READY TO FILTER");
                        }
                    }

                    return false;

                }); //end filtering on click
            }
        });
    }

    /* --- Magnific Popup Initialization --- */

    function magnificPopupInit() {
        if (globalDebug) {
            console.log("Magnific Popup - Init");
        }

        $('.content').each(function() { // the containers for all your galleries should have the class gallery
            $(this).magnificPopup({
                delegate: 'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"]', // the container for each your gallery items
                type: 'image',
                closeOnContentClick: false,
                closeBtnInside: false,
                removalDelay: 500,
                mainClass: 'mfp-fade',
                image: {
                    markup: '<div class="mfp-figure">' +
                        '<div class="mfp-img"></div>' +
                        '<div class="mfp-bottom-bar">' +
                        '<div class="mfp-counter"></div>' +
                        '<div class="mfp-title"></div>' +
                        '</div>' +
                        '</div>',
                    titleSrc: function(item) {
                        var output = '';
                        if (typeof item.el.attr('data-alt') !== "undefined" && item.el.attr('data-alt') !== "") {
                            output += '<small>' + item.el.attr('data-alt') + '</small>';
                        }
                        return output;
                    }
                },
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                    //arrowMarkup: '<a href="#" class="gallery-arrow gallery-arrow--%dir% control-item arrow-button arrow-button--%dir%">%dir%</a>'
                    tCounter: '%curr% ' + objectl10n.tCounter + ' %total%'
                },
                callbacks: {
                    elementParse: function(item) {

                        if (this.currItem != undefined) {
                            item = this.currItem;
                        }

                        var output = '';
                        if (typeof item.el.attr('data-alt') !== "undefined" && item.el.attr('data-alt') !== "") {
                            output += '<small>' + item.el.attr('data-alt') + '</small>';
                        }

                        $('.mfp-title').html(output);
                    },
                    change: function(item) {
                        var output = '';
                        if (typeof item.el.attr('data-alt') !== "undefined" && item.el.attr('data-alt') !== "") {
                            output += '<small>' + item.el.attr('data-alt') + '</small>';
                        }

                        $('.mfp-title').html(output);
                    },
                    open: function() {
                        $('html').addClass('mfp--is-open');

                        $('html').bind('touchmove', function(e) {
                            e.preventDefault()
                        })
                    },
                    close: function() {
                        $('html').removeClass('mfp--is-open');

                        $('html').unbind('touchmove');
                    }
                }
            });
        });

        $('.js-gallery').each(function() { // the containers for all your galleries should have the class gallery
            $(this).magnificPopup({
                delegate: '.mfp-image, .mfp-video', // the container for each your gallery items
                mainClass: 'mfp-fade',
                closeOnBgClick: true,
                closeBtnInside: false,
                image: {
                    markup: '<div class="mfp-figure">' +
                        '<div class="mfp-img"></div>' +
                        '<div class="mfp-bottom-bar">' +
                        '<div class="mfp-counter"></div>' +
                        '<div class="mfp-title"></div>' +
                        '</div>' +
                        '</div>'
                },
                iframe: {
                    markup: '<div class="mfp-figure">' +
                        '<div class="mfp-iframe-scaler">' +
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
                        '</div>' +
                        '<div class="mfp-bottom-bar">' +
                        '<div class="mfp-counter"></div>' +
                        '<div class="mfp-title mfp-title--video"></div>' +
                        '</div>' +
                        '</div>',
                    patterns: {
                        youtube: {
                            index: 'youtube.com/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).
                            id: function(url) {
                                var video_id = url.split('v=')[1];
                                var ampersandPosition = video_id.indexOf('&');
                                if (ampersandPosition != -1) {
                                    video_id = video_id.substring(0, ampersandPosition);
                                }

                                return video_id;
                            }, // String that splits URL in a two parts, second part should be %id%
                            // Or null - full URL will be returned
                            // Or a function that should return %id%, for example:
                            // id: function(url) { return 'parsed id'; }
                            src: '//www.youtube.com/embed/%id%' // URL that will be set as a source for iframe.
                        },
                        youtu_be: {
                            index: 'youtu.be/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).
                            id: '.be/', // String that splits URL in a two parts, second part should be %id%
                            // Or null - full URL will be returned
                            // Or a function that should return %id%, for example:
                            // id: function(url) { return 'parsed id'; }
                            src: '//www.youtube.com/embed/%id%' // URL that will be set as a source for iframe.
                        },

                        vimeo: {
                            index: 'vimeo.com/',
                            id: '/',
                            src: '//player.vimeo.com/video/%id%'
                        },
                        gmaps: {
                            index: '//maps.google.',
                            src: '%id%&output=embed'
                        }
                        // you may add here more sources
                    },
                    srcAction: 'iframe_src' // Templating object key. First part defines CSS selector, second attribute. "iframe_src" means: find "iframe" and set attribute "src".
                },
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                    tCounter: '%curr% ' + objectl10n.tCounter + ' %total%'
                },
                callbacks: {
                    change: function(item) {
                        $(this.content).find('iframe').each(function() {
                            var url = $(this).attr("src");
                            $(this).attr("src", setQueryParameter(url, "wmode", "transparent"));
                        });
                    },
                    elementParse: function(item) {
                        if (globalDebug) {
                            console.log("Magnific Popup - Parse Element");
                        }

                        $(item).find('iframe').each(function() {
                            var url = $(this).attr("src");
                            $(this).attr("src", url + "?wmode=transparent");
                        });
                    },
                    markupParse: function(template, values, item) {
                        values.title = '<span class="title">' + item.el.attr('data-title') + '</span>' + '<span class="description">' + item.el.attr('data-caption') + '</span>';
                    },
                    open: function() {
                        $('html').addClass('mfp--is-open');

                        $('html').bind('touchmove', function(e) {
                            e.preventDefault()
                        })
                    },
                    close: function() {
                        $('html').removeClass('mfp--is-open');

                        $('html').unbind('touchmove');
                    }
                }
            });
        });

    }

    function navigationInit() {

        var showingNav = false,
            $trigger = $('.navigation__trigger, .navigation__menu-label'),
            $navTrigger = $('.navigation__trigger'),
            $triggerTop = $navTrigger.children('.trigger__top'),
            $triggerMiddle = $navTrigger.children('.trigger__middle'),
            $triggerBottom = $navTrigger.children('.trigger__bottom'),
            $nav = $('.overlay--navigation'),
            $current = $('.menu--main-menu').children('[class*="current-menu"]').children('a'),
            isOpen = false,
            $horMenu = $('.js-horizontal-menu');

        $current.wrapInner('<span class="menu__item--current"></span>');
        /**
         * This is not such a good idea since the class "current-menu" is added also on parents and ancestors which
         * cannot be accessed anymore if we disable the click
         */
        //$current.on('click', function (e) {
        //	e.preventDefault();
        //	e.stopPropagation();
        //});

        $trigger.on('mouseenter', function(e) {

            if (isOpen) {
                TweenMax.to($navTrigger, 0.15, {
                    scale: 0.8
                });
            } else {
                TweenMax.to($triggerTop, 0.15, {
                    y: -3,
                    ease: Quad.easeOut
                });
                TweenMax.to($triggerBottom, 0.15, {
                    y: 3,
                    ease: Quad.easeOut
                });
            }

        });

        $trigger.on('mouseleave', function(e) {

            if (isOpen) {
                TweenMax.to($navTrigger, 0.15, {
                    scale: 1
                });
            } else {
                TweenMax.to($triggerTop, 0.15, {
                    y: 0,
                    ease: Power4.easeOut
                });
                TweenMax.to($triggerBottom, 0.15, {
                    y: 0,
                    ease: Power4.easeOut
                });
            }

        });

        // On overlay navigation, close any open sub menu
        // when clicking on anything but a menu item
        $nav.on('click', function(event) {
            if (!$(event.target).is('.menu-item > a')) {
                $('.menu-item').removeClass('open');
            }
        });

        $('.navigation__links-trigger').on('click', function() {
            $(this).toggleClass('active');
        });

        // Toggle navigation on click
        $trigger.on('click  touchstart', navToggle);

        // Close menu with ESC key
        $(document).on('keydown', function(e) {
            if (e.keyCode == 27 && isOpen) {
                navToggle(e);
            }
        });

        function navToggle(e) {
            e.preventDefault();
            e.stopPropagation();

            var $label = $('.navigation__menu-label'),
                $open = $label.find('.label--open'),
                $close = $label.find('.label--close'),
                tl1,
                tl2;

            showingNav = !showingNav;

            if (showingNav) {

                TweenMax.to($nav, 0.3, {
                    opacity: 1,
                    onStart: function() {
                        $nav.css('transform', 'translateY(0)');
                    }
                });

                $html.css('overflow', 'hidden');

                $('.header').addClass('header--inverse-important');
                $label.addClass('is--toggled');
                $horMenu.addClass('is--toggled');

                tl1 = new TimelineMax({
                    paused: true
                });

                tl1.to($triggerTop, 0.2, {
                    rotation: 45,
                    y: 7,
                    force3D: true
                });
                tl1.to($triggerMiddle, 0.2, {
                    opacity: 0
                }, '-=0.2');
                tl1.to($triggerBottom, 0.2, {
                    rotation: -45,
                    y: -7,
                    force3D: true
                }, '-=0.2');

                tl1.to($navTrigger, 0.2, {
                    scale: 0.8
                }, '-=0.1');
                tl1.to($navTrigger, 0.2, {
                    scale: 1,
                    ease: Quad.easeOut
                });

                showMenuLabel();

                tl1.play();

                isOpen = true;

            } else {

                if (latestKnownScrollY > 60) showMenuLinks(true);

                TweenMax.to($nav, 0.3, {
                    opacity: 0,
                    onComplete: function() {
                        $nav.css('transform', 'translateY(100%)');
                        $('.js-main-menu > li').removeClass('open');
                    }
                });

                $html.css('overflow', '').removeClass('nav--is-visible');

                $('.header').removeClass('header--inverse-important');
                $label.removeClass('is--toggled');
                $horMenu.removeClass('is--toggled');

                tl2 = new TimelineMax({
                    paused: true
                });

                tl2.to($triggerTop, 0.2, {
                    rotation: 0,
                    y: 0,
                    force3D: true
                });
                tl2.to($triggerMiddle, 0.2, {
                    opacity: 1
                }, '-=0.2');
                tl2.to($triggerBottom, 0.2, {
                    rotation: 0,
                    y: 0,
                    force3D: true
                }, '-=0.2');

                tl2.to($navTrigger, 0.2, {
                    scale: 1,
                    force3D: true
                });

                tl2.play();

                isOpen = false;
            }
        }

        (function() {
            if (Modernizr.touchevents) {
                $('.site-navigation .menu-item-has-children > a').on('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $('.js-main-menu > li').removeClass('open');
                    $(this).parent().addClass('open');
                });
            }
        })();

        // double tab link problem in iOS
        // http://davidwalsh.name/ios-hover-menu-fix
        // http://stackoverflow.com/questions/25731106/ios-requires-double-tap-for-a-simple-link-element
        $('.menu-item > a').on('touchstart mouseenter focus', function(e) {
            if (e.type == 'touchstart') {
                // Don't trigger mouseenter even if they hold
                e.stopImmediatePropagation();
            }
        })

        var latestKnownScrollY = 0,
            lastKnownScrollY = 0,
            scrollDirection = 'down',
            $label = $('.navigation__menu-label'),
            $links = $('.navigation__links'),
            $hasNavLinks = $links.find('ul').children().length,
            duration = 0.3,
            timeline = new TimelineMax({
                paused: true
            });


        function showMenuLinks(forced) {
            if ($hasNavLinks && $horMenu.length) {
                TweenMax.to($horMenu, duration, {
                    y: -40,
                    opacity: 0
                });
            } else {
                TweenMax.to($label, duration, {
                    y: -40,
                    opacity: 0
                });
            }

            if (forced) {
                if ($hasNavLinks && $horMenu.length) {
                    TweenMax.to($horMenu, 0, {
                        y: -40,
                        opacity: 0
                    });
                } else {
                    TweenMax.to($label, 0, {
                        y: -40,
                        opacity: 0
                    });
                }
            }

            TweenMax.to($links, duration, {
                y: 0,
                opacity: 1,
                pointerEvents: 'auto'
            });
        }

        function showMenuLabel() {
            if ($hasNavLinks && $horMenu.length) {
                TweenMax.to($horMenu, duration, {
                    y: 0,
                    opacity: 1
                });
            } else {
                TweenMax.to($label, duration, {
                    y: 0,
                    opacity: 1
                });
            }

            $('.navigation__links-trigger').removeClass('active');

            TweenMax.to($links, duration, {
                y: 40,
                opacity: 0,
                pointerEvents: 'none'
            });
        }

        $(window).on('scroll', function() {
            latestKnownScrollY = $window.scrollTop();

            scrollDirection = latestKnownScrollY > lastKnownScrollY ? 'down' : 'up';

            if (latestKnownScrollY < 40 && scrollDirection == 'up') {
                showMenuLabel();
            }

            if (latestKnownScrollY > 60 && scrollDirection == 'down') {
                showMenuLinks();
            }

            lastKnownScrollY = latestKnownScrollY;
        });
    }

    var HandleSubmenusOnTouch = (function() {

        var $theMenu,
            $theUsualSuspects,
            $theUsualAnchors,
            isInitiated = false;

        // Sub menus will be opened with a click on the parent
        // The second click on the parent will follow parent's link
        function init($menu) {
            if (isInitiated) return;

            $theMenu = $menu;
            $theUsualSuspects = $theMenu.find('li[class*="children"]');
            $theUsualAnchors = $theUsualSuspects.find('> a');

            unbind();
            bindOuterNavClick();

            // Make sure there are no open menu items
            $theUsualSuspects.removeClass('hover');

            $theUsualAnchors.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if ($(this).hasClass('active')) {
                    window.location.href = $(this).attr('href');
                }

                $theUsualAnchors.removeClass('active');
                $(this).addClass('active');

                // When a parent menu item is activated,
                // close other menu items on the same level
                $(this).parent().siblings().removeClass('hover');

                // Open the sub menu of this parent item
                $(this).parent().addClass('hover');
            });

            isInitiated = true;
        }

        function unbind() {
            $theUsualAnchors.unbind();
            isInitiated = false;
        }

        // When a sub menu is open, close it by a touch on
        // any other part of the viewport than navigation.
        // use case: normal, horizontal menu, touch events,
        // sub menus are not visible.
        function bindOuterNavClick() {
            $('body').on('touchstart', function(e) {
                var container = $theMenu;

                if (!container.is(e.target) // if the target of the click isn't the container...
                    &&
                    container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    $theUsualSuspects.removeClass('hover');
                    $theUsualAnchors.removeClass('active');
                }
            });
        }

        return {
            init: init
        }
    }());

    function niceScrollInit() {

        var smoothScroll = $('body').data('smoothscrolling') !== undefined;

        if (smoothScroll && !Modernizr.touchevents && !ieMobile && !iOS && !isMac) {

            var $window = $window || $(window); // Window object

            $window.on("mousewheel DOMMouseScroll", function(event) {

                var scrollTo,
                    scrollDistance = 400,
                    delta;

                if (event.type == 'mousewheel') {
                    delta = event.originalEvent.wheelDelta / 120;
                } else if (event.type == 'DOMMouseScroll') {
                    delta = -event.originalEvent.detail / 3;
                }

                scrollTo = latestKnownScrollY - delta * scrollDistance;

                if ($(event.target).closest('.overlay--navigation').length) {
                    return;
                }

                if (scrollTo) {

                    event.preventDefault();

                    TweenMax.to($window, .6, {
                        scrollTo: {
                            y: scrollTo,
                            autoKill: true
                        },
                        ease: Power1.easeOut, // For more easing functions see http://api.greensock.com/js/com/greensock/easing/package-detail.html
                        autoKill: true,
                        overwrite: 5
                    });

                }

            });

        }

    }


    var Parallax = {
        selector: '.js-hero-bg',
        covers: $([]),
        amount: 0,
        initialized: false,
        start: 0,
        stop: 0,

        initialize: function() {
            var that = this;

            $('.hero').each(function(i, hero) {

                var $hero = $(hero),
                    $cover = $hero.children('.hero__bg'),
                    $image = $cover.find('img').not('.gmap img, .js-pixslider img');

                $hero.find('.hero__bg').show();

                if (!$image.length) {
                    $image = $cover.children('picture').children('img');
                }

                if ($image.length) {

                    var imageWidth = $image.css('width', 'auto').outerWidth(),
                        imageHeight = $image.outerHeight(),
                        heroHeight = $hero.outerHeight(),
                        scaleX = windowWidth / imageWidth;
                    scaleY = windowHeight / imageHeight;
                    scale = Math.max(scaleX, scaleY);
                    newWidth = parseInt(imageWidth * scale);

                    $image.css({
                        top: (heroHeight - imageHeight * scale) / 2,
                        width: newWidth
                    });
                }

                // if this is a touch device initialize the slider and skip the complicated part
                if ((Modernizr.touchevents || is_ie) && !this.initialized) {
                    gmapInit($hero);

                    if (Modernizr.touchevents) {
                        $hero.on('click', function makeGmapActive() {
                            $(this).find('.gmap').addClass('active');
                        });
                    }

                    royalSliderInit($hero);
                }
            });

            if ((Modernizr.touchevents || is_ie) && !this.initialized) {
                return;
            }

            this.stop = documentHeight - windowHeight;
            this.amount = $body.data('parallax-speed');
            this.initialized = true;

            // clean up
            $('.covers').empty();

            $('.js-hero-bg').each(function(i, cover) {

                // grab all the variables we need
                var $cover = $(cover),
                    opacity = $cover.css('opacity'),
                    $target = $cover.children().not('span'),
                    $image = $target.filter('img'),
                    $slider = $target.not('img'),
                    $clone = $cover.clone(),
                    $cloneTarget = $clone.children().not('span'),
                    $cloneImage = $cloneTarget.filter('img'),
                    $cloneSlider = $cloneTarget.not('img'),
                    imageWidth = $image.outerWidth(),
                    imageHeight = $image.outerHeight(),
                    $hero = $cover.parent(),
                    heroHeight = $hero.outerHeight(),
                    heroOffset = $hero.offset(),
                    adminBar = parseInt($html.css('marginTop')),
                    amount = that.amount,

                    // we may need to scale the image up or down
                    // so we need to find the max scale of both X and Y axis
                    scaleX,
                    scaleY,
                    scale,
                    newWidth,
                    distance,
                    speeds = {
                        static: 0,
                        slow: 0.25,
                        medium: 0.5,
                        fast: 0.75,
                        fixed: 1
                    };

                $cover.removeAttr('style');
                $clone.data('source', $cover).appendTo('.covers').show();

                $clone.css('height', heroHeight);

                // let's see if the user wants different speed for different whateva'
                if (typeof parallax_speeds !== "undefined") {
                    $.each(speeds, function(speed, value) {
                        if (typeof parallax_speeds[speed] !== "undefined") {
                            if ($hero.is(parallax_speeds[speed])) {
                                amount = value;
                            }
                        }
                    });
                }

                scaleX = windowWidth / imageWidth;
                scaleY = (heroHeight + (windowHeight - heroHeight) * amount) / imageHeight;
                scale = Math.max(scaleX, scaleY);
                newWidth = parseInt(imageWidth * scale);
                distance = (windowHeight - heroHeight) * amount;

                // set the new width, the image should have height: auto to scale properly
                $cloneImage.css({
                    width: newWidth,
                    top: (heroHeight - imageHeight * scale) / 2,
                });

                // if there's a slider we are working with we may have to set the height
                $cloneSlider.css('height', heroHeight + distance);

                // align the clone to its surrogate
                // we use TweenMax cause it'll take care of the vendor prefixes
                TweenMax.to($clone, 0, {
                    y: heroOffset.top - adminBar
                });

                // prepare image / slider timeline
                var parallax = {
                        start: heroOffset.top - windowHeight,
                        end: heroOffset.top + heroHeight,
                        timeline: new TimelineMax({
                            paused: true
                        })
                    },
                    // the container timeline
                    parallax2 = {
                        start: 0,
                        end: documentHeight,
                        timeline: new TimelineMax({
                            paused: true
                        })
                    };

                // move the image for a parallax effect
                parallax.timeline.fromTo($cloneTarget, 1, {
                    y: '-=' + (windowHeight + heroHeight) * amount / 2
                }, {
                    y: '+=' + (windowHeight + heroHeight) * amount,
                    ease: Linear.easeNone,
                    force3D: true
                });

                parallax.timeline.fromTo($cloneSlider.find('.hero__content, .hero__caption'), 1, {
                    y: '+=' + windowHeight * amount
                }, {
                    y: '-=' + windowHeight * amount * 2,
                    ease: Linear.easeNone,
                    force3D: true
                }, '-=1');

                // move the container to match scrolling
                parallax2.timeline.fromTo($clone, 1, {
                    y: heroOffset.top
                }, {
                    y: heroOffset.top - documentHeight,
                    ease: Linear.easeNone,
                    force3D: true
                });

                // set the parallax info as data attributes on the clone to be used on update
                $clone
                    .data('parallax', parallax)
                    .data('parallax2', parallax2);

                // update progress on the timelines to match current scroll position
                that.update();

                // or the slider
                royalSliderInit($clone);
                gmapInit($clone);

                if (Modernizr.touchevents) {
                    $clone.on('click', function makeGmapActive() {
                        $(this).find('.gmap').addClass('active');
                    });
                }

            });

        },

        update: function() {

            if (Modernizr.touchevents || is_ie || latestKnownScrollY > this.stop || latestKnownScrollY < this.start) {
                return;
            }

            $('.covers .js-hero-bg').each(function(i, cover) {
                var $cover = $(cover),
                    parallax = $cover.data('parallax'),
                    parallax2 = $cover.data('parallax2'),
                    progress = (latestKnownScrollY - parallax.start) / (parallax.end - parallax.start),
                    progress2 = (latestKnownScrollY - parallax2.start) / (parallax2.end - parallax2.start);

                if (0 <= progress && 1 >= progress) {
                    parallax.timeline.progress(progress);
                }

                if (0 <= progress2 && 1 >= progress2) {
                    parallax2.timeline.progress(progress2);
                }
            });

        }
    };
    // Platform Detection
    function getIOSVersion(ua) {
        ua = ua || navigator.userAgent;
        return parseFloat(
            ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(ua) || [0, ''])[1])
            .replace('undefined', '3_2').replace('_', '.').replace('_', '')
        ) || false;
    }

    function getAndroidVersion(ua) {
        var matches;
        ua = ua || navigator.userAgent;
        matches = ua.match(/[A|a]ndroid\s([0-9\.]*)/);
        return matches ? matches[1] : false;
    }

    function detectIE() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // IE 12 => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }

    function platformDetect() {

        var navUA = navigator.userAgent.toLowerCase(),
            navPlat = navigator.platform.toLowerCase();

        var nua = navigator.userAgent;

        isiPhone = navPlat.indexOf("iphone");
        isiPod = navPlat.indexOf("ipod");
        isAndroidPhone = ((nua.indexOf('Mozilla/5.0') !== -1 && nua.indexOf('Android ') !== -1 && nua.indexOf('AppleWebKit') !== -1) && nua.indexOf('Chrome') === -1);
        isSafari = navUA.indexOf('safari') != -1 && navUA.indexOf('chrome') == -1;
        ieMobile = ua.match(/Windows Phone/i) ? true : false;
        iOS = getIOSVersion();
        android = getAndroidVersion();
        isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        is_ie = detectIE();

        if (Modernizr.touchevents) {
            $html.addClass('touch');
        }

        if (iOS && iOS < 8) {
            $html.addClass('no-scroll-fx')
        }

        if (is_ie) {
            $body.addClass('is--IE');
        }

        if (ieMobile) {
            $html.addClass('is--ie-mobile');
        }

        if (isAndroidPhone)
            $html.addClass('is--ancient-android');
    }
    /* --- $VIDEOS --- */

    // function used to resize videos to fit their containers by keeping the original aspect ratio
    function initVideos() {
        if (globalDebug) {
            console.group("videos::init");
        }

        var videos = $('.youtube-player, .entry-media iframe, .entry-media video, .entry-media embed, .entry-media object, iframe[width][height]');

        // Figure out and save aspect ratio for each video
        videos.each(function() {
            $(this).attr('data-aspectRatio', this.width / this.height)
                // and remove the hard coded width/height
                .removeAttr('height')
                .removeAttr('width');
        });

        resizeVideos();

        // Firefox Opacity Video Hack
        $('iframe').each(function() {
            var url = $(this).attr("src");
            if (!empty(url))
                $(this).attr("src", setQueryParameter(url, "wmode", "transparent"));
        });

        if (globalDebug) {
            console.groupEnd();
        }
    }

    function resizeVideos() {
        if (globalDebug) {
            console.group("videos::resize");
        }

        var videos = $('.youtube-player, .entry-media iframe, .entry-media video, .entry-media embed, .entry-media object, iframe[data-aspectRatio]');

        videos.each(function() {
            var video = $(this),
                ratio = video.attr('data-aspectRatio'),
                w = video.css('width', '100%').width(),
                h = w / ratio;

            video.height(h);
        });

        if (globalDebug) {
            console.groupEnd();
        }
    }
    /* --- Royal Slider Init --- */

    function royalSliderInit($container) {
        $container = typeof $container !== 'undefined' ? $container : $('body');

        // Transform Wordpress Galleries to Sliders
        $container.find('.wp-gallery').each(function() {
            sliderMarkupGallery($(this));
        });

        // Find and initialize each slider
        $container.find('.js-pixslider').each(function() {

            sliderInit($(this));

            var $sliderContainer = $(this),
                slider = $(this).data('royalSlider'),
                lastSlide = 0,
                // Sir Hackalot
                $sourceContent = $sliderContainer.closest('.hero__bg').data('source');

            if (typeof slider === "undefined" || !slider.slides.length) {
                return;
            }

            var firstSlide = slider.slides[0],
                firstSlideContent = $(firstSlide.content),
                $video = firstSlideContent.hasClass('video') ? firstSlideContent : firstSlideContent.find('.video'),
                firstSlideAutoPlay = typeof $video.data('video_autoplay') !== "undefined";

            if (Modernizr.touchevents) firstSlideAutoPlay = false;

            if (firstSlideAutoPlay) {
                firstSlide.holder.on('rsAfterContentSet', function() {
                    slider.playVideo();
                });
            }

            var $destination = $sliderContainer.parent(),
                $source = $(slider.currSlide.content).children();

            if ($destination.is('.js-projects-slider')) {
                $destination.removeClass('hero--light hero--shadowed hero--dark');
                $destination.toggleClass('hero--light', $source.hasClass('hero--light'));
                $destination.toggleClass('hero--shadowed', $source.hasClass('hero--shadowed'));
                $destination.toggleClass('hero--dark', $source.hasClass('hero--dark'));
            }

            slider.ev.on('rsBeforeAnimStart', function(event) {
                // transitions
                var $lastSlide = $(slider.slides[lastSlide].content),
                    timeline = new TimelineMax({
                        paused: true
                    }),
                    lastAbove, lastMain, lastBelow;

                if ($destination.is('.js-projects-slider')) {
                    $destination.removeClass('hero--light hero--shadowed hero--dark');
                }

                if (typeof $sourceContent == "undefined") {
                    if ($sliderContainer.closest('.hero__bg').siblings('.hero__content').length) {
                        $lastSlide = $sliderContainer.closest('.hero__bg').siblings('.hero__content');
                    }
                } else {
                    if ($sourceContent.siblings('.hero__content').length) {
                        $lastSlide = $sourceContent.siblings('.hero__content');
                    }
                }

                if (!$destination.is('.js-projects-slider') && slider.currSlideId == 0) {
                    return;
                }

                lastMain = $lastSlide.find('.hero__title, .huge, .large, .hero__description').first();
                lastAbove = lastMain.prevAll();
                lastBelow = lastMain.nextAll();

                if (typeof lastMain !== "undefined" || !lastMain.length) {
                    lastAbove = lastMain.prevAll();
                    lastBelow = lastMain.nextAll();

                    timeline.to(lastMain, .44, {
                        scale: 0.7,
                        z: 0.01,
                        ease: Power3.easeOut
                    });
                    timeline.to(lastAbove, .44, {
                        y: 40,
                        z: 0.01,
                        ease: Quad.easeOut
                    }, '-=.44');
                    timeline.to(lastBelow, .44, {
                        y: -40,
                        z: 0.01,
                        ease: Quad.easeOut
                    }, '-=.44');
                    timeline.to(lastMain, .34, {
                        opacity: 0,
                        ease: Quad.easeOut
                    }, '-=.34');
                    timeline.to(lastAbove, .34, {
                        opacity: 0,
                        ease: Quad.easeOut
                    }, '-=.34');
                    timeline.to(lastBelow, .34, {
                        opacity: 0,
                        ease: Quad.easeOut
                    }, '-=.34');

                    timeline.to(lastMain, 0, {
                        scale: 1,
                        z: 0.01
                    });
                    timeline.to(lastAbove, 0, {
                        opacity: 0,
                        y: 0,
                        z: 0.01
                    });
                    timeline.to(lastBelow, 0, {
                        opacity: 0,
                        y: 0,
                        z: 0.01
                    });
                } else {
                    nextBelow = $lastSlide.find('.hero__title, .hero__subtitle, .hero__btn, .hero__description');
                    timeline.to(nextBelow, 0, {
                        opacity: 1
                    });
                    timeline.fromTo(nextBelow, .45, {
                        y: 0,
                        z: 0.01
                    }, {
                        y: -40,
                        z: 0.01,
                        opacity: 0,
                        ease: Sine.easeOut
                    });
                }

                timeline.play();

                lastSlide = slider.currSlideId;
            });

            // auto play video sliders if is set so
            slider.ev.on('rsAfterSlideChange', function(event) {
                var $slide_content = $(slider.currSlide.content),
                    $video = $slide_content.hasClass('video') ? $slide_content : $slide_content.find('.video'),
                    rs_videoAutoPlay = typeof $video.data('video_autoplay') !== "undefined";

                //if (Modernizr.touchevents) rs_videoAutoPlay = false;

                if (rs_videoAutoPlay) {

                    setTimeout(function() {
                        slider.stopVideo();
                        slider.playVideo();
                    }, 150);
                }

                $destination = $sliderContainer.parent();
                $source = $(slider.currSlide.content).children();

                if ($destination.is('.js-projects-slider')) {
                    $destination.toggleClass('hero--light', $source.hasClass('hero--light'));
                    $destination.toggleClass('hero--shadowed', $source.hasClass('hero--shadowed'));
                    $destination.toggleClass('hero--dark', $source.hasClass('hero--dark'));
                }

                // transitions
                var $nextSlide = $(slider.currSlide.content),
                    timeline = new TimelineMax({
                        paused: true
                    }),
                    nextAbove, nextMain, nextBelow, letterspacing;

                if (typeof $sourceContent == "undefined") {
                    if ($sliderContainer.closest('.hero__bg').siblings('.hero__content').length) {
                        $nextSlide = $sliderContainer.closest('.hero__bg').siblings('.hero__content');
                    }
                } else {
                    if ($sourceContent.siblings('.hero__content').length) {
                        $nextSlide = $sourceContent.siblings('.hero__content');
                    }
                }

                if (!$destination.is('.js-projects-slider') && slider.currSlideId !== 0) {
                    return;
                }

                nextMain = $nextSlide.find('.hero__title, .huge, .large, .hero__description').first();
                nextAbove = nextMain.prevAll();
                nextBelow = nextMain.nextAll();

                if (typeof nextMain !== "undefined" && nextMain.length != 0) {
                    nextAbove = nextMain.prevAll();
                    nextBelow = nextMain.nextAll();

                    timeline.to(nextMain, 0, {
                        scale: 1,
                        z: 0.01
                    });
                    timeline.to(nextAbove, 0, {
                        opacity: 0,
                        y: 0,
                        z: 0.01
                    });
                    timeline.to(nextBelow, 0, {
                        opacity: 0,
                        y: 0,
                        z: 0.01
                    });

                    // Slides Content Transitions
                    // Title
                    timeline.fromTo(nextMain, .25, {
                        opacity: 0
                    }, {
                        opacity: 1
                    });
                    timeline.fromTo(nextMain, .45, {
                        'scale': 1.4,
                        z: 0.01
                    }, {
                        'scale': 1,
                        z: 0.01,
                        opacity: 1,
                        ease: Sine.easeOut
                    }, '-=.24');
                    // Subtitle
                    timeline.fromTo(nextAbove, .45, {
                        y: 40
                    }, {
                        y: 0,
                        z: 0.01,
                        opacity: 1,
                        ease: Back.easeOut
                    }, '-=.25');
                    // Description
                    timeline.fromTo(nextBelow, .45, {
                        y: -40
                    }, {
                        y: 0,
                        z: 0.01,
                        opacity: 1,
                        ease: Back.easeOut
                    }, '-=.45');
                } else {
                    nextBelow = $nextSlide.find('.hero__title, .hero__subtitle, .hero__btn, .hero__description');
                    timeline.to(nextBelow, 0, {
                        opacity: 0
                    });
                    timeline.fromTo(nextBelow, .45, {
                        y: -40,
                        z: 0.01
                    }, {
                        y: 0,
                        z: 0.01,
                        opacity: 1,
                        ease: Sine.easeOut
                    });
                }

                setTimeout(function() {
                    timeline.play();
                }, 150);
            });

            // after destroying a video remove the autoplay class (this way the image gets visible)
            slider.ev.on('rsOnDestroyVideoElement', function(i, el) {

                var $slide_content = $(this.currSlide.content),
                    $video = $slide_content.hasClass('video') ? $slide_content : $slide_content.find('.video');

                $video.removeClass('video_autoplay');

            });

            if (Modernizr.touchevents) {
                $window.on('resize', function() {
                    setTimeout(function() {
                        slider.updateSliderSize(true);
                    }, 100);
                });
            }

            if (typeof $sliderContainer.data('animated') == "undefined") {
                $sliderContainer.data('animated', true);
                setTimeout(function() {
                    animateIn($(firstSlide.content));
                }, 500);
            }

            $sliderContainer.imagesLoaded(function() {
                setTimeout(function() {
                    TweenMax.to($sliderContainer.find('.hero__bg'), .3, {
                        opacity: 1
                    });
                }, 1000);
            });


        });

    }

    /*
     * Slider Initialization
     */
    function sliderInit($slider) {
        if (globalDebug) {
            console.log("Royal Slider Init");
        }

        $slider.find('img').removeClass('invisible');

        var $children = $(this).children(),
            rs_arrows = typeof $slider.data('arrows') !== "undefined",
            rs_bullets = typeof $slider.data('bullets') !== "undefined" ? "bullets" : "none",
            rs_autoheight = typeof $slider.data('autoheight') !== "undefined",
            rs_autoScaleSlider = false,
            rs_autoScaleSliderWidth = typeof $slider.data('autoscalesliderwidth') !== "undefined" && $slider.data('autoscalesliderwidth') != '' ? $slider.data('autoscalesliderwidth') : false,
            rs_autoScaleSliderHeight = typeof $slider.data('autoscalesliderheight') !== "undefined" && $slider.data('autoscalesliderheight') != '' ? $slider.data('autoscalesliderheight') : false,
            rs_customArrows = typeof $slider.data('customarrows') !== "undefined",
            rs_slidesSpacing = typeof $slider.data('slidesspacing') !== "undefined" ? parseInt($slider.data('slidesspacing')) : 0,
            rs_keyboardNav = typeof $slider.data('fullscreen') !== "undefined",
            rs_imageScale = $slider.data('imagescale') || "fill",
            rs_visibleNearby = typeof $slider.data('visiblenearby') !== "undefined",
            rs_imageAlignCenter = typeof $slider.data('imagealigncenter') !== "undefined",
            //rs_imageAlignCenter = false,
            rs_transition = typeof $slider.data('slidertransition') !== "undefined" && $slider.data('slidertransition') != '' ? $slider.data('slidertransition') : 'fade',
            rs_transitionSpeed = 500,
            rs_autoPlay = typeof $slider.data('sliderautoplay') !== "undefined",
            rs_delay = typeof $slider.data('sliderdelay') !== "undefined" && $slider.data('sliderdelay') != '' ? $slider.data('sliderdelay') : '1000',
            rs_drag = true,
            rs_globalCaption = typeof $slider.data('showcaptions') !== "undefined",
            is_headerSlider = $slider.hasClass('hero-slider') ? true : false,
            hoverArrows = typeof $slider.data('hoverarrows') !== "undefined";

        if (rs_autoheight) {
            rs_autoScaleSlider = false;
        } else {
            rs_autoScaleSlider = true;
        }

        if (Modernizr.touchevents) rs_autoPlay = false;

        // Single slide case
        if ($children.length == 1) {
            rs_arrows = false;
            rs_bullets = 'none';
            rs_keyboardNav = false;
            rs_drag = false;
            rs_transition = 'fade';
            rs_customArrows = false;
        }

        // make sure default arrows won't appear if customArrows is set
        if (rs_customArrows) rs_arrows = false;

        //the main params for Royal Slider

        var royalSliderParams = {
            autoHeight: rs_autoheight,
            autoScaleSlider: rs_autoScaleSlider,
            loop: true,
            autoScaleSliderWidth: rs_autoScaleSliderWidth,
            autoScaleSliderHeight: rs_autoScaleSliderHeight,
            imageScaleMode: rs_imageScale,
            imageAlignCenter: rs_imageAlignCenter,
            slidesSpacing: rs_slidesSpacing,
            arrowsNav: rs_arrows,
            controlNavigation: rs_bullets,
            keyboardNavEnabled: rs_keyboardNav,
            arrowsNavAutoHide: false,
            sliderDrag: rs_drag,
            transitionType: rs_transition,
            transitionSpeed: rs_transitionSpeed,
            imageScalePadding: 0,
            autoPlay: {
                enabled: rs_autoPlay,
                stopAtAction: true,
                pauseOnHover: true,
                delay: rs_delay
            },
            globalCaption: rs_globalCaption,
            numImagesToPreload: 2
        };

        if (rs_visibleNearby) {
            royalSliderParams['visibleNearby'] = {
                enabled: true,
                //centerArea: 0.8,
                center: true,
                breakpoint: 0,
                //breakpointCenterArea: 0.64,
                navigateByCenterClick: false,
                addActiveClass: true
            }
        }

        // lets fire it up
        $slider.royalSlider(royalSliderParams);

        var royalSlider = $slider.data('royalSlider'),
            slidesNumber = royalSlider.numSlides,
            $arrows = $slider.find('.rsArrows');

        if (typeof $arrows !== "undefined" || !$arrows.length) {
            $arrows.remove();
        }

        // create the markup for the customArrows
        // it's not necessary it if we have only one slide
        if (royalSlider && rs_arrows && slidesNumber > 1) {

            var $gallery_control = $(
                '<div class="rsArrows">' +
                '<div class="rsArrow rsArrowLeft js-arrow-left"></div>' +
                '<div class="rsArrow rsArrowRight js-arrow-right"></div>' +
                '</div>'
            );


            $('.js-arrows-templates .svg-arrow--left').clone().appendTo($gallery_control.find('.js-arrow-left'));
            $('.js-arrows-templates .svg-arrow--right').clone().appendTo($gallery_control.find('.js-arrow-right'));

            $slider.find('.rsArrows').remove();
            $slider.nextAll('.rsArrows').remove();

            if ($slider.closest('.hero__bg').length) {
                $gallery_control.insertAfter($slider);
                $slider.find('.rsBullets').insertAfter($slider);
            } else {
                $gallery_control.appendTo($slider);
            }

            var timeline = new TimelineMax({
                    paused: true
                }),
                $left = $gallery_control.find('.svg-arrow--left'),
                $right = $gallery_control.find('.svg-arrow--right');

            timeline.fromTo($left, .5, {
                x: 50,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                ease: Back.easeOut
            });
            timeline.fromTo($right, .5, {
                x: -50,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                ease: Back.easeOut
            }, '-=.5');

            setTimeout(function() {
                timeline.play();
            }, 900);

            $left.parent().on('mouseenter', function() {
                TweenMax.to($left, .2, {
                    x: -6
                });
            }).on('mouseleave', function() {
                TweenMax.to($left, .2, {
                    x: 0
                })
            });

            $right.parent().on('mouseenter', function() {
                TweenMax.to($right, .2, {
                    x: 6
                });
            }).on('mouseleave', function() {
                TweenMax.to($right, .2, {
                    x: 0
                })
            });

            $gallery_control.on('click', '.js-arrow-left', function(event) {
                event.preventDefault();
                if ($('body').hasClass('rtl')) {
                    royalSlider.next();
                } else {
                    royalSlider.prev();
                }
            });

            $gallery_control.on('click', '.js-arrow-right', function(event) {
                event.preventDefault();
                if ($('body').hasClass('rtl')) {
                    royalSlider.prev();
                } else {
                    royalSlider.next();
                }
            });

        }

        if (slidesNumber == 1) {
            $slider.addClass('single-slide');
        }

        $slider.addClass('slider--loaded');
    }

    /*
     * Wordpress Galleries to Sliders
     * Create the markup for the slider from the gallery shortcode
     * take all the images and insert them in the .gallery <div>
     */
    function sliderMarkupGallery($gallery) {
        var $old_gallery = $gallery,
            gallery_data = $gallery.data(),
            $images = $old_gallery.find('img'),
            $new_gallery = $('<div class="pixslider js-pixslider">');

        $images.prependTo($new_gallery).addClass('rsImg');

        //add the data attributes
        $.each(gallery_data, function(key, value) {
            $new_gallery.attr('data-' + key, value);
        })

        $old_gallery.replaceWith($new_gallery);
    }

    /*
     Get slider arrows to hover, following the cursor
     */

    function hoverArrow($arrow) {
        var $mouseX = 0,
            $mouseY = 0;
        var $arrowH = 35,
            $arrowW = 35;

        $arrow.mouseenter(function(e) {
            $(this).addClass('visible');

            moveArrow($(this));
        });

        var $loop;

        function moveArrow($arrow) {
            var $mouseX;
            var $mouseY;

            $arrow.mousemove(function(e) {
                $mouseX = e.pageX - $arrow.offset().left - 40;
                $mouseY = e.pageY - $arrow.offset().top - 40;

                var $arrowIcn = $arrow.find('.rsArrowIcn');
                TweenMax.to($arrowIcn, 0, {
                    x: $mouseX,
                    y: $mouseY,
                    z: 0.01
                });
            });

            $arrow.mouseleave(function(e) {
                $(this).removeClass('visible').removeClass('is--scrolled');
                clearInterval($loop);
            });

            $(window).scroll(function() {
                if ($arrow.hasClass('visible')) {

                    $arrow.addClass('is--scrolled');

                    clearTimeout($.data(this, 'scrollTimer'));
                    $.data(this, 'scrollTimer', setTimeout(function() {
                        $arrow.removeClass('is--scrolled');
                    }, 100));
                }
            });
        }
    }

    function bindShareClick() {
        var tl = new TimelineLite({
                paused: true
            }),
            elements = $(".share-icons > li"),
            randomGap = .4;

        tl.to($('.overlay--share'), 0, {
            'y': 0
        });

        tl.to($('.overlay--share'), .2, {
            opacity: 1,
            pointerEvents: 'auto'
        });

        tl.fromTo('.share-title', .3, {
            y: 40,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            ease: Power4.easeOut
        });

        for (var i = 0; i < elements.length; i++) {
            tl.to(elements[i], .3, {
                y: 0,
                opacity: 1,
                ease: Back.easeOut
            }, 0.2 + Math.random() * randomGap);
        }

        $('.js-popup-share').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            TweenMax.to($('.overlay--share'), 0, {
                'display': 'table'
            });

            tl.play();
            $('html').css('overflow', 'hidden');
            $('.header').addClass('header--inverse-important');

            $('.navigation__links-trigger').removeClass('active');

            $(document).on('keyup', bindToEscape);
        });

        $('.share-icons').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        function animateOut() {
            tl.reverse();
            $(document).off('keyup', bindToEscape);
            $('html').css('overflow', '');

            setTimeout(function() {
                $('.header').removeClass('header--inverse-important');
            }, 300);
        }

        function bindToEscape(e) {
            if (e.keyCode == 27) {
                animateOut();
            }
        }

        $('.overlay--share').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            animateOut();
        });
    }
    (function($, sr) {

        // debouncing function from John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        var debounce = function(func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this,
                    args = arguments;

                function delayed() {
                    if (!execAsap)
                        func.apply(obj, args);
                    timeout = null;
                };

                if (timeout)
                    clearTimeout(timeout);
                else if (execAsap)
                    func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 200);
            };
        };

        jQuery.fn[sr] = function(fn) {
            return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
        };

    })(jQuery, 'smartresize');

    function smoothScrollTo(y, speed) {

        speed = typeof speed == "undefined" ? 1 : speed;

        var distance = Math.abs(latestKnownScrollY - y),
            time = speed * distance / 2000;

        TweenMax.to($(window), time, {
            scrollTo: {
                y: y,
                autoKill: true,
                ease: Quint.easeInOut
            }
        });
    }

    (function() {
        if (window.location.hash) {
            var hash = window.location.hash,
                target, distance;

            try {
                target = $(hash);
            } catch (error) {
                return;
            }

            if (!target.length) {
                return;
            }

            distance = target.offset().top

            setTimeout(function() {
                jQuery(window).scrollTop(0);
            }, 1);

            setTimeout(function() {
                smoothScrollTo(distance);
            }, 1200);
        }
    })();
    var $window = $(window),
        $document = $(document),
        $html = $('html'),
        $body = $('body'),
        // needed for browserSize
        windowWidth = $window.width(),
        windowHeight = $window.height(),
        documentHeight = $document.height(),
        aspectRatio = windowWidth / windowHeight,
        orientation = windowWidth > windowHeight ? 'landscape' : 'portrait',
        orientationChanged = false,
        headerHeight = $('.panel--logo').outerHeight(),
        // needed for requestAnimationFrame
        latestKnownScrollY = $window.scrollTop(),
        lastKnownScrollY = latestKnownScrollY,
        scrollDirection = 'down',
        ticking = false;

    function browserSize() {
        var newOrientation;

        windowWidth = $window.outerWidth();
        windowHeight = $window.outerHeight();
        documentHeight = $document.height();
        aspectRatio = windowWidth / windowHeight;
        newOrientation = windowWidth > windowHeight ? 'landscape' : 'portrait';

        if (newOrientation !== orientation) {
            orientationChanged = true;
        }

        orientation = newOrientation;
    }

    function onOrientationChange(firstTime) {

        firstTime = firstTime || false;

        if (!orientationChanged) {
            return;
        }

        if (orientationChanged || !!firstTime) {

            if (Modernizr.touchevents) {

                var $hero = $('#djaxHero, .hero-slider');

                $hero.removeAttr('style');
                $hero.attr('style', 'height: ' + $hero.outerHeight() + 'px !important');

                // trigger resize to let royal slider relayout
                $(window).trigger('resize');

            }

            Parallax.initialize();
            Chameleon.prepare();
        }

        orientationChanged = false;

    }

    function reload(firstTime) {
        if (globalDebug) {
            console.group("global::reload")
        }
        browserSize();
        resizeVideos();
        onOrientationChange(firstTime);
        if (!Modernizr.touchevents)
            VideoBackground.fill();

        function reloadUpdate() {
            browserSize();
            Parallax.initialize();
            Chameleon.prepare();
            onOrientationChange(firstTime);
        }

        if (firstTime === true) {
            reloadUpdate();
            if (globalDebug) {
                console.groupEnd()
            }
            return;
        }

        if (!Modernizr.touchevents) {
            reloadUpdate();
        }

        if (globalDebug) {
            console.groupEnd()
        }
    }

    $window.smartresize(reload);

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(update);
        }
        ticking = true;
    }

    function update() {
        ticking = false;

        Parallax.update();
        Chameleon.update();
    }

    /* ====== INTERNAL FUNCTIONS END ====== */


    /* ====== ONE TIME INIT ====== */

    function init() {
        if (globalDebug) {
            console.group("global::init");
        }

        //  GET BROWSER DIMENSIONS
        browserSize();

        // /* DETECT PLATFORM */
        platformDetect();

        loadAddThisScript();

        navigationInit();

        /* ONE TIME EVENT HANDLERS */
        eventHandlersOnce();

        /* INSTANTIATE EVENT HANDLERS */
        eventHandlers();

        if (globalDebug) {
            console.groupEnd();
        }
    }



    /* ====== CONDITIONAL LOADING ====== */

    function loadUp() {
        if (globalDebug) {
            console.group("global::loadup");
        }

        resizeVideos();
        magnificPopupInit();
        isotopeInit();

        if (!Modernizr.touchevents)
            VideoBackground.init();

        $('.pixcode--tabs').organicTabs();

        $('body').imagesLoaded(function() {
            royalSliderInit($('.hero__content'));
            royalSliderInit($('.content'));

            setTimeout(function() {
                reload(true);
            }, 60);
        });

        /*
         * Woocommerce Events support
         * */

        if (typeof woocommerce_events_handlers == 'function') {
            woocommerce_events_handlers();
        }

        if (globalDebug) {
            console.groupEnd();
        }
    }

    /* ====== EVENT HANDLERS ====== */

    function eventHandlersOnce() {
        if (globalDebug) {
            console.group("eventHandlers::once");
        }

        $('a[href="#top"]').on('click', function(e) {
            e.preventDefault();
            smoothScrollTo(0);
        });

        if (Modernizr.touchevents) {
            HandleSubmenusOnTouch.init($('.js-horizontal-menu'));
        }

        //copyrightOverlayInit();

        if (globalDebug) {
            console.groupEnd();
        }

    }

    function eventHandlers() {
        if (globalDebug) {
            console.group("eventHandlers");
        }

        bindShareClick();

        $(window).on("organicTabsChange", function(e) {
            browserSize();
            Parallax.initialize();
        });

        $('.js-arrow-down').on('click', function(e) {

            e.preventDefault();

            var height = $(this).closest('.hero').outerHeight();

            TweenMax.to('html, body', Math.abs(height) / 1500, {
                scrollTop: height,
                ease: Power2.easeOut
            });
        });

        $('.mies-item').not('.mies-share, .post').each(function(i, item) {

            var $item = $(this).find('.mies-item-wrap'),
                $border = $item.find('.mies-item-border'),
                $image = $item.find('img'),
                $content = $item.find('.mies-item-content'),
                $title = $item.find('.mies-item-title'),
                $meta = $item.find('.mies-item-meta'),
                itemHeight = $item.outerHeight(),
                itemWidth = $item.outerWidth();

            $(this).hover(function() {
                TweenMax.to($border, .2, {
                    borderTopWidth: 18,
                    borderRightWidth: 18,
                    borderBottomWidth: 18,
                    borderLeftWidth: 18,
                    'ease': Power3.easeOut
                });

                TweenMax.to($content, .2, {
                    opacity: 1,
                    'ease': Power3.easeOut
                }, '-=.2');

                TweenMax.fromTo($title, .2, {
                    y: -20
                }, {
                    y: 0
                }, '-=.2');

                TweenMax.fromTo($meta, .2, {
                    y: 20
                }, {
                    y: 0
                }, '-=.2');

                TweenMax.to($image, .2, {
                    'opacity': .35,
                    'ease': Power3.easeOut
                });

            }, function() {

                TweenMax.to($border, .2, {
                    borderTopWidth: 0,
                    borderRightWidth: 0,
                    borderBottomWidth: 0,
                    borderLeftWidth: 0,
                    'ease': Power3.easeOut
                });

                TweenMax.to($content, .2, {
                    opacity: 0,
                    'ease': Power3.easeIn
                }, '-=.2');

                TweenMax.fromTo($title, .2, {
                    y: 0
                }, {
                    y: -20
                }, '-=.2');

                TweenMax.fromTo($meta, .2, {
                    y: 0
                }, {
                    y: 20
                }, '-=.2');

                TweenMax.to($image, .2, {
                    'opacity': 1,
                    'ease': Power3.easeIn
                });
            });

        });

        bindProjectsHover();
        bindGalleryImagesHover();

        // Scroll Down Arrows on Full Height Hero
        $('.hero-scroll-down').on('click', function(e) {
            smoothScrollTo(windowHeight);
        });

        // whenever a category is selected, make sure the "All" button is on
        $(document).on('click', '.filter__fields li', function(e) {
            var target = $(this).children('a').attr('href');
            $(target + ' li:first-child button').trigger('click');
        });

        if (globalDebug) {
            console.groupEnd();
        }
    }

    function bindProjectsHover() {

        $('.masonry__item')
            .off('mouseenter')
            .on('mouseenter', function(e) {
                var $image = $(this).find('.masonry__item-image');
                TweenMax.to($image, 0.5, {
                    opacity: 0.5,
                    ease: Power4.easeOut
                });
            })
            .off('mouseleave')
            .on('mouseleave', function(e) {
                var $image = $(this).find('.masonry__item-image');
                TweenMax.to($image, 0.5, {
                    opacity: 1,
                    ease: Power4.easeOut
                });
            });

    }

    function bindGalleryImagesHover() {
        $('.gallery-icon')
            .off('mouseenter')
            .on('mouseenter', function(e) {
                var $image = $(this).find('img');
                TweenMax.to($image, 0.5, {
                    opacity: 0.5,
                    ease: Power4.easeOut
                });
            })
            .off('mouseleave')
            .on('mouseleave', function(e) {
                var $image = $(this).find('img');
                TweenMax.to($image, 0.5, {
                    opacity: 1,
                    ease: Power4.easeOut
                });
            });
    }


    /* --- GLOBAL EVENT HANDLERS --- */


    /* ====== ON DOCUMENT READY ====== */

    $(document).ready(function() {
        if (globalDebug) {
            console.group("document::ready");
        }

        init();
        initVideos();

        if (isSafari) {
            $('html').css('opacity', 0);
        }

        if (globalDebug) {
            console.groupEnd();
        }
    });


    $window.load(function() {
        if (globalDebug) {
            console.group("window::load");
        }

        loadUp();
        niceScrollInit();
        //    isotopeUpdateLayout();

        var sliders = $('.js-projects-slider').parent();

        $('.hero').not(sliders).each(function(i, obj) {
            if (!$(obj).is('.content')) {
                $(obj).imagesLoaded(function() {
                    setTimeout(function() {
                        animateIn($(obj));
                    }, 300);
                });
            }
        });

        $('.pixcode--tabs').organicTabs();

        if (isSafari) {
            setTimeout(function() {
                reload();
                TweenMax.to('html', .3, {
                    opacity: 1
                });
            }, 300);
        } else {

        }

        if (globalDebug) {
            console.groupEnd();
        }
    });

    function animateIn($hero) {

        var $bg = $hero.find('.hero__bg'),
            timeline = new TimelineMax({
                paused: true
            }),
            $description = $hero.find('.hero__description'),
            above,
            main,
            below,
            arrowLeft = $('.hero').find('.arrow--left'),
            arrowRight = $('.hero').find('.arrow--right'),
            arrowDown = $('.hero').find('.arrow--down'),
            other;

        main = $hero.find('.hero__content-wrap').children('.hero__title').first();

        if ((typeof main == "undefined" || !main.length) && $description.length) {
            main = $description.find('.hero__title, .huge, .large').first();
            above = main.prevAll().add($description.prevAll());
            below = main.nextAll().add($description.nextAll());
        }

        // Background Intro
        // timeline.to($bg, .3, {opacity: 1, ease: Quint.easeIn});

        if (typeof main !== "undefined" && main.length != 0) {
            above = main.prevAll();
            below = main.nextAll();

            above.css({
                opacity: 0
            });
            main.css({
                opacity: 0
            });
            below.css({
                opacity: 0
            });
            $description.css({
                opacity: 1
            });


            // Title
            timeline.fromTo(main, .25, {
                opacity: 0
            }, {
                opacity: 1
            }, '-=.15');
            timeline.fromTo(main, .45, {
                'scale': 1.4
            }, {
                'scale': 1,
                opacity: 1,
                ease: Sine.easeOut
            }, '-=.20');

            // Subtitle
            timeline.fromTo(above, .45, {
                y: '+=40'
            }, {
                y: '-=40',
                opacity: 1,
                ease: Back.easeOut
            }, '-=.25');

            // Description
            timeline.fromTo(below, .45, {
                y: '-=40'
            }, {
                y: '+=40',
                opacity: 1,
                ease: Back.easeOut
            }, '-=.45');

        } else {

            below = $hero.find('.hero__title, .hero__subtitle, .hero__btn, .hero__description');

            // Description
            timeline.fromTo(below, .45, {
                y: '-=40'
            }, {
                y: '+=40',
                opacity: 1,
                ease: Sine.easeOut
            });
        }

        if (arrowDown.length) {
            timeline.fromTo(arrowDown, .25, {
                y: -20
            }, {
                y: 0,
                opacity: 1,
                ease: Quad.easeOut
            });
        }

        timeline.play();
    }

    /* ====== ON JETPACK POST LOAD ====== */
    $(document.body).on('post-load', function() {
        if (globalDebug) {
            console.log("Jetpack Post load");
        }
        browserSize();
        Parallax.initialize();
        Chameleon.prepare();
        initVideos();
        resizeVideos();
    });

    /* ====== ON SCROLL ====== */

    $window.on('scroll', onScroll);

    function onScroll() {
        latestKnownScrollY = $window.scrollTop();
        scrollDirection = lastKnownScrollY > latestKnownScrollY ? 'up' : 'down';
        lastKnownScrollY = latestKnownScrollY;
        requestTick();
    }

    // smooth scrolling to anchors
    $(function() {

        $('.overlay--navigation a[href*="#"]:not([href="#"])').click(function() {

            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

                if ($('.overlay--navigation').length && parseInt($('.overlay--navigation').css('left'), 10) == 0) {
                    $('.navigation__trigger').trigger('click');
                }

                var target = $(this.hash);

                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    smoothScrollTo(target.offset().top);
                    return false;
                }
            }

        });
    });
    // here we change the link of the Edit button in the Admin Bar
    // to make sure it reflects the current page
    function adminBarEditFix(id, editString, taxonomy) {
        //get the admin ajax url and clean it
        var baseEditURL = ajaxurl.replace('admin-ajax.php', 'post.php'),
            baseExitTaxURL = ajaxurl.replace('admin-ajax.php', 'edit-tags.php'),
            $editButton = $('#wp-admin-bar-edit a');

        if (!empty($editButton)) {
            if (id !== undefined && editString !== undefined) { //modify the current Edit button
                if (!empty(taxonomy)) { //it seems we need to edit a taxonomy
                    $editButton.attr('href', baseExitTaxURL + '?tag_ID=' + id + '&taxonomy=' + taxonomy + '&action=edit');
                } else {
                    $editButton.attr('href', baseEditURL + '?post=' + id + '&action=edit');
                }
                $editButton.html(editString);
            } else { //we have found an edit button but right now we don't need it anymore since we have no id
                $('#wp-admin-bar-edit').remove();
            }
        } else { //upss ... no edit button
            //lets see if we need one
            if (id !== undefined && editString !== undefined) { //we do need one after all
                //locate the New button because we need to add stuff after it
                var $newButton = $('#wp-admin-bar-new-content');

                if (!empty($newButton)) {
                    if (!empty(taxonomy)) { //it seems we need to generate a taxonomy edit thingy
                        $newButton.after('<li id="wp-admin-bar-edit"><a class="ab-item dJAX_internal" href="' + baseExitTaxURL + '?tag_ID=' + id + '&taxonomy=' + taxonomy + '&action=edit">' + editString + '</a></li>');
                    } else { //just a regular edit
                        $newButton.after('<li id="wp-admin-bar-edit"><a class="ab-item dJAX_internal" href="' + baseEditURL + '?post=' + id + '&action=edit">' + editString + '</a></li>');
                    }
                }
            }
        }
    }

    /* --- Load AddThis Async --- */
    function loadAddThisScript() {
        if (window.addthis) {
            if (globalDebug) {
                console.log("addthis::Load Script");
            }
            // Listen for the ready event
            addthis.addEventListener('addthis.ready', addthisReady);
            addthis.init();
        }
    }

    /* --- AddThis On Ready - The API is fully loaded --- */
    //only fire this the first time we load the AddThis API - even when using ajax
    function addthisReady() {
        if (globalDebug) {
            console.log("addthis::Ready");
        }
        addThisInit();
    }

    /* --- AddThis Init --- */
    function addThisInit() {
        if (window.addthis) {
            if (globalDebug) {
                console.log("addthis::Toolbox INIT");
            }

            addthis.toolbox('.addthis_toolbox');
        }
    }

    /* --- Do all the cleanup that is needed when going to another page with dJax --- */
    function cleanupBeforeDJax() {
        if (globalDebug) {
            console.group("djax::Cleanup Before dJax");
        }

        /* --- KILL ROYALSLIDER ---*/
        var sliders = $('.js-pixslider');
        if (!empty(sliders)) {
            sliders.each(function() {
                var slider = $(this).data('royalSlider');
                if (!empty(slider)) {
                    slider.destroy();
                }
            });
        }

        /* --- KILL MAGNIFIC POPUP ---*/
        //when hitting back or forward we need to make sure that there is no rezidual Magnific Popup
        $.magnificPopup.close(); // Close popup that is currently opened (shorthand)

        if (globalDebug) {
            console.groupEnd();
        }

    }

    function loadUpDJaxOnly(data) {
        if (globalDebug) {
            console.group("djax::loadup - dJaxOnly");
        }

        //fire the AddThis reinitialization separate from loadUp()
        //because on normal load we want to fire it only after the API is fully loaded - addthisReady()
        addThisInit();

        //bgCheckInit();

        //find and initialize Tiled Galleries via Jetpack
        if (typeof tiledGalleries !== "undefined") {
            if (globalDebug) {
                console.log("Find and setup new galleries - Jetpack");
            }
            tiledGalleries.findAndSetupNewGalleries();
        }

        //lets do some Google Analytics Tracking
        if (window._gaq) {
            _gaq.push(['_trackPageview']);
        }

        if (globalDebug) {
            console.groupEnd();
        }
    }
})(jQuery, window);
/*
 * BackgroundCheck
 * http://kennethcachia.com/background-check
 *
 * v1.2.2
 *
 * The MIT License (MIT)

 Copyright (c) 2013 Kenneth

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.BackgroundCheck = factory(root);
    }

}(this, function() {

    'use strict';

    var resizeEvent = window.orientation !== undefined ? 'orientationchange' : 'resize';
    var supported;
    var canvas;
    var context;
    var throttleDelay;
    var viewport;
    var attrs = {};


    /*
     * Initializer
     */
    function init(a) {

        if (a === undefined || a.targets === undefined) {
            throw 'Missing attributes';
        }

        // Default values
        attrs.debug = checkAttr(a.debug, false);
        attrs.debugOverlay = checkAttr(a.debugOverlay, false);
        attrs.targets = getElements(a.targets);
        attrs.images = getElements(a.images || 'img', true);
        attrs.changeParent = checkAttr(a.changeParent, false);
        attrs.threshold = checkAttr(a.threshold, 50);
        attrs.minComplexity = checkAttr(a.minComplexity, 30);
        attrs.minOverlap = checkAttr(a.minOverlap, 50);
        attrs.windowEvents = checkAttr(a.windowEvents, true);
        attrs.maxDuration = checkAttr(a.maxDuration, 500);

        attrs.mask = checkAttr(a.mask, {
            r: 0,
            g: 255,
            b: 0
        });

        attrs.classes = checkAttr(a.classes, {
            dark: 'background--dark',
            light: 'background--light',
            complex: 'background--complex'
        });

        if (supported === undefined) {
            checkSupport();

            if (supported) {
                canvas.style.position = 'fixed';
                canvas.style.top = '0px';
                canvas.style.left = '0px';
                canvas.style.width = '100%';
                canvas.style.height = '100%';

                window.addEventListener(resizeEvent, throttle.bind(null, function() {
                    resizeCanvas();
                    check();
                }));

                window.addEventListener('scroll', throttle.bind(null, check));

                resizeCanvas();
                check();
            }
        }
    }


    /*
     * Destructor
     */
    function destroy() {
        supported = null;
        canvas = null;
        context = null;
        attrs = {};

        if (throttleDelay) {
            clearTimeout(throttleDelay);
        }
    }


    /*
     * Output debug logs
     */
    function log(msg) {

        if (get('debug')) {
            console.log(msg);
        }
    }


    /*
     * Get attribute value, use a default
     * when undefined
     */
    function checkAttr(value, def) {
        checkType(value, typeof def);
        return (value === undefined) ? def : value;
    }


    /*
     * Reject unwanted types
     */
    function checkType(value, type) {

        if (value !== undefined && typeof value !== type) {
            throw 'Incorrect attribute type';
        }
    }


    /*
     * Convert elements with background-image
     * to Images
     */
    function checkForCSSImages(els) {
        var el;
        var url;
        var list = [];

        for (var e = 0; e < els.length; e++) {
            el = els[e];
            list.push(el);

            if (el.tagName !== 'IMG') {
                url = window.getComputedStyle(el).backgroundImage;

                // Ignore multiple backgrounds
                if (url.split(/,url|, url/).length > 1) {
                    throw 'Multiple backgrounds are not supported';
                }

                if (url && url !== 'none') {
                    list[e] = {
                        img: new Image(),
                        el: list[e]
                    };

                    url = url.slice(4, -1);
                    url = url.replace(/"/g, '');

                    list[e].img.src = url;
                    log('CSS Image - ' + url);
                } else {
                    throw 'Element is not an <img> but does not have a background-image';
                }
            }
        }

        return list;
    }


    /*
     * Check for String, Element or NodeList
     */
    function getElements(selector, convertToImages) {
        var els = selector;

        if (typeof selector === 'string') {
            els = document.querySelectorAll(selector);
        } else if (selector && selector.nodeType === 1) {
            els = [selector];
        }

        if (!els || els.length === 0 || els.length === undefined) {
            log('Elements not found');
        } else {

            if (convertToImages) {
                els = checkForCSSImages(els);
            }

            els = Array.prototype.slice.call(els);
        }

        return els;
    }


    /*
     * Check if browser supports <canvas>
     */
    function checkSupport() {
        canvas = document.createElement('canvas');

        if (canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            supported = true;
        } else {
            supported = false;
        }

        showDebugOverlay();
    }


    /*
     * Show <canvas> on top of page
     */
    function showDebugOverlay() {

        if (get('debugOverlay')) {
            canvas.style.opacity = 0.5;
            canvas.style.pointerEvents = 'none';
            document.body.appendChild(canvas);
        } else {

            // Check if it was previously added
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }
    }


    /*
     * Stop if it's slow
     */
    function kill(start) {
        var duration = new Date().getTime() - start;

        log('Duration: ' + duration + 'ms');

        if (duration > get('maxDuration')) {
            // Log a message even when debug is false
            console.log('BackgroundCheck - Killed');
            removeClasses();
            destroy();
        }
    }


    /*
     * Set width and height of <canvas>
     */
    function resizeCanvas() {
        viewport = {
            left: 0,
            top: 0,
            right: document.body.clientWidth,
            bottom: window.innerHeight
        };

        canvas.width = document.body.clientWidth;
        canvas.height = window.innerHeight;
    }


    /*
     * Process px and %, discard anything else
     */
    function getValue(css, parent, delta) {
        var value;
        var percentage;

        if (css.indexOf('px') !== -1) {
            value = parseFloat(css);
        } else if (css.indexOf('%') !== -1) {
            value = parseFloat(css);
            percentage = value / 100;
            value = percentage * parent;

            if (delta) {
                value -= delta * percentage;
            }
        } else {
            value = parent;
        }

        return value;
    }


    /*
     * Calculate top, left, width and height
     * using the object's CSS
     */
    function calculateAreaFromCSS(obj) {
        var css = window.getComputedStyle(obj.el);

        // Force no-repeat and padding-box
        obj.el.style.backgroundRepeat = 'no-repeat';
        obj.el.style.backgroundOrigin = 'padding-box';

        // Background Size
        var size = css.backgroundSize.split(' ');
        var width = size[0];
        var height = size[1] === undefined ? 'auto' : size[1];

        var parentRatio = obj.el.clientWidth / obj.el.clientHeight;
        var imgRatio = obj.img.naturalWidth / obj.img.naturalHeight;

        if (width === 'cover') {

            if (parentRatio >= imgRatio) {
                width = '100%';
                height = 'auto';
            } else {
                width = 'auto';
                size[0] = 'auto';
                height = '100%';
            }

        } else if (width === 'contain') {

            if (1 / parentRatio < 1 / imgRatio) {
                width = 'auto';
                size[0] = 'auto';
                height = '100%';
            } else {
                width = '100%';
                height = 'auto';
            }
        }

        if (width === 'auto') {
            width = obj.img.naturalWidth;
        } else {
            width = getValue(width, obj.el.clientWidth);
        }

        if (height === 'auto') {
            height = (width / obj.img.naturalWidth) * obj.img.naturalHeight;
        } else {
            height = getValue(height, obj.el.clientHeight);
        }

        if (size[0] === 'auto' && size[1] !== 'auto') {
            width = (height / obj.img.naturalHeight) * obj.img.naturalWidth;
        }

        var position = css.backgroundPosition;

        // Fix inconsistencies between browsers
        if (position === 'top') {
            position = '50% 0%';
        } else if (position === 'left') {
            position = '0% 50%';
        } else if (position === 'right') {
            position = '100% 50%';
        } else if (position === 'bottom') {
            position = '50% 100%';
        } else if (position === 'center') {
            position = '50% 50%';
        }

        position = position.split(' ');

        var x;
        var y;

        // Two-value syntax vs Four-value syntax
        if (position.length === 4) {
            x = position[1];
            y = position[3];
        } else {
            x = position[0];
            y = position[1];
        }

        // Use a default value
        y = y || '50%';

        // Background Position
        x = getValue(x, obj.el.clientWidth, width);
        y = getValue(y, obj.el.clientHeight, height);

        // Take care of ex: background-position: right 20px bottom 20px;
        if (position.length === 4) {

            if (position[0] === 'right') {
                x = obj.el.clientWidth - obj.img.naturalWidth - x;
            }

            if (position[2] === 'bottom') {
                y = obj.el.clientHeight - obj.img.naturalHeight - y;
            }
        }

        x += obj.el.getBoundingClientRect().left;
        y += obj.el.getBoundingClientRect().top;

        return {
            left: Math.floor(x),
            right: Math.floor(x + width),
            top: Math.floor(y),
            bottom: Math.floor(y + height),
            width: Math.floor(width),
            height: Math.floor(height)
        };
    }


    /*
     * Get Bounding Client Rect
     */
    function getArea(obj) {
        var area;
        var image;
        var parent;

        if (obj.nodeType) {
            var rect = obj.getBoundingClientRect();

            // Clone ClientRect for modification purposes
            area = {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
            };

            parent = obj.parentNode;
            image = obj;
        } else {
            area = calculateAreaFromCSS(obj);
            parent = obj.el;
            image = obj.img;
        }

        parent = parent.getBoundingClientRect();

        area.imageTop = 0;
        area.imageLeft = 0;
        area.imageWidth = image.naturalWidth;
        area.imageHeight = image.naturalHeight;

        var ratio = area.imageHeight / area.height;
        var delta;

        // Stay within the parent's boundary
        if (area.top < parent.top) {
            delta = parent.top - area.top;
            area.imageTop = ratio * delta;
            area.imageHeight -= ratio * delta;
            area.top += delta;
            area.height -= delta;
        }

        if (area.left < parent.left) {
            delta = parent.left - area.left;
            area.imageLeft += ratio * delta;
            area.imageWidth -= ratio * delta;
            area.width -= delta;
            area.left += delta;
        }

        if (area.bottom > parent.bottom) {
            delta = area.bottom - parent.bottom;
            area.imageHeight -= ratio * delta;
            area.height -= delta;
        }

        if (area.right > parent.right) {
            delta = area.right - parent.right;
            area.imageWidth -= ratio * delta;
            area.width -= delta;
        }

        area.imageTop = Math.floor(area.imageTop);
        area.imageLeft = Math.floor(area.imageLeft);
        area.imageHeight = Math.floor(area.imageHeight);
        area.imageWidth = Math.floor(area.imageWidth);

        return area;
    }


    /*
     * Render image on canvas
     */
    function drawImage(image) {
        var area = getArea(image);

        image = image.nodeType ? image : image.img;

        if (area.imageWidth > 0 && area.imageHeight > 0 && area.width > 0 && area.height > 0) {
            context.drawImage(image,
                area.imageLeft, area.imageTop, area.imageWidth, area.imageHeight,
                area.left, area.top, area.width, area.height);
        } else {
            log('Skipping image - ' + image.src + ' - area too small');
        }
    }


    /*
     * Add/remove classes
     */
    function classList(node, name, mode) {
        var className = node.className;

        switch (mode) {
            case 'add':
                className += ' ' + name;
                break;
            case 'remove':
                var pattern = new RegExp('(?:^|\\s)' + name + '(?!\\S)', 'g');
                className = className.replace(pattern, '');
                break;
        }

        node.className = className.trim();
    }


    /*
     * Remove classes from element or
     * their parents, depending on checkParent
     */
    function removeClasses(el) {
        var targets = el ? [el] : get('targets');
        var target;

        for (var t = 0; t < targets.length; t++) {
            target = targets[t];
            target = get('changeParent') ? target.parentNode : target;

            classList(target, get('classes').light, 'remove');
            classList(target, get('classes').dark, 'remove');
            classList(target, get('classes').complex, 'remove');
        }
    }


    /*
     * Calculate average pixel brightness of a region
     * and add 'light' or 'dark' accordingly
     */
    function calculatePixelBrightness(target) {
        var dims = target.getBoundingClientRect();
        var brightness;
        var data;
        var pixels = 0;
        var delta;
        var deltaSqr = 0;
        var mean = 0;
        var variance;
        var minOverlap = 0;
        var mask = get('mask');

        if (dims.width > 0 && dims.height > 0) {
            removeClasses(target);

            target = get('changeParent') ? target.parentNode : target;
            data = context.getImageData(dims.left, dims.top, dims.width, dims.height).data;

            for (var p = 0; p < data.length; p += 4) {

                if (data[p] === mask.r && data[p + 1] === mask.g && data[p + 2] === mask.b) {
                    minOverlap++;
                } else {
                    pixels++;
                    brightness = (0.2126 * data[p]) + (0.7152 * data[p + 1]) + (0.0722 * data[p + 2]);
                    delta = brightness - mean;
                    deltaSqr += delta * delta;
                    mean = mean + delta / pixels;
                }
            }

            if (minOverlap <= (data.length / 4) * (1 - (get('minOverlap') / 100))) {
                variance = Math.sqrt(deltaSqr / pixels) / 255;
                mean = mean / 255;
                log('Target: ' + target.className + ' lum: ' + mean + ' var: ' + variance);
                classList(target, mean <= (get('threshold') / 100) ? get('classes').dark : get('classes').light, 'add');

                if (variance > get('minComplexity') / 100) {
                    classList(target, get('classes').complex, 'add');
                }
            }
        }
    }


    /*
     * Test if a is within b's boundary
     */
    function isInside(a, b) {
        a = (a.nodeType ? a : a.el).getBoundingClientRect();
        b = b === viewport ? b : (b.nodeType ? b : b.el).getBoundingClientRect();

        return !(a.right < b.left || a.left > b.right || a.top > b.bottom || a.bottom < b.top);
    }


    /*
     * Process all targets (checkTarget is undefined)
     * or a single target (checkTarget is a previously set target)
     *
     * When not all images are loaded, checkTarget is an image
     * to avoid processing all targets multiple times
     */
    function processTargets(checkTarget) {
        var start = new Date().getTime();
        var mode = (checkTarget && (checkTarget.tagName === 'IMG' || checkTarget.img)) ? 'image' : 'targets';
        var found = checkTarget ? false : true;
        var total = get('targets').length;
        var target;

        for (var t = 0; t < total; t++) {
            target = get('targets')[t];

            if (isInside(target, viewport)) {
                if (mode === 'targets' && (!checkTarget || checkTarget === target)) {
                    found = true;
                    calculatePixelBrightness(target);
                } else if (mode === 'image' && isInside(target, checkTarget)) {
                    calculatePixelBrightness(target);
                }
            }
        }

        if (mode === 'targets' && !found) {
            throw checkTarget + ' is not a target';
        }

        kill(start);
    }


    /*
     * Find the element's zIndex. Also checks
     * the zIndex of its parent
     */
    function getZIndex(el) {
        var calculate = function(el) {
            var zindex = 0;

            if (window.getComputedStyle(el).position !== 'static') {
                zindex = parseInt(window.getComputedStyle(el).zIndex, 10) || 0;

                // Reserve zindex = 0 for elements with position: static;
                if (zindex >= 0) {
                    zindex++;
                }
            }

            return zindex;
        };

        var parent = el.parentNode;
        var zIndexParent = parent ? calculate(parent) : 0;
        var zIndexEl = calculate(el);

        return (zIndexParent * 100000) + zIndexEl;
    }


    /*
     * Check zIndexes
     */
    function sortImagesByZIndex(images) {
        var sorted = false;
        if (images && images.length) {
            images.sort(function(a, b) {
                a = a.nodeType ? a : a.el;
                b = b.nodeType ? b : b.el;

                var pos = a.compareDocumentPosition(b);
                var reverse = 0;

                a = getZIndex(a);
                b = getZIndex(b);

                if (a > b) {
                    sorted = true;
                }

                // Reposition if zIndex is the same but the elements are not
                // sorted according to their document position
                if (a === b && pos === 2) {
                    reverse = 1;
                } else if (a === b && pos === 4) {
                    reverse = -1;
                }

                return reverse || a - b;
            });

            log('Sorted: ' + sorted);

            if (sorted) {
                log(images);
            }
        }

        return sorted;
    }


    /*
     * Main function
     */
    function check(target, avoidClear, imageLoaded) {

        if (supported) {
            var mask = get('mask');

            log('--- BackgroundCheck ---');
            log('onLoad event: ' + (imageLoaded && imageLoaded.src));

            if (avoidClear !== true) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = 'rgb(' + mask.r + ', ' + mask.g + ', ' + mask.b + ')';
                context.fillRect(0, 0, canvas.width, canvas.height);
            }

            var processImages = imageLoaded ? [imageLoaded] : get('images');
            var sorted = sortImagesByZIndex(processImages);

            var image;
            var imageNode;
            var loading = false;

            for (var i = 0; i < processImages.length; i++) {
                image = processImages[i];

                if (isInside(image, viewport)) {
                    imageNode = image.nodeType ? image : image.img;

                    if (imageNode.naturalWidth === 0) {
                        loading = true;
                        log('Loading... ' + image.src);

                        imageNode.removeEventListener('load', check);

                        if (sorted) {
                            // Sorted -- redraw all images
                            imageNode.addEventListener('load', check.bind(null, null, false, null));
                        } else {
                            // Not sorted -- just draw one image
                            imageNode.addEventListener('load', check.bind(null, target, true, image));
                        }
                    } else {
                        log('Drawing: ' + image.src);
                        drawImage(image);
                    }
                }
            }

            if (!imageLoaded && !loading) {
                processTargets(target);
            } else if (imageLoaded) {
                processTargets(imageLoaded);
            }
        }
    }


    /*
     * Throttle events
     */
    function throttle(callback) {

        if (get('windowEvents') === true) {

            if (throttleDelay) {
                clearTimeout(throttleDelay);
            }

            throttleDelay = setTimeout(callback, 200);
        }
    }


    /*
     * Setter
     */
    function set(property, newValue) {

        if (attrs[property] === undefined) {
            throw 'Unknown property - ' + property;
        } else if (newValue === undefined) {
            throw 'Missing value for ' + property;
        }

        if (property === 'targets' || property === 'images') {

            try {
                newValue = getElements(property === 'images' && !newValue ? 'img' : newValue, property === 'images' ? true : false);
            } catch (err) {
                newValue = [];
                throw err;
            }
        } else {
            checkType(newValue, typeof attrs[property]);
        }

        removeClasses();
        attrs[property] = newValue;
        check();

        if (property === 'debugOverlay') {
            showDebugOverlay();
        }
    }


    /*
     * Getter
     */
    function get(property) {

        if (attrs[property] === undefined) {
            throw 'Unknown property - ' + property;
        }

        return attrs[property];
    }


    /*
     * Get position and size of all images.
     * Used for testing purposes
     */
    function getImageData() {
        var images = get('images');
        var area;
        var data = [];

        for (var i = 0; i < images.length; i++) {
            area = getArea(images[i]);
            data.push(area);
        }

        return data;
    }


    return {
        /*
         * Init and destroy
         */
        init: init,
        destroy: destroy,

        /*
         * Expose main function
         */
        refresh: check,

        /*
         * Setters and getters
         */
        set: set,
        get: get,

        /*
         * Return image data
         */
        getImageData: getImageData
    };

}));
/*!
 *  GMAP3 Plugin for jQuery
 *  Version   : 6.0.0
 *  Date      : 2014-04-25
 *  Author    : DEMONTE Jean-Baptiste
 *  Contact   : jbdemonte@gmail.com
 *  Web site  : http://gmap3.net
 *  Licence   : GPL v3 : http://www.gnu.org/licenses/gpl.html
 *  
 *  Copyright (c) 2010-2014 Jean-Baptiste DEMONTE
 *  All rights reserved.
 */
;
(function($, undef) {

    var defaults, gm,
        gId = 0,
        isFunction = $.isFunction,
        isArray = $.isArray;

    function isObject(m) {
        return typeof m === "object";
    }

    function isString(m) {
        return typeof m === "string";
    }

    function isNumber(m) {
        return typeof m === "number";
    }

    function isUndefined(m) {
        return m === undef;
    }

    /**
     * Initialize default values
     * defaults are defined at first gmap3 call to pass the rails asset pipeline and jasmine while google library is not yet loaded
     */
    function initDefaults() {
        gm = google.maps;
        if (!defaults) {
            defaults = {
                verbose: false,
                queryLimit: {
                    attempt: 5,
                    delay: 250, // setTimeout(..., delay + random);
                    random: 250
                },
                classes: (function() {
                    var r = {};
                    $.each("Map Marker InfoWindow Circle Rectangle OverlayView StreetViewPanorama KmlLayer TrafficLayer BicyclingLayer GroundOverlay StyledMapType ImageMapType".split(" "), function(_, k) {
                        r[k] = gm[k];
                    });
                    return r;
                }()),
                map: {
                    mapTypeId: gm.MapTypeId.ROADMAP,
                    center: [46.578498, 2.457275],
                    zoom: 2
                },
                overlay: {
                    pane: "floatPane",
                    content: "",
                    offset: {
                        x: 0,
                        y: 0
                    }
                },
                geoloc: {
                    getCurrentPosition: {
                        maximumAge: 60000,
                        timeout: 5000
                    }
                }
            }
        }
    }


    /**
     * Generate a new ID if not defined
     * @param id {string} (optional)
     * @param simulate {boolean} (optional)
     * @returns {*}
     */
    function globalId(id, simulate) {
        return isUndefined(id) ? "gmap3_" + (simulate ? gId + 1 : ++gId) : id;
    }


    /**
     * Return true if current version of Google Maps is equal or above to these in parameter
     * @param version {string} Minimal version required
     * @return {Boolean}
     */
    function googleVersionMin(version) {
        var i,
            gmVersion = gm.version.split(".");
        version = version.split(".");
        for (i = 0; i < gmVersion.length; i++) {
            gmVersion[i] = parseInt(gmVersion[i], 10);
        }
        for (i = 0; i < version.length; i++) {
            version[i] = parseInt(version[i], 10);
            if (gmVersion.hasOwnProperty(i)) {
                if (gmVersion[i] < version[i]) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }


    /**
     * attach events from a container to a sender
     * td[
     *  events => { eventName => function, }
     *  onces  => { eventName => function, }
     *  data   => mixed data
     * ]
     **/
    function attachEvents($container, args, sender, id, senders) {
        var td = args.td || {},
            context = {
                id: id,
                data: td.data,
                tag: td.tag
            };

        function bind(items, handler) {
            if (items) {
                $.each(items, function(name, f) {
                    var self = $container,
                        fn = f;
                    if (isArray(f)) {
                        self = f[0];
                        fn = f[1];
                    }
                    handler(sender, name, function(event) {
                        fn.apply(self, [senders || sender, event, context]);
                    });
                });
            }
        }
        bind(td.events, gm.event.addListener);
        bind(td.onces, gm.event.addListenerOnce);
    }

    /**
     * Extract keys from object
     * @param obj {object}
     * @returns {Array}
     */
    function getKeys(obj) {
        var k, keys = [];
        for (k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    /**
     * copy a key content
     **/
    function copyKey(target, key) {
        var i,
            args = arguments;
        for (i = 2; i < args.length; i++) {
            if (key in args[i]) {
                if (args[i].hasOwnProperty(key)) {
                    target[key] = args[i][key];
                    return;
                }
            }
        }
    }

    /**
     * Build a tuple
     * @param args {object}
     * @param value {object}
     * @returns {object}
     */
    function tuple(args, value) {
        var k, i,
            keys = ["data", "tag", "id", "events", "onces"],
            td = {};

        // "copy" the common data
        if (args.td) {
            for (k in args.td) {
                if (args.td.hasOwnProperty(k)) {
                    if ((k !== "options") && (k !== "values")) {
                        td[k] = args.td[k];
                    }
                }
            }
        }
        // "copy" some specific keys from value first else args.td
        for (i = 0; i < keys.length; i++) {
            copyKey(td, keys[i], value, args.td);
        }

        // create an extended options
        td.options = $.extend({}, args.opts || {}, value.options || {});

        return td;
    }

    /**
     * Log error
     */
    function error() {
        if (defaults.verbose) {
            var i, err = [];
            if (window.console && (isFunction(console.error))) {
                for (i = 0; i < arguments.length; i++) {
                    err.push(arguments[i]);
                }
                console.error.apply(console, err);
            } else {
                err = "";
                for (i = 0; i < arguments.length; i++) {
                    err += arguments[i].toString() + " ";
                }
                alert(err);
            }
        }
    }

    /**
     * return true if mixed is usable as number
     **/
    function numeric(mixed) {
        return (isNumber(mixed) || isString(mixed)) && mixed !== "" && !isNaN(mixed);
    }

    /**
     * convert data to array
     **/
    function array(mixed) {
        var k, a = [];
        if (!isUndefined(mixed)) {
            if (isObject(mixed)) {
                if (isNumber(mixed.length)) {
                    a = mixed;
                } else {
                    for (k in mixed) {
                        a.push(mixed[k]);
                    }
                }
            } else {
                a.push(mixed);
            }
        }
        return a;
    }

    /**
     * create a function to check a tag
     */
    function ftag(tag) {
        if (tag) {
            if (isFunction(tag)) {
                return tag;
            }
            tag = array(tag);
            return function(val) {
                var i;
                if (isUndefined(val)) {
                    return false;
                }
                if (isObject(val)) {
                    for (i = 0; i < val.length; i++) {
                        if ($.inArray(val[i], tag) >= 0) {
                            return true;
                        }
                    }
                    return false;
                }
                return $.inArray(val, tag) >= 0;
            };
        }
    }


    /**
     * convert mixed [ lat, lng ] objet to gm.LatLng
     **/
    function toLatLng(mixed, emptyReturnMixed, noFlat) {
        var empty = emptyReturnMixed ? mixed : null;
        if (!mixed || (isString(mixed))) {
            return empty;
        }
        // defined latLng
        if (mixed.latLng) {
            return toLatLng(mixed.latLng);
        }
        // gm.LatLng object
        if (mixed instanceof gm.LatLng) {
            return mixed;
        }
        // {lat:X, lng:Y} object
        if (numeric(mixed.lat)) {
            return new gm.LatLng(mixed.lat, mixed.lng);
        }
        // [X, Y] object
        if (!noFlat && isArray(mixed)) {
            if (!numeric(mixed[0]) || !numeric(mixed[1])) {
                return empty;
            }
            return new gm.LatLng(mixed[0], mixed[1]);
        }
        return empty;
    }

    /**
     * convert mixed [ sw, ne ] object by gm.LatLngBounds
     **/
    function toLatLngBounds(mixed) {
        var ne, sw;
        if (!mixed || mixed instanceof gm.LatLngBounds) {
            return mixed || null;
        }
        if (isArray(mixed)) {
            if (mixed.length === 2) {
                ne = toLatLng(mixed[0]);
                sw = toLatLng(mixed[1]);
            } else if (mixed.length === 4) {
                ne = toLatLng([mixed[0], mixed[1]]);
                sw = toLatLng([mixed[2], mixed[3]]);
            }
        } else {
            if (("ne" in mixed) && ("sw" in mixed)) {
                ne = toLatLng(mixed.ne);
                sw = toLatLng(mixed.sw);
            } else if (("n" in mixed) && ("e" in mixed) && ("s" in mixed) && ("w" in mixed)) {
                ne = toLatLng([mixed.n, mixed.e]);
                sw = toLatLng([mixed.s, mixed.w]);
            }
        }
        if (ne && sw) {
            return new gm.LatLngBounds(sw, ne);
        }
        return null;
    }

    /**
     * resolveLatLng
     **/
    function resolveLatLng(ctx, method, runLatLng, args, attempt) {
        var latLng = runLatLng ? toLatLng(args.td, false, true) : false,
            conf = latLng ? {
                latLng: latLng
            } : (args.td.address ? (isString(args.td.address) ? {
                address: args.td.address
            } : args.td.address) : false),
            cache = conf ? geocoderCache.get(conf) : false,
            self = this;
        if (conf) {
            attempt = attempt || 0; // convert undefined to int
            if (cache) {
                args.latLng = cache.results[0].geometry.location;
                args.results = cache.results;
                args.status = cache.status;
                method.apply(ctx, [args]);
            } else {
                if (conf.location) {
                    conf.location = toLatLng(conf.location);
                }
                if (conf.bounds) {
                    conf.bounds = toLatLngBounds(conf.bounds);
                }
                geocoder().geocode(
                    conf,
                    function(results, status) {
                        if (status === gm.GeocoderStatus.OK) {
                            geocoderCache.store(conf, {
                                results: results,
                                status: status
                            });
                            args.latLng = results[0].geometry.location;
                            args.results = results;
                            args.status = status;
                            method.apply(ctx, [args]);
                        } else if ((status === gm.GeocoderStatus.OVER_QUERY_LIMIT) && (attempt < defaults.queryLimit.attempt)) {
                            setTimeout(
                                function() {
                                    resolveLatLng.apply(self, [ctx, method, runLatLng, args, attempt + 1]);
                                },
                                defaults.queryLimit.delay + Math.floor(Math.random() * defaults.queryLimit.random)
                            );
                        } else {
                            error("geocode failed", status, conf);
                            args.latLng = args.results = false;
                            args.status = status;
                            method.apply(ctx, [args]);
                        }
                    }
                );
            }
        } else {
            args.latLng = toLatLng(args.td, false, true);
            method.apply(ctx, [args]);
        }
    }

    function resolveAllLatLng(list, ctx, method, args) {
        var self = this,
            i = -1;

        function resolve() {
            // look for next address to resolve
            do {
                i++;
            } while ((i < list.length) && !("address" in list[i]));

            // no address found, so run method
            if (i >= list.length) {
                method.apply(ctx, [args]);
                return;
            }

            resolveLatLng(
                self,
                function(args) {
                    delete args.td;
                    $.extend(list[i], args);
                    resolve.apply(self, []); // resolve next (using apply avoid too much recursion)
                },
                true, {
                    td: list[i]
                }
            );
        }
        resolve();
    }



    /**
     * geolocalise the user and return a LatLng
     **/
    function geoloc(ctx, method, args) {
        var is_echo = false; // sometime, a kind of echo appear, this trick will notice once the first call is run to ignore the next one
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    if (!is_echo) {
                        is_echo = true;
                        args.latLng = new gm.LatLng(pos.coords.latitude, pos.coords.longitude);
                        method.apply(ctx, [args]);
                    }
                },
                function() {
                    if (!is_echo) {
                        is_echo = true;
                        args.latLng = false;
                        method.apply(ctx, [args]);
                    }
                },
                args.opts.getCurrentPosition
            );
        } else {
            args.latLng = false;
            method.apply(ctx, [args]);
        }
    }

    /**
     * Return true if get is a direct call
     * it means :
     *   - get is the only key
     *   - get has no callback
     * @param obj {Object} The request to check
     * @return {Boolean}
     */
    function isDirectGet(obj) {
        var k,
            result = false;
        if (isObject(obj) && obj.hasOwnProperty("get")) {
            for (k in obj) {
                if (k !== "get") {
                    return false;
                }
            }
            result = !obj.get.hasOwnProperty("callback");
        }
        return result;
    }
    var services = {},
        geocoderCache = new GeocoderCache();


    function geocoder() {
        if (!services.geocoder) {
            services.geocoder = new gm.Geocoder();
        }
        return services.geocoder;
    }
    /**
     * Class GeocoderCache
     * @constructor
     */
    function GeocoderCache() {
        var cache = [];

        this.get = function(request) {
            if (cache.length) {
                var i, j, k, item, eq,
                    keys = getKeys(request);
                for (i = 0; i < cache.length; i++) {
                    item = cache[i];
                    eq = keys.length === item.keys.length;
                    for (j = 0;
                        (j < keys.length) && eq; j++) {
                        k = keys[j];
                        eq = k in item.request;
                        if (eq) {
                            if (isObject(request[k]) && ("equals" in request[k]) && isFunction(request[k])) {
                                eq = request[k].equals(item.request[k]);
                            } else {
                                eq = request[k] === item.request[k];
                            }
                        }
                    }
                    if (eq) {
                        return item.results;
                    }
                }
            }
        };

        this.store = function(request, results) {
            cache.push({
                request: request,
                keys: getKeys(request),
                results: results
            });
        };
    }
    /**
     * Class Stack
     * @constructor
     */
    function Stack() {
        var st = [],
            self = this;

        self.empty = function() {
            return !st.length;
        };

        self.add = function(v) {
            st.push(v);
        };

        self.get = function() {
            return st.length ? st[0] : false;
        };

        self.ack = function() {
            st.shift();
        };
    }
    /**
     * Class Store
     * @constructor
     */
    function Store() {
        var store = {}, // name => [id, ...]
            objects = {}, // id => object
            self = this;

        function normalize(res) {
            return {
                id: res.id,
                name: res.name,
                object: res.obj,
                tag: res.tag,
                data: res.data
            };
        }

        /**
         * add a mixed to the store
         **/
        self.add = function(args, name, obj, sub) {
            var td = args.td || {},
                id = globalId(td.id);
            if (!store[name]) {
                store[name] = [];
            }
            if (id in objects) { // object already exists: remove it
                self.clearById(id);
            }
            objects[id] = {
                obj: obj,
                sub: sub,
                name: name,
                id: id,
                tag: td.tag,
                data: td.data
            };
            store[name].push(id);
            return id;
        };

        /**
         * return a stored object by its id
         **/
        self.getById = function(id, sub, full) {
            var result = false;
            if (id in objects) {
                if (sub) {
                    result = objects[id].sub;
                } else if (full) {
                    result = normalize(objects[id]);
                } else {
                    result = objects[id].obj;
                }
            }
            return result;
        };

        /**
         * return a stored value
         **/
        self.get = function(name, last, tag, full) {
            var n, id, check = ftag(tag);
            if (!store[name] || !store[name].length) {
                return null;
            }
            n = store[name].length;
            while (n) {
                n--;
                id = store[name][last ? n : store[name].length - n - 1];
                if (id && objects[id]) {
                    if (check && !check(objects[id].tag)) {
                        continue;
                    }
                    return full ? normalize(objects[id]) : objects[id].obj;
                }
            }
            return null;
        };

        /**
         * return all stored values
         **/
        self.all = function(name, tag, full) {
            var result = [],
                check = ftag(tag),
                find = function(n) {
                    var i, id;
                    for (i = 0; i < store[n].length; i++) {
                        id = store[n][i];
                        if (id && objects[id]) {
                            if (check && !check(objects[id].tag)) {
                                continue;
                            }
                            result.push(full ? normalize(objects[id]) : objects[id].obj);
                        }
                    }
                };
            if (name in store) {
                find(name);
            } else if (isUndefined(name)) { // internal use only
                for (name in store) {
                    find(name);
                }
            }
            return result;
        };

        /**
         * hide and remove an object
         **/
        function rm(obj) {
            // Google maps element
            if (isFunction(obj.setMap)) {
                obj.setMap(null);
            }
            // jQuery
            if (isFunction(obj.remove)) {
                obj.remove();
            }
            // internal (cluster)
            if (isFunction(obj.free)) {
                obj.free();
            }
            obj = null;
        }

        /**
         * remove one object from the store
         **/
        self.rm = function(name, check, pop) {
            var idx, id;
            if (!store[name]) {
                return false;
            }
            if (check) {
                if (pop) {
                    for (idx = store[name].length - 1; idx >= 0; idx--) {
                        id = store[name][idx];
                        if (check(objects[id].tag)) {
                            break;
                        }
                    }
                } else {
                    for (idx = 0; idx < store[name].length; idx++) {
                        id = store[name][idx];
                        if (check(objects[id].tag)) {
                            break;
                        }
                    }
                }
            } else {
                idx = pop ? store[name].length - 1 : 0;
            }
            if (!(idx in store[name])) {
                return false;
            }
            return self.clearById(store[name][idx], idx);
        };

        /**
         * remove object from the store by its id
         **/
        self.clearById = function(id, idx) {
            if (id in objects) {
                var i, name = objects[id].name;
                for (i = 0; isUndefined(idx) && i < store[name].length; i++) {
                    if (id === store[name][i]) {
                        idx = i;
                    }
                }
                rm(objects[id].obj);
                if (objects[id].sub) {
                    rm(objects[id].sub);
                }
                delete objects[id];
                store[name].splice(idx, 1);
                return true;
            }
            return false;
        };

        /**
         * return an object from a container object in the store by its id
         * ! for now, only cluster manage this feature
         **/
        self.objGetById = function(id) {
            var result, idx;
            if (store.clusterer) {
                for (idx in store.clusterer) {
                    if ((result = objects[store.clusterer[idx]].obj.getById(id)) !== false) {
                        return result;
                    }
                }
            }
            return false;
        };

        /**
         * remove object from a container object in the store by its id
         * ! for now, only cluster manage this feature
         **/
        self.objClearById = function(id) {
            var idx;
            if (store.clusterer) {
                for (idx in store.clusterer) {
                    if (objects[store.clusterer[idx]].obj.clearById(id)) {
                        return true;
                    }
                }
            }
            return null;
        };

        /**
         * remove objects from the store
         **/
        self.clear = function(list, last, first, tag) {
            var k, i, name,
                check = ftag(tag);
            if (!list || !list.length) {
                list = [];
                for (k in store) {
                    list.push(k);
                }
            } else {
                list = array(list);
            }
            for (i = 0; i < list.length; i++) {
                name = list[i];
                if (last) {
                    self.rm(name, check, true);
                } else if (first) {
                    self.rm(name, check, false);
                } else { // all
                    while (self.rm(name, check, false)) {}
                }
            }
        };

        /**
         * remove object from a container object in the store by its tags
         * ! for now, only cluster manage this feature
         **/
        self.objClear = function(list, last, first, tag) {
            var idx;
            if (store.clusterer && ($.inArray("marker", list) >= 0 || !list.length)) {
                for (idx in store.clusterer) {
                    objects[store.clusterer[idx]].obj.clear(last, first, tag);
                }
            }
        };
    }
    /**
     * Class Task
     * @param ctx
     * @param onEnd
     * @param td
     * @constructor
     */
    function Task(ctx, onEnd, td) {
        var session = {},
            self = this,
            current,
            resolve = {
                latLng: { // function => bool (=> address = latLng)
                    map: false,
                    marker: false,
                    infowindow: false,
                    circle: false,
                    overlay: false,
                    getlatlng: false,
                    getmaxzoom: false,
                    getelevation: false,
                    streetviewpanorama: false,
                    getaddress: true
                },
                geoloc: {
                    getgeoloc: true
                }
            };

        function unify(td) {
            var result = {};
            result[td] = {};
            return result;
        }

        if (isString(td)) {
            td = unify(td);
        }

        function next() {
            var k;
            for (k in td) {
                if (td.hasOwnProperty(k) && !session.hasOwnProperty(k)) {
                    return k;
                }
            }
        }

        self.run = function() {
            var k, opts;
            while (k = next()) {
                if (isFunction(ctx[k])) {
                    current = k;
                    opts = $.extend(true, {}, defaults[k] || {}, td[k].options || {});
                    if (k in resolve.latLng) {
                        if (td[k].values) {
                            resolveAllLatLng(td[k].values, ctx, ctx[k], {
                                td: td[k],
                                opts: opts,
                                session: session
                            });
                        } else {
                            resolveLatLng(ctx, ctx[k], resolve.latLng[k], {
                                td: td[k],
                                opts: opts,
                                session: session
                            });
                        }
                    } else if (k in resolve.geoloc) {
                        geoloc(ctx, ctx[k], {
                            td: td[k],
                            opts: opts,
                            session: session
                        });
                    } else {
                        ctx[k].apply(ctx, [{
                            td: td[k],
                            opts: opts,
                            session: session
                        }]);
                    }
                    return; // wait until ack
                } else {
                    session[k] = null;
                }
            }
            onEnd.apply(ctx, [td, session]);
        };

        self.ack = function(result) {
            session[current] = result;
            self.run.apply(self, []);
        };
    }

    function directionsService() {
        if (!services.ds) {
            services.ds = new gm.DirectionsService();
        }
        return services.ds;
    }

    function distanceMatrixService() {
        if (!services.dms) {
            services.dms = new gm.DistanceMatrixService();
        }
        return services.dms;
    }

    function maxZoomService() {
        if (!services.mzs) {
            services.mzs = new gm.MaxZoomService();
        }
        return services.mzs;
    }

    function elevationService() {
        if (!services.es) {
            services.es = new gm.ElevationService();
        }
        return services.es;
    }

    /**
     * Usefull to get a projection
     * => done in a function, to let dead-code analyser works without google library loaded
     **/
    function newEmptyOverlay(map, radius) {
        function Overlay() {
            var self = this;
            self.onAdd = function() {};
            self.onRemove = function() {};
            self.draw = function() {};
            return defaults.classes.OverlayView.apply(self, []);
        }
        Overlay.prototype = defaults.classes.OverlayView.prototype;
        var obj = new Overlay();
        obj.setMap(map);
        return obj;
    }

    /**
     * Class InternalClusterer
     * This class manage clusters thanks to "td" objects
     *
     * Note:
     * Individuals marker are created on the fly thanks to the td objects, they are
     * first set to null to keep the indexes synchronised with the td list
     * This is the "display" function, set by the gmap3 object, which uses theses data
     * to create markers when clusters are not required
     * To remove a marker, the objects are deleted and set not null in arrays
     *    markers[key]
     *      = null : marker exist but has not been displayed yet
     *      = false : marker has been removed
     **/
    function InternalClusterer($container, map, raw) {
        var timer, projection,
            ffilter, fdisplay, ferror, // callback function
            updating = false,
            updated = false,
            redrawing = false,
            ready = false,
            enabled = true,
            self = this,
            events = [],
            store = {}, // combin of index (id1-id2-...) => object
            ids = {}, // unique id => index
            idxs = {}, // index => unique id
            markers = [], // index => marker
            tds = [], // index => td or null if removed
            values = [], // index => value
            overlay = newEmptyOverlay(map, raw.radius);

        main();

        function prepareMarker(index) {
            if (!markers[index]) {
                delete tds[index].options.map;
                markers[index] = new defaults.classes.Marker(tds[index].options);
                attachEvents($container, {
                    td: tds[index]
                }, markers[index], tds[index].id);
            }
        }

        /**
         * return a marker by its id, null if not yet displayed and false if no exist or removed
         **/
        self.getById = function(id) {
            if (id in ids) {
                prepareMarker(ids[id]);
                return markers[ids[id]];
            }
            return false;
        };

        /**
         * remove one object from the store
         **/
        self.rm = function(id) {
            var index = ids[id];
            if (markers[index]) { // can be null
                markers[index].setMap(null);
            }
            delete markers[index];
            markers[index] = false;

            delete tds[index];
            tds[index] = false;

            delete values[index];
            values[index] = false;

            delete ids[id];
            delete idxs[index];
            updated = true;
        };

        /**
         * remove a marker by its id
         **/
        self.clearById = function(id) {
            if (id in ids) {
                self.rm(id);
                return true;
            }
        };

        /**
         * remove objects from the store
         **/
        self.clear = function(last, first, tag) {
            var start, stop, step, index, i,
                list = [],
                check = ftag(tag);
            if (last) {
                start = tds.length - 1;
                stop = -1;
                step = -1;
            } else {
                start = 0;
                stop = tds.length;
                step = 1;
            }
            for (index = start; index !== stop; index += step) {
                if (tds[index]) {
                    if (!check || check(tds[index].tag)) {
                        list.push(idxs[index]);
                        if (first || last) {
                            break;
                        }
                    }
                }
            }
            for (i = 0; i < list.length; i++) {
                self.rm(list[i]);
            }
        };

        // add a "marker td" to the cluster
        self.add = function(td, value) {
            td.id = globalId(td.id);
            self.clearById(td.id);
            ids[td.id] = markers.length;
            idxs[markers.length] = td.id;
            markers.push(null); // null = marker not yet created / displayed
            tds.push(td);
            values.push(value);
            updated = true;
        };

        // add a real marker to the cluster
        self.addMarker = function(marker, td) {
            td = td || {};
            td.id = globalId(td.id);
            self.clearById(td.id);
            if (!td.options) {
                td.options = {};
            }
            td.options.position = marker.getPosition();
            attachEvents($container, {
                td: td
            }, marker, td.id);
            ids[td.id] = markers.length;
            idxs[markers.length] = td.id;
            markers.push(marker);
            tds.push(td);
            values.push(td.data || {});
            updated = true;
        };

        // return a "marker td" by its index
        self.td = function(index) {
            return tds[index];
        };

        // return a "marker value" by its index
        self.value = function(index) {
            return values[index];
        };

        // return a marker by its index
        self.marker = function(index) {
            if (index in markers) {
                prepareMarker(index);
                return markers[index];
            }
            return false;
        };

        // return a marker by its index
        self.markerIsSet = function(index) {
            return Boolean(markers[index]);
        };

        // store a new marker instead if the default "false"
        self.setMarker = function(index, marker) {
            markers[index] = marker;
        };

        // link the visible overlay to the logical data (to hide overlays later)
        self.store = function(cluster, obj, shadow) {
            store[cluster.ref] = {
                obj: obj,
                shadow: shadow
            };
        };

        // free all objects
        self.free = function() {
            var i;
            for (i = 0; i < events.length; i++) {
                gm.event.removeListener(events[i]);
            }
            events = [];

            $.each(store, function(key) {
                flush(key);
            });
            store = {};

            $.each(tds, function(i) {
                tds[i] = null;
            });
            tds = [];

            $.each(markers, function(i) {
                if (markers[i]) { // false = removed
                    markers[i].setMap(null);
                    delete markers[i];
                }
            });
            markers = [];

            $.each(values, function(i) {
                delete values[i];
            });
            values = [];

            ids = {};
            idxs = {};
        };

        // link the display function
        self.filter = function(f) {
            ffilter = f;
            redraw();
        };

        // enable/disable the clustering feature
        self.enable = function(value) {
            if (enabled !== value) {
                enabled = value;
                redraw();
            }
        };

        // link the display function
        self.display = function(f) {
            fdisplay = f;
        };

        // link the errorfunction
        self.error = function(f) {
            ferror = f;
        };

        // lock the redraw
        self.beginUpdate = function() {
            updating = true;
        };

        // unlock the redraw
        self.endUpdate = function() {
            updating = false;
            if (updated) {
                redraw();
            }
        };

        // extends current bounds with internal markers
        self.autofit = function(bounds) {
            var i;
            for (i = 0; i < tds.length; i++) {
                if (tds[i]) {
                    bounds.extend(tds[i].options.position);
                }
            }
        };

        // bind events
        function main() {
            projection = overlay.getProjection();
            if (!projection) {
                setTimeout(function() {
                    main.apply(self, []);
                }, 25);
                return;
            }
            ready = true;
            events.push(gm.event.addListener(map, "zoom_changed", delayRedraw));
            events.push(gm.event.addListener(map, "bounds_changed", delayRedraw));
            redraw();
        }

        // flush overlays
        function flush(key) {
            if (isObject(store[key])) { // is overlay
                if (isFunction(store[key].obj.setMap)) {
                    store[key].obj.setMap(null);
                }
                if (isFunction(store[key].obj.remove)) {
                    store[key].obj.remove();
                }
                if (isFunction(store[key].shadow.remove)) {
                    store[key].obj.remove();
                }
                if (isFunction(store[key].shadow.setMap)) {
                    store[key].shadow.setMap(null);
                }
                delete store[key].obj;
                delete store[key].shadow;
            } else if (markers[key]) { // marker not removed
                markers[key].setMap(null);
                // don't remove the marker object, it may be displayed later
            }
            delete store[key];
        }

        /**
         * return the distance between 2 latLng couple into meters
         * Params :
         *  Lat1, Lng1, Lat2, Lng2
         *  LatLng1, Lat2, Lng2
         *  Lat1, Lng1, LatLng2
         *  LatLng1, LatLng2
         **/
        function distanceInMeter() {
            var lat1, lat2, lng1, lng2, e, f, g, h,
                cos = Math.cos,
                sin = Math.sin,
                args = arguments;
            if (args[0] instanceof gm.LatLng) {
                lat1 = args[0].lat();
                lng1 = args[0].lng();
                if (args[1] instanceof gm.LatLng) {
                    lat2 = args[1].lat();
                    lng2 = args[1].lng();
                } else {
                    lat2 = args[1];
                    lng2 = args[2];
                }
            } else {
                lat1 = args[0];
                lng1 = args[1];
                if (args[2] instanceof gm.LatLng) {
                    lat2 = args[2].lat();
                    lng2 = args[2].lng();
                } else {
                    lat2 = args[2];
                    lng2 = args[3];
                }
            }
            e = Math.PI * lat1 / 180;
            f = Math.PI * lng1 / 180;
            g = Math.PI * lat2 / 180;
            h = Math.PI * lng2 / 180;
            return 1000 * 6371 * Math.acos(Math.min(cos(e) * cos(g) * cos(f) * cos(h) + cos(e) * sin(f) * cos(g) * sin(h) + sin(e) * sin(g), 1));
        }

        // extend the visible bounds
        function extendsMapBounds() {
            var radius = distanceInMeter(map.getCenter(), map.getBounds().getNorthEast()),
                circle = new gm.Circle({
                    center: map.getCenter(),
                    radius: 1.25 * radius // + 25%
                });
            return circle.getBounds();
        }

        // return an object where keys are store keys
        function getStoreKeys() {
            var k,
                keys = {};
            for (k in store) {
                keys[k] = true;
            }
            return keys;
        }

        // async the delay function
        function delayRedraw() {
            clearTimeout(timer);
            timer = setTimeout(redraw, 25);
        }

        // generate bounds extended by radius
        function extendsBounds(latLng) {
            var p = projection.fromLatLngToDivPixel(latLng),
                ne = projection.fromDivPixelToLatLng(new gm.Point(p.x + raw.radius, p.y - raw.radius)),
                sw = projection.fromDivPixelToLatLng(new gm.Point(p.x - raw.radius, p.y + raw.radius));
            return new gm.LatLngBounds(sw, ne);
        }

        // run the clustering process and call the display function
        function redraw() {
            if (updating || redrawing || !ready) {
                return;
            }

            var i, j, k, indexes, check = false,
                bounds, cluster, position, previous, lat, lng, loop,
                keys = [],
                used = {},
                zoom = map.getZoom(),
                forceDisabled = ("maxZoom" in raw) && (zoom > raw.maxZoom),
                previousKeys = getStoreKeys();

            // reset flag
            updated = false;

            if (zoom > 3) {
                // extend the bounds of the visible map to manage clusters near the boundaries
                bounds = extendsMapBounds();

                // check contain only if boundaries are valid
                check = bounds.getSouthWest().lng() < bounds.getNorthEast().lng();
            }

            // calculate positions of "visibles" markers (in extended bounds)
            for (i = 0; i < tds.length; i++) {
                if (tds[i] && (!check || bounds.contains(tds[i].options.position)) && (!ffilter || ffilter(values[i]))) {
                    keys.push(i);
                }
            }

            // for each "visible" marker, search its neighbors to create a cluster
            // we can't do a classical "for" loop, because, analysis can bypass a marker while focusing on cluster
            while (1) {
                i = 0;
                while (used[i] && (i < keys.length)) { // look for the next marker not used
                    i++;
                }
                if (i === keys.length) {
                    break;
                }

                indexes = [];

                if (enabled && !forceDisabled) {
                    loop = 10;
                    do {
                        previous = indexes;
                        indexes = [];
                        loop--;

                        if (previous.length) {
                            position = bounds.getCenter();
                        } else {
                            position = tds[keys[i]].options.position;
                        }
                        bounds = extendsBounds(position);

                        for (j = i; j < keys.length; j++) {
                            if (used[j]) {
                                continue;
                            }
                            if (bounds.contains(tds[keys[j]].options.position)) {
                                indexes.push(j);
                            }
                        }
                    } while ((previous.length < indexes.length) && (indexes.length > 1) && loop);
                } else {
                    for (j = i; j < keys.length; j++) {
                        if (!used[j]) {
                            indexes.push(j);
                            break;
                        }
                    }
                }

                cluster = {
                    indexes: [],
                    ref: []
                };
                lat = lng = 0;
                for (k = 0; k < indexes.length; k++) {
                    used[indexes[k]] = true;
                    cluster.indexes.push(keys[indexes[k]]);
                    cluster.ref.push(keys[indexes[k]]);
                    lat += tds[keys[indexes[k]]].options.position.lat();
                    lng += tds[keys[indexes[k]]].options.position.lng();
                }
                lat /= indexes.length;
                lng /= indexes.length;
                cluster.latLng = new gm.LatLng(lat, lng);

                cluster.ref = cluster.ref.join("-");

                if (cluster.ref in previousKeys) { // cluster doesn't change
                    delete previousKeys[cluster.ref]; // remove this entry, these still in this array will be removed
                } else { // cluster is new
                    if (indexes.length === 1) { // alone markers are not stored, so need to keep the key (else, will be displayed every time and marker will blink)
                        store[cluster.ref] = true;
                    }
                    fdisplay(cluster);
                }
            }

            // flush the previous overlays which are not still used
            $.each(previousKeys, function(key) {
                flush(key);
            });
            redrawing = false;
        }
    }
    /**
     * Class Clusterer
     * a facade with limited method for external use
     **/
    function Clusterer(id, internalClusterer) {
        var self = this;
        self.id = function() {
            return id;
        };
        self.filter = function(f) {
            internalClusterer.filter(f);
        };
        self.enable = function() {
            internalClusterer.enable(true);
        };
        self.disable = function() {
            internalClusterer.enable(false);
        };
        self.add = function(marker, td, lock) {
            if (!lock) {
                internalClusterer.beginUpdate();
            }
            internalClusterer.addMarker(marker, td);
            if (!lock) {
                internalClusterer.endUpdate();
            }
        };
        self.getById = function(id) {
            return internalClusterer.getById(id);
        };
        self.clearById = function(id, lock) {
            var result;
            if (!lock) {
                internalClusterer.beginUpdate();
            }
            result = internalClusterer.clearById(id);
            if (!lock) {
                internalClusterer.endUpdate();
            }
            return result;
        };
        self.clear = function(last, first, tag, lock) {
            if (!lock) {
                internalClusterer.beginUpdate();
            }
            internalClusterer.clear(last, first, tag);
            if (!lock) {
                internalClusterer.endUpdate();
            }
        };
    }

    /**
     * Class OverlayView
     * @constructor
     */
    function OverlayView(map, opts, latLng, $div) {
        var self = this,
            listeners = [];

        defaults.classes.OverlayView.call(self);
        self.setMap(map);

        self.onAdd = function() {
            var panes = self.getPanes();
            if (opts.pane in panes) {
                $(panes[opts.pane]).append($div);
            }
            $.each("dblclick click mouseover mousemove mouseout mouseup mousedown".split(" "), function(i, name) {
                listeners.push(
                    gm.event.addDomListener($div[0], name, function(e) {
                        $.Event(e).stopPropagation();
                        gm.event.trigger(self, name, [e]);
                        self.draw();
                    })
                );
            });
            listeners.push(
                gm.event.addDomListener($div[0], "contextmenu", function(e) {
                    $.Event(e).stopPropagation();
                    gm.event.trigger(self, "rightclick", [e]);
                    self.draw();
                })
            );
        };

        self.getPosition = function() {
            return latLng;
        };

        self.setPosition = function(newLatLng) {
            latLng = newLatLng;
            self.draw();
        };

        self.draw = function() {
            var ps = self.getProjection().fromLatLngToDivPixel(latLng);
            $div
                .css("left", (ps.x + opts.offset.x) + "px")
                .css("top", (ps.y + opts.offset.y) + "px");
        };

        self.onRemove = function() {
            var i;
            for (i = 0; i < listeners.length; i++) {
                gm.event.removeListener(listeners[i]);
            }
            $div.remove();
        };

        self.hide = function() {
            $div.hide();
        };

        self.show = function() {
            $div.show();
        };

        self.toggle = function() {
            if ($div) {
                if ($div.is(":visible")) {
                    self.show();
                } else {
                    self.hide();
                }
            }
        };

        self.toggleDOM = function() {
            self.setMap(self.getMap() ? null : map);
        };

        self.getDOMElement = function() {
            return $div[0];
        };
    }

    function Gmap3($this) {
        var self = this,
            stack = new Stack(),
            store = new Store(),
            map = null,
            task;

        /**
         * if not running, start next action in stack
         **/
        function run() {
            if (!task && (task = stack.get())) {
                task.run();
            }
        }

        /**
         * called when action in finished, to acknoledge the current in stack and start next one
         **/
        function end() {
            task = null;
            stack.ack();
            run.call(self); // restart to high level scope
        }

        //-----------------------------------------------------------------------//
        // Tools
        //-----------------------------------------------------------------------//

        /**
         * execute callback functions
         **/
        function callback(args) {
            var params,
                cb = args.td.callback;
            if (cb) {
                params = Array.prototype.slice.call(arguments, 1);
                if (isFunction(cb)) {
                    cb.apply($this, params);
                } else if (isArray(cb)) {
                    if (isFunction(cb[1])) {
                        cb[1].apply(cb[0], params);
                    }
                }
            }
        }

        /**
         * execute ending functions
         **/
        function manageEnd(args, obj, id) {
            if (id) {
                attachEvents($this, args, obj, id);
            }
            callback(args, obj);
            task.ack(obj);
        }

        /**
         * initialize the map if not yet initialized
         **/
        function newMap(latLng, args) {
            args = args || {};
            var opts = args.td && args.td.options ? args.td.options : 0;
            if (map) {
                if (opts) {
                    if (opts.center) {
                        opts.center = toLatLng(opts.center);
                    }
                    map.setOptions(opts);
                }
            } else {
                opts = args.opts || $.extend(true, {}, defaults.map, opts || {});
                opts.center = latLng || toLatLng(opts.center);
                map = new defaults.classes.Map($this.get(0), opts);
            }
        }

        /**
         * store actions to execute in a stack manager
         **/
        self._plan = function(list) {
            var k;
            for (k = 0; k < list.length; k++) {
                stack.add(new Task(self, end, list[k]));
            }
            run();
        };

        /**
         * Initialize gm.Map object
         **/
        self.map = function(args) {
            newMap(args.latLng, args);
            attachEvents($this, args, map);
            manageEnd(args, map);
        };

        /**
         * destroy an existing instance
         **/
        self.destroy = function(args) {
            store.clear();
            $this.empty();
            if (map) {
                map = null;
            }
            manageEnd(args, true);
        };

        /**
         * add an overlay
         **/
        self.overlay = function(args, internal) {
            var objs = [],
                multiple = "values" in args.td;
            if (!multiple) {
                args.td.values = [{
                    latLng: args.latLng,
                    options: args.opts
                }];
            }
            if (!args.td.values.length) {
                manageEnd(args, false);
                return;
            }
            if (!OverlayView.__initialised) {
                OverlayView.prototype = new defaults.classes.OverlayView();
                OverlayView.__initialised = true;
            }
            $.each(args.td.values, function(i, value) {
                var id, obj, td = tuple(args, value),
                    $div = $(document.createElement("div")).css({
                        border: "none",
                        borderWidth: 0,
                        position: "absolute"
                    });
                $div.append(td.options.content);
                obj = new OverlayView(map, td.options, toLatLng(td) || toLatLng(value), $div);
                objs.push(obj);
                $div = null; // memory leak
                if (!internal) {
                    id = store.add(args, "overlay", obj);
                    attachEvents($this, {
                        td: td
                    }, obj, id);
                }
            });
            if (internal) {
                return objs[0];
            }
            manageEnd(args, multiple ? objs : objs[0]);
        };

        /**
         * Create an InternalClusterer object
         **/
        function createClusterer(raw) {
            var internalClusterer = new InternalClusterer($this, map, raw),
                td = {},
                styles = {},
                thresholds = [],
                isInt = /^[0-9]+$/,
                calculator,
                k;

            for (k in raw) {
                if (isInt.test(k)) {
                    thresholds.push(1 * k); // cast to int
                    styles[k] = raw[k];
                    styles[k].width = styles[k].width || 0;
                    styles[k].height = styles[k].height || 0;
                } else {
                    td[k] = raw[k];
                }
            }
            thresholds.sort(function(a, b) {
                return a > b;
            });

            // external calculator
            if (td.calculator) {
                calculator = function(indexes) {
                    var data = [];
                    $.each(indexes, function(i, index) {
                        data.push(internalClusterer.value(index));
                    });
                    return td.calculator.apply($this, [data]);
                };
            } else {
                calculator = function(indexes) {
                    return indexes.length;
                };
            }

            // set error function
            internalClusterer.error(function() {
                error.apply(self, arguments);
            });

            // set display function
            internalClusterer.display(function(cluster) {
                var i, style, atd, obj, offset, shadow,
                    cnt = calculator(cluster.indexes);

                // look for the style to use
                if (raw.force || cnt > 1) {
                    for (i = 0; i < thresholds.length; i++) {
                        if (thresholds[i] <= cnt) {
                            style = styles[thresholds[i]];
                        }
                    }
                }

                if (style) {
                    offset = style.offset || [-style.width / 2, -style.height / 2];
                    // create a custom overlay command
                    // nb: 2 extends are faster self a deeper extend
                    atd = $.extend({}, td);
                    atd.options = $.extend({
                            pane: "overlayLayer",
                            content: style.content ? style.content.replace("CLUSTER_COUNT", cnt) : "",
                            offset: {
                                x: ("x" in offset ? offset.x : offset[0]) || 0,
                                y: ("y" in offset ? offset.y : offset[1]) || 0
                            }
                        },
                        td.options || {});

                    obj = self.overlay({
                        td: atd,
                        opts: atd.options,
                        latLng: toLatLng(cluster)
                    }, true);

                    atd.options.pane = "floatShadow";
                    atd.options.content = $(document.createElement("div")).width(style.width + "px").height(style.height + "px").css({
                        cursor: "pointer"
                    });
                    shadow = self.overlay({
                        td: atd,
                        opts: atd.options,
                        latLng: toLatLng(cluster)
                    }, true);

                    // store data to the clusterer
                    td.data = {
                        latLng: toLatLng(cluster),
                        markers: []
                    };
                    $.each(cluster.indexes, function(i, index) {
                        td.data.markers.push(internalClusterer.value(index));
                        if (internalClusterer.markerIsSet(index)) {
                            internalClusterer.marker(index).setMap(null);
                        }
                    });
                    attachEvents($this, {
                        td: td
                    }, shadow, undef, {
                        main: obj,
                        shadow: shadow
                    });
                    internalClusterer.store(cluster, obj, shadow);
                } else {
                    $.each(cluster.indexes, function(i, index) {
                        internalClusterer.marker(index).setMap(map);
                    });
                }
            });

            return internalClusterer;
        }

        /**
         *  add a marker
         **/
        self.marker = function(args) {
            var objs,
                clusterer, internalClusterer,
                multiple = "values" in args.td,
                init = !map;
            if (!multiple) {
                args.opts.position = args.latLng || toLatLng(args.opts.position);
                args.td.values = [{
                    options: args.opts
                }];
            }
            if (!args.td.values.length) {
                manageEnd(args, false);
                return;
            }
            if (init) {
                newMap();
            }
            if (args.td.cluster && !map.getBounds()) { // map not initialised => bounds not available : wait for map if clustering feature is required
                gm.event.addListenerOnce(map, "bounds_changed", function() {
                    self.marker.apply(self, [args]);
                });
                return;
            }
            if (args.td.cluster) {
                if (args.td.cluster instanceof Clusterer) {
                    clusterer = args.td.cluster;
                    internalClusterer = store.getById(clusterer.id(), true);
                } else {
                    internalClusterer = createClusterer(args.td.cluster);
                    clusterer = new Clusterer(globalId(args.td.id, true), internalClusterer);
                    store.add(args, "clusterer", clusterer, internalClusterer);
                }
                internalClusterer.beginUpdate();

                $.each(args.td.values, function(i, value) {
                    var td = tuple(args, value);
                    td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value);
                    if (td.options.position) {
                        td.options.map = map;
                        if (init) {
                            map.setCenter(td.options.position);
                            init = false;
                        }
                        internalClusterer.add(td, value);
                    }
                });

                internalClusterer.endUpdate();
                manageEnd(args, clusterer);

            } else {
                objs = [];
                $.each(args.td.values, function(i, value) {
                    var id, obj,
                        td = tuple(args, value);
                    td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value);
                    if (td.options.position) {
                        td.options.map = map;
                        if (init) {
                            map.setCenter(td.options.position);
                            init = false;
                        }
                        obj = new defaults.classes.Marker(td.options);
                        objs.push(obj);
                        id = store.add({
                            td: td
                        }, "marker", obj);
                        attachEvents($this, {
                            td: td
                        }, obj, id);
                    }
                });
                manageEnd(args, multiple ? objs : objs[0]);
            }
        };

        /**
         * return a route
         **/
        self.getroute = function(args) {
            args.opts.origin = toLatLng(args.opts.origin, true);
            args.opts.destination = toLatLng(args.opts.destination, true);
            directionsService().route(
                args.opts,
                function(results, status) {
                    callback(args, status === gm.DirectionsStatus.OK ? results : false, status);
                    task.ack();
                }
            );
        };

        /**
         * return the distance between an origin and a destination
         *
         **/
        self.getdistance = function(args) {
            var i;
            args.opts.origins = array(args.opts.origins);
            for (i = 0; i < args.opts.origins.length; i++) {
                args.opts.origins[i] = toLatLng(args.opts.origins[i], true);
            }
            args.opts.destinations = array(args.opts.destinations);
            for (i = 0; i < args.opts.destinations.length; i++) {
                args.opts.destinations[i] = toLatLng(args.opts.destinations[i], true);
            }
            distanceMatrixService().getDistanceMatrix(
                args.opts,
                function(results, status) {
                    callback(args, status === gm.DistanceMatrixStatus.OK ? results : false, status);
                    task.ack();
                }
            );
        };

        /**
         * add an infowindow
         **/
        self.infowindow = function(args) {
            var objs = [],
                multiple = "values" in args.td;
            if (!multiple) {
                if (args.latLng) {
                    args.opts.position = args.latLng;
                }
                args.td.values = [{
                    options: args.opts
                }];
            }
            $.each(args.td.values, function(i, value) {
                var id, obj,
                    td = tuple(args, value);
                td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value.latLng);
                if (!map) {
                    newMap(td.options.position);
                }
                obj = new defaults.classes.InfoWindow(td.options);
                if (obj && (isUndefined(td.open) || td.open)) {
                    if (multiple) {
                        obj.open(map, td.anchor || undef);
                    } else {
                        obj.open(map, td.anchor || (args.latLng ? undef : (args.session.marker ? args.session.marker : undef)));
                    }
                }
                objs.push(obj);
                id = store.add({
                    td: td
                }, "infowindow", obj);
                attachEvents($this, {
                    td: td
                }, obj, id);
            });
            manageEnd(args, multiple ? objs : objs[0]);
        };

        /**
         * add a circle
         **/
        self.circle = function(args) {
            var objs = [],
                multiple = "values" in args.td;
            if (!multiple) {
                args.opts.center = args.latLng || toLatLng(args.opts.center);
                args.td.values = [{
                    options: args.opts
                }];
            }
            if (!args.td.values.length) {
                manageEnd(args, false);
                return;
            }
            $.each(args.td.values, function(i, value) {
                var id, obj,
                    td = tuple(args, value);
                td.options.center = td.options.center ? toLatLng(td.options.center) : toLatLng(value);
                if (!map) {
                    newMap(td.options.center);
                }
                td.options.map = map;
                obj = new defaults.classes.Circle(td.options);
                objs.push(obj);
                id = store.add({
                    td: td
                }, "circle", obj);
                attachEvents($this, {
                    td: td
                }, obj, id);
            });
            manageEnd(args, multiple ? objs : objs[0]);
        };

        /**
         * returns address structure from latlng
         **/
        self.getaddress = function(args) {
            callback(args, args.results, args.status);
            task.ack();
        };

        /**
         * returns latlng from an address
         **/
        self.getlatlng = function(args) {
            callback(args, args.results, args.status);
            task.ack();
        };

        /**
         * return the max zoom of a location
         **/
        self.getmaxzoom = function(args) {
            maxZoomService().getMaxZoomAtLatLng(
                args.latLng,
                function(result) {
                    callback(args, result.status === gm.MaxZoomStatus.OK ? result.zoom : false, status);
                    task.ack();
                }
            );
        };

        /**
         * return the elevation of a location
         **/
        self.getelevation = function(args) {
            var i,
                locations = [],
                f = function(results, status) {
                    callback(args, status === gm.ElevationStatus.OK ? results : false, status);
                    task.ack();
                };

            if (args.latLng) {
                locations.push(args.latLng);
            } else {
                locations = array(args.td.locations || []);
                for (i = 0; i < locations.length; i++) {
                    locations[i] = toLatLng(locations[i]);
                }
            }
            if (locations.length) {
                elevationService().getElevationForLocations({
                    locations: locations
                }, f);
            } else {
                if (args.td.path && args.td.path.length) {
                    for (i = 0; i < args.td.path.length; i++) {
                        locations.push(toLatLng(args.td.path[i]));
                    }
                }
                if (locations.length) {
                    elevationService().getElevationAlongPath({
                        path: locations,
                        samples: args.td.samples
                    }, f);
                } else {
                    task.ack();
                }
            }
        };

        /**
         * define defaults values
         **/
        self.defaults = function(args) {
            $.each(args.td, function(name, value) {
                if (isObject(defaults[name])) {
                    defaults[name] = $.extend({}, defaults[name], value);
                } else {
                    defaults[name] = value;
                }
            });
            task.ack(true);
        };

        /**
         * add a rectangle
         **/
        self.rectangle = function(args) {
            var objs = [],
                multiple = "values" in args.td;
            if (!multiple) {
                args.td.values = [{
                    options: args.opts
                }];
            }
            if (!args.td.values.length) {
                manageEnd(args, false);
                return;
            }
            $.each(args.td.values, function(i, value) {
                var id, obj,
                    td = tuple(args, value);
                td.options.bounds = td.options.bounds ? toLatLngBounds(td.options.bounds) : toLatLngBounds(value);
                if (!map) {
                    newMap(td.options.bounds.getCenter());
                }
                td.options.map = map;

                obj = new defaults.classes.Rectangle(td.options);
                objs.push(obj);
                id = store.add({
                    td: td
                }, "rectangle", obj);
                attachEvents($this, {
                    td: td
                }, obj, id);
            });
            manageEnd(args, multiple ? objs : objs[0]);
        };

        /**
         * add a polygone / polyline
         **/
        function poly(args, poly, path) {
            var objs = [],
                multiple = "values" in args.td;
            if (!multiple) {
                args.td.values = [{
                    options: args.opts
                }];
            }
            if (!args.td.values.length) {
                manageEnd(args, false);
                return;
            }
            newMap();
            $.each(args.td.values, function(_, value) {
                var id, i, j, obj,
                    td = tuple(args, value);
                if (td.options[path]) {
                    if (td.options[path][0][0] && isArray(td.options[path][0][0])) {
                        for (i = 0; i < td.options[path].length; i++) {
                            for (j = 0; j < td.options[path][i].length; j++) {
                                td.options[path][i][j] = toLatLng(td.options[path][i][j]);
                            }
                        }
                    } else {
                        for (i = 0; i < td.options[path].length; i++) {
                            td.options[path][i] = toLatLng(td.options[path][i]);
                        }
                    }
                }
                td.options.map = map;
                obj = new gm[poly](td.options);
                objs.push(obj);
                id = store.add({
                    td: td
                }, poly.toLowerCase(), obj);
                attachEvents($this, {
                    td: td
                }, obj, id);
            });
            manageEnd(args, multiple ? objs : objs[0]);
        }

        self.polyline = function(args) {
            poly(args, "Polyline", "path");
        };

        self.polygon = function(args) {
            poly(args, "Polygon", "paths");
        };

        /**
         * add a traffic layer
         **/
        self.trafficlayer = function(args) {
            newMap();
            var obj = store.get("trafficlayer");
            if (!obj) {
                obj = new defaults.classes.TrafficLayer();
                obj.setMap(map);
                store.add(args, "trafficlayer", obj);
            }
            manageEnd(args, obj);
        };

        /**
         * add a bicycling layer
         **/
        self.bicyclinglayer = function(args) {
            newMap();
            var obj = store.get("bicyclinglayer");
            if (!obj) {
                obj = new defaults.classes.BicyclingLayer();
                obj.setMap(map);
                store.add(args, "bicyclinglayer", obj);
            }
            manageEnd(args, obj);
        };

        /**
         * add a ground overlay
         **/
        self.groundoverlay = function(args) {
            args.opts.bounds = toLatLngBounds(args.opts.bounds);
            if (args.opts.bounds) {
                newMap(args.opts.bounds.getCenter());
            }
            var id,
                obj = new defaults.classes.GroundOverlay(args.opts.url, args.opts.bounds, args.opts.opts);
            obj.setMap(map);
            id = store.add(args, "groundoverlay", obj);
            manageEnd(args, obj, id);
        };

        /**
         * set a streetview
         **/
        self.streetviewpanorama = function(args) {
            if (!args.opts.opts) {
                args.opts.opts = {};
            }
            if (args.latLng) {
                args.opts.opts.position = args.latLng;
            } else if (args.opts.opts.position) {
                args.opts.opts.position = toLatLng(args.opts.opts.position);
            }
            if (args.td.divId) {
                args.opts.container = document.getElementById(args.td.divId);
            } else if (args.opts.container) {
                args.opts.container = $(args.opts.container).get(0);
            }
            var id, obj = new defaults.classes.StreetViewPanorama(args.opts.container, args.opts.opts);
            if (obj) {
                map.setStreetView(obj);
            }
            id = store.add(args, "streetviewpanorama", obj);
            manageEnd(args, obj, id);
        };

        self.kmllayer = function(args) {
            var objs = [],
                multiple = "values" in args.td;
            if (!multiple) {
                args.td.values = [{
                    options: args.opts
                }];
            }
            if (!args.td.values.length) {
                manageEnd(args, false);
                return;
            }
            $.each(args.td.values, function(i, value) {
                var id, obj, options,
                    td = tuple(args, value);
                if (!map) {
                    newMap();
                }
                options = td.options;
                // compatibility 5.0-
                if (td.options.opts) {
                    options = td.options.opts;
                    if (td.options.url) {
                        options.url = td.options.url;
                    }
                }
                // -- end --
                options.map = map;
                if (googleVersionMin("3.10")) {
                    obj = new defaults.classes.KmlLayer(options);
                } else {
                    obj = new defaults.classes.KmlLayer(options.url, options);
                }
                objs.push(obj);
                id = store.add({
                    td: td
                }, "kmllayer", obj);
                attachEvents($this, {
                    td: td
                }, obj, id);
            });
            manageEnd(args, multiple ? objs : objs[0]);
        };

        /**
         * add a fix panel
         **/
        self.panel = function(args) {
            newMap();
            var id, $content,
                x = 0,
                y = 0,
                $div = $(document.createElement("div"));

            $div.css({
                position: "absolute",
                zIndex: 1000,
                visibility: "hidden"
            });

            if (args.opts.content) {
                $content = $(args.opts.content);
                $div.append($content);
                $this.first().prepend($div);

                if (!isUndefined(args.opts.left)) {
                    x = args.opts.left;
                } else if (!isUndefined(args.opts.right)) {
                    x = $this.width() - $content.width() - args.opts.right;
                } else if (args.opts.center) {
                    x = ($this.width() - $content.width()) / 2;
                }

                if (!isUndefined(args.opts.top)) {
                    y = args.opts.top;
                } else if (!isUndefined(args.opts.bottom)) {
                    y = $this.height() - $content.height() - args.opts.bottom;
                } else if (args.opts.middle) {
                    y = ($this.height() - $content.height()) / 2
                }

                $div.css({
                    top: y,
                    left: x,
                    visibility: "visible"
                });
            }

            id = store.add(args, "panel", $div);
            manageEnd(args, $div, id);
            $div = null; // memory leak
        };

        /**
         * add a direction renderer
         **/
        self.directionsrenderer = function(args) {
            args.opts.map = map;
            var id,
                obj = new gm.DirectionsRenderer(args.opts);
            if (args.td.divId) {
                obj.setPanel(document.getElementById(args.td.divId));
            } else if (args.td.container) {
                obj.setPanel($(args.td.container).get(0));
            }
            id = store.add(args, "directionsrenderer", obj);
            manageEnd(args, obj, id);
        };

        /**
         * returns latLng of the user
         **/
        self.getgeoloc = function(args) {
            manageEnd(args, args.latLng);
        };

        /**
         * add a style
         **/
        self.styledmaptype = function(args) {
            newMap();
            var obj = new defaults.classes.StyledMapType(args.td.styles, args.opts);
            map.mapTypes.set(args.td.id, obj);
            manageEnd(args, obj);
        };

        /**
         * add an imageMapType
         **/
        self.imagemaptype = function(args) {
            newMap();
            var obj = new defaults.classes.ImageMapType(args.opts);
            map.mapTypes.set(args.td.id, obj);
            manageEnd(args, obj);
        };

        /**
         * autofit a map using its overlays (markers, rectangles ...)
         **/
        self.autofit = function(args) {
            var bounds = new gm.LatLngBounds();
            $.each(store.all(), function(i, obj) {
                if (obj.getPosition) {
                    bounds.extend(obj.getPosition());
                } else if (obj.getBounds) {
                    bounds.extend(obj.getBounds().getNorthEast());
                    bounds.extend(obj.getBounds().getSouthWest());
                } else if (obj.getPaths) {
                    obj.getPaths().forEach(function(path) {
                        path.forEach(function(latLng) {
                            bounds.extend(latLng);
                        });
                    });
                } else if (obj.getPath) {
                    obj.getPath().forEach(function(latLng) {
                        bounds.extend(latLng);
                    });
                } else if (obj.getCenter) {
                    bounds.extend(obj.getCenter());
                } else if (typeof Clusterer === "function" && obj instanceof Clusterer) {
                    obj = store.getById(obj.id(), true);
                    if (obj) {
                        obj.autofit(bounds);
                    }
                }
            });

            if (!bounds.isEmpty() && (!map.getBounds() || !map.getBounds().equals(bounds))) {
                if ("maxZoom" in args.td) {
                    // fitBouds Callback event => detect zoom level and check maxZoom
                    gm.event.addListenerOnce(
                        map,
                        "bounds_changed",
                        function() {
                            if (this.getZoom() > args.td.maxZoom) {
                                this.setZoom(args.td.maxZoom);
                            }
                        }
                    );
                }
                map.fitBounds(bounds);
            }
            manageEnd(args, true);
        };

        /**
         * remove objects from a map
         **/
        self.clear = function(args) {
            if (isString(args.td)) {
                if (store.clearById(args.td) || store.objClearById(args.td)) {
                    manageEnd(args, true);
                    return;
                }
                args.td = {
                    name: args.td
                };
            }
            if (args.td.id) {
                $.each(array(args.td.id), function(i, id) {
                    store.clearById(id) || store.objClearById(id);
                });
            } else {
                store.clear(array(args.td.name), args.td.last, args.td.first, args.td.tag);
                store.objClear(array(args.td.name), args.td.last, args.td.first, args.td.tag);
            }
            manageEnd(args, true);
        };

        /**
         * return objects previously created
         **/
        self.get = function(args, direct, full) {
            var name, res,
                td = direct ? args : args.td;
            if (!direct) {
                full = td.full;
            }
            if (isString(td)) {
                res = store.getById(td, false, full) || store.objGetById(td);
                if (res === false) {
                    name = td;
                    td = {};
                }
            } else {
                name = td.name;
            }
            if (name === "map") {
                res = map;
            }
            if (!res) {
                res = [];
                if (td.id) {
                    $.each(array(td.id), function(i, id) {
                        res.push(store.getById(id, false, full) || store.objGetById(id));
                    });
                    if (!isArray(td.id)) {
                        res = res[0];
                    }
                } else {
                    $.each(name ? array(name) : [undef], function(i, aName) {
                        var result;
                        if (td.first) {
                            result = store.get(aName, false, td.tag, full);
                            if (result) {
                                res.push(result);
                            }
                        } else if (td.all) {
                            $.each(store.all(aName, td.tag, full), function(i, result) {
                                res.push(result);
                            });
                        } else {
                            result = store.get(aName, true, td.tag, full);
                            if (result) {
                                res.push(result);
                            }
                        }
                    });
                    if (!td.all && !isArray(name)) {
                        res = res[0];
                    }
                }
            }
            res = isArray(res) || !td.all ? res : [res];
            if (direct) {
                return res;
            } else {
                manageEnd(args, res);
            }
        };

        /**
         * run a function on each items selected
         **/
        self.exec = function(args) {
            $.each(array(args.td.func), function(i, func) {
                $.each(self.get(args.td, true, args.td.hasOwnProperty("full") ? args.td.full : true), function(j, res) {
                    func.call($this, res);
                });
            });
            manageEnd(args, true);
        };

        /**
         * trigger events on the map
         **/
        self.trigger = function(args) {
            if (isString(args.td)) {
                gm.event.trigger(map, args.td);
            } else {
                var options = [map, args.td.eventName];
                if (args.td.var_args) {
                    $.each(args.td.var_args, function(i, v) {
                        options.push(v);
                    });
                }
                gm.event.trigger.apply(gm.event, options);
            }
            callback(args);
            task.ack();
        };
    }

    $.fn.gmap3 = function() {
        var i,
            list = [],
            empty = true,
            results = [];

        // init library
        initDefaults();

        // store all arguments in a td list
        for (i = 0; i < arguments.length; i++) {
            if (arguments[i]) {
                list.push(arguments[i]);
            }
        }

        // resolve empty call - run init
        if (!list.length) {
            list.push("map");
        }

        // loop on each jQuery object
        $.each(this, function() {
            var $this = $(this),
                gmap3 = $this.data("gmap3");
            empty = false;
            if (!gmap3) {
                gmap3 = new Gmap3($this);
                $this.data("gmap3", gmap3);
            }
            if (list.length === 1 && (list[0] === "get" || isDirectGet(list[0]))) {
                if (list[0] === "get") {
                    results.push(gmap3.get("map", true));
                } else {
                    results.push(gmap3.get(list[0].get, true, list[0].get.full));
                }
            } else {
                gmap3._plan(list);
            }
        });

        // return for direct call only
        if (results.length) {
            if (results.length === 1) { // 1 css selector
                return results[0];
            }
            return results;
        }

        return this;
    };
})(jQuery);
/*!
 * imagesLoaded PACKAGED v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function() {
    function e() {}

    function t(e, t) {
        for (var n = e.length; n--;)
            if (e[n].listener === t) return n;
        return -1
    }

    function n(e) {
        return function() {
            return this[e].apply(this, arguments)
        }
    }
    var i = e.prototype,
        r = this,
        o = r.EventEmitter;
    i.getListeners = function(e) {
        var t, n, i = this._getEvents();
        if ("object" == typeof e) {
            t = {};
            for (n in i) i.hasOwnProperty(n) && e.test(n) && (t[n] = i[n])
        } else t = i[e] || (i[e] = []);
        return t
    }, i.flattenListeners = function(e) {
        var t, n = [];
        for (t = 0; e.length > t; t += 1) n.push(e[t].listener);
        return n
    }, i.getListenersAsObject = function(e) {
        var t, n = this.getListeners(e);
        return n instanceof Array && (t = {}, t[e] = n), t || n
    }, i.addListener = function(e, n) {
        var i, r = this.getListenersAsObject(e),
            o = "object" == typeof n;
        for (i in r) r.hasOwnProperty(i) && -1 === t(r[i], n) && r[i].push(o ? n : {
            listener: n,
            once: !1
        });
        return this
    }, i.on = n("addListener"), i.addOnceListener = function(e, t) {
        return this.addListener(e, {
            listener: t,
            once: !0
        })
    }, i.once = n("addOnceListener"), i.defineEvent = function(e) {
        return this.getListeners(e), this
    }, i.defineEvents = function(e) {
        for (var t = 0; e.length > t; t += 1) this.defineEvent(e[t]);
        return this
    }, i.removeListener = function(e, n) {
        var i, r, o = this.getListenersAsObject(e);
        for (r in o) o.hasOwnProperty(r) && (i = t(o[r], n), -1 !== i && o[r].splice(i, 1));
        return this
    }, i.off = n("removeListener"), i.addListeners = function(e, t) {
        return this.manipulateListeners(!1, e, t)
    }, i.removeListeners = function(e, t) {
        return this.manipulateListeners(!0, e, t)
    }, i.manipulateListeners = function(e, t, n) {
        var i, r, o = e ? this.removeListener : this.addListener,
            s = e ? this.removeListeners : this.addListeners;
        if ("object" != typeof t || t instanceof RegExp)
            for (i = n.length; i--;) o.call(this, t, n[i]);
        else
            for (i in t) t.hasOwnProperty(i) && (r = t[i]) && ("function" == typeof r ? o.call(this, i, r) : s.call(this, i, r));
        return this
    }, i.removeEvent = function(e) {
        var t, n = typeof e,
            i = this._getEvents();
        if ("string" === n) delete i[e];
        else if ("object" === n)
            for (t in i) i.hasOwnProperty(t) && e.test(t) && delete i[t];
        else delete this._events;
        return this
    }, i.removeAllListeners = n("removeEvent"), i.emitEvent = function(e, t) {
        var n, i, r, o, s = this.getListenersAsObject(e);
        for (r in s)
            if (s.hasOwnProperty(r))
                for (i = s[r].length; i--;) n = s[r][i], n.once === !0 && this.removeListener(e, n.listener), o = n.listener.apply(this, t || []), o === this._getOnceReturnValue() && this.removeListener(e, n.listener);
        return this
    }, i.trigger = n("emitEvent"), i.emit = function(e) {
        var t = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(e, t)
    }, i.setOnceReturnValue = function(e) {
        return this._onceReturnValue = e, this
    }, i._getOnceReturnValue = function() {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, i._getEvents = function() {
        return this._events || (this._events = {})
    }, e.noConflict = function() {
        return r.EventEmitter = o, e
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function() {
        return e
    }) : "object" == typeof module && module.exports ? module.exports = e : this.EventEmitter = e
}).call(this),
    function(e) {
        function t(t) {
            var n = e.event;
            return n.target = n.target || n.srcElement || t, n
        }
        var n = document.documentElement,
            i = function() {};
        n.addEventListener ? i = function(e, t, n) {
            e.addEventListener(t, n, !1)
        } : n.attachEvent && (i = function(e, n, i) {
            e[n + i] = i.handleEvent ? function() {
                var n = t(e);
                i.handleEvent.call(i, n)
            } : function() {
                var n = t(e);
                i.call(e, n)
            }, e.attachEvent("on" + n, e[n + i])
        });
        var r = function() {};
        n.removeEventListener ? r = function(e, t, n) {
            e.removeEventListener(t, n, !1)
        } : n.detachEvent && (r = function(e, t, n) {
            e.detachEvent("on" + t, e[t + n]);
            try {
                delete e[t + n]
            } catch (i) {
                e[t + n] = void 0
            }
        });
        var o = {
            bind: i,
            unbind: r
        };
        "function" == typeof define && define.amd ? define("eventie/eventie", o) : e.eventie = o
    }(this),
    function(e, t) {
        "function" == typeof define && define.amd ? define(["eventEmitter/EventEmitter", "eventie/eventie"], function(n, i) {
            return t(e, n, i)
        }) : "object" == typeof exports ? module.exports = t(e, require("wolfy87-eventemitter"), require("eventie")) : e.imagesLoaded = t(e, e.EventEmitter, e.eventie)
    }(window, function(e, t, n) {
        function i(e, t) {
            for (var n in t) e[n] = t[n];
            return e
        }

        function r(e) {
            return "[object Array]" === d.call(e)
        }

        function o(e) {
            var t = [];
            if (r(e)) t = e;
            else if ("number" == typeof e.length)
                for (var n = 0, i = e.length; i > n; n++) t.push(e[n]);
            else t.push(e);
            return t
        }

        function s(e, t, n) {
            if (!(this instanceof s)) return new s(e, t);
            "string" == typeof e && (e = document.querySelectorAll(e)), this.elements = o(e), this.options = i({}, this.options), "function" == typeof t ? n = t : i(this.options, t), n && this.on("always", n), this.getImages(), a && (this.jqDeferred = new a.Deferred);
            var r = this;
            setTimeout(function() {
                r.check()
            })
        }

        function f(e) {
            this.img = e
        }

        function c(e) {
            this.src = e, v[e] = this
        }
        var a = e.jQuery,
            u = e.console,
            h = u !== void 0,
            d = Object.prototype.toString;
        s.prototype = new t, s.prototype.options = {}, s.prototype.getImages = function() {
            this.images = [];
            for (var e = 0, t = this.elements.length; t > e; e++) {
                var n = this.elements[e];
                "IMG" === n.nodeName && this.addImage(n);
                var i = n.nodeType;
                if (i && (1 === i || 9 === i || 11 === i))
                    for (var r = n.querySelectorAll("img"), o = 0, s = r.length; s > o; o++) {
                        var f = r[o];
                        this.addImage(f)
                    }
            }
        }, s.prototype.addImage = function(e) {
            var t = new f(e);
            this.images.push(t)
        }, s.prototype.check = function() {
            function e(e, r) {
                return t.options.debug && h && u.log("confirm", e, r), t.progress(e), n++, n === i && t.complete(), !0
            }
            var t = this,
                n = 0,
                i = this.images.length;
            if (this.hasAnyBroken = !1, !i) return this.complete(), void 0;
            for (var r = 0; i > r; r++) {
                var o = this.images[r];
                o.on("confirm", e), o.check()
            }
        }, s.prototype.progress = function(e) {
            this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded;
            var t = this;
            setTimeout(function() {
                t.emit("progress", t, e), t.jqDeferred && t.jqDeferred.notify && t.jqDeferred.notify(t, e)
            })
        }, s.prototype.complete = function() {
            var e = this.hasAnyBroken ? "fail" : "done";
            this.isComplete = !0;
            var t = this;
            setTimeout(function() {
                if (t.emit(e, t), t.emit("always", t), t.jqDeferred) {
                    var n = t.hasAnyBroken ? "reject" : "resolve";
                    t.jqDeferred[n](t)
                }
            })
        }, a && (a.fn.imagesLoaded = function(e, t) {
            var n = new s(this, e, t);
            return n.jqDeferred.promise(a(this))
        }), f.prototype = new t, f.prototype.check = function() {
            var e = v[this.img.src] || new c(this.img.src);
            if (e.isConfirmed) return this.confirm(e.isLoaded, "cached was confirmed"), void 0;
            if (this.img.complete && void 0 !== this.img.naturalWidth) return this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), void 0;
            var t = this;
            e.on("confirm", function(e, n) {
                return t.confirm(e.isLoaded, n), !0
            }), e.check()
        }, f.prototype.confirm = function(e, t) {
            this.isLoaded = e, this.emit("confirm", this, t)
        };
        var v = {};
        return c.prototype = new t, c.prototype.check = function() {
            if (!this.isChecked) {
                var e = new Image;
                n.bind(e, "load", this), n.bind(e, "error", this), e.src = this.src, this.isChecked = !0
            }
        }, c.prototype.handleEvent = function(e) {
            var t = "on" + e.type;
            this[t] && this[t](e)
        }, c.prototype.onload = function(e) {
            this.confirm(!0, "onload"), this.unbindProxyEvents(e)
        }, c.prototype.onerror = function(e) {
            this.confirm(!1, "onerror"), this.unbindProxyEvents(e)
        }, c.prototype.confirm = function(e, t) {
            this.isConfirmed = !0, this.isLoaded = e, this.emit("confirm", this, t)
        }, c.prototype.unbindProxyEvents = function(e) {
            n.unbind(e.target, "load", this), n.unbind(e.target, "error", this)
        }, s
    });
/* Infinite Scroll
from here: https://github.com/clockworkgeek/infinite-scroll - it is a fork of the original
added localStorage history so it will try and regenerate on back in browser
 */
(function(p, i, k) {
    i.infinitescroll = function A(F, H, G) {
        this.element = i(G);
        if (!this._create(F, H)) {
            this.failed = true
        }
    };
    i.infinitescroll.defaults = {
        loading: {
            finished: k,
            finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
            img: "data:image/gif;base64,R0lGODlh3AATAPQeAPDy+MnQ6LW/4N3h8MzT6rjC4sTM5r/I5NHX7N7j8c7U6tvg8OLl8uXo9Ojr9b3G5MfP6Ovu9tPZ7PT1+vX2+tbb7vf4+8/W69jd7rC73vn5/O/x+K243ai02////wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgD/ACwAAAAA3AATAAAF/6AnjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEj0BAScpHLJbDqf0Kh0Sq1ar9isdioItAKGw+MAKYMFhbF63CW438f0mg1R2O8EuXj/aOPtaHx7fn96goR4hmuId4qDdX95c4+RBIGCB4yAjpmQhZN0YGYGXitdZBIVGAsLoq4BBKQDswm1CQRkcG6ytrYKubq8vbfAcMK9v7q7EMO1ycrHvsW6zcTKsczNz8HZw9vG3cjTsMIYqQkCLBwHCgsMDQ4RDAYIqfYSFxDxEfz88/X38Onr16+Bp4ADCco7eC8hQYMAEe57yNCew4IVBU7EGNDiRn8Z831cGLHhSIgdFf9chIeBg7oA7gjaWUWTVQAGE3LqBDCTlc9WOHfm7PkTqNCh54rePDqB6M+lR536hCpUqs2gVZM+xbrTqtGoWqdy1emValeXKzggYBBB5y1acFNZmEvXAoN2cGfJrTv3bl69Ffj2xZt3L1+/fw3XRVw4sGDGcR0fJhxZsF3KtBTThZxZ8mLMgC3fRatCbYMNFCzwLEqLgE4NsDWs/tvqdezZf13Hvk2A9Szdu2X3pg18N+68xXn7rh1c+PLksI/Dhe6cuO3ow3NfV92bdArTqC2Ebd3A8vjf5QWfH6Bg7Nz17c2fj69+fnq+8N2Lty+fuP78/eV2X13neIcCeBRwxorbZrA1ANoCDGrgoG8RTshahQ9iSKEEzUmYIYfNWViUhheCGJyIP5E4oom7WWjgCeBFAJNv1DVV01MAdJhhjdkplWNzO/5oXI846njjVEIqR2OS2B1pE5PVscajkxhMycqLJghQSwT40PgfAl4GqNSXYdZXJn5gSkmmmmJu1aZYb14V51do+pTOCmA40AqVCIhG5IJ9PvYnhIFOxmdqhpaI6GeHCtpooisuutmg+Eg62KOMKuqoTaXgicQWoIYq6qiklmoqFV0UoeqqrLbq6quwxirrrLTWauutJ4QAACH5BAUKABwALAcABADOAAsAAAX/IPd0D2dyRCoUp/k8gpHOKtseR9yiSmGbuBykler9XLAhkbDavXTL5k2oqFqNOxzUZPU5YYZd1XsD72rZpBjbeh52mSNnMSC8lwblKZGwi+0QfIJ8CncnCoCDgoVnBHmKfByGJimPkIwtiAeBkH6ZHJaKmCeVnKKTHIihg5KNq4uoqmEtcRUtEREMBggtEr4QDrjCuRC8h7/BwxENeicSF8DKy82pyNLMOxzWygzFmdvD2L3P0dze4+Xh1Arkyepi7dfFvvTtLQkZBC0T/FX3CRgCMOBHsJ+EHYQY7OinAGECgQsB+Lu3AOK+CewcWjwxQeJBihtNGHSoQOE+iQ3//4XkwBBhRZMcUS6YSXOAwIL8PGqEaSJCiYt9SNoCmnJPAgUVLChdaoFBURN8MAzl2PQphwQLfDFd6lTowglHve6rKpbjhK7/pG5VinZP1qkiz1rl4+tr2LRwWU64cFEihwEtZgbgR1UiHaMVvxpOSwBA37kzGz9e8G+B5MIEKLutOGEsAH2ATQwYfTmuX8aETWdGPZmiZcccNSzeTCA1Sw0bdiitC7LBWgu8jQr8HRzqgpK6gX88QbrB14z/kF+ELpwB8eVQj/JkqdylAudji/+ts3039vEEfK8Vz2dlvxZKG0CmbkKDBvllRd6fCzDvBLKBDSCeffhRJEFebFk1k/Mv9jVIoIJZSeBggwUaNeB+Qk34IE0cXlihcfRxkOAJFFhwGmKlmWDiakZhUJtnLBpnWWcnKaAZcxI0piFGGLBm1mc90kajSCveeBVWKeYEoU2wqeaQi0PetoE+rr14EpVC7oAbAUHqhYExbn2XHHsVqbcVew9tx8+XJKk5AZsqqdlddGpqAKdbAYBn1pcczmSTdWvdmZ17c1b3FZ99vnTdCRFM8OEcAhLwm1NdXnWcBBSMRWmfkWZqVlsmLIiAp/o1gGV2vpS4lalGYsUOqXrddcKCmK61aZ8SjEpUpVFVoCpTj4r661Km7kBHjrDyc1RAIQAAIfkEBQoAGwAsBwAEAM4ACwAABf/gtmUCd4goQQgFKj6PYKi0yrrbc8i4ohQt12EHcal+MNSQiCP8gigdz7iCioaCIvUmZLp8QBzW0EN2vSlCuDtFKaq4RyHzQLEKZNdiQDhRDVooCwkbfm59EAmKi4SGIm+AjIsKjhsqB4mSjT2IOIOUnICeCaB/mZKFNTSRmqVpmJqklSqskq6PfYYCDwYHDC4REQwGCBLGxxIQDsHMwhAIX8bKzcENgSLGF9PU1j3Sy9zX2NrgzQziChLk1BHWxcjf7N046tvN82715czn9Pryz6Ilc4ACj4EBOCZM8KEnAYYADBRKnACAYUMFv1wotIhCEcaJCisqwJFgAUSQGyX/kCSVUUTIdKMwJlyo0oXHlhskwrTJciZHEXsgaqS4s6PJiCAr1uzYU8kBBSgnWFqpoMJMUjGtDmUwkmfVmVypakWhEKvXsS4nhLW5wNjVroJIoc05wSzTr0PtiigpYe4EC2vj4iWrFu5euWIMRBhacaVJhYQBEFjA9jHjyQ0xEABwGceGAZYjY0YBOrRLCxUp29QM+bRkx5s7ZyYgVbTqwwti2ybJ+vLtDYpycyZbYOlptxdx0kV+V7lC5iJAyyRrwYKxAdiz82ng0/jnAdMJFz0cPi104Ec1Vj9/M6F173vKL/feXv156dw11tlqeMMnv4V5Ap53GmjQQH97nFfg+IFiucfgRX5Z8KAgbUlQ4IULIlghhhdOSB6AgX0IVn8eReghen3NRIBsRgnH4l4LuEidZBjwRpt6NM5WGwoW0KSjCwX6yJSMab2GwwAPDXfaBCtWpluRTQqC5JM5oUZAjUNS+VeOLWpJEQ7VYQANW0INJSZVDFSnZphjSikfmzE5N4EEbQI1QJmnWXCmHulRp2edwDXF43txukenJwvI9xyg9Q26Z3MzGUcBYFEChZh6DVTq34AU8Iflh51Sd+CnKFYQ6mmZkhqfBKfSxZWqA9DZanWjxmhrWwi0qtCrt/43K6WqVjjpmhIqgEGvculaGKklKstAACEAACH5BAUKABwALAcABADOAAsAAAX/ICdyQmaMYyAUqPgIBiHPxNpy79kqRXH8wAPsRmDdXpAWgWdEIYm2llCHqjVHU+jjJkwqBTecwItShMXkEfNWSh8e1NGAcLgpDGlRgk7EJ/6Ae3VKfoF/fDuFhohVeDeCfXkcCQqDVQcQhn+VNDOYmpSWaoqBlUSfmowjEA+iEAEGDRGztAwGCDcXEA60tXEiCrq8vREMEBLIyRLCxMWSHMzExnbRvQ2Sy7vN0zvVtNfU2tLY3rPgLdnDvca4VQS/Cpk3ABwSLQkYAQwT/P309vcI7OvXr94jBQMJ/nskkGA/BQBRLNDncAIAiDcG6LsxAWOLiQzmeURBKWSLCQbv/1F0eDGinJUKR47YY1IEgQASKk7Yc7ACRwZm7mHweRJoz59BJUogisKCUaFMR0x4SlJBVBFTk8pZivTR0K73rN5wqlXEAq5Fy3IYgHbEzQ0nLy4QSoCjXLoom96VOJEeCosK5n4kkFfqXjl94wa+l1gvAcGICbewAOAxY8l/Ky/QhAGz4cUkGxu2HNozhwMGBnCUqUdBg9UuW9eUynqSwLHIBujePef1ZGQZXcM+OFuEBeBhi3OYgLyqcuaxbT9vLkf4SeqyWxSQpKGB2gQpm1KdWbu72rPRzR9Ne2Nu9Kzr/1Jqj0yD/fvqP4aXOt5sW/5qsXXVcv1Nsp8IBUAmgswGF3llGgeU1YVXXKTN1FlhWFXW3gIE+DVChApysACHHo7Q4A35lLichh+ROBmLKAzgYmYEYDAhCgxKGOOMn4WR4kkDaoBBOxJtdNKQxFmg5JIWIBnQc07GaORfUY4AEkdV6jHlCEISSZ5yTXpp1pbGZbkWmcuZmQCaE6iJ0FhjMaDjTMsgZaNEHFRAQVp3bqXnZED1qYcECOz5V6BhSWCoVJQIKuKQi2KFKEkEFAqoAo7uYSmO3jk61wUUMKmknJ4SGimBmAa0qVQBhAAAIfkEBQoAGwAsBwAEAM4ACwAABf/gJm5FmRlEqhJC+bywgK5pO4rHI0D3pii22+Mg6/0Ej96weCMAk7cDkXf7lZTTnrMl7eaYoy10JN0ZFdco0XAuvKI6qkgVFJXYNwjkIBcNBgR8TQoGfRsJCRuCYYQQiI+ICosiCoGOkIiKfSl8mJkHZ4U9kZMbKaI3pKGXmJKrngmug4WwkhA0lrCBWgYFCCMQFwoQDRHGxwwGCBLMzRLEx8iGzMMO0cYNeCMKzBDW19lnF9DXDIY/48Xg093f0Q3s1dcR8OLe8+Y91OTv5wrj7o7B+7VNQqABIoRVCMBggsOHE36kSoCBIcSH3EbFangxogJYFi8CkJhqQciLJEf/LDDJEeJIBT0GsOwYUYJGBS0fjpQAMidGmyVP6sx4Y6VQhzs9VUwkwqaCCh0tmKoFtSMDmBOf9phg4SrVrROuasRQAaxXpVUhdsU6IsECZlvX3kwLUWzRt0BHOLTbNlbZG3vZinArge5Dvn7wbqtQkSYAAgtKmnSsYKVKo2AfW048uaPmG386i4Q8EQMBAIAnfB7xBxBqvapJ9zX9WgRS2YMpnvYMGdPK3aMjt/3dUcNI4blpj7iwkMFWDXDvSmgAlijrt9RTR78+PS6z1uAJZIe93Q8g5zcsWCi/4Y+C8bah5zUv3vv89uft30QP23punGCx5954oBBwnwYaNCDY/wYrsYeggnM9B2Fpf8GG2CEUVWhbWAtGouEGDy7Y4IEJVrbSiXghqGKIo7z1IVcXIkKWWR361QOLWWnIhwERpLaaCCee5iMBGJQmJGyPFTnbkfHVZGRtIGrg5HALEJAZbu39BuUEUmq1JJQIPtZilY5hGeSWsSk52G9XqsmgljdIcABytq13HyIM6RcUA+r1qZ4EBF3WHWB29tBgAzRhEGhig8KmqKFv8SeCeo+mgsF7YFXa1qWSbkDpom/mqR1PmHCqJ3fwNRVXjC7S6CZhFVCQ2lWvZiirhQq42SACt25IK2hv8TprriUV1usGgeka7LFcNmCldMLi6qZMgFLgpw16Cipb7bC1knXsBiEAACH5BAUKABsALAcABADOAAsAAAX/4FZsJPkUmUGsLCEUTywXglFuSg7fW1xAvNWLF6sFFcPb42C8EZCj24EJdCp2yoegWsolS0Uu6fmamg8n8YYcLU2bXSiRaXMGvqV6/KAeJAh8VgZqCX+BexCFioWAYgqNi4qAR4ORhRuHY408jAeUhAmYYiuVlpiflqGZa5CWkzc5fKmbbhIpsAoQDRG8vQwQCBLCwxK6vb5qwhfGxxENahvCEA7NzskSy7vNzzzK09W/PNHF1NvX2dXcN8K55cfh69Luveol3vO8zwi4Yhj+AQwmCBw4IYclDAAJDlQggVOChAoLKkgFkSCAHDwWLKhIEOONARsDKryogFPIiAUb/95gJNIiw4wnI778GFPhzBKFOAq8qLJEhQpiNArjMcHCmlTCUDIouTKBhApELSxFWiGiVKY4E2CAekPgUphDu0742nRrVLJZnyrFSqKQ2ohoSYAMW6IoDpNJ4bLdILTnAj8KUF7UeENjAKuDyxIgOuGiOI0EBBMgLNew5AUrDTMGsFixwBIaNCQuAXJB57qNJ2OWm2Aj4skwCQCIyNkhhtMkdsIuodE0AN4LJDRgfLPtn5YDLdBlraAByuUbBgxQwICxMOnYpVOPej074OFdlfc0TqC62OIbcppHjV4o+LrieWhfT8JC/I/T6W8oCl29vQ0XjLdBaA3s1RcPBO7lFvpX8BVoG4O5jTXRQRDuJ6FDTzEWF1/BCZhgbyAKE9qICYLloQYOFtahVRsWYlZ4KQJHlwHS/IYaZ6sZd9tmu5HQm2xi1UaTbzxYwJk/wBF5g5EEYOBZeEfGZmNdFyFZmZIR4jikbLThlh5kUUVJGmRT7sekkziRWUIACABk3T4qCsedgO4xhgGcY7q5pHJ4klBBTQRJ0CeHcoYHHUh6wgfdn9uJdSdMiebGJ0zUPTcoS286FCkrZxnYoYYKWLkBowhQoBeaOlZAgVhLidrXqg2GiqpQpZ4apwSwRtjqrB3muoF9BboaXKmshlqWqsWiGt2wphJkQbAU5hoCACH5BAUKABsALAcABADOAAsAAAX/oGFw2WZuT5oZROsSQnGaKjRvilI893MItlNOJ5v5gDcFrHhKIWcEYu/xFEqNv6B1N62aclysF7fsZYe5aOx2yL5aAUGSaT1oTYMBwQ5VGCAJgYIJCnx1gIOBhXdwiIl7d0p2iYGQUAQBjoOFSQR/lIQHnZ+Ue6OagqYzSqSJi5eTpTxGcjcSChANEbu8DBAIEsHBChe5vL13G7fFuscRDcnKuM3H0La3EA7Oz8kKEsXazr7Cw9/Gztar5uHHvte47MjktznZ2w0G1+D3BgirAqJmJMAQgMGEgwgn5Ei0gKDBhBMALGRYEOJBb5QcWlQo4cbAihZz3GgIMqFEBSM1/4ZEOWPAgpIIJXYU+PIhRG8ja1qU6VHlzZknJNQ6UanCjQkWCIGSUGEjAwVLjc44+DTqUQtPPS5gejUrTa5TJ3g9sWCr1BNUWZI161StiQUDmLYdGfesibQ3XMq1OPYthrwuA2yU2LBs2cBHIypYQPPlYAKFD5cVvNPtW8eVGbdcQADATsiNO4cFAPkvHpedPzc8kUcPgNGgZ5RNDZG05reoE9s2vSEP79MEGiQGy1qP8LA4ZcdtsJE48ONoLTBtTV0B9LsTnPceoIDBDQvS7W7vfjVY3q3eZ4A339J4eaAmKqU/sV58HvJh2RcnIBsDUw0ABqhBA5aV5V9XUFGiHfVeAiWwoFgJJrIXRH1tEMiDFV4oHoAEGlaWhgIGSGBO2nFomYY3mKjVglidaNYJGJDkWW2xxTfbjCbVaOGNqoX2GloR8ZeTaECS9pthRGJH2g0b3Agbk6hNANtteHD2GJUucfajCQBy5OOTQ25ZgUPvaVVQmbKh9510/qQpwXx3SQdfk8tZJOd5b6JJFplT3ZnmmX3qd5l1eg5q00HrtUkUn0AKaiGjClSAgKLYZcgWXwocGRcCFGCKwSB6ceqphwmYRUFYT/1WKlOdUpipmxW0mlCqHjYkAaeoZlqrqZ4qd+upQKaapn/AmgAegZ8KUtYtFAQQAgAh+QQFCgAbACwHAAQAzgALAAAF/+C2PUcmiCiZGUTrEkKBis8jQEquKwU5HyXIbEPgyX7BYa5wTNmEMwWsSXsqFbEh8DYs9mrgGjdK6GkPY5GOeU6ryz7UFopSQEzygOGhJBjoIgMDBAcBM0V/CYqLCQqFOwobiYyKjn2TlI6GKC2YjJZknouaZAcQlJUHl6eooJwKooobqoewrJSEmyKdt59NhRKFMxLEEA4RyMkMEAjDEhfGycqAG8TQx9IRDRDE3d3R2ctD1RLg0ttKEnbY5wZD3+zJ6M7X2RHi9Oby7u/r9g38UFjTh2xZJBEBMDAboogAgwkQI07IMUORwocSJwCgWDFBAIwZOaJIsOBjRogKJP8wTODw5ESVHVtm3AhzpEeQElOuNDlTZ0ycEUWKWFASqEahGwYUPbnxoAgEdlYSqDBkgoUNClAlIHbSAoOsqCRQnQHxq1axVb06FWFxLIqyaze0Tft1JVqyE+pWXMD1pF6bYl3+HTqAWNW8cRUFzmih0ZAAB2oGKukSAAGGRHWJgLiR6AylBLpuHKKUMlMCngMpDSAa9QIUggZVVvDaJobLeC3XZpvgNgCmtPcuwP3WgmXSq4do0DC6o2/guzcseECtUoO0hmcsGKDgOt7ssBd07wqesAIGZC1YIBa7PQHvb1+SFo+++HrJSQfB33xfav3i5eX3Hnb4CTJgegEq8tH/YQEOcIJzbm2G2EoYRLgBXFpVmFYDcREV4HIcnmUhiGBRouEMJGJGzHIspqgdXxK0yCKHRNXoIX4uorCdTyjkyNtdPWrA4Up82EbAbzMRxxZRR54WXVLDIRmRcag5d2R6ugl3ZXzNhTecchpMhIGVAKAYpgJjjsSklBEd99maZoo535ZvdamjBEpusJyctg3h4X8XqodBMx0tiNeg/oGJaKGABpogS40KSqiaEgBqlQWLUtqoVQnytekEjzo0hHqhRorppOZt2p923M2AAV+oBtpAnnPNoB6HaU6mAAIU+IXmi3j2mtFXuUoHKwXpzVrsjcgGOauKEjQrwq157hitGq2NoWmjh7z6Wmxb0m5w66+2VRAuXN/yFUAIACH5BAUKABsALAcABADOAAsAAAX/4CZuRiaM45MZqBgIRbs9AqTcuFLE7VHLOh7KB5ERdjJaEaU4ClO/lgKWjKKcMiJQ8KgumcieVdQMD8cbBeuAkkC6LYLhOxoQ2PF5Ys9PKPBMen17f0CCg4VSh32JV4t8jSNqEIOEgJKPlkYBlJWRInKdiJdkmQlvKAsLBxdABA4RsbIMBggtEhcQsLKxDBC2TAS6vLENdJLDxMZAubu8vjIbzcQRtMzJz79S08oQEt/guNiyy7fcvMbh4OezdAvGrakLAQwyABsELQkY9BP+//ckyPDD4J9BfAMh1GsBoImMeQUN+lMgUJ9CiRMa5msxoB9Gh/o8GmxYMZXIgxtR/yQ46S/gQAURR0pDwYDfywoyLPip5AdnCwsMFPBU4BPFhKBDi444quCmDKZOfwZ9KEGpCKgcN1jdALSpPqIYsabS+nSqvqplvYqQYAeDPgwKwjaMtiDl0oaqUAyo+3TuWwUAMPpVCfee0cEjVBGQq2ABx7oTWmQk4FglZMGN9fGVDMCuiH2AOVOu/PmyxM630gwM0CCn6q8LjVJ8GXvpa5Uwn95OTC/nNxkda1/dLSK475IjCD6dHbK1ZOa4hXP9DXs5chJ00UpVm5xo2qRpoxptwF2E4/IbJpB/SDz9+q9b1aNfQH08+p4a8uvX8B53fLP+ycAfemjsRUBgp1H20K+BghHgVgt1GXZXZpZ5lt4ECjxYR4ScUWiShEtZqBiIInRGWnERNnjiBglw+JyGnxUmGowsyiiZg189lNtPGACjV2+S9UjbU0JWF6SPvEk3QZEqsZYTk3UAaRSUnznJI5LmESCdBVSyaOWUWLK4I5gDUYVeV1T9l+FZClCAUVA09uSmRHBCKAECFEhW51ht6rnmWBXkaR+NjuHpJ40D3DmnQXt2F+ihZxlqVKOfQRACACH5BAUKABwALAcABADOAAsAAAX/ICdyUCkUo/g8mUG8MCGkKgspeC6j6XEIEBpBUeCNfECaglBcOVfJFK7YQwZHQ6JRZBUqTrSuVEuD3nI45pYjFuWKvjjSkCoRaBUMWxkwBGgJCXspQ36Bh4EEB0oKhoiBgyNLjo8Ki4QElIiWfJqHnISNEI+Ql5J9o6SgkqKkgqYihamPkW6oNBgSfiMMDQkGCBLCwxIQDhHIyQwQCGMKxsnKVyPCF9DREQ3MxMPX0cu4wt7J2uHWx9jlKd3o39MiuefYEcvNkuLt5O8c1ePI2tyELXGQwoGDAQf+iEC2xByDCRAjTlAgIUWCBRgCPJQ4AQBFXAs0coT40WLIjRxL/47AcHLkxIomRXL0CHPERZkpa4q4iVKiyp0tR/7kwHMkTUBBJR5dOCEBAVcKKtCAyOHpowXCpk7goABqBZdcvWploACpBKkpIJI1q5OD2rIWE0R1uTZu1LFwbWL9OlKuWb4c6+o9i3dEgw0RCGDUG9KlRw56gDY2qmCByZBaASi+TACA0TucAaTteCcy0ZuOK3N2vJlx58+LRQyY3Xm0ZsgjZg+oPQLi7dUcNXi0LOJw1pgNtB7XG6CBy+U75SYfPTSQAgZTNUDnQHt67wnbZyvwLgKiMN3oCZB3C76tdewpLFgIP2C88rbi4Y+QT3+8S5USMICZXWj1pkEDeUU3lOYGB3alSoEiMIjgX4WlgNF2EibIwQIXauWXSRg2SAOHIU5IIIMoZkhhWiJaiFVbKo6AQEgQXrTAazO1JhkBrBG3Y2Y6EsUhaGn95hprSN0oWpFE7rhkeaQBchGOEWnwEmc0uKWZj0LeuNV3W4Y2lZHFlQCSRjTIl8uZ+kG5HU/3sRlnTG2ytyadytnD3HrmuRcSn+0h1dycexIK1KCjYaCnjCCVqOFFJTZ5GkUUjESWaUIKU2lgCmAKKQIUjHapXRKE+t2og1VgankNYnohqKJ2CmKplso6GKz7WYCgqxeuyoF8u9IQAgA7",
            msg: null,
            msgText: "<em>Loading the next set of posts...</em>",
            selector: null,
            speed: "fast",
            start: k
        },
        state: {
            isDuringAjax: false,
            isInvalidPage: false,
            isDestroyed: false,
            isDone: false,
            isPaused: false,
            isBeyondMaxPage: false,
            currPage: 1
        },
        debug: false,
        behavior: k,
        binder: i(p),
        nextSelector: "div.navigation a:first",
        navSelector: "div.navigation",
        contentSelector: null,
        extraScrollPx: 150,
        itemSelector: "div.post",
        animate: false,
        pathParse: k,
        dataType: "html",
        appendCallback: true,
        bufferPx: 40,
        errorCallback: function() {},
        infid: 0,
        pixelsFromNavToBottom: k,
        path: k,
        prefill: false,
        maxPage: k
    };
    i.infinitescroll.prototype = {
        _binding: function g(H) {
            var F = this,
                G = F.options;
            G.v = "2.0b2.120520";
            if (!!G.behavior && this["_binding_" + G.behavior] !== k) {
                this["_binding_" + G.behavior].call(this);
                return
            }
            if (H !== "bind" && H !== "unbind") {
                this._debug("Binding value  " + H + " not valid");
                return false
            }
            if (H === "unbind") {
                (this.options.binder).unbind("smartscroll.infscr." + F.options.infid)
            } else {
                (this.options.binder)[H]("smartscroll.infscr." + F.options.infid, function() {
                    F.scroll()
                })
            }
            this._debug("Binding", H)
        },
        _create: function u(H, L) {
            var I = i.extend(true, {}, i.infinitescroll.defaults, H);
            this.options = I;
            var K = i(p);
            var F = this;
            if (!F._validate(H)) {
                return false
            }
            var J = i(I.nextSelector).attr("href");
            if (!J) {
                this._debug("Navigation selector not found");
                return false
            }
            I.path = I.path || this._determinepath(J);
            I.contentSelector = I.contentSelector || this.element;
            I.loading.selector = I.loading.selector || I.contentSelector;
            I.loading.msg = I.loading.msg || i('<div id="infscr-loading"><img alt="Loading..." src="' + I.loading.img + '" /><div>' + I.loading.msgText + "</div></div>");
            (new Image()).src = I.loading.img;
            if (I.pixelsFromNavToBottom === k) {
                I.pixelsFromNavToBottom = i(document).height() - i(I.navSelector).offset().top;
                this._debug("pixelsFromNavToBottom: " + I.pixelsFromNavToBottom)
            }
            var G = this;
            I.loading.start = I.loading.start || function() {
                i(I.navSelector).hide();
                I.loading.msg.appendTo(I.loading.selector).show(I.loading.speed, i.proxy(function() {
                    this.beginAjax(I)
                }, G))
            };
            I.loading.finished = I.loading.finished || function() {
                if (!I.state.isBeyondMaxPage) {
                    I.loading.msg.fadeOut(I.loading.speed)
                }
            };
            I.callback = function(M, O, N) {
                if (!!I.behavior && M["_callback_" + I.behavior] !== k) {
                    M["_callback_" + I.behavior].call(i(I.contentSelector)[0], O, N)
                }
                if (L) {
                    L.call(i(I.contentSelector)[0], O, I, N)
                }
                if (I.prefill) {
                    K.bind("resize.infinite-scroll", M._prefill)
                }
            };
            if (H.debug) {
                if (Function.prototype.bind && (typeof console === "object" || typeof console === "function") && typeof console.log === "object") {
                    ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"].forEach(function(M) {
                        console[M] = this.call(console[M], console)
                    }, Function.prototype.bind)
                }
            }
            this._setup();
            if (I.prefill) {
                this._prefill()
            }
            return true
        },
        _prefill: function n() {
            var F = this;
            var H = i(p);

            function G() {
                return (F.options.contentSelector.height() <= H.height())
            }
            this._prefill = function() {
                if (G()) {
                    F.scroll()
                }
                H.bind("resize.infinite-scroll", function() {
                    if (G()) {
                        H.unbind("resize.infinite-scroll");
                        F.scroll()
                    }
                })
            };
            this._prefill()
        },
        _debug: function r() {
            if (true !== this.options.debug) {
                return
            }
            if (typeof console !== "undefined" && typeof console.log === "function") {
                if ((Array.prototype.slice.call(arguments)).length === 1 && typeof Array.prototype.slice.call(arguments)[0] === "string") {
                    console.log((Array.prototype.slice.call(arguments)).toString())
                } else {
                    console.log(Array.prototype.slice.call(arguments))
                }
            } else {
                if (!Function.prototype.bind && typeof console !== "undefined" && typeof console.log === "object") {
                    Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments))
                }
            }
        },
        _determinepath: function C(G) {
            var F = this.options;
            if (!!F.behavior && this["_determinepath_" + F.behavior] !== k) {
                return this["_determinepath_" + F.behavior].call(this, G)
            }
            if (!!F.pathParse) {
                this._debug("pathParse manual");
                return F.pathParse(G, this.options.state.currPage + 1)
            } else {
                if (G.match(/^(.*?)\b2\b(.*?$)/)) {
                    G = G.match(/^(.*?)\b2\b(.*?$)/).slice(1)
                } else {
                    if (G.match(/^(.*?)2(.*?$)/)) {
                        if (G.match(/^(.*?page=)2(\/.*|$)/)) {
                            G = G.match(/^(.*?page=)2(\/.*|$)/).slice(1);
                            return G
                        }
                        G = G.match(/^(.*?)2(.*?$)/).slice(1)
                    } else {
                        if (G.match(/^(.*?page=)1(\/.*|$)/)) {
                            G = G.match(/^(.*?page=)1(\/.*|$)/).slice(1);
                            return G
                        } else {
                            this._debug("Sorry, we couldn't parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.");
                            F.state.isInvalidPage = true
                        }
                    }
                }
            }
            this._debug("determinePath", G);
            return G
        },
        _error: function w(G) {
            var F = this.options;
            if (!!F.behavior && this["_error_" + F.behavior] !== k) {
                this["_error_" + F.behavior].call(this, G);
                return
            }
            if (G !== "destroy" && G !== "end") {
                G = "unknown"
            }
            this._debug("Error", G);
            if (G === "end" || F.state.isBeyondMaxPage) {
                this._showdonemsg()
            }
            F.state.isDone = true;
            F.state.currPage = 1;
            F.state.isPaused = false;
            F.state.isBeyondMaxPage = false;
            this._binding("unbind")
        },
        _cache: function q(F, G) {
            if (p.sessionStorage) {
                sessionStorage.setItem("infscr::" + F, G)
            }
        },
        _loadcallback: function c(J, I, G) {
            var F = this.options,
                L = this.options.callback,
                N = (F.state.isDone) ? "done" : (!F.appendCallback) ? "no-append" : "append",
                M;
            if (!!F.behavior && this["_loadcallback_" + F.behavior] !== k) {
                this["_loadcallback_" + F.behavior].call(this, J, I);
                return
            }
            switch (N) {
                case "done":
                    this._showdonemsg();
                    return false;
                case "no-append":
                    if (F.dataType === "html") {
                        I = "<div>" + I + "</div>";
                        I = i(I).find(F.itemSelector)
                    }
                    break;
                case "append":
                    var H = J.children();
                    if (H.length === 0) {
                        return this._error("end")
                    }
                    M = document.createDocumentFragment();
                    while (J[0].firstChild) {
                        M.appendChild(J[0].firstChild)
                    }
                    this._debug("contentSelector", i(F.contentSelector)[0]);
                    i(F.contentSelector)[0].appendChild(M);
                    I = H.get();
                    break
            }
            F.loading.finished.call(i(F.contentSelector)[0], F);
            if (F.animate) {
                var K = i(p).scrollTop() + i(F.loading.msg).height() + F.extraScrollPx + "px";
                i("html,body").animate({
                    scrollTop: K
                }, 800, function() {
                    F.state.isDuringAjax = false
                })
            }
            if (!F.animate) {
                F.state.isDuringAjax = false
            }
            L(this, I, G);
            if (F.prefill) {
                this._prefill()
            }
        },
        _nearbottom: function v() {
            var G = this.options,
                F = 0 + i(document).height() - (G.binder.scrollTop()) - i(p).height();
            if (!!G.behavior && this["_nearbottom_" + G.behavior] !== k) {
                return this["_nearbottom_" + G.behavior].call(this)
            }
            this._debug("math:", F, G.pixelsFromNavToBottom);
            return (F - G.bufferPx < G.pixelsFromNavToBottom)
        },
        _pausing: function l(G) {
            var F = this.options;
            if (!!F.behavior && this["_pausing_" + F.behavior] !== k) {
                this["_pausing_" + F.behavior].call(this, G);
                return
            }
            if (G !== "pause" && G !== "resume" && G !== null) {
                this._debug("Invalid argument. Toggling pause value instead")
            }
            G = (G && (G === "pause" || G === "resume")) ? G : "toggle";
            switch (G) {
                case "pause":
                    F.state.isPaused = true;
                    break;
                case "resume":
                    F.state.isPaused = false;
                    break;
                case "toggle":
                    F.state.isPaused = !F.state.isPaused;
                    break
            }
            this._debug("Paused", F.state.isPaused);
            return false
        },
        _setup: function s() {
            var F = this.options;
            if (!!F.behavior && this["_setup_" + F.behavior] !== k) {
                this["_setup_" + F.behavior].call(this);
                return
            }
            this._binding("bind");
            this.restore();
            return false
        },
        _showdonemsg: function a() {
            var F = this.options;
            if (!!F.behavior && this["_showdonemsg_" + F.behavior] !== k) {
                this["_showdonemsg_" + F.behavior].call(this);
                return
            }
            F.loading.msg.find("img").hide().parent().find("div").html(F.loading.finishedMsg).animate({
                opacity: 1
            }, 2000, function() {
                i(this).parent().fadeOut(F.loading.speed)
            });
            F.errorCallback.call(i(F.contentSelector)[0], "done")
        },
        _validate: function x(G) {
            for (var F in G) {
                if (F.indexOf && F.indexOf("Selector") > -1 && i(G[F]).length === 0) {
                    this._debug("Your " + F + " found no elements.");
                    return false
                }
            }
            return true
        },
        bind: function o() {
            this._binding("bind")
        },
        destroy: function E() {
            this.options.state.isDestroyed = true;
            this.options.loading.finished();
            return this._error("destroy")
        },
        pause: function e() {
            this._pausing("pause")
        },
        resume: function h() {
            this._pausing("resume")
        },
        beginAjax: function D(I) {
            var G = this,
                K = I.path,
                H, F, M, L;
            I.state.currPage++;
            if (I.maxPage != k && I.state.currPage > I.maxPage) {
                I.state.isBeyondMaxPage = true;
                this.destroy();
                return
            }
            H = i(I.contentSelector).is("table, tbody") ? i("<tbody/>") : i("<div/>");
            F = (typeof K === "function") ? K(I.state.currPage) : K.join(I.state.currPage);
            G._debug("heading into ajax", F);
            M = (I.dataType === "html" || I.dataType === "json") ? I.dataType : "html+callback";
            if (I.appendCallback && I.dataType === "html") {
                M += "+callback"
            }
            switch (M) {
                case "html+callback":
                    G._debug("Using HTML via .load() method");
                    H.load(F + " " + I.itemSelector, k, function J(N) {
                        G._loadcallback(H, N, F);
                        G._cache(F, N)
                    });
                    break;
                case "html":
                    G._debug("Using " + (M.toUpperCase()) + " via $.ajax() method");
                    i.ajax({
                        url: F,
                        dataType: I.dataType,
                        complete: function J(N, O) {
                            L = (typeof(N.isResolved) !== "undefined") ? (N.isResolved()) : (O === "success" || O === "notmodified");
                            if (L) {
                                G._loadcallback(H, N.responseText, F);
                                G._cache(destUrl, N.responseText)
                            } else {
                                G._error("end")
                            }
                        }
                    });
                    break;
                case "json":
                    G._debug("Using " + (M.toUpperCase()) + " via $.ajax() method");
                    i.ajax({
                        dataType: "json",
                        type: "GET",
                        url: F,
                        success: function(P, Q, O) {
                            L = (typeof(O.isResolved) !== "undefined") ? (O.isResolved()) : (Q === "success" || Q === "notmodified");
                            if (I.appendCallback) {
                                if (I.template !== k) {
                                    var N = I.template(P);
                                    H.append(N);
                                    if (L) {
                                        G._loadcallback(H, N);
                                        G._cache(F, O.responseText)
                                    } else {
                                        G._error("end")
                                    }
                                } else {
                                    G._debug("template must be defined.");
                                    G._error("end")
                                }
                            } else {
                                if (L) {
                                    G._loadcallback(H, P, F);
                                    G._cache(F, O.responseText)
                                } else {
                                    G._error("end")
                                }
                            }
                        },
                        error: function() {
                            G._debug("JSON ajax request failed.");
                            G._error("end")
                        }
                    });
                    break
            }
        },
        restore: function B() {
            var J = this.options;
            if (!p.sessionStorage || !!J.behavior || J.state.isDestroyed) {
                return
            }
            var G = this,
                L = J.path,
                I, F, M, K;
            F = (typeof L === "function") ? L(J.state.currPage + 1) : L.join(J.state.currPage + 1);
            K = sessionStorage.getItem("infscr::" + F);
            if (!K) {
                G._debug("sessionStorage does not have " + F);
                return
            }
            J.state.currPage++;
            if (J.maxPage != k && J.state.currPage > J.maxPage) {
                J.state.isBeyondMaxPage = true;
                this.destroy();
                return
            }
            I = i(J.contentSelector).is("table, tbody") ? i("<tbody/>") : i("<div/>");
            M = (J.dataType === "html" || J.dataType === "json") ? J.dataType : "html+callback";
            if (J.appendCallback && J.dataType === "html") {
                M += "+callback"
            }
            switch (M) {
                case "html":
                case "html+callback":
                    G._debug("Using HTML from sessionStorage (" + F + ")");
                    I.html(!J.itemSelector ? K : i("<div>").append(i(K)).find(J.itemSelector));
                    this._loadcallback(I, K, F);
                    break;
                case "json":
                    G._debug("Using JSON from sessionStorage (" + F + ")");
                    if (J.appendCallback) {
                        if (J.template !== k) {
                            var H = J.template(JSON.parse(K));
                            I.append(H);
                            G._loadcallback(I, H, F)
                        } else {
                            G._debug("template must be defined.");
                            G._error("end")
                        }
                    } else {
                        G._loadcallback(I, JSON.parse(K), F)
                    }
                    break
            }
            G.restore()
        },
        retrieve: function b(H) {
            H = H || null;
            var F = this,
                G = F.options;
            if (!!G.behavior && this["retrieve_" + G.behavior] !== k) {
                this["retrieve_" + G.behavior].call(this, H);
                return
            }
            if (G.state.isDestroyed) {
                this._debug("Instance is destroyed");
                return false
            }
            G.state.isDuringAjax = true;
            G.loading.start.call(i(G.contentSelector)[0], G)
        },
        scroll: function f() {
            var F = this.options,
                G = F.state;
            if (!!F.behavior && this["scroll_" + F.behavior] !== k) {
                this["scroll_" + F.behavior].call(this);
                return
            }
            if (G.isDuringAjax || G.isInvalidPage || G.isDone || G.isDestroyed || G.isPaused) {
                return
            }
            if (!this._nearbottom()) {
                return
            }
            this.retrieve()
        },
        toggle: function z() {
            this._pausing()
        },
        unbind: function m() {
            this._binding("unbind")
        },
        update: function j(F) {
            if (i.isPlainObject(F)) {
                this.options = i.extend(true, this.options, F)
            }
        }
    };
    i.fn.infinitescroll = function d(H, I) {
        var G = typeof H;
        switch (G) {
            case "string":
                var F = Array.prototype.slice.call(arguments, 1);
                this.each(function() {
                    var J = i.data(this, "infinitescroll");
                    if (!J) {
                        return false
                    }
                    if (!i.isFunction(J[H]) || H.charAt(0) === "_") {
                        return false
                    }
                    J[H].apply(J, F)
                });
                break;
            case "object":
                this.each(function() {
                    var J = i.data(this, "infinitescroll");
                    if (J) {
                        J.update(H)
                    } else {
                        J = new i.infinitescroll(H, I, this);
                        if (!J.failed) {
                            i.data(this, "infinitescroll", J)
                        }
                    }
                });
                break
        }
        return this
    };
    var y = i.event,
        t;
    y.special.smartscroll = {
        setup: function() {
            i(this).bind("scroll", y.special.smartscroll.handler)
        },
        teardown: function() {
            i(this).unbind("scroll", y.special.smartscroll.handler)
        },
        handler: function(I, F) {
            var H = this,
                G = arguments;
            I.type = "smartscroll";
            if (t) {
                clearTimeout(t)
            }
            t = setTimeout(function() {
                i(H).trigger("smartscroll", G)
            }, F === "execAsap" ? 0 : 100)
        }
    };
    i.fn.smartscroll = function(F) {
        return F ? this.bind("smartscroll", F) : this.trigger("smartscroll", ["execAsap"])
    }
})(window, jQuery);
/*!
 * Isotope PACKAGED v2.2.2
 *
 * Licensed GPLv3
 *
 * http://isotope.metafizzy.co
 * Copyright 2015 Metafizzy
 */

/**
 * Bridget makes jQuery widgets
 * v1.1.0
 * MIT license
 */

(function(window) {



    // -------------------------- utils -------------------------- //

    var slice = Array.prototype.slice;

    function noop() {}

    // -------------------------- definition -------------------------- //

    function defineBridget($) {

        // bail if no jQuery
        if (!$) {
            return;
        }

        // -------------------------- addOptionMethod -------------------------- //

        /**
         * adds option method -> $().plugin('option', {...})
         * @param {Function} PluginClass - constructor class
         */
        function addOptionMethod(PluginClass) {
            // don't overwrite original option method
            if (PluginClass.prototype.option) {
                return;
            }

            // option setter
            PluginClass.prototype.option = function(opts) {
                // bail out if not an object
                if (!$.isPlainObject(opts)) {
                    return;
                }
                this.options = $.extend(true, this.options, opts);
            };
        }

        // -------------------------- plugin bridge -------------------------- //

        // helper function for logging errors
        // $.error breaks jQuery chaining
        var logError = typeof console === 'undefined' ? noop :
            function(message) {
                console.error(message);
            };

        /**
         * jQuery plugin bridge, access methods like $elem.plugin('method')
         * @param {String} namespace - plugin name
         * @param {Function} PluginClass - constructor class
         */
        function bridge(namespace, PluginClass) {
            // add to jQuery fn namespace
            $.fn[namespace] = function(options) {
                if (typeof options === 'string') {
                    // call plugin method when first argument is a string
                    // get arguments for method
                    var args = slice.call(arguments, 1);

                    for (var i = 0, len = this.length; i < len; i++) {
                        var elem = this[i];
                        var instance = $.data(elem, namespace);
                        if (!instance) {
                            logError("cannot call methods on " + namespace + " prior to initialization; " +
                                "attempted to call '" + options + "'");
                            continue;
                        }
                        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                            logError("no such method '" + options + "' for " + namespace + " instance");
                            continue;
                        }

                        // trigger method with arguments
                        var returnValue = instance[options].apply(instance, args);

                        // break look and return first value if provided
                        if (returnValue !== undefined) {
                            return returnValue;
                        }
                    }
                    // return this if no return value
                    return this;
                } else {
                    return this.each(function() {
                        var instance = $.data(this, namespace);
                        if (instance) {
                            // apply options & init
                            instance.option(options);
                            instance._init();
                        } else {
                            // initialize new instance
                            instance = new PluginClass(this, options);
                            $.data(this, namespace, instance);
                        }
                    });
                }
            };

        }

        // -------------------------- bridget -------------------------- //

        /**
         * converts a Prototypical class into a proper jQuery plugin
         *   the class must have a ._init method
         * @param {String} namespace - plugin name, used in $().pluginName
         * @param {Function} PluginClass - constructor class
         */
        $.bridget = function(namespace, PluginClass) {
            addOptionMethod(PluginClass);
            bridge(namespace, PluginClass);
        };

        return $.bridget;

    }

    // transport
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('jquery-bridget/jquery.bridget', ['jquery'], defineBridget);
    } else if (typeof exports === 'object') {
        defineBridget(require('jquery'));
    } else {
        // get jquery from browser global
        defineBridget(window.jQuery);
    }

})(window);

/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

(function(window) {



    var docElem = document.documentElement;

    var bind = function() {};

    function getIEEvent(obj) {
        var event = window.event;
        // add event.target
        event.target = event.target || event.srcElement || obj;
        return event;
    }

    if (docElem.addEventListener) {
        bind = function(obj, type, fn) {
            obj.addEventListener(type, fn, false);
        };
    } else if (docElem.attachEvent) {
        bind = function(obj, type, fn) {
            obj[type + fn] = fn.handleEvent ?
                function() {
                    var event = getIEEvent(obj);
                    fn.handleEvent.call(fn, event);
                } :
                function() {
                    var event = getIEEvent(obj);
                    fn.call(obj, event);
                };
            obj.attachEvent("on" + type, obj[type + fn]);
        };
    }

    var unbind = function() {};

    if (docElem.removeEventListener) {
        unbind = function(obj, type, fn) {
            obj.removeEventListener(type, fn, false);
        };
    } else if (docElem.detachEvent) {
        unbind = function(obj, type, fn) {
            obj.detachEvent("on" + type, obj[type + fn]);
            try {
                delete obj[type + fn];
            } catch (err) {
                // can't delete window object properties
                obj[type + fn] = undefined;
            }
        };
    }

    var eventie = {
        bind: bind,
        unbind: unbind
    };

    // ----- module definition ----- //

    if (typeof define === 'function' && define.amd) {
        // AMD
        define('eventie/eventie', eventie);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = eventie;
    } else {
        // browser global
        window.eventie = eventie;
    }

})(window);

/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;
(function() {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        } else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    } else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        } else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        } else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        } else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        } else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define('eventEmitter/EventEmitter', [], function() {
            return EventEmitter;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = EventEmitter;
    } else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

/*!
 * getStyleProperty v1.0.4
 * original by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false, exports: false, module: false */

(function(window) {



    var prefixes = 'Webkit Moz ms Ms O'.split(' ');
    var docElemStyle = document.documentElement.style;

    function getStyleProperty(propName) {
        if (!propName) {
            return;
        }

        // test standard property first
        if (typeof docElemStyle[propName] === 'string') {
            return propName;
        }

        // capitalize
        propName = propName.charAt(0).toUpperCase() + propName.slice(1);

        // test vendor specific properties
        var prefixed;
        for (var i = 0, len = prefixes.length; i < len; i++) {
            prefixed = prefixes[i] + propName;
            if (typeof docElemStyle[prefixed] === 'string') {
                return prefixed;
            }
        }
    }

    // transport
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('get-style-property/get-style-property', [], function() {
            return getStyleProperty;
        });
    } else if (typeof exports === 'object') {
        // CommonJS for Component
        module.exports = getStyleProperty;
    } else {
        // browser global
        window.getStyleProperty = getStyleProperty;
    }

})(window);

/*!
 * getSize v1.2.2
 * measure size of elements
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, exports: false, require: false, module: false, console: false */

(function(window, undefined) {



    // -------------------------- helpers -------------------------- //

    // get a number from a string, not a percentage
    function getStyleSize(value) {
        var num = parseFloat(value);
        // not a percent like '100%', and a number
        var isValid = value.indexOf('%') === -1 && !isNaN(num);
        return isValid && num;
    }

    function noop() {}

    var logError = typeof console === 'undefined' ? noop :
        function(message) {
            console.error(message);
        };

    // -------------------------- measurements -------------------------- //

    var measurements = [
        'paddingLeft',
        'paddingRight',
        'paddingTop',
        'paddingBottom',
        'marginLeft',
        'marginRight',
        'marginTop',
        'marginBottom',
        'borderLeftWidth',
        'borderRightWidth',
        'borderTopWidth',
        'borderBottomWidth'
    ];

    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        };
        for (var i = 0, len = measurements.length; i < len; i++) {
            var measurement = measurements[i];
            size[measurement] = 0;
        }
        return size;
    }



    function defineGetSize(getStyleProperty) {

        // -------------------------- setup -------------------------- //

        var isSetup = false;

        var getStyle, boxSizingProp, isBoxSizeOuter;

        /**
         * setup vars and functions
         * do it on initial getSize(), rather than on script load
         * For Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=548397
         */
        function setup() {
            // setup once
            if (isSetup) {
                return;
            }
            isSetup = true;

            var getComputedStyle = window.getComputedStyle;
            getStyle = (function() {
                var getStyleFn = getComputedStyle ?
                    function(elem) {
                        return getComputedStyle(elem, null);
                    } :
                    function(elem) {
                        return elem.currentStyle;
                    };

                return function getStyle(elem) {
                    var style = getStyleFn(elem);
                    if (!style) {
                        logError('Style returned ' + style +
                            '. Are you running this code in a hidden iframe on Firefox? ' +
                            'See http://bit.ly/getsizebug1');
                    }
                    return style;
                };
            })();

            // -------------------------- box sizing -------------------------- //

            boxSizingProp = getStyleProperty('boxSizing');

            /**
             * WebKit measures the outer-width on style.width on border-box elems
             * IE & Firefox measures the inner-width
             */
            if (boxSizingProp) {
                var div = document.createElement('div');
                div.style.width = '200px';
                div.style.padding = '1px 2px 3px 4px';
                div.style.borderStyle = 'solid';
                div.style.borderWidth = '1px 2px 3px 4px';
                div.style[boxSizingProp] = 'border-box';

                var body = document.body || document.documentElement;
                body.appendChild(div);
                var style = getStyle(div);

                isBoxSizeOuter = getStyleSize(style.width) === 200;
                body.removeChild(div);
            }

        }

        // -------------------------- getSize -------------------------- //

        function getSize(elem) {
            setup();

            // use querySeletor if elem is string
            if (typeof elem === 'string') {
                elem = document.querySelector(elem);
            }

            // do not proceed on non-objects
            if (!elem || typeof elem !== 'object' || !elem.nodeType) {
                return;
            }

            var style = getStyle(elem);

            // if hidden, everything is 0
            if (style.display === 'none') {
                return getZeroSize();
            }

            var size = {};
            size.width = elem.offsetWidth;
            size.height = elem.offsetHeight;

            var isBorderBox = size.isBorderBox = !!(boxSizingProp &&
                style[boxSizingProp] && style[boxSizingProp] === 'border-box');

            // get all measurements
            for (var i = 0, len = measurements.length; i < len; i++) {
                var measurement = measurements[i];
                var value = style[measurement];
                value = mungeNonPixel(elem, value);
                var num = parseFloat(value);
                // any 'auto', 'medium' value will be 0
                size[measurement] = !isNaN(num) ? num : 0;
            }

            var paddingWidth = size.paddingLeft + size.paddingRight;
            var paddingHeight = size.paddingTop + size.paddingBottom;
            var marginWidth = size.marginLeft + size.marginRight;
            var marginHeight = size.marginTop + size.marginBottom;
            var borderWidth = size.borderLeftWidth + size.borderRightWidth;
            var borderHeight = size.borderTopWidth + size.borderBottomWidth;

            var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

            // overwrite width and height if we can get it from style
            var styleWidth = getStyleSize(style.width);
            if (styleWidth !== false) {
                size.width = styleWidth +
                    // add padding and border unless it's already including it
                    (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
            }

            var styleHeight = getStyleSize(style.height);
            if (styleHeight !== false) {
                size.height = styleHeight +
                    // add padding and border unless it's already including it
                    (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
            }

            size.innerWidth = size.width - (paddingWidth + borderWidth);
            size.innerHeight = size.height - (paddingHeight + borderHeight);

            size.outerWidth = size.width + marginWidth;
            size.outerHeight = size.height + marginHeight;

            return size;
        }

        // IE8 returns percent values, not pixels
        // taken from jQuery's curCSS
        function mungeNonPixel(elem, value) {
            // IE8 and has percent value
            if (window.getComputedStyle || value.indexOf('%') === -1) {
                return value;
            }
            var style = elem.style;
            // Remember the original values
            var left = style.left;
            var rs = elem.runtimeStyle;
            var rsLeft = rs && rs.left;

            // Put in the new values to get a computed value out
            if (rsLeft) {
                rs.left = elem.currentStyle.left;
            }
            style.left = value;
            value = style.pixelLeft;

            // Revert the changed values
            style.left = left;
            if (rsLeft) {
                rs.left = rsLeft;
            }

            return value;
        }

        return getSize;

    }

    // transport
    if (typeof define === 'function' && define.amd) {
        // AMD for RequireJS
        define('get-size/get-size', ['get-style-property/get-style-property'], defineGetSize);
    } else if (typeof exports === 'object') {
        // CommonJS for Component
        module.exports = defineGetSize(require('desandro-get-style-property'));
    } else {
        // browser global
        window.getSize = defineGetSize(window.getStyleProperty);
    }

})(window);

/*!
 * docReady v1.0.4
 * Cross browser DOMContentLoaded event emitter
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true*/
/*global define: false, require: false, module: false */

(function(window) {



    var document = window.document;
    // collection of functions to be triggered on ready
    var queue = [];

    function docReady(fn) {
        // throw out non-functions
        if (typeof fn !== 'function') {
            return;
        }

        if (docReady.isReady) {
            // ready now, hit it
            fn();
        } else {
            // queue function when ready
            queue.push(fn);
        }
    }

    docReady.isReady = false;

    // triggered on various doc ready events
    function onReady(event) {
        // bail if already triggered or IE8 document is not ready just yet
        var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
        if (docReady.isReady || isIE8NotReady) {
            return;
        }

        trigger();
    }

    function trigger() {
        docReady.isReady = true;
        // process queue
        for (var i = 0, len = queue.length; i < len; i++) {
            var fn = queue[i];
            fn();
        }
    }

    function defineDocReady(eventie) {
        // trigger ready if page is ready
        if (document.readyState === 'complete') {
            trigger();
        } else {
            // listen for events
            eventie.bind(document, 'DOMContentLoaded', onReady);
            eventie.bind(document, 'readystatechange', onReady);
            eventie.bind(window, 'load', onReady);
        }

        return docReady;
    }

    // transport
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('doc-ready/doc-ready', ['eventie/eventie'], defineDocReady);
    } else if (typeof exports === 'object') {
        module.exports = defineDocReady(require('eventie'));
    } else {
        // browser global
        window.docReady = defineDocReady(window.eventie);
    }

})(window);

/**
 * matchesSelector v1.0.3
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

(function(ElemProto) {

    'use strict';

    var matchesMethod = (function() {
        // check for the standard method name first
        if (ElemProto.matches) {
            return 'matches';
        }
        // check un-prefixed
        if (ElemProto.matchesSelector) {
            return 'matchesSelector';
        }
        // check vendor prefixes
        var prefixes = ['webkit', 'moz', 'ms', 'o'];

        for (var i = 0, len = prefixes.length; i < len; i++) {
            var prefix = prefixes[i];
            var method = prefix + 'MatchesSelector';
            if (ElemProto[method]) {
                return method;
            }
        }
    })();

    // ----- match ----- //

    function match(elem, selector) {
        return elem[matchesMethod](selector);
    }

    // ----- appendToFragment ----- //

    function checkParent(elem) {
        // not needed if already has parent
        if (elem.parentNode) {
            return;
        }
        var fragment = document.createDocumentFragment();
        fragment.appendChild(elem);
    }

    // ----- query ----- //

    // fall back to using QSA
    // thx @jonathantneal https://gist.github.com/3062955
    function query(elem, selector) {
        // append to fragment if no parent
        checkParent(elem);

        // match elem with all selected elems of parent
        var elems = elem.parentNode.querySelectorAll(selector);
        for (var i = 0, len = elems.length; i < len; i++) {
            // return true if match
            if (elems[i] === elem) {
                return true;
            }
        }
        // otherwise return false
        return false;
    }

    // ----- matchChild ----- //

    function matchChild(elem, selector) {
        checkParent(elem);
        return match(elem, selector);
    }

    // ----- matchesSelector ----- //

    var matchesSelector;

    if (matchesMethod) {
        // IE9 supports matchesSelector, but doesn't work on orphaned elems
        // check for that
        var div = document.createElement('div');
        var supportsOrphans = match(div, 'div');
        matchesSelector = supportsOrphans ? match : matchChild;
    } else {
        matchesSelector = query;
    }

    // transport
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('matches-selector/matches-selector', [], function() {
            return matchesSelector;
        });
    } else if (typeof exports === 'object') {
        module.exports = matchesSelector;
    } else {
        // browser global
        window.matchesSelector = matchesSelector;
    }

})(Element.prototype);

/**
 * Fizzy UI utils v1.0.1
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

(function(window, factory) {
    /*global define: false, module: false, require: false */
    'use strict';
    // universal module definition

    if (typeof define == 'function' && define.amd) {
        // AMD
        define('fizzy-ui-utils/utils', [
            'doc-ready/doc-ready',
            'matches-selector/matches-selector'
        ], function(docReady, matchesSelector) {
            return factory(window, docReady, matchesSelector);
        });
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            window,
            require('doc-ready'),
            require('desandro-matches-selector')
        );
    } else {
        // browser global
        window.fizzyUIUtils = factory(
            window,
            window.docReady,
            window.matchesSelector
        );
    }

}(window, function factory(window, docReady, matchesSelector) {



    var utils = {};

    // ----- extend ----- //

    // extends objects
    utils.extend = function(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    };

    // ----- modulo ----- //

    utils.modulo = function(num, div) {
        return ((num % div) + div) % div;
    };

    // ----- isArray ----- //

    var objToString = Object.prototype.toString;
    utils.isArray = function(obj) {
        return objToString.call(obj) == '[object Array]';
    };

    // ----- makeArray ----- //

    // turn element or nodeList into an array
    utils.makeArray = function(obj) {
        var ary = [];
        if (utils.isArray(obj)) {
            // use object if already an array
            ary = obj;
        } else if (obj && typeof obj.length == 'number') {
            // convert nodeList to array
            for (var i = 0, len = obj.length; i < len; i++) {
                ary.push(obj[i]);
            }
        } else {
            // array of single index
            ary.push(obj);
        }
        return ary;
    };

    // ----- indexOf ----- //

    // index of helper cause IE8
    utils.indexOf = Array.prototype.indexOf ? function(ary, obj) {
        return ary.indexOf(obj);
    } : function(ary, obj) {
        for (var i = 0, len = ary.length; i < len; i++) {
            if (ary[i] === obj) {
                return i;
            }
        }
        return -1;
    };

    // ----- removeFrom ----- //

    utils.removeFrom = function(ary, obj) {
        var index = utils.indexOf(ary, obj);
        if (index != -1) {
            ary.splice(index, 1);
        }
    };

    // ----- isElement ----- //

    // http://stackoverflow.com/a/384380/182183
    utils.isElement = (typeof HTMLElement == 'function' || typeof HTMLElement == 'object') ?
        function isElementDOM2(obj) {
            return obj instanceof HTMLElement;
        } :
        function isElementQuirky(obj) {
            return obj && typeof obj == 'object' &&
                obj.nodeType == 1 && typeof obj.nodeName == 'string';
        };

    // ----- setText ----- //

    utils.setText = (function() {
        var setTextProperty;

        function setText(elem, text) {
            // only check setTextProperty once
            setTextProperty = setTextProperty || (document.documentElement.textContent !== undefined ? 'textContent' : 'innerText');
            elem[setTextProperty] = text;
        }
        return setText;
    })();

    // ----- getParent ----- //

    utils.getParent = function(elem, selector) {
        while (elem != document.body) {
            elem = elem.parentNode;
            if (matchesSelector(elem, selector)) {
                return elem;
            }
        }
    };

    // ----- getQueryElement ----- //

    // use element as selector string
    utils.getQueryElement = function(elem) {
        if (typeof elem == 'string') {
            return document.querySelector(elem);
        }
        return elem;
    };

    // ----- handleEvent ----- //

    // enable .ontype to trigger from .addEventListener( elem, 'type' )
    utils.handleEvent = function(event) {
        var method = 'on' + event.type;
        if (this[method]) {
            this[method](event);
        }
    };

    // ----- filterFindElements ----- //

    utils.filterFindElements = function(elems, selector) {
        // make array of elems
        elems = utils.makeArray(elems);
        var ffElems = [];

        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            // check that elem is an actual element
            if (!utils.isElement(elem)) {
                continue;
            }
            // filter & find items if we have a selector
            if (selector) {
                // filter siblings
                if (matchesSelector(elem, selector)) {
                    ffElems.push(elem);
                }
                // find children
                var childElems = elem.querySelectorAll(selector);
                // concat childElems to filterFound array
                for (var j = 0, jLen = childElems.length; j < jLen; j++) {
                    ffElems.push(childElems[j]);
                }
            } else {
                ffElems.push(elem);
            }
        }

        return ffElems;
    };

    // ----- debounceMethod ----- //

    utils.debounceMethod = function(_class, methodName, threshold) {
        // original method
        var method = _class.prototype[methodName];
        var timeoutName = methodName + 'Timeout';

        _class.prototype[methodName] = function() {
            var timeout = this[timeoutName];
            if (timeout) {
                clearTimeout(timeout);
            }
            var args = arguments;

            var _this = this;
            this[timeoutName] = setTimeout(function() {
                method.apply(_this, args);
                delete _this[timeoutName];
            }, threshold || 100);
        };
    };

    // ----- htmlInit ----- //

    // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
    utils.toDashed = function(str) {
        return str.replace(/(.)([A-Z])/g, function(match, $1, $2) {
            return $1 + '-' + $2;
        }).toLowerCase();
    };

    var console = window.console;
    /**
     * allow user to initialize classes via .js-namespace class
     * htmlInit( Widget, 'widgetName' )
     * options are parsed from data-namespace-option attribute
     */
    utils.htmlInit = function(WidgetClass, namespace) {
        docReady(function() {
            var dashedNamespace = utils.toDashed(namespace);
            var elems = document.querySelectorAll('.js-' + dashedNamespace);
            var dataAttr = 'data-' + dashedNamespace + '-options';

            for (var i = 0, len = elems.length; i < len; i++) {
                var elem = elems[i];
                var attr = elem.getAttribute(dataAttr);
                var options;
                try {
                    options = attr && JSON.parse(attr);
                } catch (error) {
                    // log error, do not initialize
                    if (console) {
                        console.error('Error parsing ' + dataAttr + ' on ' +
                            elem.nodeName.toLowerCase() + (elem.id ? '#' + elem.id : '') + ': ' +
                            error);
                    }
                    continue;
                }
                // initialize
                var instance = new WidgetClass(elem, options);
                // make available via $().data('layoutname')
                var jQuery = window.jQuery;
                if (jQuery) {
                    jQuery.data(elem, namespace, instance);
                }
            }
        });
    };

    // -----  ----- //

    return utils;

}));

/**
 * Outlayer Item
 */

(function(window, factory) {
    'use strict';
    // universal module definition
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('outlayer/item', [
                'eventEmitter/EventEmitter',
                'get-size/get-size',
                'get-style-property/get-style-property',
                'fizzy-ui-utils/utils'
            ],
            function(EventEmitter, getSize, getStyleProperty, utils) {
                return factory(window, EventEmitter, getSize, getStyleProperty, utils);
            }
        );
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(
            window,
            require('wolfy87-eventemitter'),
            require('get-size'),
            require('desandro-get-style-property'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        window.Outlayer = {};
        window.Outlayer.Item = factory(
            window,
            window.EventEmitter,
            window.getSize,
            window.getStyleProperty,
            window.fizzyUIUtils
        );
    }

}(window, function factory(window, EventEmitter, getSize, getStyleProperty, utils) {
    'use strict';

    // ----- helpers ----- //

    var getComputedStyle = window.getComputedStyle;
    var getStyle = getComputedStyle ?
        function(elem) {
            return getComputedStyle(elem, null);
        } :
        function(elem) {
            return elem.currentStyle;
        };


    function isEmptyObj(obj) {
        for (var prop in obj) {
            return false;
        }
        prop = null;
        return true;
    }

    // -------------------------- CSS3 support -------------------------- //

    var transitionProperty = getStyleProperty('transition');
    var transformProperty = getStyleProperty('transform');
    var supportsCSS3 = transitionProperty && transformProperty;
    var is3d = !!getStyleProperty('perspective');

    var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'otransitionend',
        transition: 'transitionend'
    }[transitionProperty];

    // properties that could have vendor prefix
    var prefixableProperties = [
        'transform',
        'transition',
        'transitionDuration',
        'transitionProperty'
    ];

    // cache all vendor properties
    var vendorProperties = (function() {
        var cache = {};
        for (var i = 0, len = prefixableProperties.length; i < len; i++) {
            var prop = prefixableProperties[i];
            var supportedProp = getStyleProperty(prop);
            if (supportedProp && supportedProp !== prop) {
                cache[prop] = supportedProp;
            }
        }
        return cache;
    })();

    // -------------------------- Item -------------------------- //

    function Item(element, layout) {
        if (!element) {
            return;
        }

        this.element = element;
        // parent layout class, i.e. Masonry, Isotope, or Packery
        this.layout = layout;
        this.position = {
            x: 0,
            y: 0
        };

        this._create();
    }

    // inherit EventEmitter
    utils.extend(Item.prototype, EventEmitter.prototype);

    Item.prototype._create = function() {
        // transition objects
        this._transn = {
            ingProperties: {},
            clean: {},
            onEnd: {}
        };

        this.css({
            position: 'absolute'
        });
    };

    // trigger specified handler for event type
    Item.prototype.handleEvent = function(event) {
        var method = 'on' + event.type;
        if (this[method]) {
            this[method](event);
        }
    };

    Item.prototype.getSize = function() {
        this.size = getSize(this.element);
    };

    /**
     * apply CSS styles to element
     * @param {Object} style
     */
    Item.prototype.css = function(style) {
        var elemStyle = this.element.style;

        for (var prop in style) {
            // use vendor property if available
            var supportedProp = vendorProperties[prop] || prop;
            elemStyle[supportedProp] = style[prop];
        }
    };

    // measure position, and sets it
    Item.prototype.getPosition = function() {
        var style = getStyle(this.element);
        var layoutOptions = this.layout.options;
        var isOriginLeft = layoutOptions.isOriginLeft;
        var isOriginTop = layoutOptions.isOriginTop;
        var xValue = style[isOriginLeft ? 'left' : 'right'];
        var yValue = style[isOriginTop ? 'top' : 'bottom'];
        // convert percent to pixels
        var layoutSize = this.layout.size;
        var x = xValue.indexOf('%') != -1 ?
            (parseFloat(xValue) / 100) * layoutSize.width : parseInt(xValue, 10);
        var y = yValue.indexOf('%') != -1 ?
            (parseFloat(yValue) / 100) * layoutSize.height : parseInt(yValue, 10);

        // clean up 'auto' or other non-integer values
        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y;
        // remove padding from measurement
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

        this.position.x = x;
        this.position.y = y;
    };

    // set settled position, apply padding
    Item.prototype.layoutPosition = function() {
        var layoutSize = this.layout.size;
        var layoutOptions = this.layout.options;
        var style = {};

        // x
        var xPadding = layoutOptions.isOriginLeft ? 'paddingLeft' : 'paddingRight';
        var xProperty = layoutOptions.isOriginLeft ? 'left' : 'right';
        var xResetProperty = layoutOptions.isOriginLeft ? 'right' : 'left';

        var x = this.position.x + layoutSize[xPadding];
        // set in percentage or pixels
        style[xProperty] = this.getXValue(x);
        // reset other property
        style[xResetProperty] = '';

        // y
        var yPadding = layoutOptions.isOriginTop ? 'paddingTop' : 'paddingBottom';
        var yProperty = layoutOptions.isOriginTop ? 'top' : 'bottom';
        var yResetProperty = layoutOptions.isOriginTop ? 'bottom' : 'top';

        var y = this.position.y + layoutSize[yPadding];
        // set in percentage or pixels
        style[yProperty] = this.getYValue(y);
        // reset other property
        style[yResetProperty] = '';

        this.css(style);
        this.emitEvent('layout', [this]);
    };

    Item.prototype.getXValue = function(x) {
        var layoutOptions = this.layout.options;
        return layoutOptions.percentPosition && !layoutOptions.isHorizontal ?
            ((x / this.layout.size.width) * 100) + '%' : x + 'px';
    };

    Item.prototype.getYValue = function(y) {
        var layoutOptions = this.layout.options;
        return layoutOptions.percentPosition && layoutOptions.isHorizontal ?
            ((y / this.layout.size.height) * 100) + '%' : y + 'px';
    };


    Item.prototype._transitionTo = function(x, y) {
        this.getPosition();
        // get current x & y from top/left
        var curX = this.position.x;
        var curY = this.position.y;

        var compareX = parseInt(x, 10);
        var compareY = parseInt(y, 10);
        var didNotMove = compareX === this.position.x && compareY === this.position.y;

        // save end position
        this.setPosition(x, y);

        // if did not move and not transitioning, just go to layout
        if (didNotMove && !this.isTransitioning) {
            this.layoutPosition();
            return;
        }

        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate(transX, transY);

        this.transition({
            to: transitionStyle,
            onTransitionEnd: {
                transform: this.layoutPosition
            },
            isCleaning: true
        });
    };

    Item.prototype.getTranslate = function(x, y) {
        // flip cooridinates if origin on right or bottom
        var layoutOptions = this.layout.options;
        x = layoutOptions.isOriginLeft ? x : -x;
        y = layoutOptions.isOriginTop ? y : -y;

        if (is3d) {
            return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        }

        return 'translate(' + x + 'px, ' + y + 'px)';
    };

    // non transition + transform support
    Item.prototype.goTo = function(x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
    };

    // use transition and transforms if supported
    Item.prototype.moveTo = supportsCSS3 ?
        Item.prototype._transitionTo : Item.prototype.goTo;

    Item.prototype.setPosition = function(x, y) {
        this.position.x = parseInt(x, 10);
        this.position.y = parseInt(y, 10);
    };

    // ----- transition ----- //

    /**
     * @param {Object} style - CSS
     * @param {Function} onTransitionEnd
     */

    // non transition, just trigger callback
    Item.prototype._nonTransition = function(args) {
        this.css(args.to);
        if (args.isCleaning) {
            this._removeStyles(args.to);
        }
        for (var prop in args.onTransitionEnd) {
            args.onTransitionEnd[prop].call(this);
        }
    };

    /**
     * proper transition
     * @param {Object} args - arguments
     *   @param {Object} to - style to transition to
     *   @param {Object} from - style to start transition from
     *   @param {Boolean} isCleaning - removes transition styles after transition
     *   @param {Function} onTransitionEnd - callback
     */
    Item.prototype._transition = function(args) {
        // redirect to nonTransition if no transition duration
        if (!parseFloat(this.layout.options.transitionDuration)) {
            this._nonTransition(args);
            return;
        }

        var _transition = this._transn;
        // keep track of onTransitionEnd callback by css property
        for (var prop in args.onTransitionEnd) {
            _transition.onEnd[prop] = args.onTransitionEnd[prop];
        }
        // keep track of properties that are transitioning
        for (prop in args.to) {
            _transition.ingProperties[prop] = true;
            // keep track of properties to clean up when transition is done
            if (args.isCleaning) {
                _transition.clean[prop] = true;
            }
        }

        // set from styles
        if (args.from) {
            this.css(args.from);
            // force redraw. http://blog.alexmaccaw.com/css-transitions
            var h = this.element.offsetHeight;
            // hack for JSHint to hush about unused var
            h = null;
        }
        // enable transition
        this.enableTransition(args.to);
        // set styles that are transitioning
        this.css(args.to);

        this.isTransitioning = true;

    };

    // dash before all cap letters, including first for
    // WebkitTransform => -webkit-transform
    function toDashedAll(str) {
        return str.replace(/([A-Z])/g, function($1) {
            return '-' + $1.toLowerCase();
        });
    }

    var transitionProps = 'opacity,' +
        toDashedAll(vendorProperties.transform || 'transform');

    Item.prototype.enableTransition = function( /* style */ ) {
        // HACK changing transitionProperty during a transition
        // will cause transition to jump
        if (this.isTransitioning) {
            return;
        }

        // make `transition: foo, bar, baz` from style object
        // HACK un-comment this when enableTransition can work
        // while a transition is happening
        // var transitionValues = [];
        // for ( var prop in style ) {
        //   // dash-ify camelCased properties like WebkitTransition
        //   prop = vendorProperties[ prop ] || prop;
        //   transitionValues.push( toDashedAll( prop ) );
        // }
        // enable transition styles
        this.css({
            transitionProperty: transitionProps,
            transitionDuration: this.layout.options.transitionDuration
        });
        // listen for transition end event
        this.element.addEventListener(transitionEndEvent, this, false);
    };

    Item.prototype.transition = Item.prototype[transitionProperty ? '_transition' : '_nonTransition'];

    // ----- events ----- //

    Item.prototype.onwebkitTransitionEnd = function(event) {
        this.ontransitionend(event);
    };

    Item.prototype.onotransitionend = function(event) {
        this.ontransitionend(event);
    };

    // properties that I munge to make my life easier
    var dashedVendorProperties = {
        '-webkit-transform': 'transform',
        '-moz-transform': 'transform',
        '-o-transform': 'transform'
    };

    Item.prototype.ontransitionend = function(event) {
        // disregard bubbled events from children
        if (event.target !== this.element) {
            return;
        }
        var _transition = this._transn;
        // get property name of transitioned property, convert to prefix-free
        var propertyName = dashedVendorProperties[event.propertyName] || event.propertyName;

        // remove property that has completed transitioning
        delete _transition.ingProperties[propertyName];
        // check if any properties are still transitioning
        if (isEmptyObj(_transition.ingProperties)) {
            // all properties have completed transitioning
            this.disableTransition();
        }
        // clean style
        if (propertyName in _transition.clean) {
            // clean up style
            this.element.style[event.propertyName] = '';
            delete _transition.clean[propertyName];
        }
        // trigger onTransitionEnd callback
        if (propertyName in _transition.onEnd) {
            var onTransitionEnd = _transition.onEnd[propertyName];
            onTransitionEnd.call(this);
            delete _transition.onEnd[propertyName];
        }

        this.emitEvent('transitionEnd', [this]);
    };

    Item.prototype.disableTransition = function() {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, false);
        this.isTransitioning = false;
    };

    /**
     * removes style property from element
     * @param {Object} style
     **/
    Item.prototype._removeStyles = function(style) {
        // clean up transition styles
        var cleanStyle = {};
        for (var prop in style) {
            cleanStyle[prop] = '';
        }
        this.css(cleanStyle);
    };

    var cleanTransitionStyle = {
        transitionProperty: '',
        transitionDuration: ''
    };

    Item.prototype.removeTransitionStyles = function() {
        // remove transition
        this.css(cleanTransitionStyle);
    };

    // ----- show/hide/remove ----- //

    // remove element from DOM
    Item.prototype.removeElem = function() {
        this.element.parentNode.removeChild(this.element);
        // remove display: none
        this.css({
            display: ''
        });
        this.emitEvent('remove', [this]);
    };

    Item.prototype.remove = function() {
        // just remove element if no transition support or no transition
        if (!transitionProperty || !parseFloat(this.layout.options.transitionDuration)) {
            this.removeElem();
            return;
        }

        // start transition
        var _this = this;
        this.once('transitionEnd', function() {
            _this.removeElem();
        });
        this.hide();
    };

    Item.prototype.reveal = function() {
        delete this.isHidden;
        // remove display: none
        this.css({
            display: ''
        });

        var options = this.layout.options;

        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;

        this.transition({
            from: options.hiddenStyle,
            to: options.visibleStyle,
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };

    Item.prototype.onRevealTransitionEnd = function() {
        // check if still visible
        // during transition, item may have been hidden
        if (!this.isHidden) {
            this.emitEvent('reveal');
        }
    };

    /**
     * get style property use for hide/reveal transition end
     * @param {String} styleProperty - hiddenStyle/visibleStyle
     * @returns {String}
     */
    Item.prototype.getHideRevealTransitionEndProperty = function(styleProperty) {
        var optionStyle = this.layout.options[styleProperty];
        // use opacity
        if (optionStyle.opacity) {
            return 'opacity';
        }
        // get first property
        for (var prop in optionStyle) {
            return prop;
        }
    };

    Item.prototype.hide = function() {
        // set flag
        this.isHidden = true;
        // remove display: none
        this.css({
            display: ''
        });

        var options = this.layout.options;

        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;

        this.transition({
            from: options.visibleStyle,
            to: options.hiddenStyle,
            // keep hidden stuff hidden
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };

    Item.prototype.onHideTransitionEnd = function() {
        // check if still hidden
        // during transition, item may have been un-hidden
        if (this.isHidden) {
            this.css({
                display: 'none'
            });
            this.emitEvent('hide');
        }
    };

    Item.prototype.destroy = function() {
        this.css({
            position: '',
            left: '',
            right: '',
            top: '',
            bottom: '',
            transition: '',
            transform: ''
        });
    };

    return Item;

}));

/*!
 * Outlayer v1.4.2
 * the brains and guts of a layout library
 * MIT license
 */

(function(window, factory) {
    'use strict';
    // universal module definition

    if (typeof define == 'function' && define.amd) {
        // AMD
        define('outlayer/outlayer', [
                'eventie/eventie',
                'eventEmitter/EventEmitter',
                'get-size/get-size',
                'fizzy-ui-utils/utils',
                './item'
            ],
            function(eventie, EventEmitter, getSize, utils, Item) {
                return factory(window, eventie, EventEmitter, getSize, utils, Item);
            }
        );
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            window,
            require('eventie'),
            require('wolfy87-eventemitter'),
            require('get-size'),
            require('fizzy-ui-utils'),
            require('./item')
        );
    } else {
        // browser global
        window.Outlayer = factory(
            window,
            window.eventie,
            window.EventEmitter,
            window.getSize,
            window.fizzyUIUtils,
            window.Outlayer.Item
        );
    }

}(window, function factory(window, eventie, EventEmitter, getSize, utils, Item) {
    'use strict';

    // ----- vars ----- //

    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function() {};

    // -------------------------- Outlayer -------------------------- //

    // globally unique identifiers
    var GUID = 0;
    // internal store of all Outlayer intances
    var instances = {};


    /**
     * @param {Element, String} element
     * @param {Object} options
     * @constructor
     */
    function Outlayer(element, options) {
        var queryElement = utils.getQueryElement(element);
        if (!queryElement) {
            if (console) {
                console.error('Bad element for ' + this.constructor.namespace +
                    ': ' + (queryElement || element));
            }
            return;
        }
        this.element = queryElement;
        // add jQuery
        if (jQuery) {
            this.$element = jQuery(this.element);
        }

        // options
        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options);

        // add id for Outlayer.getFromElement
        var id = ++GUID;
        this.element.outlayerGUID = id; // expando
        instances[id] = this; // associate via id

        // kick it off
        this._create();

        if (this.options.isInitLayout) {
            this.layout();
        }
    }

    // settings are for internal use only
    Outlayer.namespace = 'outlayer';
    Outlayer.Item = Item;

    // default options
    Outlayer.defaults = {
        containerStyle: {
            position: 'relative'
        },
        isInitLayout: true,
        isOriginLeft: true,
        isOriginTop: true,
        isResizeBound: true,
        isResizingContainer: true,
        // item options
        transitionDuration: '0.4s',
        hiddenStyle: {
            opacity: 0,
            transform: 'scale(0.001)'
        },
        visibleStyle: {
            opacity: 1,
            transform: 'scale(1)'
        }
    };

    // inherit EventEmitter
    utils.extend(Outlayer.prototype, EventEmitter.prototype);

    /**
     * set options
     * @param {Object} opts
     */
    Outlayer.prototype.option = function(opts) {
        utils.extend(this.options, opts);
    };

    Outlayer.prototype._create = function() {
        // get items from children
        this.reloadItems();
        // elements that affect layout, but are not laid out
        this.stamps = [];
        this.stamp(this.options.stamp);
        // set container style
        utils.extend(this.element.style, this.options.containerStyle);

        // bind resize method
        if (this.options.isResizeBound) {
            this.bindResize();
        }
    };

    // goes through all children again and gets bricks in proper order
    Outlayer.prototype.reloadItems = function() {
        // collection of item elements
        this.items = this._itemize(this.element.children);
    };


    /**
     * turn elements into Outlayer.Items to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - collection of new Outlayer Items
     */
    Outlayer.prototype._itemize = function(elems) {

        var itemElems = this._filterFindItemElements(elems);
        var Item = this.constructor.Item;

        // create new Outlayer Items for collection
        var items = [];
        for (var i = 0, len = itemElems.length; i < len; i++) {
            var elem = itemElems[i];
            var item = new Item(elem, this);
            items.push(item);
        }

        return items;
    };

    /**
     * get item elements to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - item elements
     */
    Outlayer.prototype._filterFindItemElements = function(elems) {
        return utils.filterFindElements(elems, this.options.itemSelector);
    };

    /**
     * getter method for getting item elements
     * @returns {Array} elems - collection of item elements
     */
    Outlayer.prototype.getItemElements = function() {
        var elems = [];
        for (var i = 0, len = this.items.length; i < len; i++) {
            elems.push(this.items[i].element);
        }
        return elems;
    };

    // ----- init & layout ----- //

    /**
     * lays out all items
     */
    Outlayer.prototype.layout = function() {
        this._resetLayout();
        this._manageStamps();

        // don't animate first layout
        var isInstant = this.options.isLayoutInstant !== undefined ?
            this.options.isLayoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant);

        // flag for initalized
        this._isLayoutInited = true;
    };

    // _init is alias for layout
    Outlayer.prototype._init = Outlayer.prototype.layout;

    /**
     * logic before any new layout
     */
    Outlayer.prototype._resetLayout = function() {
        this.getSize();
    };


    Outlayer.prototype.getSize = function() {
        this.size = getSize(this.element);
    };

    /**
     * get measurement from option, for columnWidth, rowHeight, gutter
     * if option is String -> get element from selector string, & get size of element
     * if option is Element -> get size of element
     * else use option as a number
     *
     * @param {String} measurement
     * @param {String} size - width or height
     * @private
     */
    Outlayer.prototype._getMeasurement = function(measurement, size) {
        var option = this.options[measurement];
        var elem;
        if (!option) {
            // default to 0
            this[measurement] = 0;
        } else {
            // use option as an element
            if (typeof option === 'string') {
                elem = this.element.querySelector(option);
            } else if (utils.isElement(option)) {
                elem = option;
            }
            // use size of element, if element
            this[measurement] = elem ? getSize(elem)[size] : option;
        }
    };

    /**
     * layout a collection of item elements
     * @api public
     */
    Outlayer.prototype.layoutItems = function(items, isInstant) {
        items = this._getItemsForLayout(items);

        this._layoutItems(items, isInstant);

        this._postLayout();
    };

    /**
     * get the items to be laid out
     * you may want to skip over some items
     * @param {Array} items
     * @returns {Array} items
     */
    Outlayer.prototype._getItemsForLayout = function(items) {
        var layoutItems = [];
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (!item.isIgnored) {
                layoutItems.push(item);
            }
        }
        return layoutItems;
    };

    /**
     * layout items
     * @param {Array} items
     * @param {Boolean} isInstant
     */
    Outlayer.prototype._layoutItems = function(items, isInstant) {
        this._emitCompleteOnItems('layout', items);

        if (!items || !items.length) {
            // no items, emit event with empty array
            return;
        }

        var queue = [];

        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            // get x/y object from method
            var position = this._getItemLayoutPosition(item);
            // enqueue
            position.item = item;
            position.isInstant = isInstant || item.isLayoutInstant;
            queue.push(position);
        }

        this._processLayoutQueue(queue);
    };

    /**
     * get item layout position
     * @param {Outlayer.Item} item
     * @returns {Object} x and y position
     */
    Outlayer.prototype._getItemLayoutPosition = function( /* item */ ) {
        return {
            x: 0,
            y: 0
        };
    };

    /**
     * iterate over array and position each item
     * Reason being - separating this logic prevents 'layout invalidation'
     * thx @paul_irish
     * @param {Array} queue
     */
    Outlayer.prototype._processLayoutQueue = function(queue) {
        for (var i = 0, len = queue.length; i < len; i++) {
            var obj = queue[i];
            this._positionItem(obj.item, obj.x, obj.y, obj.isInstant);
        }
    };

    /**
     * Sets position of item in DOM
     * @param {Outlayer.Item} item
     * @param {Number} x - horizontal position
     * @param {Number} y - vertical position
     * @param {Boolean} isInstant - disables transitions
     */
    Outlayer.prototype._positionItem = function(item, x, y, isInstant) {
        if (isInstant) {
            // if not transition, just set CSS
            item.goTo(x, y);
        } else {
            item.moveTo(x, y);
        }
    };

    /**
     * Any logic you want to do after each layout,
     * i.e. size the container
     */
    Outlayer.prototype._postLayout = function() {
        this.resizeContainer();
    };

    Outlayer.prototype.resizeContainer = function() {
        if (!this.options.isResizingContainer) {
            return;
        }
        var size = this._getContainerSize();
        if (size) {
            this._setContainerMeasure(size.width, true);
            this._setContainerMeasure(size.height, false);
        }
    };

    /**
     * Sets width or height of container if returned
     * @returns {Object} size
     *   @param {Number} width
     *   @param {Number} height
     */
    Outlayer.prototype._getContainerSize = noop;

    /**
     * @param {Number} measure - size of width or height
     * @param {Boolean} isWidth
     */
    Outlayer.prototype._setContainerMeasure = function(measure, isWidth) {
        if (measure === undefined) {
            return;
        }

        var elemSize = this.size;
        // add padding and border width if border box
        if (elemSize.isBorderBox) {
            measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
                elemSize.borderLeftWidth + elemSize.borderRightWidth :
                elemSize.paddingBottom + elemSize.paddingTop +
                elemSize.borderTopWidth + elemSize.borderBottomWidth;
        }

        measure = Math.max(measure, 0);
        this.element.style[isWidth ? 'width' : 'height'] = measure + 'px';
    };

    /**
     * emit eventComplete on a collection of items events
     * @param {String} eventName
     * @param {Array} items - Outlayer.Items
     */
    Outlayer.prototype._emitCompleteOnItems = function(eventName, items) {
        var _this = this;

        function onComplete() {
            _this.dispatchEvent(eventName + 'Complete', null, [items]);
        }

        var count = items.length;
        if (!items || !count) {
            onComplete();
            return;
        }

        var doneCount = 0;

        function tick() {
            doneCount++;
            if (doneCount === count) {
                onComplete();
            }
        }

        // bind callback
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            item.once(eventName, tick);
        }
    };

    /**
     * emits events via eventEmitter and jQuery events
     * @param {String} type - name of event
     * @param {Event} event - original event
     * @param {Array} args - extra arguments
     */
    Outlayer.prototype.dispatchEvent = function(type, event, args) {
        // add original event to arguments
        var emitArgs = event ? [event].concat(args) : args;
        this.emitEvent(type, emitArgs);

        if (jQuery) {
            // set this.$element
            this.$element = this.$element || jQuery(this.element);
            if (event) {
                // create jQuery event
                var $event = jQuery.Event(event);
                $event.type = type;
                this.$element.trigger($event, args);
            } else {
                // just trigger with type if no event available
                this.$element.trigger(type, args);
            }
        }
    };

    // -------------------------- ignore & stamps -------------------------- //


    /**
     * keep item in collection, but do not lay it out
     * ignored items do not get skipped in layout
     * @param {Element} elem
     */
    Outlayer.prototype.ignore = function(elem) {
        var item = this.getItem(elem);
        if (item) {
            item.isIgnored = true;
        }
    };

    /**
     * return item to layout collection
     * @param {Element} elem
     */
    Outlayer.prototype.unignore = function(elem) {
        var item = this.getItem(elem);
        if (item) {
            delete item.isIgnored;
        }
    };

    /**
     * adds elements to stamps
     * @param {NodeList, Array, Element, or String} elems
     */
    Outlayer.prototype.stamp = function(elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }

        this.stamps = this.stamps.concat(elems);
        // ignore
        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            this.ignore(elem);
        }
    };

    /**
     * removes elements to stamps
     * @param {NodeList, Array, or Element} elems
     */
    Outlayer.prototype.unstamp = function(elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }

        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            // filter out removed stamp elements
            utils.removeFrom(this.stamps, elem);
            this.unignore(elem);
        }

    };

    /**
     * finds child elements
     * @param {NodeList, Array, Element, or String} elems
     * @returns {Array} elems
     */
    Outlayer.prototype._find = function(elems) {
        if (!elems) {
            return;
        }
        // if string, use argument as selector string
        if (typeof elems === 'string') {
            elems = this.element.querySelectorAll(elems);
        }
        elems = utils.makeArray(elems);
        return elems;
    };

    Outlayer.prototype._manageStamps = function() {
        if (!this.stamps || !this.stamps.length) {
            return;
        }

        this._getBoundingRect();

        for (var i = 0, len = this.stamps.length; i < len; i++) {
            var stamp = this.stamps[i];
            this._manageStamp(stamp);
        }
    };

    // update boundingLeft / Top
    Outlayer.prototype._getBoundingRect = function() {
        // get bounding rect for container element
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
            left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
            top: boundingRect.top + size.paddingTop + size.borderTopWidth,
            right: boundingRect.right - (size.paddingRight + size.borderRightWidth),
            bottom: boundingRect.bottom - (size.paddingBottom + size.borderBottomWidth)
        };
    };

    /**
     * @param {Element} stamp
     **/
    Outlayer.prototype._manageStamp = noop;

    /**
     * get x/y position of element relative to container element
     * @param {Element} elem
     * @returns {Object} offset - has left, top, right, bottom
     */
    Outlayer.prototype._getElementOffset = function(elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize(elem);
        var offset = {
            left: boundingRect.left - thisRect.left - size.marginLeft,
            top: boundingRect.top - thisRect.top - size.marginTop,
            right: thisRect.right - boundingRect.right - size.marginRight,
            bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
        };
        return offset;
    };

    // -------------------------- resize -------------------------- //

    // enable event handlers for listeners
    // i.e. resize -> onresize
    Outlayer.prototype.handleEvent = function(event) {
        var method = 'on' + event.type;
        if (this[method]) {
            this[method](event);
        }
    };

    /**
     * Bind layout to window resizing
     */
    Outlayer.prototype.bindResize = function() {
        // bind just one listener
        if (this.isResizeBound) {
            return;
        }
        eventie.bind(window, 'resize', this);
        this.isResizeBound = true;
    };

    /**
     * Unbind layout to window resizing
     */
    Outlayer.prototype.unbindResize = function() {
        if (this.isResizeBound) {
            eventie.unbind(window, 'resize', this);
        }
        this.isResizeBound = false;
    };

    // original debounce by John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/

    // this fires every resize
    Outlayer.prototype.onresize = function() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        var _this = this;

        function delayed() {
            _this.resize();
            delete _this.resizeTimeout;
        }

        this.resizeTimeout = setTimeout(delayed, 100);
    };

    // debounced, layout on resize
    Outlayer.prototype.resize = function() {
        // don't trigger if size did not change
        // or if resize was unbound. See #9
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }

        this.layout();
    };

    /**
     * check if layout is needed post layout
     * @returns Boolean
     */
    Outlayer.prototype.needsResizeLayout = function() {
        var size = getSize(this.element);
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
    };

    // -------------------------- methods -------------------------- //

    /**
     * add items to Outlayer instance
     * @param {Array or NodeList or Element} elems
     * @returns {Array} items - Outlayer.Items
     **/
    Outlayer.prototype.addItems = function(elems) {
        var items = this._itemize(elems);
        // add items to collection
        if (items.length) {
            this.items = this.items.concat(items);
        }
        return items;
    };

    /**
     * Layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    Outlayer.prototype.appended = function(elems) {
        var items = this.addItems(elems);
        if (!items.length) {
            return;
        }
        // layout and reveal just the new items
        this.layoutItems(items, true);
        this.reveal(items);
    };

    /**
     * Layout prepended elements
     * @param {Array or NodeList or Element} elems
     */
    Outlayer.prototype.prepended = function(elems) {
        var items = this._itemize(elems);
        if (!items.length) {
            return;
        }
        // add items to beginning of collection
        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems);
        // start new layout
        this._resetLayout();
        this._manageStamps();
        // layout new stuff without transition
        this.layoutItems(items, true);
        this.reveal(items);
        // layout previous items
        this.layoutItems(previousItems);
    };

    /**
     * reveal a collection of items
     * @param {Array of Outlayer.Items} items
     */
    Outlayer.prototype.reveal = function(items) {
        this._emitCompleteOnItems('reveal', items);

        var len = items && items.length;
        for (var i = 0; len && i < len; i++) {
            var item = items[i];
            item.reveal();
        }
    };

    /**
     * hide a collection of items
     * @param {Array of Outlayer.Items} items
     */
    Outlayer.prototype.hide = function(items) {
        this._emitCompleteOnItems('hide', items);

        var len = items && items.length;
        for (var i = 0; len && i < len; i++) {
            var item = items[i];
            item.hide();
        }
    };

    /**
     * reveal item elements
     * @param {Array}, {Element}, {NodeList} items
     */
    Outlayer.prototype.revealItemElements = function(elems) {
        var items = this.getItems(elems);
        this.reveal(items);
    };

    /**
     * hide item elements
     * @param {Array}, {Element}, {NodeList} items
     */
    Outlayer.prototype.hideItemElements = function(elems) {
        var items = this.getItems(elems);
        this.hide(items);
    };

    /**
     * get Outlayer.Item, given an Element
     * @param {Element} elem
     * @param {Function} callback
     * @returns {Outlayer.Item} item
     */
    Outlayer.prototype.getItem = function(elem) {
        // loop through items to get the one that matches
        for (var i = 0, len = this.items.length; i < len; i++) {
            var item = this.items[i];
            if (item.element === elem) {
                // return item
                return item;
            }
        }
    };

    /**
     * get collection of Outlayer.Items, given Elements
     * @param {Array} elems
     * @returns {Array} items - Outlayer.Items
     */
    Outlayer.prototype.getItems = function(elems) {
        elems = utils.makeArray(elems);
        var items = [];
        for (var i = 0, len = elems.length; i < len; i++) {
            var elem = elems[i];
            var item = this.getItem(elem);
            if (item) {
                items.push(item);
            }
        }

        return items;
    };

    /**
     * remove element(s) from instance and DOM
     * @param {Array or NodeList or Element} elems
     */
    Outlayer.prototype.remove = function(elems) {
        var removeItems = this.getItems(elems);

        this._emitCompleteOnItems('remove', removeItems);

        // bail if no items to remove
        if (!removeItems || !removeItems.length) {
            return;
        }

        for (var i = 0, len = removeItems.length; i < len; i++) {
            var item = removeItems[i];
            item.remove();
            // remove item from collection
            utils.removeFrom(this.items, item);
        }
    };

    // ----- destroy ----- //

    // remove and disable Outlayer instance
    Outlayer.prototype.destroy = function() {
        // clean up dynamic styles
        var style = this.element.style;
        style.height = '';
        style.position = '';
        style.width = '';
        // destroy items
        for (var i = 0, len = this.items.length; i < len; i++) {
            var item = this.items[i];
            item.destroy();
        }

        this.unbindResize();

        var id = this.element.outlayerGUID;
        delete instances[id]; // remove reference to instance by id
        delete this.element.outlayerGUID;
        // remove data for jQuery
        if (jQuery) {
            jQuery.removeData(this.element, this.constructor.namespace);
        }

    };

    // -------------------------- data -------------------------- //

    /**
     * get Outlayer instance from element
     * @param {Element} elem
     * @returns {Outlayer}
     */
    Outlayer.data = function(elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
    };


    // -------------------------- create Outlayer class -------------------------- //

    /**
     * create a layout class
     * @param {String} namespace
     */
    Outlayer.create = function(namespace, options) {
        // sub-class Outlayer
        function Layout() {
            Outlayer.apply(this, arguments);
        }
        // inherit Outlayer prototype, use Object.create if there
        if (Object.create) {
            Layout.prototype = Object.create(Outlayer.prototype);
        } else {
            utils.extend(Layout.prototype, Outlayer.prototype);
        }
        // set contructor, used for namespace and Item
        Layout.prototype.constructor = Layout;

        Layout.defaults = utils.extend({}, Outlayer.defaults);
        // apply new options
        utils.extend(Layout.defaults, options);
        // keep prototype.settings for backwards compatibility (Packery v1.2.0)
        Layout.prototype.settings = {};

        Layout.namespace = namespace;

        Layout.data = Outlayer.data;

        // sub-class Item
        Layout.Item = function LayoutItem() {
            Item.apply(this, arguments);
        };

        Layout.Item.prototype = new Item();

        // -------------------------- declarative -------------------------- //

        utils.htmlInit(Layout, namespace);

        // -------------------------- jQuery bridge -------------------------- //

        // make into jQuery plugin
        if (jQuery && jQuery.bridget) {
            jQuery.bridget(namespace, Layout);
        }

        return Layout;
    };

    // ----- fin ----- //

    // back in global
    Outlayer.Item = Item;

    return Outlayer;

}));


/**
 * Isotope Item
 **/

(function(window, factory) {
    'use strict';
    // universal module definition
    if (typeof define == 'function' && define.amd) {
        // AMD
        define('isotope/js/item', [
                'outlayer/outlayer'
            ],
            factory);
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            require('outlayer')
        );
    } else {
        // browser global
        window.Isotope = window.Isotope || {};
        window.Isotope.Item = factory(
            window.Outlayer
        );
    }

}(window, function factory(Outlayer) {
    'use strict';

    // -------------------------- Item -------------------------- //

    // sub-class Outlayer Item
    function Item() {
        Outlayer.Item.apply(this, arguments);
    }

    Item.prototype = new Outlayer.Item();

    Item.prototype._create = function() {
        // assign id, used for original-order sorting
        this.id = this.layout.itemGUID++;
        Outlayer.Item.prototype._create.call(this);
        this.sortData = {};
    };

    Item.prototype.updateSortData = function() {
        if (this.isIgnored) {
            return;
        }
        // default sorters
        this.sortData.id = this.id;
        // for backward compatibility
        this.sortData['original-order'] = this.id;
        this.sortData.random = Math.random();
        // go thru getSortData obj and apply the sorters
        var getSortData = this.layout.options.getSortData;
        var sorters = this.layout._sorters;
        for (var key in getSortData) {
            var sorter = sorters[key];
            this.sortData[key] = sorter(this.element, this);
        }
    };

    var _destroy = Item.prototype.destroy;
    Item.prototype.destroy = function() {
        // call super
        _destroy.apply(this, arguments);
        // reset display, #741
        this.css({
            display: ''
        });
    };

    return Item;

}));

/**
 * Isotope LayoutMode
 */

(function(window, factory) {
    'use strict';
    // universal module definition

    if (typeof define == 'function' && define.amd) {
        // AMD
        define('isotope/js/layout-mode', [
                'get-size/get-size',
                'outlayer/outlayer'
            ],
            factory);
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            require('get-size'),
            require('outlayer')
        );
    } else {
        // browser global
        window.Isotope = window.Isotope || {};
        window.Isotope.LayoutMode = factory(
            window.getSize,
            window.Outlayer
        );
    }

}(window, function factory(getSize, Outlayer) {
    'use strict';

    // layout mode class
    function LayoutMode(isotope) {
        this.isotope = isotope;
        // link properties
        if (isotope) {
            this.options = isotope.options[this.namespace];
            this.element = isotope.element;
            this.items = isotope.filteredItems;
            this.size = isotope.size;
        }
    }

    /**
     * some methods should just defer to default Outlayer method
     * and reference the Isotope instance as `this`
     **/
    (function() {
        var facadeMethods = [
            '_resetLayout',
            '_getItemLayoutPosition',
            '_manageStamp',
            '_getContainerSize',
            '_getElementOffset',
            'needsResizeLayout'
        ];

        for (var i = 0, len = facadeMethods.length; i < len; i++) {
            var methodName = facadeMethods[i];
            LayoutMode.prototype[methodName] = getOutlayerMethod(methodName);
        }

        function getOutlayerMethod(methodName) {
            return function() {
                return Outlayer.prototype[methodName].apply(this.isotope, arguments);
            };
        }
    })();

    // -----  ----- //

    // for horizontal layout modes, check vertical size
    LayoutMode.prototype.needsVerticalResizeLayout = function() {
        // don't trigger if size did not change
        var size = getSize(this.isotope.element);
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var hasSizes = this.isotope.size && size;
        return hasSizes && size.innerHeight != this.isotope.size.innerHeight;
    };

    // ----- measurements ----- //

    LayoutMode.prototype._getMeasurement = function() {
        this.isotope._getMeasurement.apply(this, arguments);
    };

    LayoutMode.prototype.getColumnWidth = function() {
        this.getSegmentSize('column', 'Width');
    };

    LayoutMode.prototype.getRowHeight = function() {
        this.getSegmentSize('row', 'Height');
    };

    /**
     * get columnWidth or rowHeight
     * segment: 'column' or 'row'
     * size 'Width' or 'Height'
     **/
    LayoutMode.prototype.getSegmentSize = function(segment, size) {
        var segmentName = segment + size;
        var outerSize = 'outer' + size;
        // columnWidth / outerWidth // rowHeight / outerHeight
        this._getMeasurement(segmentName, outerSize);
        // got rowHeight or columnWidth, we can chill
        if (this[segmentName]) {
            return;
        }
        // fall back to item of first element
        var firstItemSize = this.getFirstItemSize();
        this[segmentName] = firstItemSize && firstItemSize[outerSize] ||
            // or size of container
            this.isotope.size['inner' + size];
    };

    LayoutMode.prototype.getFirstItemSize = function() {
        var firstItem = this.isotope.filteredItems[0];
        return firstItem && firstItem.element && getSize(firstItem.element);
    };

    // ----- methods that should reference isotope ----- //

    LayoutMode.prototype.layout = function() {
        this.isotope.layout.apply(this.isotope, arguments);
    };

    LayoutMode.prototype.getSize = function() {
        this.isotope.getSize();
        this.size = this.isotope.size;
    };

    // -------------------------- create -------------------------- //

    LayoutMode.modes = {};

    LayoutMode.create = function(namespace, options) {

        function Mode() {
            LayoutMode.apply(this, arguments);
        }

        Mode.prototype = new LayoutMode();

        // default options
        if (options) {
            Mode.options = options;
        }

        Mode.prototype.namespace = namespace;
        // register in Isotope
        LayoutMode.modes[namespace] = Mode;

        return Mode;
    };

    return LayoutMode;

}));

/*!
 * Masonry v3.3.1
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

(function(window, factory) {
    'use strict';
    // universal module definition
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('masonry/masonry', [
                'outlayer/outlayer',
                'get-size/get-size',
                'fizzy-ui-utils/utils'
            ],
            factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(
            require('outlayer'),
            require('get-size'),
            require('fizzy-ui-utils')
        );
    } else {
        // browser global
        window.Masonry = factory(
            window.Outlayer,
            window.getSize,
            window.fizzyUIUtils
        );
    }

}(window, function factory(Outlayer, getSize, utils) {



    // -------------------------- masonryDefinition -------------------------- //

    // create an Outlayer layout class
    var Masonry = Outlayer.create('masonry');

    Masonry.prototype._resetLayout = function() {
        this.getSize();
        this._getMeasurement('columnWidth', 'outerWidth');
        this._getMeasurement('gutter', 'outerWidth');
        this.measureColumns();

        // reset column Y
        var i = this.cols;
        this.colYs = [];
        while (i--) {
            this.colYs.push(0);
        }

        this.maxY = 0;
    };

    Masonry.prototype.measureColumns = function() {
        this.getContainerWidth();
        // if columnWidth is 0, default to outerWidth of first item
        if (!this.columnWidth) {
            var firstItem = this.items[0];
            var firstItemElem = firstItem && firstItem.element;
            // columnWidth fall back to item of first element
            this.columnWidth = firstItemElem && getSize(firstItemElem).outerWidth ||
                // if first elem has no width, default to size of container
                this.containerWidth;
        }

        var columnWidth = this.columnWidth += this.gutter;

        // calculate columns
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        // fix rounding errors, typically with gutters
        var excess = columnWidth - containerWidth % columnWidth;
        // if overshoot is less than a pixel, round up, otherwise floor it
        var mathMethod = excess && excess < 1 ? 'round' : 'floor';
        cols = Math[mathMethod](cols);
        this.cols = Math.max(cols, 1);
    };

    Masonry.prototype.getContainerWidth = function() {
        // container is parent if fit width
        var container = this.options.isFitWidth ? this.element.parentNode : this.element;
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var size = getSize(container);
        this.containerWidth = size && size.innerWidth;
    };

    Masonry.prototype._getItemLayoutPosition = function(item) {
        item.getSize();
        // how many columns does this brick span
        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
        // round if off by 1 pixel, otherwise use ceil
        var colSpan = Math[mathMethod](item.size.outerWidth / this.columnWidth);
        colSpan = Math.min(colSpan, this.cols);

        var colGroup = this._getColGroup(colSpan);
        // get the minimum Y value from the columns
        var minimumY = Math.min.apply(Math, colGroup);
        var shortColIndex = utils.indexOf(colGroup, minimumY);

        // position the brick
        var position = {
            x: this.columnWidth * shortColIndex,
            y: minimumY
        };

        // apply setHeight to necessary columns
        var setHeight = minimumY + item.size.outerHeight;
        var setSpan = this.cols + 1 - colGroup.length;
        for (var i = 0; i < setSpan; i++) {
            this.colYs[shortColIndex + i] = setHeight;
        }

        return position;
    };

    /**
     * @param {Number} colSpan - number of columns the element spans
     * @returns {Array} colGroup
     */
    Masonry.prototype._getColGroup = function(colSpan) {
        if (colSpan < 2) {
            // if brick spans only one column, use all the column Ys
            return this.colYs;
        }

        var colGroup = [];
        // how many different places could this brick fit horizontally
        var groupCount = this.cols + 1 - colSpan;
        // for each group potential horizontal position
        for (var i = 0; i < groupCount; i++) {
            // make an array of colY values for that one group
            var groupColYs = this.colYs.slice(i, i + colSpan);
            // and get the max value of the array
            colGroup[i] = Math.max.apply(Math, groupColYs);
        }
        return colGroup;
    };

    Masonry.prototype._manageStamp = function(stamp) {
        var stampSize = getSize(stamp);
        var offset = this._getElementOffset(stamp);
        // get the columns that this stamp affects
        var firstX = this.options.isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor(firstX / this.columnWidth);
        firstCol = Math.max(0, firstCol);
        var lastCol = Math.floor(lastX / this.columnWidth);
        // lastCol should not go over if multiple of columnWidth #425
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min(this.cols - 1, lastCol);
        // set colYs to bottom of the stamp
        var stampMaxY = (this.options.isOriginTop ? offset.top : offset.bottom) +
            stampSize.outerHeight;
        for (var i = firstCol; i <= lastCol; i++) {
            this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
        }
    };

    Masonry.prototype._getContainerSize = function() {
        this.maxY = Math.max.apply(Math, this.colYs);
        var size = {
            height: this.maxY
        };

        if (this.options.isFitWidth) {
            size.width = this._getContainerFitWidth();
        }

        return size;
    };

    Masonry.prototype._getContainerFitWidth = function() {
        var unusedCols = 0;
        // count unused columns
        var i = this.cols;
        while (--i) {
            if (this.colYs[i] !== 0) {
                break;
            }
            unusedCols++;
        }
        // fit container to columns that have been used
        return (this.cols - unusedCols) * this.columnWidth - this.gutter;
    };

    Masonry.prototype.needsResizeLayout = function() {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth !== this.containerWidth;
    };

    return Masonry;

}));

/*!
 * Masonry layout mode
 * sub-classes Masonry
 * http://masonry.desandro.com
 */

(function(window, factory) {
    'use strict';
    // universal module definition
    if (typeof define == 'function' && define.amd) {
        // AMD
        define('isotope/js/layout-modes/masonry', [
                '../layout-mode',
                'masonry/masonry'
            ],
            factory);
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            require('../layout-mode'),
            require('masonry-layout')
        );
    } else {
        // browser global
        factory(
            window.Isotope.LayoutMode,
            window.Masonry
        );
    }

}(window, function factory(LayoutMode, Masonry) {
    'use strict';

    // -------------------------- helpers -------------------------- //

    // extend objects
    function extend(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    }

    // -------------------------- masonryDefinition -------------------------- //

    // create an Outlayer layout class
    var MasonryMode = LayoutMode.create('masonry');

    // save on to these methods
    var _getElementOffset = MasonryMode.prototype._getElementOffset;
    var layout = MasonryMode.prototype.layout;
    var _getMeasurement = MasonryMode.prototype._getMeasurement;

    // sub-class Masonry
    extend(MasonryMode.prototype, Masonry.prototype);

    // set back, as it was overwritten by Masonry
    MasonryMode.prototype._getElementOffset = _getElementOffset;
    MasonryMode.prototype.layout = layout;
    MasonryMode.prototype._getMeasurement = _getMeasurement;

    var measureColumns = MasonryMode.prototype.measureColumns;
    MasonryMode.prototype.measureColumns = function() {
        // set items, used if measuring first item
        this.items = this.isotope.filteredItems;
        measureColumns.call(this);
    };

    // HACK copy over isOriginLeft/Top options
    var _manageStamp = MasonryMode.prototype._manageStamp;
    MasonryMode.prototype._manageStamp = function() {
        this.options.isOriginLeft = this.isotope.options.isOriginLeft;
        this.options.isOriginTop = this.isotope.options.isOriginTop;
        _manageStamp.apply(this, arguments);
    };

    return MasonryMode;

}));

/**
 * fitRows layout mode
 */

(function(window, factory) {
    'use strict';
    // universal module definition
    if (typeof define == 'function' && define.amd) {
        // AMD
        define('isotope/js/layout-modes/fit-rows', [
                '../layout-mode'
            ],
            factory);
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            require('../layout-mode')
        );
    } else {
        // browser global
        factory(
            window.Isotope.LayoutMode
        );
    }

}(window, function factory(LayoutMode) {
    'use strict';

    var FitRows = LayoutMode.create('fitRows');

    FitRows.prototype._resetLayout = function() {
        this.x = 0;
        this.y = 0;
        this.maxY = 0;
        this._getMeasurement('gutter', 'outerWidth');
    };

    FitRows.prototype._getItemLayoutPosition = function(item) {
        item.getSize();

        var itemWidth = item.size.outerWidth + this.gutter;
        // if this element cannot fit in the current row
        var containerWidth = this.isotope.size.innerWidth + this.gutter;
        if (this.x !== 0 && itemWidth + this.x > containerWidth) {
            this.x = 0;
            this.y = this.maxY;
        }

        var position = {
            x: this.x,
            y: this.y
        };

        this.maxY = Math.max(this.maxY, this.y + item.size.outerHeight);
        this.x += itemWidth;

        return position;
    };

    FitRows.prototype._getContainerSize = function() {
        return {
            height: this.maxY
        };
    };

    return FitRows;

}));

/**
 * vertical layout mode
 */

(function(window, factory) {
    'use strict';
    // universal module definition
    if (typeof define == 'function' && define.amd) {
        // AMD
        define('isotope/js/layout-modes/vertical', [
                '../layout-mode'
            ],
            factory);
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            require('../layout-mode')
        );
    } else {
        // browser global
        factory(
            window.Isotope.LayoutMode
        );
    }

}(window, function factory(LayoutMode) {
    'use strict';

    var Vertical = LayoutMode.create('vertical', {
        horizontalAlignment: 0
    });

    Vertical.prototype._resetLayout = function() {
        this.y = 0;
    };

    Vertical.prototype._getItemLayoutPosition = function(item) {
        item.getSize();
        var x = (this.isotope.size.innerWidth - item.size.outerWidth) *
            this.options.horizontalAlignment;
        var y = this.y;
        this.y += item.size.outerHeight;
        return {
            x: x,
            y: y
        };
    };

    Vertical.prototype._getContainerSize = function() {
        return {
            height: this.y
        };
    };

    return Vertical;

}));

/*!
 * Isotope v2.2.2
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2015 Metafizzy
 */

(function(window, factory) {
    'use strict';
    // universal module definition

    if (typeof define == 'function' && define.amd) {
        // AMD
        define([
                'outlayer/outlayer',
                'get-size/get-size',
                'matches-selector/matches-selector',
                'fizzy-ui-utils/utils',
                'isotope/js/item',
                'isotope/js/layout-mode',
                // include default layout modes
                'isotope/js/layout-modes/masonry',
                'isotope/js/layout-modes/fit-rows',
                'isotope/js/layout-modes/vertical'
            ],
            function(Outlayer, getSize, matchesSelector, utils, Item, LayoutMode) {
                return factory(window, Outlayer, getSize, matchesSelector, utils, Item, LayoutMode);
            });
    } else if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(
            window,
            require('outlayer'),
            require('get-size'),
            require('desandro-matches-selector'),
            require('fizzy-ui-utils'),
            require('./item'),
            require('./layout-mode'),
            // include default layout modes
            require('./layout-modes/masonry'),
            require('./layout-modes/fit-rows'),
            require('./layout-modes/vertical')
        );
    } else {
        // browser global
        window.Isotope = factory(
            window,
            window.Outlayer,
            window.getSize,
            window.matchesSelector,
            window.fizzyUIUtils,
            window.Isotope.Item,
            window.Isotope.LayoutMode
        );
    }

}(window, function factory(window, Outlayer, getSize, matchesSelector, utils,
    Item, LayoutMode) {



    // -------------------------- vars -------------------------- //

    var jQuery = window.jQuery;

    // -------------------------- helpers -------------------------- //

    var trim = String.prototype.trim ?
        function(str) {
            return str.trim();
        } :
        function(str) {
            return str.replace(/^\s+|\s+$/g, '');
        };

    var docElem = document.documentElement;

    var getText = docElem.textContent ?
        function(elem) {
            return elem.textContent;
        } :
        function(elem) {
            return elem.innerText;
        };

    // -------------------------- isotopeDefinition -------------------------- //

    // create an Outlayer layout class
    var Isotope = Outlayer.create('isotope', {
        layoutMode: "masonry",
        isJQueryFiltering: true,
        sortAscending: true
    });

    Isotope.Item = Item;
    Isotope.LayoutMode = LayoutMode;

    Isotope.prototype._create = function() {
        this.itemGUID = 0;
        // functions that sort items
        this._sorters = {};
        this._getSorters();
        // call super
        Outlayer.prototype._create.call(this);

        // create layout modes
        this.modes = {};
        // start filteredItems with all items
        this.filteredItems = this.items;
        // keep of track of sortBys
        this.sortHistory = ['original-order'];
        // create from registered layout modes
        for (var name in LayoutMode.modes) {
            this._initLayoutMode(name);
        }
    };

    Isotope.prototype.reloadItems = function() {
        // reset item ID counter
        this.itemGUID = 0;
        // call super
        Outlayer.prototype.reloadItems.call(this);
    };

    Isotope.prototype._itemize = function() {
        var items = Outlayer.prototype._itemize.apply(this, arguments);
        // assign ID for original-order
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            item.id = this.itemGUID++;
        }
        this._updateItemsSortData(items);
        return items;
    };


    // -------------------------- layout -------------------------- //

    Isotope.prototype._initLayoutMode = function(name) {
        var Mode = LayoutMode.modes[name];
        // set mode options
        // HACK extend initial options, back-fill in default options
        var initialOpts = this.options[name] || {};
        this.options[name] = Mode.options ?
            utils.extend(Mode.options, initialOpts) : initialOpts;
        // init layout mode instance
        this.modes[name] = new Mode(this);
    };


    Isotope.prototype.layout = function() {
        // if first time doing layout, do all magic
        if (!this._isLayoutInited && this.options.isInitLayout) {
            this.arrange();
            return;
        }
        this._layout();
    };

    // private method to be used in layout() & magic()
    Isotope.prototype._layout = function() {
        // don't animate first layout
        var isInstant = this._getIsInstant();
        // layout flow
        this._resetLayout();
        this._manageStamps();
        this.layoutItems(this.filteredItems, isInstant);

        // flag for initalized
        this._isLayoutInited = true;
    };

    // filter + sort + layout
    Isotope.prototype.arrange = function(opts) {
        // set any options pass
        this.option(opts);
        this._getIsInstant();
        // filter, sort, and layout

        // filter
        var filtered = this._filter(this.items);
        this.filteredItems = filtered.matches;

        var _this = this;

        function hideReveal() {
            _this.reveal(filtered.needReveal);
            _this.hide(filtered.needHide);
        }

        this._bindArrangeComplete();

        if (this._isInstant) {
            this._noTransition(hideReveal);
        } else {
            hideReveal();
        }

        this._sort();
        this._layout();
    };
    // alias to _init for main plugin method
    Isotope.prototype._init = Isotope.prototype.arrange;

    // HACK
    // Don't animate/transition first layout
    // Or don't animate/transition other layouts
    Isotope.prototype._getIsInstant = function() {
        var isInstant = this.options.isLayoutInstant !== undefined ?
            this.options.isLayoutInstant : !this._isLayoutInited;
        this._isInstant = isInstant;
        return isInstant;
    };

    // listen for layoutComplete, hideComplete and revealComplete
    // to trigger arrangeComplete
    Isotope.prototype._bindArrangeComplete = function() {
        // listen for 3 events to trigger arrangeComplete
        var isLayoutComplete, isHideComplete, isRevealComplete;
        var _this = this;

        function arrangeParallelCallback() {
            if (isLayoutComplete && isHideComplete && isRevealComplete) {
                _this.dispatchEvent('arrangeComplete', null, [_this.filteredItems]);
            }
        }
        this.once('layoutComplete', function() {
            isLayoutComplete = true;
            arrangeParallelCallback();
        });
        this.once('hideComplete', function() {
            isHideComplete = true;
            arrangeParallelCallback();
        });
        this.once('revealComplete', function() {
            isRevealComplete = true;
            arrangeParallelCallback();
        });
    };

    // -------------------------- filter -------------------------- //

    Isotope.prototype._filter = function(items) {
        var filter = this.options.filter;
        filter = filter || '*';
        var matches = [];
        var hiddenMatched = [];
        var visibleUnmatched = [];

        var test = this._getFilterTest(filter);

        // test each item
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item.isIgnored) {
                continue;
            }
            // add item to either matched or unmatched group
            var isMatched = test(item);
            // item.isFilterMatched = isMatched;
            // add to matches if its a match
            if (isMatched) {
                matches.push(item);
            }
            // add to additional group if item needs to be hidden or revealed
            if (isMatched && item.isHidden) {
                hiddenMatched.push(item);
            } else if (!isMatched && !item.isHidden) {
                visibleUnmatched.push(item);
            }
        }

        // return collections of items to be manipulated
        return {
            matches: matches,
            needReveal: hiddenMatched,
            needHide: visibleUnmatched
        };
    };

    // get a jQuery, function, or a matchesSelector test given the filter
    Isotope.prototype._getFilterTest = function(filter) {
        if (jQuery && this.options.isJQueryFiltering) {
            // use jQuery
            return function(item) {
                return jQuery(item.element).is(filter);
            };
        }
        if (typeof filter == 'function') {
            // use filter as function
            return function(item) {
                return filter(item.element);
            };
        }
        // default, use filter as selector string
        return function(item) {
            return matchesSelector(item.element, filter);
        };
    };

    // -------------------------- sorting -------------------------- //

    /**
     * @params {Array} elems
     * @public
     */
    Isotope.prototype.updateSortData = function(elems) {
        // get items
        var items;
        if (elems) {
            elems = utils.makeArray(elems);
            items = this.getItems(elems);
        } else {
            // update all items if no elems provided
            items = this.items;
        }

        this._getSorters();
        this._updateItemsSortData(items);
    };

    Isotope.prototype._getSorters = function() {
        var getSortData = this.options.getSortData;
        for (var key in getSortData) {
            var sorter = getSortData[key];
            this._sorters[key] = mungeSorter(sorter);
        }
    };

    /**
     * @params {Array} items - of Isotope.Items
     * @private
     */
    Isotope.prototype._updateItemsSortData = function(items) {
        // do not update if no items
        var len = items && items.length;

        for (var i = 0; len && i < len; i++) {
            var item = items[i];
            item.updateSortData();
        }
    };

    // ----- munge sorter ----- //

    // encapsulate this, as we just need mungeSorter
    // other functions in here are just for munging
    var mungeSorter = (function() {
        // add a magic layer to sorters for convienent shorthands
        // `.foo-bar` will use the text of .foo-bar querySelector
        // `[foo-bar]` will use attribute
        // you can also add parser
        // `.foo-bar parseInt` will parse that as a number
        function mungeSorter(sorter) {
            // if not a string, return function or whatever it is
            if (typeof sorter != 'string') {
                return sorter;
            }
            // parse the sorter string
            var args = trim(sorter).split(' ');
            var query = args[0];
            // check if query looks like [an-attribute]
            var attrMatch = query.match(/^\[(.+)\]$/);
            var attr = attrMatch && attrMatch[1];
            var getValue = getValueGetter(attr, query);
            // use second argument as a parser
            var parser = Isotope.sortDataParsers[args[1]];
            // parse the value, if there was a parser
            sorter = parser ? function(elem) {
                    return elem && parser(getValue(elem));
                } :
                // otherwise just return value
                function(elem) {
                    return elem && getValue(elem);
                };

            return sorter;
        }

        // get an attribute getter, or get text of the querySelector
        function getValueGetter(attr, query) {
            var getValue;
            // if query looks like [foo-bar], get attribute
            if (attr) {
                getValue = function(elem) {
                    return elem.getAttribute(attr);
                };
            } else {
                // otherwise, assume its a querySelector, and get its text
                getValue = function(elem) {
                    var child = elem.querySelector(query);
                    return child && getText(child);
                };
            }
            return getValue;
        }

        return mungeSorter;
    })();

    // parsers used in getSortData shortcut strings
    Isotope.sortDataParsers = {
        'parseInt': function(val) {
            return parseInt(val, 10);
        },
        'parseFloat': function(val) {
            return parseFloat(val);
        }
    };

    // ----- sort method ----- //

    // sort filteredItem order
    Isotope.prototype._sort = function() {
        var sortByOpt = this.options.sortBy;
        if (!sortByOpt) {
            return;
        }
        // concat all sortBy and sortHistory
        var sortBys = [].concat.apply(sortByOpt, this.sortHistory);
        // sort magic
        var itemSorter = getItemSorter(sortBys, this.options.sortAscending);
        this.filteredItems.sort(itemSorter);
        // keep track of sortBy History
        if (sortByOpt != this.sortHistory[0]) {
            // add to front, oldest goes in last
            this.sortHistory.unshift(sortByOpt);
        }
    };

    // returns a function used for sorting
    function getItemSorter(sortBys, sortAsc) {
        return function sorter(itemA, itemB) {
            // cycle through all sortKeys
            for (var i = 0, len = sortBys.length; i < len; i++) {
                var sortBy = sortBys[i];
                var a = itemA.sortData[sortBy];
                var b = itemB.sortData[sortBy];
                if (a > b || a < b) {
                    // if sortAsc is an object, use the value given the sortBy key
                    var isAscending = sortAsc[sortBy] !== undefined ? sortAsc[sortBy] : sortAsc;
                    var direction = isAscending ? 1 : -1;
                    return (a > b ? 1 : -1) * direction;
                }
            }
            return 0;
        };
    }

    // -------------------------- methods -------------------------- //

    // get layout mode
    Isotope.prototype._mode = function() {
        var layoutMode = this.options.layoutMode;
        var mode = this.modes[layoutMode];
        if (!mode) {
            // TODO console.error
            throw new Error('No layout mode: ' + layoutMode);
        }
        // HACK sync mode's options
        // any options set after init for layout mode need to be synced
        mode.options = this.options[layoutMode];
        return mode;
    };

    Isotope.prototype._resetLayout = function() {
        // trigger original reset layout
        Outlayer.prototype._resetLayout.call(this);
        this._mode()._resetLayout();
    };

    Isotope.prototype._getItemLayoutPosition = function(item) {
        return this._mode()._getItemLayoutPosition(item);
    };

    Isotope.prototype._manageStamp = function(stamp) {
        this._mode()._manageStamp(stamp);
    };

    Isotope.prototype._getContainerSize = function() {
        return this._mode()._getContainerSize();
    };

    Isotope.prototype.needsResizeLayout = function() {
        return this._mode().needsResizeLayout();
    };

    // -------------------------- adding & removing -------------------------- //

    // HEADS UP overwrites default Outlayer appended
    Isotope.prototype.appended = function(elems) {
        var items = this.addItems(elems);
        if (!items.length) {
            return;
        }
        // filter, layout, reveal new items
        var filteredItems = this._filterRevealAdded(items);
        // add to filteredItems
        this.filteredItems = this.filteredItems.concat(filteredItems);
    };

    // HEADS UP overwrites default Outlayer prepended
    Isotope.prototype.prepended = function(elems) {
        var items = this._itemize(elems);
        if (!items.length) {
            return;
        }
        // start new layout
        this._resetLayout();
        this._manageStamps();
        // filter, layout, reveal new items
        var filteredItems = this._filterRevealAdded(items);
        // layout previous items
        this.layoutItems(this.filteredItems);
        // add to items and filteredItems
        this.filteredItems = filteredItems.concat(this.filteredItems);
        this.items = items.concat(this.items);
    };

    Isotope.prototype._filterRevealAdded = function(items) {
        var filtered = this._filter(items);
        this.hide(filtered.needHide);
        // reveal all new items
        this.reveal(filtered.matches);
        // layout new items, no transition
        this.layoutItems(filtered.matches, true);
        return filtered.matches;
    };

    /**
     * Filter, sort, and layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    Isotope.prototype.insert = function(elems) {
        var items = this.addItems(elems);
        if (!items.length) {
            return;
        }
        // append item elements
        var i, item;
        var len = items.length;
        for (i = 0; i < len; i++) {
            item = items[i];
            this.element.appendChild(item.element);
        }
        // filter new stuff
        var filteredInsertItems = this._filter(items).matches;
        // set flag
        for (i = 0; i < len; i++) {
            items[i].isLayoutInstant = true;
        }
        this.arrange();
        // reset flag
        for (i = 0; i < len; i++) {
            delete items[i].isLayoutInstant;
        }
        this.reveal(filteredInsertItems);
    };

    var _remove = Isotope.prototype.remove;
    Isotope.prototype.remove = function(elems) {
        elems = utils.makeArray(elems);
        var removeItems = this.getItems(elems);
        // do regular thing
        _remove.call(this, elems);
        // bail if no items to remove
        var len = removeItems && removeItems.length;
        if (!len) {
            return;
        }
        // remove elems from filteredItems
        for (var i = 0; i < len; i++) {
            var item = removeItems[i];
            // remove item from collection
            utils.removeFrom(this.filteredItems, item);
        }
    };

    Isotope.prototype.shuffle = function() {
        // update random sortData
        for (var i = 0, len = this.items.length; i < len; i++) {
            var item = this.items[i];
            item.sortData.random = Math.random();
        }
        this.options.sortBy = 'random';
        this._sort();
        this._layout();
    };

    /**
     * trigger fn without transition
     * kind of hacky to have this in the first place
     * @param {Function} fn
     * @returns ret
     * @private
     */
    Isotope.prototype._noTransition = function(fn) {
        // save transitionDuration before disabling
        var transitionDuration = this.options.transitionDuration;
        // disable transition
        this.options.transitionDuration = 0;
        // do it
        var returnValue = fn.call(this);
        // re-enable transition for reveal
        this.options.transitionDuration = transitionDuration;
        return returnValue;
    };

    // ----- helper methods ----- //

    /**
     * getter method for getting filtered item elements
     * @returns {Array} elems - collection of item elements
     */
    Isotope.prototype.getFilteredItemElements = function() {
        var elems = [];
        for (var i = 0, len = this.filteredItems.length; i < len; i++) {
            elems.push(this.filteredItems[i].element);
        }
        return elems;
    };

    // -----  ----- //

    return Isotope;

}));
/*! Magnific Popup - v1.0.0 - 2014-12-12
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2014 Dmitry Semenov;
*
* The MIT License (MIT)

 Copyright (c) 2014-2016 Dmitry Semenov, http://dimsemenov.com

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
* */
;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module. 
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS 
        factory(require('jquery'));
    } else {
        // Browser globals 
        factory(window.jQuery || window.Zepto);
    }
}(function($) {

    /*>>core*/
    /**
     * 
     * Magnific Popup Core JS file
     * 
     */


    /**
     * Private static constants
     */
    var CLOSE_EVENT = 'Close',
        BEFORE_CLOSE_EVENT = 'BeforeClose',
        AFTER_CLOSE_EVENT = 'AfterClose',
        BEFORE_APPEND_EVENT = 'BeforeAppend',
        MARKUP_PARSE_EVENT = 'MarkupParse',
        OPEN_EVENT = 'Open',
        CHANGE_EVENT = 'Change',
        NS = 'mfp',
        EVENT_NS = '.' + NS,
        READY_CLASS = 'mfp-ready',
        REMOVING_CLASS = 'mfp-removing',
        PREVENT_CLOSE_CLASS = 'mfp-prevent-close';


    /**
     * Private vars 
     */
    var mfp, // As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
        MagnificPopup = function() {},
        _isJQ = !!(window.jQuery),
        _prevStatus,
        _window = $(window),
        _body,
        _document,
        _prevContentType,
        _wrapClasses,
        _currPopupType;


    /**
     * Private functions
     */
    var _mfpOn = function(name, f) {
            mfp.ev.on(NS + name + EVENT_NS, f);
        },
        _getEl = function(className, appendTo, html, raw) {
            var el = document.createElement('div');
            el.className = 'mfp-' + className;
            if (html) {
                el.innerHTML = html;
            }
            if (!raw) {
                el = $(el);
                if (appendTo) {
                    el.appendTo(appendTo);
                }
            } else if (appendTo) {
                appendTo.appendChild(el);
            }
            return el;
        },
        _mfpTrigger = function(e, data) {
            mfp.ev.triggerHandler(NS + e, data);

            if (mfp.st.callbacks) {
                // converts "mfpEventName" to "eventName" callback and triggers it if it's present
                e = e.charAt(0).toLowerCase() + e.slice(1);
                if (mfp.st.callbacks[e]) {
                    mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
                }
            }
        },
        _getCloseBtn = function(type) {
            if (type !== _currPopupType || !mfp.currTemplate.closeBtn) {
                mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace('%title%', mfp.st.tClose));
                _currPopupType = type;
            }
            return mfp.currTemplate.closeBtn;
        },
        // Initialize Magnific Popup only when called at least once
        _checkInstance = function() {
            if (!$.magnificPopup.instance) {
                mfp = new MagnificPopup();
                mfp.init();
                $.magnificPopup.instance = mfp;
            }
        },
        // CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
        supportsTransitions = function() {
            var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
                v = ['ms', 'O', 'Moz', 'Webkit']; // 'v' for vendor

            if (s['transition'] !== undefined) {
                return true;
            }

            while (v.length) {
                if (v.pop() + 'Transition' in s) {
                    return true;
                }
            }

            return false;
        };



    /**
     * Public functions
     */
    MagnificPopup.prototype = {

        constructor: MagnificPopup,

        /**
         * Initializes Magnific Popup plugin. 
         * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
         */
        init: function() {
            var appVersion = navigator.appVersion;
            mfp.isIE7 = appVersion.indexOf("MSIE 7.") !== -1;
            mfp.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
            mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
            mfp.isAndroid = (/android/gi).test(appVersion);
            mfp.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);
            mfp.supportsTransition = supportsTransitions();

            // We disable fixed positioned lightbox on devices that don't handle it nicely.
            // If you know a better way of detecting this - let me know.
            mfp.probablyMobile = (mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent));
            _document = $(document);

            mfp.popupsCache = {};
        },

        /**
         * Opens popup
         * @param  data [description]
         */
        open: function(data) {

            if (!_body) {
                _body = $(document.body);
            }

            var i;

            if (data.isObj === false) {
                // convert jQuery collection to array to avoid conflicts later
                mfp.items = data.items.toArray();

                mfp.index = 0;
                var items = data.items,
                    item;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.parsed) {
                        item = item.el[0];
                    }
                    if (item === data.el[0]) {
                        mfp.index = i;
                        break;
                    }
                }
            } else {
                mfp.items = $.isArray(data.items) ? data.items : [data.items];
                mfp.index = data.index || 0;
            }

            // if popup is already opened - we just update the content
            if (mfp.isOpen) {
                mfp.updateItemHTML();
                return;
            }

            mfp.types = [];
            _wrapClasses = '';
            if (data.mainEl && data.mainEl.length) {
                mfp.ev = data.mainEl.eq(0);
            } else {
                mfp.ev = _document;
            }

            if (data.key) {
                if (!mfp.popupsCache[data.key]) {
                    mfp.popupsCache[data.key] = {};
                }
                mfp.currTemplate = mfp.popupsCache[data.key];
            } else {
                mfp.currTemplate = {};
            }



            mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data);
            mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

            if (mfp.st.modal) {
                mfp.st.closeOnContentClick = false;
                mfp.st.closeOnBgClick = false;
                mfp.st.showCloseBtn = false;
                mfp.st.enableEscapeKey = false;
            }


            // Building markup
            // main containers are created only once
            if (!mfp.bgOverlay) {

                // Dark overlay
                mfp.bgOverlay = _getEl('bg').on('click' + EVENT_NS, function() {
                    mfp.close();
                });

                mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click' + EVENT_NS, function(e) {
                    if (mfp._checkIfClose(e.target)) {
                        mfp.close();
                    }
                });

                mfp.container = _getEl('container', mfp.wrap);
            }

            mfp.contentContainer = _getEl('content');
            if (mfp.st.preloader) {
                mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
            }


            // Initializing modules
            var modules = $.magnificPopup.modules;
            for (i = 0; i < modules.length; i++) {
                var n = modules[i];
                n = n.charAt(0).toUpperCase() + n.slice(1);
                mfp['init' + n].call(mfp);
            }
            _mfpTrigger('BeforeOpen');


            if (mfp.st.showCloseBtn) {
                // Close button
                if (!mfp.st.closeBtnInside) {
                    mfp.wrap.append(_getCloseBtn());
                } else {
                    _mfpOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
                        values.close_replaceWith = _getCloseBtn(item.type);
                    });
                    _wrapClasses += ' mfp-close-btn-in';
                }
            }

            if (mfp.st.alignTop) {
                _wrapClasses += ' mfp-align-top';
            }



            if (mfp.fixedContentPos) {
                mfp.wrap.css({
                    overflow: mfp.st.overflowY,
                    overflowX: 'hidden',
                    overflowY: mfp.st.overflowY
                });
            } else {
                mfp.wrap.css({
                    top: _window.scrollTop(),
                    position: 'absolute'
                });
            }
            if (mfp.st.fixedBgPos === false || (mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos)) {
                mfp.bgOverlay.css({
                    height: _document.height(),
                    position: 'absolute'
                });
            }



            if (mfp.st.enableEscapeKey) {
                // Close on ESC key
                _document.on('keyup' + EVENT_NS, function(e) {
                    if (e.keyCode === 27) {
                        mfp.close();
                    }
                });
            }

            _window.on('resize' + EVENT_NS, function() {
                mfp.updateSize();
            });


            if (!mfp.st.closeOnContentClick) {
                _wrapClasses += ' mfp-auto-cursor';
            }

            if (_wrapClasses)
                mfp.wrap.addClass(_wrapClasses);


            // this triggers recalculation of layout, so we get it once to not to trigger twice
            var windowHeight = mfp.wH = _window.height();


            var windowStyles = {};

            if (mfp.fixedContentPos) {
                if (mfp._hasScrollBar(windowHeight)) {
                    var s = mfp._getScrollbarSize();
                    if (s) {
                        windowStyles.marginRight = s;
                    }
                }
            }

            if (mfp.fixedContentPos) {
                if (!mfp.isIE7) {
                    windowStyles.overflow = 'hidden';
                } else {
                    // ie7 double-scroll bug
                    $('body, html').css('overflow', 'hidden');
                }
            }



            var classesToadd = mfp.st.mainClass;
            if (mfp.isIE7) {
                classesToadd += ' mfp-ie7';
            }
            if (classesToadd) {
                mfp._addClassToMFP(classesToadd);
            }

            // add content
            mfp.updateItemHTML();

            _mfpTrigger('BuildControls');

            // remove scrollbar, add margin e.t.c
            $('html').css(windowStyles);

            // add everything to DOM
            mfp.bgOverlay.add(mfp.wrap).prependTo(mfp.st.prependTo || _body);

            // Save last focused element
            mfp._lastFocusedEl = document.activeElement;

            // Wait for next cycle to allow CSS transition
            setTimeout(function() {

                if (mfp.content) {
                    mfp._addClassToMFP(READY_CLASS);
                    mfp._setFocus();
                } else {
                    // if content is not defined (not loaded e.t.c) we add class only for BG
                    mfp.bgOverlay.addClass(READY_CLASS);
                }

                // Trap the focus in popup
                _document.on('focusin' + EVENT_NS, mfp._onFocusIn);

            }, 16);

            mfp.isOpen = true;
            mfp.updateSize(windowHeight);
            _mfpTrigger(OPEN_EVENT);

            return data;
        },

        /**
         * Closes the popup
         */
        close: function() {
            if (!mfp.isOpen) return;
            _mfpTrigger(BEFORE_CLOSE_EVENT);

            mfp.isOpen = false;
            // for CSS3 animation
            if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
                mfp._addClassToMFP(REMOVING_CLASS);
                setTimeout(function() {
                    mfp._close();
                }, mfp.st.removalDelay);
            } else {
                mfp._close();
            }
        },

        /**
         * Helper for close() function
         */
        _close: function() {
            _mfpTrigger(CLOSE_EVENT);

            var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

            mfp.bgOverlay.detach();
            mfp.wrap.detach();
            mfp.container.empty();

            if (mfp.st.mainClass) {
                classesToRemove += mfp.st.mainClass + ' ';
            }

            mfp._removeClassFromMFP(classesToRemove);

            if (mfp.fixedContentPos) {
                var windowStyles = {
                    marginRight: ''
                };
                if (mfp.isIE7) {
                    $('body, html').css('overflow', '');
                } else {
                    windowStyles.overflow = '';
                }
                $('html').css(windowStyles);
            }

            _document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
            mfp.ev.off(EVENT_NS);

            // clean up DOM elements that aren't removed
            mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
            mfp.bgOverlay.attr('class', 'mfp-bg');
            mfp.container.attr('class', 'mfp-container');

            // remove close button from target element
            if (mfp.st.showCloseBtn &&
                (!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
                if (mfp.currTemplate.closeBtn)
                    mfp.currTemplate.closeBtn.detach();
            }


            if (mfp._lastFocusedEl) {
                $(mfp._lastFocusedEl).focus(); // put tab focus back
            }
            mfp.currItem = null;
            mfp.content = null;
            mfp.currTemplate = null;
            mfp.prevHeight = 0;

            _mfpTrigger(AFTER_CLOSE_EVENT);
        },

        updateSize: function(winHeight) {

            if (mfp.isIOS) {
                // fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
                var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
                var height = window.innerHeight * zoomLevel;
                mfp.wrap.css('height', height);
                mfp.wH = height;
            } else {
                mfp.wH = winHeight || _window.height();
            }
            // Fixes #84: popup incorrectly positioned with position:relative on body
            if (!mfp.fixedContentPos) {
                mfp.wrap.css('height', mfp.wH);
            }

            _mfpTrigger('Resize');

        },

        /**
         * Set content of popup based on current index
         */
        updateItemHTML: function() {
            var item = mfp.items[mfp.index];

            // Detach and perform modifications
            mfp.contentContainer.detach();

            if (mfp.content)
                mfp.content.detach();

            if (!item.parsed) {
                item = mfp.parseEl(mfp.index);
            }

            var type = item.type;

            _mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
            // BeforeChange event works like so:
            // _mfpOn('BeforeChange', function(e, prevType, newType) { });

            mfp.currItem = item;





            if (!mfp.currTemplate[type]) {
                var markup = mfp.st[type] ? mfp.st[type].markup : false;

                // allows to modify markup
                _mfpTrigger('FirstMarkupParse', markup);

                if (markup) {
                    mfp.currTemplate[type] = $(markup);
                } else {
                    // if there is no markup found we just define that template is parsed
                    mfp.currTemplate[type] = true;
                }
            }

            if (_prevContentType && _prevContentType !== item.type) {
                mfp.container.removeClass('mfp-' + _prevContentType + '-holder');
            }

            var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
            mfp.appendContent(newContent, type);

            item.preloaded = true;

            _mfpTrigger(CHANGE_EVENT, item);
            _prevContentType = item.type;

            // Append container back after its content changed
            mfp.container.prepend(mfp.contentContainer);

            _mfpTrigger('AfterChange');
        },


        /**
         * Set HTML content of popup
         */
        appendContent: function(newContent, type) {
            mfp.content = newContent;

            if (newContent) {
                if (mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
                    mfp.currTemplate[type] === true) {
                    // if there is no markup, we just append close button element inside
                    if (!mfp.content.find('.mfp-close').length) {
                        mfp.content.append(_getCloseBtn());
                    }
                } else {
                    mfp.content = newContent;
                }
            } else {
                mfp.content = '';
            }

            _mfpTrigger(BEFORE_APPEND_EVENT);
            mfp.container.addClass('mfp-' + type + '-holder');

            mfp.contentContainer.append(mfp.content);
        },




        /**
         * Creates Magnific Popup data object based on given data
         * @param  {int} index Index of item to parse
         */
        parseEl: function(index) {
            var item = mfp.items[index],
                type;

            if (item.tagName) {
                item = {
                    el: $(item)
                };
            } else {
                type = item.type;
                item = {
                    data: item,
                    src: item.src
                };
            }

            if (item.el) {
                var types = mfp.types;

                // check for 'mfp-TYPE' class
                for (var i = 0; i < types.length; i++) {
                    if (item.el.hasClass('mfp-' + types[i])) {
                        type = types[i];
                        break;
                    }
                }

                item.src = item.el.attr('data-mfp-src');
                if (!item.src) {
                    item.src = item.el.attr('href');
                }
            }

            item.type = type || mfp.st.type || 'inline';
            item.index = index;
            item.parsed = true;
            mfp.items[index] = item;
            _mfpTrigger('ElementParse', item);

            return mfp.items[index];
        },


        /**
         * Initializes single popup or a group of popups
         */
        addGroup: function(el, options) {
            var eHandler = function(e) {
                e.mfpEl = this;
                mfp._openClick(e, el, options);
            };

            if (!options) {
                options = {};
            }

            var eName = 'click.magnificPopup';
            options.mainEl = el;

            if (options.items) {
                options.isObj = true;
                el.off(eName).on(eName, eHandler);
            } else {
                options.isObj = false;
                if (options.delegate) {
                    el.off(eName).on(eName, options.delegate, eHandler);
                } else {
                    options.items = el;
                    el.off(eName).on(eName, eHandler);
                }
            }
        },
        _openClick: function(e, el, options) {
            var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


            if (!midClick && (e.which === 2 || e.ctrlKey || e.metaKey)) {
                return;
            }

            var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

            if (disableOn) {
                if ($.isFunction(disableOn)) {
                    if (!disableOn.call(mfp)) {
                        return true;
                    }
                } else { // else it's number
                    if (_window.width() < disableOn) {
                        return true;
                    }
                }
            }

            if (e.type) {
                e.preventDefault();

                // This will prevent popup from closing if element is inside and popup is already opened
                if (mfp.isOpen) {
                    e.stopPropagation();
                }
            }


            options.el = $(e.mfpEl);
            if (options.delegate) {
                options.items = el.find(options.delegate);
            }
            mfp.open(options);
        },


        /**
         * Updates text on preloader
         */
        updateStatus: function(status, text) {

            if (mfp.preloader) {
                if (_prevStatus !== status) {
                    mfp.container.removeClass('mfp-s-' + _prevStatus);
                }

                if (!text && status === 'loading') {
                    text = mfp.st.tLoading;
                }

                var data = {
                    status: status,
                    text: text
                };
                // allows to modify status
                _mfpTrigger('UpdateStatus', data);

                status = data.status;
                text = data.text;

                mfp.preloader.html(text);

                mfp.preloader.find('a').on('click', function(e) {
                    e.stopImmediatePropagation();
                });

                mfp.container.addClass('mfp-s-' + status);
                _prevStatus = status;
            }
        },


        /*
        	"Private" helpers that aren't private at all
         */
        // Check to close popup or not
        // "target" is an element that was clicked
        _checkIfClose: function(target) {

            if ($(target).hasClass(PREVENT_CLOSE_CLASS)) {
                return;
            }

            var closeOnContent = mfp.st.closeOnContentClick;
            var closeOnBg = mfp.st.closeOnBgClick;

            if (closeOnContent && closeOnBg) {
                return true;
            } else {

                // We close the popup if click is on close button or on preloader. Or if there is no content.
                if (!mfp.content || $(target).hasClass('mfp-close') || (mfp.preloader && target === mfp.preloader[0])) {
                    return true;
                }

                // if click is outside the content
                if ((target !== mfp.content[0] && !$.contains(mfp.content[0], target))) {
                    if (closeOnBg) {
                        // last check, if the clicked element is in DOM, (in case it's removed onclick)
                        if ($.contains(document, target)) {
                            return true;
                        }
                    }
                } else if (closeOnContent) {
                    return true;
                }

            }
            return false;
        },
        _addClassToMFP: function(cName) {
            mfp.bgOverlay.addClass(cName);
            mfp.wrap.addClass(cName);
        },
        _removeClassFromMFP: function(cName) {
            this.bgOverlay.removeClass(cName);
            mfp.wrap.removeClass(cName);
        },
        _hasScrollBar: function(winHeight) {
            return ((mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height()));
        },
        _setFocus: function() {
            (mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
        },
        _onFocusIn: function(e) {
            if (e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target)) {
                mfp._setFocus();
                return false;
            }
        },
        _parseMarkup: function(template, values, item) {
            var arr;
            if (item.data) {
                values = $.extend(item.data, values);
            }
            _mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item]);

            $.each(values, function(key, value) {
                if (value === undefined || value === false) {
                    return true;
                }
                arr = key.split('_');
                if (arr.length > 1) {
                    var el = template.find(EVENT_NS + '-' + arr[0]);

                    if (el.length > 0) {
                        var attr = arr[1];
                        if (attr === 'replaceWith') {
                            if (el[0] !== value[0]) {
                                el.replaceWith(value);
                            }
                        } else if (attr === 'img') {
                            if (el.is('img')) {
                                el.attr('src', value);
                            } else {
                                el.replaceWith('<img src="' + value + '" class="' + el.attr('class') + '" />');
                            }
                        } else {
                            el.attr(arr[1], value);
                        }
                    }

                } else {
                    template.find(EVENT_NS + '-' + key).html(value);
                }
            });
        },

        _getScrollbarSize: function() {
            // thx David
            if (mfp.scrollbarSize === undefined) {
                var scrollDiv = document.createElement("div");
                scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
                document.body.appendChild(scrollDiv);
                mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                document.body.removeChild(scrollDiv);
            }
            return mfp.scrollbarSize;
        }

    }; /* MagnificPopup core prototype end */




    /**
     * Public static functions
     */
    $.magnificPopup = {
        instance: null,
        proto: MagnificPopup.prototype,
        modules: [],

        open: function(options, index) {
            _checkInstance();

            if (!options) {
                options = {};
            } else {
                options = $.extend(true, {}, options);
            }


            options.isObj = true;
            options.index = index || 0;
            return this.instance.open(options);
        },

        close: function() {
            return $.magnificPopup.instance && $.magnificPopup.instance.close();
        },

        registerModule: function(name, module) {
            if (module.options) {
                $.magnificPopup.defaults[name] = module.options;
            }
            $.extend(this.proto, module.proto);
            this.modules.push(name);
        },

        defaults: {

            // Info about options is in docs:
            // http://dimsemenov.com/plugins/magnific-popup/documentation.html#options

            disableOn: 0,

            key: null,

            midClick: false,

            mainClass: '',

            preloader: true,

            focus: '', // CSS selector of input to focus after popup is opened

            closeOnContentClick: false,

            closeOnBgClick: true,

            closeBtnInside: true,

            showCloseBtn: true,

            enableEscapeKey: true,

            modal: false,

            alignTop: false,

            removalDelay: 0,

            prependTo: null,

            fixedContentPos: 'auto',

            fixedBgPos: 'auto',

            overflowY: 'auto',

            closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',

            tClose: 'Close (Esc)',

            tLoading: 'Loading...'

        }
    };



    $.fn.magnificPopup = function(options) {
        _checkInstance();

        var jqEl = $(this);

        // We call some API method of first param is a string
        if (typeof options === "string") {

            if (options === 'open') {
                var items,
                    itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
                    index = parseInt(arguments[1], 10) || 0;

                if (itemOpts.items) {
                    items = itemOpts.items[index];
                } else {
                    items = jqEl;
                    if (itemOpts.delegate) {
                        items = items.find(itemOpts.delegate);
                    }
                    items = items.eq(index);
                }
                mfp._openClick({
                    mfpEl: items
                }, jqEl, itemOpts);
            } else {
                if (mfp.isOpen)
                    mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
            }

        } else {
            // clone options obj
            options = $.extend(true, {}, options);

            /*
             * As Zepto doesn't support .data() method for objects 
             * and it works only in normal browsers
             * we assign "options" object directly to the DOM element. FTW!
             */
            if (_isJQ) {
                jqEl.data('magnificPopup', options);
            } else {
                jqEl[0].magnificPopup = options;
            }

            mfp.addGroup(jqEl, options);

        }
        return jqEl;
    };


    //Quick benchmark
    /*
    var start = performance.now(),
    	i,
    	rounds = 1000;

    for(i = 0; i < rounds; i++) {

    }
    console.log('Test #1:', performance.now() - start);

    start = performance.now();
    for(i = 0; i < rounds; i++) {

    }
    console.log('Test #2:', performance.now() - start);
    */


    /*>>core*/

    /*>>inline*/

    var INLINE_NS = 'inline',
        _hiddenClass,
        _inlinePlaceholder,
        _lastInlineElement,
        _putInlineElementsBack = function() {
            if (_lastInlineElement) {
                _inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
                _lastInlineElement = null;
            }
        };

    $.magnificPopup.registerModule(INLINE_NS, {
        options: {
            hiddenClass: 'hide', // will be appended with `mfp-` prefix
            markup: '',
            tNotFound: 'Content not found'
        },
        proto: {

            initInline: function() {
                mfp.types.push(INLINE_NS);

                _mfpOn(CLOSE_EVENT + '.' + INLINE_NS, function() {
                    _putInlineElementsBack();
                });
            },

            getInline: function(item, template) {

                _putInlineElementsBack();

                if (item.src) {
                    var inlineSt = mfp.st.inline,
                        el = $(item.src);

                    if (el.length) {

                        // If target element has parent - we replace it with placeholder and put it back after popup is closed
                        var parent = el[0].parentNode;
                        if (parent && parent.tagName) {
                            if (!_inlinePlaceholder) {
                                _hiddenClass = inlineSt.hiddenClass;
                                _inlinePlaceholder = _getEl(_hiddenClass);
                                _hiddenClass = 'mfp-' + _hiddenClass;
                            }
                            // replace target inline element with placeholder
                            _lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
                        }

                        mfp.updateStatus('ready');
                    } else {
                        mfp.updateStatus('error', inlineSt.tNotFound);
                        el = $('<div>');
                    }

                    item.inlineElement = el;
                    return el;
                }

                mfp.updateStatus('ready');
                mfp._parseMarkup(template, {}, item);
                return template;
            }
        }
    });

    /*>>inline*/

    /*>>ajax*/
    var AJAX_NS = 'ajax',
        _ajaxCur,
        _removeAjaxCursor = function() {
            if (_ajaxCur) {
                _body.removeClass(_ajaxCur);
            }
        },
        _destroyAjaxRequest = function() {
            _removeAjaxCursor();
            if (mfp.req) {
                mfp.req.abort();
            }
        };

    $.magnificPopup.registerModule(AJAX_NS, {

        options: {
            settings: null,
            cursor: 'mfp-ajax-cur',
            tError: '<a href="%url%">The content</a> could not be loaded.'
        },

        proto: {
            initAjax: function() {
                mfp.types.push(AJAX_NS);
                _ajaxCur = mfp.st.ajax.cursor;

                _mfpOn(CLOSE_EVENT + '.' + AJAX_NS, _destroyAjaxRequest);
                _mfpOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
            },
            getAjax: function(item) {

                if (_ajaxCur)
                    _body.addClass(_ajaxCur);

                mfp.updateStatus('loading');

                var opts = $.extend({
                    url: item.src,
                    success: function(data, textStatus, jqXHR) {
                        var temp = {
                            data: data,
                            xhr: jqXHR
                        };

                        _mfpTrigger('ParseAjax', temp);

                        mfp.appendContent($(temp.data), AJAX_NS);

                        item.finished = true;

                        _removeAjaxCursor();

                        mfp._setFocus();

                        setTimeout(function() {
                            mfp.wrap.addClass(READY_CLASS);
                        }, 16);

                        mfp.updateStatus('ready');

                        _mfpTrigger('AjaxContentAdded');
                    },
                    error: function() {
                        _removeAjaxCursor();
                        item.finished = item.loadError = true;
                        mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
                    }
                }, mfp.st.ajax.settings);

                mfp.req = $.ajax(opts);

                return '';
            }
        }
    });







    /*>>ajax*/

    /*>>image*/
    var _imgInterval,
        _getTitle = function(item) {
            if (item.data && item.data.title !== undefined)
                return item.data.title;

            var src = mfp.st.image.titleSrc;

            if (src) {
                if ($.isFunction(src)) {
                    return src.call(mfp, item);
                } else if (item.el) {
                    return item.el.attr(src) || '';
                }
            }
            return '';
        };

    $.magnificPopup.registerModule('image', {

        options: {
            markup: '<div class="mfp-figure">' +
                '<div class="mfp-close"></div>' +
                '<figure>' +
                '<div class="mfp-img"></div>' +
                '<figcaption>' +
                '<div class="mfp-bottom-bar">' +
                '<div class="mfp-title"></div>' +
                '<div class="mfp-counter"></div>' +
                '</div>' +
                '</figcaption>' +
                '</figure>' +
                '</div>',
            cursor: 'mfp-zoom-out-cur',
            titleSrc: 'title',
            verticalFit: true,
            tError: '<a href="%url%">The image</a> could not be loaded.'
        },

        proto: {
            initImage: function() {
                var imgSt = mfp.st.image,
                    ns = '.image';

                mfp.types.push('image');

                _mfpOn(OPEN_EVENT + ns, function() {
                    if (mfp.currItem.type === 'image' && imgSt.cursor) {
                        _body.addClass(imgSt.cursor);
                    }
                });

                _mfpOn(CLOSE_EVENT + ns, function() {
                    if (imgSt.cursor) {
                        _body.removeClass(imgSt.cursor);
                    }
                    _window.off('resize' + EVENT_NS);
                });

                _mfpOn('Resize' + ns, mfp.resizeImage);
                if (mfp.isLowIE) {
                    _mfpOn('AfterChange', mfp.resizeImage);
                }
            },
            resizeImage: function() {
                var item = mfp.currItem;
                if (!item || !item.img) return;

                if (mfp.st.image.verticalFit) {
                    var decr = 0;
                    // fix box-sizing in ie7/8
                    if (mfp.isLowIE) {
                        decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'), 10);
                    }
                    item.img.css('max-height', mfp.wH - decr);
                }
            },
            _onImageHasSize: function(item) {
                if (item.img) {

                    item.hasSize = true;

                    if (_imgInterval) {
                        clearInterval(_imgInterval);
                    }

                    item.isCheckingImgSize = false;

                    _mfpTrigger('ImageHasSize', item);

                    if (item.imgHidden) {
                        if (mfp.content)
                            mfp.content.removeClass('mfp-loading');

                        item.imgHidden = false;
                    }

                }
            },

            /**
             * Function that loops until the image has size to display elements that rely on it asap
             */
            findImageSize: function(item) {

                var counter = 0,
                    img = item.img[0],
                    mfpSetInterval = function(delay) {

                        if (_imgInterval) {
                            clearInterval(_imgInterval);
                        }
                        // decelerating interval that checks for size of an image
                        _imgInterval = setInterval(function() {
                            if (img.naturalWidth > 0) {
                                mfp._onImageHasSize(item);
                                return;
                            }

                            if (counter > 200) {
                                clearInterval(_imgInterval);
                            }

                            counter++;
                            if (counter === 3) {
                                mfpSetInterval(10);
                            } else if (counter === 40) {
                                mfpSetInterval(50);
                            } else if (counter === 100) {
                                mfpSetInterval(500);
                            }
                        }, delay);
                    };

                mfpSetInterval(1);
            },

            getImage: function(item, template) {

                var guard = 0,

                    // image load complete handler
                    onLoadComplete = function() {
                        if (item) {
                            if (item.img[0].complete) {
                                item.img.off('.mfploader');

                                if (item === mfp.currItem) {
                                    mfp._onImageHasSize(item);

                                    mfp.updateStatus('ready');
                                }

                                item.hasSize = true;
                                item.loaded = true;

                                _mfpTrigger('ImageLoadComplete');

                            } else {
                                // if image complete check fails 200 times (20 sec), we assume that there was an error.
                                guard++;
                                if (guard < 200) {
                                    setTimeout(onLoadComplete, 100);
                                } else {
                                    onLoadError();
                                }
                            }
                        }
                    },

                    // image error handler
                    onLoadError = function() {
                        if (item) {
                            item.img.off('.mfploader');
                            if (item === mfp.currItem) {
                                mfp._onImageHasSize(item);
                                mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
                            }

                            item.hasSize = true;
                            item.loaded = true;
                            item.loadError = true;
                        }
                    },
                    imgSt = mfp.st.image;


                var el = template.find('.mfp-img');
                if (el.length) {
                    var img = document.createElement('img');
                    img.className = 'mfp-img';
                    if (item.el && item.el.find('img').length) {
                        img.alt = item.el.find('img').attr('alt');
                    }
                    item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
                    img.src = item.src;

                    // without clone() "error" event is not firing when IMG is replaced by new IMG
                    // TODO: find a way to avoid such cloning
                    if (el.is('img')) {
                        item.img = item.img.clone();
                    }

                    img = item.img[0];
                    if (img.naturalWidth > 0) {
                        item.hasSize = true;
                    } else if (!img.width) {
                        item.hasSize = false;
                    }
                }

                mfp._parseMarkup(template, {
                    title: _getTitle(item),
                    img_replaceWith: item.img
                }, item);

                mfp.resizeImage();

                if (item.hasSize) {
                    if (_imgInterval) clearInterval(_imgInterval);

                    if (item.loadError) {
                        template.addClass('mfp-loading');
                        mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
                    } else {
                        template.removeClass('mfp-loading');
                        mfp.updateStatus('ready');
                    }
                    return template;
                }

                mfp.updateStatus('loading');
                item.loading = true;

                if (!item.hasSize) {
                    item.imgHidden = true;
                    template.addClass('mfp-loading');
                    mfp.findImageSize(item);
                }

                return template;
            }
        }
    });



    /*>>image*/

    /*>>zoom*/
    var hasMozTransform,
        getHasMozTransform = function() {
            if (hasMozTransform === undefined) {
                hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
            }
            return hasMozTransform;
        };

    $.magnificPopup.registerModule('zoom', {

        options: {
            enabled: false,
            easing: 'ease-in-out',
            duration: 300,
            opener: function(element) {
                return element.is('img') ? element : element.find('img');
            }
        },

        proto: {

            initZoom: function() {
                var zoomSt = mfp.st.zoom,
                    ns = '.zoom',
                    image;

                if (!zoomSt.enabled || !mfp.supportsTransition) {
                    return;
                }

                var duration = zoomSt.duration,
                    getElToAnimate = function(image) {
                        var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
                            transition = 'all ' + (zoomSt.duration / 1000) + 's ' + zoomSt.easing,
                            cssObj = {
                                position: 'fixed',
                                zIndex: 9999,
                                left: 0,
                                top: 0,
                                '-webkit-backface-visibility': 'hidden'
                            },
                            t = 'transition';

                        cssObj['-webkit-' + t] = cssObj['-moz-' + t] = cssObj['-o-' + t] = cssObj[t] = transition;

                        newImg.css(cssObj);
                        return newImg;
                    },
                    showMainContent = function() {
                        mfp.content.css('visibility', 'visible');
                    },
                    openTimeout,
                    animatedImg;

                _mfpOn('BuildControls' + ns, function() {
                    if (mfp._allowZoom()) {

                        clearTimeout(openTimeout);
                        mfp.content.css('visibility', 'hidden');

                        // Basically, all code below does is clones existing image, puts in on top of the current one and animated it

                        image = mfp._getItemToZoom();

                        if (!image) {
                            showMainContent();
                            return;
                        }

                        animatedImg = getElToAnimate(image);

                        animatedImg.css(mfp._getOffset());

                        mfp.wrap.append(animatedImg);

                        openTimeout = setTimeout(function() {
                            animatedImg.css(mfp._getOffset(true));
                            openTimeout = setTimeout(function() {

                                showMainContent();

                                setTimeout(function() {
                                    animatedImg.remove();
                                    image = animatedImg = null;
                                    _mfpTrigger('ZoomAnimationEnded');
                                }, 16); // avoid blink when switching images 

                            }, duration); // this timeout equals animation duration

                        }, 16); // by adding this timeout we avoid short glitch at the beginning of animation


                        // Lots of timeouts...
                    }
                });
                _mfpOn(BEFORE_CLOSE_EVENT + ns, function() {
                    if (mfp._allowZoom()) {

                        clearTimeout(openTimeout);

                        mfp.st.removalDelay = duration;

                        if (!image) {
                            image = mfp._getItemToZoom();
                            if (!image) {
                                return;
                            }
                            animatedImg = getElToAnimate(image);
                        }


                        animatedImg.css(mfp._getOffset(true));
                        mfp.wrap.append(animatedImg);
                        mfp.content.css('visibility', 'hidden');

                        setTimeout(function() {
                            animatedImg.css(mfp._getOffset());
                        }, 16);
                    }

                });

                _mfpOn(CLOSE_EVENT + ns, function() {
                    if (mfp._allowZoom()) {
                        showMainContent();
                        if (animatedImg) {
                            animatedImg.remove();
                        }
                        image = null;
                    }
                });
            },

            _allowZoom: function() {
                return mfp.currItem.type === 'image';
            },

            _getItemToZoom: function() {
                if (mfp.currItem.hasSize) {
                    return mfp.currItem.img;
                } else {
                    return false;
                }
            },

            // Get element postion relative to viewport
            _getOffset: function(isLarge) {
                var el;
                if (isLarge) {
                    el = mfp.currItem.img;
                } else {
                    el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
                }

                var offset = el.offset();
                var paddingTop = parseInt(el.css('padding-top'), 10);
                var paddingBottom = parseInt(el.css('padding-bottom'), 10);
                offset.top -= ($(window).scrollTop() - paddingTop);


                /*
			
                Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

                 */
                var obj = {
                    width: el.width(),
                    // fix Zepto height+padding issue
                    height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
                };

                // I hate to do this, but there is no another option
                if (getHasMozTransform()) {
                    obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
                } else {
                    obj.left = offset.left;
                    obj.top = offset.top;
                }
                return obj;
            }

        }
    });



    /*>>zoom*/

    /*>>iframe*/

    var IFRAME_NS = 'iframe',
        _emptyPage = '//about:blank',

        _fixIframeBugs = function(isShowing) {
            if (mfp.currTemplate[IFRAME_NS]) {
                var el = mfp.currTemplate[IFRAME_NS].find('iframe');
                if (el.length) {
                    // reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
                    if (!isShowing) {
                        el[0].src = _emptyPage;
                    }

                    // IE8 black screen bug fix
                    if (mfp.isIE8) {
                        el.css('display', isShowing ? 'block' : 'none');
                    }
                }
            }
        };

    $.magnificPopup.registerModule(IFRAME_NS, {

        options: {
            markup: '<div class="mfp-iframe-scaler">' +
                '<div class="mfp-close"></div>' +
                '<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>' +
                '</div>',

            srcAction: 'iframe_src',

            // we don't care and support only one default type of URL by default
            patterns: {
                youtube: {
                    index: 'youtube.com',
                    id: 'v=',
                    src: '//www.youtube.com/embed/%id%?autoplay=1'
                },
                vimeo: {
                    index: 'vimeo.com/',
                    id: '/',
                    src: '//player.vimeo.com/video/%id%?autoplay=1'
                },
                gmaps: {
                    index: '//maps.google.',
                    src: '%id%&output=embed'
                }
            }
        },

        proto: {
            initIframe: function() {
                mfp.types.push(IFRAME_NS);

                _mfpOn('BeforeChange', function(e, prevType, newType) {
                    if (prevType !== newType) {
                        if (prevType === IFRAME_NS) {
                            _fixIframeBugs(); // iframe if removed
                        } else if (newType === IFRAME_NS) {
                            _fixIframeBugs(true); // iframe is showing
                        }
                    } // else {
                    // iframe source is switched, don't do anything
                    //}
                });

                _mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function() {
                    _fixIframeBugs();
                });
            },

            getIframe: function(item, template) {
                var embedSrc = item.src;
                var iframeSt = mfp.st.iframe;

                $.each(iframeSt.patterns, function() {
                    if (embedSrc.indexOf(this.index) > -1) {
                        if (this.id) {
                            if (typeof this.id === 'string') {
                                embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id) + this.id.length, embedSrc.length);
                            } else {
                                embedSrc = this.id.call(this, embedSrc);
                            }
                        }
                        embedSrc = this.src.replace('%id%', embedSrc);
                        return false; // break;
                    }
                });

                var dataObj = {};
                if (iframeSt.srcAction) {
                    dataObj[iframeSt.srcAction] = embedSrc;
                }
                mfp._parseMarkup(template, dataObj, item);

                mfp.updateStatus('ready');

                return template;
            }
        }
    });



    /*>>iframe*/

    /*>>gallery*/
    /**
     * Get looped index depending on number of slides
     */
    var _getLoopedId = function(index) {
            var numSlides = mfp.items.length;
            if (index > numSlides - 1) {
                return index - numSlides;
            } else if (index < 0) {
                return numSlides + index;
            }
            return index;
        },
        _replaceCurrTotal = function(text, curr, total) {
            return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
        };

    $.magnificPopup.registerModule('gallery', {

        options: {
            enabled: false,
            arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
            preload: [0, 2],
            navigateByImgClick: true,
            arrows: true,

            tPrev: 'Previous (Left arrow key)',
            tNext: 'Next (Right arrow key)',
            tCounter: '%curr% of %total%'
        },

        proto: {
            initGallery: function() {

                var gSt = mfp.st.gallery,
                    ns = '.mfp-gallery',
                    supportsFastClick = Boolean($.fn.mfpFastClick);

                mfp.direction = true; // true - next, false - prev

                if (!gSt || !gSt.enabled) return false;

                _wrapClasses += ' mfp-gallery';

                _mfpOn(OPEN_EVENT + ns, function() {

                    if (gSt.navigateByImgClick) {
                        mfp.wrap.on('click' + ns, '.mfp-img', function() {
                            if (mfp.items.length > 1) {
                                mfp.next();
                                return false;
                            }
                        });
                    }

                    _document.on('keydown' + ns, function(e) {
                        if (e.keyCode === 37) {
                            mfp.prev();
                        } else if (e.keyCode === 39) {
                            mfp.next();
                        }
                    });
                });

                _mfpOn('UpdateStatus' + ns, function(e, data) {
                    if (data.text) {
                        data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
                    }
                });

                _mfpOn(MARKUP_PARSE_EVENT + ns, function(e, element, values, item) {
                    var l = mfp.items.length;
                    values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
                });

                _mfpOn('BuildControls' + ns, function() {
                    if (mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
                        var markup = gSt.arrowMarkup,
                            arrowLeft = mfp.arrowLeft = $(markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left')).addClass(PREVENT_CLOSE_CLASS),
                            arrowRight = mfp.arrowRight = $(markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right')).addClass(PREVENT_CLOSE_CLASS);

                        var eName = supportsFastClick ? 'mfpFastClick' : 'click';
                        arrowLeft[eName](function() {
                            mfp.prev();
                        });
                        arrowRight[eName](function() {
                            mfp.next();
                        });

                        // Polyfill for :before and :after (adds elements with classes mfp-a and mfp-b)
                        if (mfp.isIE7) {
                            _getEl('b', arrowLeft[0], false, true);
                            _getEl('a', arrowLeft[0], false, true);
                            _getEl('b', arrowRight[0], false, true);
                            _getEl('a', arrowRight[0], false, true);
                        }

                        mfp.container.append(arrowLeft.add(arrowRight));
                    }
                });

                _mfpOn(CHANGE_EVENT + ns, function() {
                    if (mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

                    mfp._preloadTimeout = setTimeout(function() {
                        mfp.preloadNearbyImages();
                        mfp._preloadTimeout = null;
                    }, 16);
                });


                _mfpOn(CLOSE_EVENT + ns, function() {
                    _document.off(ns);
                    mfp.wrap.off('click' + ns);

                    if (mfp.arrowLeft && supportsFastClick) {
                        mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
                    }
                    mfp.arrowRight = mfp.arrowLeft = null;
                });

            },
            next: function() {
                mfp.direction = true;
                mfp.index = _getLoopedId(mfp.index + 1);
                mfp.updateItemHTML();
            },
            prev: function() {
                mfp.direction = false;
                mfp.index = _getLoopedId(mfp.index - 1);
                mfp.updateItemHTML();
            },
            goTo: function(newIndex) {
                mfp.direction = (newIndex >= mfp.index);
                mfp.index = newIndex;
                mfp.updateItemHTML();
            },
            preloadNearbyImages: function() {
                var p = mfp.st.gallery.preload,
                    preloadBefore = Math.min(p[0], mfp.items.length),
                    preloadAfter = Math.min(p[1], mfp.items.length),
                    i;

                for (i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
                    mfp._preloadItem(mfp.index + i);
                }
                for (i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
                    mfp._preloadItem(mfp.index - i);
                }
            },
            _preloadItem: function(index) {
                index = _getLoopedId(index);

                if (mfp.items[index].preloaded) {
                    return;
                }

                var item = mfp.items[index];
                if (!item.parsed) {
                    item = mfp.parseEl(index);
                }

                _mfpTrigger('LazyLoad', item);

                if (item.type === 'image') {
                    item.img = $('<img class="mfp-img" />').on('load.mfploader', function() {
                        item.hasSize = true;
                    }).on('error.mfploader', function() {
                        item.hasSize = true;
                        item.loadError = true;
                        _mfpTrigger('LazyLoadError', item);
                    }).attr('src', item.src);
                }


                item.preloaded = true;
            }
        }
    });

    /*
    Touch Support that might be implemented some day

    addSwipeGesture: function() {
    	var startX,
    		moved,
    		multipleTouches;

    		return;

    	var namespace = '.mfp',
    		addEventNames = function(pref, down, move, up, cancel) {
    			mfp._tStart = pref + down + namespace;
    			mfp._tMove = pref + move + namespace;
    			mfp._tEnd = pref + up + namespace;
    			mfp._tCancel = pref + cancel + namespace;
    		};

    	if(window.navigator.msPointerEnabled) {
    		addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
    	} else if('ontouchstart' in window) {
    		addEventNames('touch', 'start', 'move', 'end', 'cancel');
    	} else {
    		return;
    	}
    	_window.on(mfp._tStart, function(e) {
    		var oE = e.originalEvent;
    		multipleTouches = moved = false;
    		startX = oE.pageX || oE.changedTouches[0].pageX;
    	}).on(mfp._tMove, function(e) {
    		if(e.originalEvent.touches.length > 1) {
    			multipleTouches = e.originalEvent.touches.length;
    		} else {
    			//e.preventDefault();
    			moved = true;
    		}
    	}).on(mfp._tEnd + ' ' + mfp._tCancel, function(e) {
    		if(moved && !multipleTouches) {
    			var oE = e.originalEvent,
    				diff = startX - (oE.pageX || oE.changedTouches[0].pageX);

    			if(diff > 20) {
    				mfp.next();
    			} else if(diff < -20) {
    				mfp.prev();
    			}
    		}
    	});
    },
    */


    /*>>gallery*/

    /*>>retina*/

    var RETINA_NS = 'retina';

    $.magnificPopup.registerModule(RETINA_NS, {
        options: {
            replaceSrc: function(item) {
                return item.src.replace(/\.\w+$/, function(m) {
                    return '@2x' + m;
                });
            },
            ratio: 1 // Function or number.  Set to 1 to disable.
        },
        proto: {
            initRetina: function() {
                if (window.devicePixelRatio > 1) {

                    var st = mfp.st.retina,
                        ratio = st.ratio;

                    ratio = !isNaN(ratio) ? ratio : ratio();

                    if (ratio > 1) {
                        _mfpOn('ImageHasSize' + '.' + RETINA_NS, function(e, item) {
                            item.img.css({
                                'max-width': item.img[0].naturalWidth / ratio,
                                'width': '100%'
                            });
                        });
                        _mfpOn('ElementParse' + '.' + RETINA_NS, function(e, item) {
                            item.src = st.replaceSrc(item, ratio);
                        });
                    }
                }

            }
        }
    });

    /*>>retina*/

    /*>>fastclick*/
    /**
     * FastClick event implementation. (removes 300ms delay on touch devices)
     * Based on https://developers.google.com/mobile/articles/fast_buttons
     *
     * You may use it outside the Magnific Popup by calling just:
     *
     * $('.your-el').mfpFastClick(function() {
     *     console.log('Clicked!');
     * });
     *
     * To unbind:
     * $('.your-el').destroyMfpFastClick();
     * 
     * 
     * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
     * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
     * 
     */

    (function() {
        var ghostClickDelay = 1000,
            supportsTouch = 'ontouchstart' in window,
            unbindTouchMove = function() {
                _window.off('touchmove' + ns + ' touchend' + ns);
            },
            eName = 'mfpFastClick',
            ns = '.' + eName;


        // As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
        $.fn.mfpFastClick = function(callback) {

            return $(this).each(function() {

                var elem = $(this),
                    lock;

                if (supportsTouch) {

                    var timeout,
                        startX,
                        startY,
                        pointerMoved,
                        point,
                        numPointers;

                    elem.on('touchstart' + ns, function(e) {
                        pointerMoved = false;
                        numPointers = 1;

                        point = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0];
                        startX = point.clientX;
                        startY = point.clientY;

                        _window.on('touchmove' + ns, function(e) {
                            point = e.originalEvent ? e.originalEvent.touches : e.touches;
                            numPointers = point.length;
                            point = point[0];
                            if (Math.abs(point.clientX - startX) > 10 ||
                                Math.abs(point.clientY - startY) > 10) {
                                pointerMoved = true;
                                unbindTouchMove();
                            }
                        }).on('touchend' + ns, function(e) {
                            unbindTouchMove();
                            if (pointerMoved || numPointers > 1) {
                                return;
                            }
                            lock = true;
                            e.preventDefault();
                            clearTimeout(timeout);
                            timeout = setTimeout(function() {
                                lock = false;
                            }, ghostClickDelay);
                            callback();
                        });
                    });

                }

                elem.on('click' + ns, function() {
                    if (!lock) {
                        callback();
                    }
                });
            });
        };

        $.fn.destroyMfpFastClick = function() {
            $(this).off('touchstart' + ns + ' click' + ns);
            if (supportsTouch) _window.off('touchmove' + ns + ' touchend' + ns);
        };
    })();

    /*>>fastclick*/
    _checkInstance();
}));
/*! modernizr 3.3.1 (Custom Build) | MIT *
 * https://modernizr.com/download/?-applicationcache-audio-backgroundsize-borderimage-borderradius-boxshadow-canvas-canvastext-cssanimations-csscolumns-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-flexbox-fontface-generatedcontent-geolocation-hashchange-history-hsla-indexeddb-inlinesvg-input-inputtypes-localstorage-multiplebgs-opacity-postmessage-rgba-sessionstorage-smil-svg-svgclippaths-textshadow-touchevents-video-webgl-websockets-websqldatabase-webworkers-addtest-domprefixes-hasevent-mq-prefixed-prefixes-setclasses-shiv-testallprops-testprop-teststyles !*/
! function(e, t, n) {
    function r(e, t) {
        return typeof e === t
    }

    function a() {
        var e, t, n, a, o, i, s;
        for (var c in x)
            if (x.hasOwnProperty(c)) {
                if (e = [], t = x[c], t.name && (e.push(t.name.toLowerCase()), t.options && t.options.aliases && t.options.aliases.length))
                    for (n = 0; n < t.options.aliases.length; n++) e.push(t.options.aliases[n].toLowerCase());
                for (a = r(t.fn, "function") ? t.fn() : t.fn, o = 0; o < e.length; o++) i = e[o], s = i.split("."), 1 === s.length ? Modernizr[s[0]] = a : (!Modernizr[s[0]] || Modernizr[s[0]] instanceof Boolean || (Modernizr[s[0]] = new Boolean(Modernizr[s[0]])), Modernizr[s[0]][s[1]] = a), b.push((a ? "" : "no-") + s.join("-"))
            }
    }

    function o(e) {
        var t = E.className,
            n = Modernizr._config.classPrefix || "";
        if (k && (t = t.baseVal), Modernizr._config.enableJSClass) {
            var r = new RegExp("(^|\\s)" + n + "no-js(\\s|$)");
            t = t.replace(r, "$1" + n + "js$2")
        }
        Modernizr._config.enableClasses && (t += " " + n + e.join(" " + n), k ? E.className.baseVal = t : E.className = t)
    }

    function i(e, t) {
        if ("object" == typeof e)
            for (var n in e) z(e, n) && i(n, e[n]);
        else {
            e = e.toLowerCase();
            var r = e.split("."),
                a = Modernizr[r[0]];
            if (2 == r.length && (a = a[r[1]]), "undefined" != typeof a) return Modernizr;
            t = "function" == typeof t ? t() : t, 1 == r.length ? Modernizr[r[0]] = t : (!Modernizr[r[0]] || Modernizr[r[0]] instanceof Boolean || (Modernizr[r[0]] = new Boolean(Modernizr[r[0]])), Modernizr[r[0]][r[1]] = t), o([(t && 0 != t ? "" : "no-") + r.join("-")]), Modernizr._trigger(e, t)
        }
        return Modernizr
    }

    function s() {
        return "function" != typeof t.createElement ? t.createElement(arguments[0]) : k ? t.createElementNS.call(t, "http://www.w3.org/2000/svg", arguments[0]) : t.createElement.apply(t, arguments)
    }

    function c(e) {
        return e.replace(/([a-z])-([a-z])/g, function(e, t, n) {
            return t + n.toUpperCase()
        }).replace(/^-/, "")
    }

    function l(e, t) {
        return !!~("" + e).indexOf(t)
    }

    function d() {
        var e = t.body;
        return e || (e = s(k ? "svg" : "body"), e.fake = !0), e
    }

    function u(e, n, r, a) {
        var o, i, c, l, u = "modernizr",
            f = s("div"),
            p = d();
        if (parseInt(r, 10))
            for (; r--;) c = s("div"), c.id = a ? a[r] : u + (r + 1), f.appendChild(c);
        return o = s("style"), o.type = "text/css", o.id = "s" + u, (p.fake ? p : f).appendChild(o), p.appendChild(f), o.styleSheet ? o.styleSheet.cssText = e : o.appendChild(t.createTextNode(e)), f.id = u, p.fake && (p.style.background = "", p.style.overflow = "hidden", l = E.style.overflow, E.style.overflow = "hidden", E.appendChild(p)), i = n(f, e), p.fake ? (p.parentNode.removeChild(p), E.style.overflow = l, E.offsetHeight) : f.parentNode.removeChild(f), !!i
    }

    function f(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }

    function p(e, t, n) {
        var a;
        for (var o in e)
            if (e[o] in t) return n === !1 ? e[o] : (a = t[e[o]], r(a, "function") ? f(a, n || t) : a);
        return !1
    }

    function m(e) {
        return e.replace(/([A-Z])/g, function(e, t) {
            return "-" + t.toLowerCase()
        }).replace(/^ms-/, "-ms-")
    }

    function h(t, r) {
        var a = t.length;
        if ("CSS" in e && "supports" in e.CSS) {
            for (; a--;)
                if (e.CSS.supports(m(t[a]), r)) return !0;
            return !1
        }
        if ("CSSSupportsRule" in e) {
            for (var o = []; a--;) o.push("(" + m(t[a]) + ":" + r + ")");
            return o = o.join(" or "), u("@supports (" + o + ") { #modernizr { position: absolute; } }", function(e) {
                return "absolute" == getComputedStyle(e, null).position
            })
        }
        return n
    }

    function g(e, t, a, o) {
        function i() {
            u && (delete H.style, delete H.modElem)
        }
        if (o = r(o, "undefined") ? !1 : o, !r(a, "undefined")) {
            var d = h(e, a);
            if (!r(d, "undefined")) return d
        }
        for (var u, f, p, m, g, v = ["modernizr", "tspan", "samp"]; !H.style && v.length;) u = !0, H.modElem = s(v.shift()), H.style = H.modElem.style;
        for (p = e.length, f = 0; p > f; f++)
            if (m = e[f], g = H.style[m], l(m, "-") && (m = c(m)), H.style[m] !== n) {
                if (o || r(a, "undefined")) return i(), "pfx" == t ? m : !0;
                try {
                    H.style[m] = a
                } catch (y) {}
                if (H.style[m] != g) return i(), "pfx" == t ? m : !0
            }
        return i(), !1
    }

    function v(e, t, n, a, o) {
        var i = e.charAt(0).toUpperCase() + e.slice(1),
            s = (e + " " + W.join(i + " ") + i).split(" ");
        return r(t, "string") || r(t, "undefined") ? g(s, t, a, o) : (s = (e + " " + P.join(i + " ") + i).split(" "), p(s, t, n))
    }

    function y(e, t, r) {
        return v(e, n, n, t, r)
    }
    var b = [],
        x = [],
        T = {
            _version: "3.3.1",
            _config: {
                classPrefix: "",
                enableClasses: !0,
                enableJSClass: !0,
                usePrefixes: !0
            },
            _q: [],
            on: function(e, t) {
                var n = this;
                setTimeout(function() {
                    t(n[e])
                }, 0)
            },
            addTest: function(e, t, n) {
                x.push({
                    name: e,
                    fn: t,
                    options: n
                })
            },
            addAsyncTest: function(e) {
                x.push({
                    name: null,
                    fn: e
                })
            }
        },
        Modernizr = function() {};
    Modernizr.prototype = T, Modernizr = new Modernizr, Modernizr.addTest("applicationcache", "applicationCache" in e), Modernizr.addTest("geolocation", "geolocation" in navigator), Modernizr.addTest("history", function() {
        var t = navigator.userAgent;
        return -1 === t.indexOf("Android 2.") && -1 === t.indexOf("Android 4.0") || -1 === t.indexOf("Mobile Safari") || -1 !== t.indexOf("Chrome") || -1 !== t.indexOf("Windows Phone") ? e.history && "pushState" in e.history : !1
    }), Modernizr.addTest("postmessage", "postMessage" in e), Modernizr.addTest("svg", !!t.createElementNS && !!t.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect);
    var w = !1;
    try {
        w = "WebSocket" in e && 2 === e.WebSocket.CLOSING
    } catch (S) {}
    Modernizr.addTest("websockets", w), Modernizr.addTest("localstorage", function() {
        var e = "modernizr";
        try {
            return localStorage.setItem(e, e), localStorage.removeItem(e), !0
        } catch (t) {
            return !1
        }
    }), Modernizr.addTest("sessionstorage", function() {
        var e = "modernizr";
        try {
            return sessionStorage.setItem(e, e), sessionStorage.removeItem(e), !0
        } catch (t) {
            return !1
        }
    }), Modernizr.addTest("websqldatabase", "openDatabase" in e), Modernizr.addTest("webworkers", "Worker" in e);
    var C = T._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : ["", ""];
    T._prefixes = C;
    var E = t.documentElement,
        k = "svg" === E.nodeName.toLowerCase();
    k || ! function(e, t) {
        function n(e, t) {
            var n = e.createElement("p"),
                r = e.getElementsByTagName("head")[0] || e.documentElement;
            return n.innerHTML = "x<style>" + t + "</style>", r.insertBefore(n.lastChild, r.firstChild)
        }

        function r() {
            var e = b.elements;
            return "string" == typeof e ? e.split(" ") : e
        }

        function a(e, t) {
            var n = b.elements;
            "string" != typeof n && (n = n.join(" ")), "string" != typeof e && (e = e.join(" ")), b.elements = n + " " + e, l(t)
        }

        function o(e) {
            var t = y[e[g]];
            return t || (t = {}, v++, e[g] = v, y[v] = t), t
        }

        function i(e, n, r) {
            if (n || (n = t), u) return n.createElement(e);
            r || (r = o(n));
            var a;
            return a = r.cache[e] ? r.cache[e].cloneNode() : h.test(e) ? (r.cache[e] = r.createElem(e)).cloneNode() : r.createElem(e), !a.canHaveChildren || m.test(e) || a.tagUrn ? a : r.frag.appendChild(a)
        }

        function s(e, n) {
            if (e || (e = t), u) return e.createDocumentFragment();
            n = n || o(e);
            for (var a = n.frag.cloneNode(), i = 0, s = r(), c = s.length; c > i; i++) a.createElement(s[i]);
            return a
        }

        function c(e, t) {
            t.cache || (t.cache = {}, t.createElem = e.createElement, t.createFrag = e.createDocumentFragment, t.frag = t.createFrag()), e.createElement = function(n) {
                return b.shivMethods ? i(n, e, t) : t.createElem(n)
            }, e.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + r().join().replace(/[\w\-:]+/g, function(e) {
                return t.createElem(e), t.frag.createElement(e), 'c("' + e + '")'
            }) + ");return n}")(b, t.frag)
        }

        function l(e) {
            e || (e = t);
            var r = o(e);
            return !b.shivCSS || d || r.hasCSS || (r.hasCSS = !!n(e, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")), u || c(e, r), e
        }
        var d, u, f = "3.7.3",
            p = e.html5 || {},
            m = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
            h = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
            g = "_html5shiv",
            v = 0,
            y = {};
        ! function() {
            try {
                var e = t.createElement("a");
                e.innerHTML = "<xyz></xyz>", d = "hidden" in e, u = 1 == e.childNodes.length || function() {
                    t.createElement("a");
                    var e = t.createDocumentFragment();
                    return "undefined" == typeof e.cloneNode || "undefined" == typeof e.createDocumentFragment || "undefined" == typeof e.createElement
                }()
            } catch (n) {
                d = !0, u = !0
            }
        }();
        var b = {
            elements: p.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",
            version: f,
            shivCSS: p.shivCSS !== !1,
            supportsUnknownElements: u,
            shivMethods: p.shivMethods !== !1,
            type: "default",
            shivDocument: l,
            createElement: i,
            createDocumentFragment: s,
            addElements: a
        };
        e.html5 = b, l(t), "object" == typeof module && module.exports && (module.exports = b)
    }("undefined" != typeof e ? e : this, t);
    var _ = "Moz O ms Webkit",
        P = T._config.usePrefixes ? _.toLowerCase().split(" ") : [];
    T._domPrefixes = P;
    var z;
    ! function() {
        var e = {}.hasOwnProperty;
        z = r(e, "undefined") || r(e.call, "undefined") ? function(e, t) {
            return t in e && r(e.constructor.prototype[t], "undefined")
        } : function(t, n) {
            return e.call(t, n)
        }
    }(), T._l = {}, T.on = function(e, t) {
        this._l[e] || (this._l[e] = []), this._l[e].push(t), Modernizr.hasOwnProperty(e) && setTimeout(function() {
            Modernizr._trigger(e, Modernizr[e])
        }, 0)
    }, T._trigger = function(e, t) {
        if (this._l[e]) {
            var n = this._l[e];
            setTimeout(function() {
                var e, r;
                for (e = 0; e < n.length; e++)(r = n[e])(t)
            }, 0), delete this._l[e]
        }
    }, Modernizr._q.push(function() {
        T.addTest = i
    });
    var N = function() {
        function e(e, t) {
            var a;
            return e ? (t && "string" != typeof t || (t = s(t || "div")), e = "on" + e, a = e in t, !a && r && (t.setAttribute || (t = s("div")), t.setAttribute(e, ""), a = "function" == typeof t[e], t[e] !== n && (t[e] = n), t.removeAttribute(e)), a) : !1
        }
        var r = !("onblur" in t.documentElement);
        return e
    }();
    T.hasEvent = N, Modernizr.addTest("hashchange", function() {
        return N("hashchange", e) === !1 ? !1 : t.documentMode === n || t.documentMode > 7
    }), Modernizr.addTest("audio", function() {
        var e = s("audio"),
            t = !1;
        try {
            (t = !!e.canPlayType) && (t = new Boolean(t), t.ogg = e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), t.mp3 = e.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/, ""), t.opus = e.canPlayType('audio/ogg; codecs="opus"') || e.canPlayType('audio/webm; codecs="opus"').replace(/^no$/, ""), t.wav = e.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), t.m4a = (e.canPlayType("audio/x-m4a;") || e.canPlayType("audio/aac;")).replace(/^no$/, ""))
        } catch (n) {}
        return t
    }), Modernizr.addTest("canvas", function() {
        var e = s("canvas");
        return !(!e.getContext || !e.getContext("2d"))
    }), Modernizr.addTest("canvastext", function() {
        return Modernizr.canvas === !1 ? !1 : "function" == typeof s("canvas").getContext("2d").fillText
    }), Modernizr.addTest("video", function() {
        var e = s("video"),
            t = !1;
        try {
            (t = !!e.canPlayType) && (t = new Boolean(t), t.ogg = e.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""), t.h264 = e.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""), t.webm = e.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ""), t.vp9 = e.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, ""), t.hls = e.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, ""))
        } catch (n) {}
        return t
    }), Modernizr.addTest("webgl", function() {
        var t = s("canvas"),
            n = "probablySupportsContext" in t ? "probablySupportsContext" : "supportsContext";
        return n in t ? t[n]("webgl") || t[n]("experimental-webgl") : "WebGLRenderingContext" in e
    }), Modernizr.addTest("cssgradients", function() {
        for (var e, t = "background-image:", n = "gradient(linear,left top,right bottom,from(#9f9),to(white));", r = "", a = 0, o = C.length - 1; o > a; a++) e = 0 === a ? "to " : "", r += t + C[a] + "linear-gradient(" + e + "left top, #9f9, white);";
        Modernizr._config.usePrefixes && (r += t + "-webkit-" + n);
        var i = s("a"),
            c = i.style;
        return c.cssText = r, ("" + c.backgroundImage).indexOf("gradient") > -1
    }), Modernizr.addTest("multiplebgs", function() {
        var e = s("a").style;
        return e.cssText = "background:url(https://),url(https://),red url(https://)", /(url\s*\(.*?){3}/.test(e.background)
    }), Modernizr.addTest("opacity", function() {
        var e = s("a").style;
        return e.cssText = C.join("opacity:.55;"), /^0.55$/.test(e.opacity)
    }), Modernizr.addTest("rgba", function() {
        var e = s("a").style;
        return e.cssText = "background-color:rgba(150,255,150,.5)", ("" + e.backgroundColor).indexOf("rgba") > -1
    }), Modernizr.addTest("inlinesvg", function() {
        var e = s("div");
        return e.innerHTML = "<svg/>", "http://www.w3.org/2000/svg" == ("undefined" != typeof SVGRect && e.firstChild && e.firstChild.namespaceURI)
    });
    var R = s("input"),
        $ = "autocomplete autofocus list placeholder max min multiple pattern required step".split(" "),
        A = {};
    Modernizr.input = function(t) {
        for (var n = 0, r = t.length; r > n; n++) A[t[n]] = !!(t[n] in R);
        return A.list && (A.list = !(!s("datalist") || !e.HTMLDataListElement)), A
    }($);
    var O = "search tel url email datetime date month week time datetime-local number range color".split(" "),
        j = {};
    Modernizr.inputtypes = function(e) {
        for (var r, a, o, i = e.length, s = "1)", c = 0; i > c; c++) R.setAttribute("type", r = e[c]), o = "text" !== R.type && "style" in R, o && (R.value = s, R.style.cssText = "position:absolute;visibility:hidden;", /^range$/.test(r) && R.style.WebkitAppearance !== n ? (E.appendChild(R), a = t.defaultView, o = a.getComputedStyle && "textfield" !== a.getComputedStyle(R, null).WebkitAppearance && 0 !== R.offsetHeight, E.removeChild(R)) : /^(search|tel)$/.test(r) || (o = /^(url|email)$/.test(r) ? R.checkValidity && R.checkValidity() === !1 : R.value != s)), j[e[c]] = !!o;
        return j
    }(O), Modernizr.addTest("hsla", function() {
        var e = s("a").style;
        return e.cssText = "background-color:hsla(120,40%,100%,.5)", l(e.backgroundColor, "rgba") || l(e.backgroundColor, "hsla")
    });
    var L = "CSS" in e && "supports" in e.CSS,
        M = "supportsCSS" in e;
    Modernizr.addTest("supports", L || M);
    var B = {}.toString;
    Modernizr.addTest("svgclippaths", function() {
        return !!t.createElementNS && /SVGClipPath/.test(B.call(t.createElementNS("http://www.w3.org/2000/svg", "clipPath")))
    }), Modernizr.addTest("smil", function() {
        return !!t.createElementNS && /SVGAnimate/.test(B.call(t.createElementNS("http://www.w3.org/2000/svg", "animate")))
    });
    var F = function() {
        var t = e.matchMedia || e.msMatchMedia;
        return t ? function(e) {
            var n = t(e);
            return n && n.matches || !1
        } : function(t) {
            var n = !1;
            return u("@media " + t + " { #modernizr { position: absolute; } }", function(t) {
                n = "absolute" == (e.getComputedStyle ? e.getComputedStyle(t, null) : t.currentStyle).position
            }), n
        }
    }();
    T.mq = F;
    var D = T.testStyles = u;
    Modernizr.addTest("touchevents", function() {
        var n;
        if ("ontouchstart" in e || e.DocumentTouch && t instanceof DocumentTouch) n = !0;
        else {
            var r = ["@media (", C.join("touch-enabled),("), "heartz", ")", "{#modernizr{top:9px;position:absolute}}"].join("");
            D(r, function(e) {
                n = 9 === e.offsetTop
            })
        }
        return n
    });
    var I = function() {
        var e = navigator.userAgent,
            t = e.match(/applewebkit\/([0-9]+)/gi) && parseFloat(RegExp.$1),
            n = e.match(/w(eb)?osbrowser/gi),
            r = e.match(/windows phone/gi) && e.match(/iemobile\/([0-9])+/gi) && parseFloat(RegExp.$1) >= 9,
            a = 533 > t && e.match(/android/gi);
        return n || a || r
    }();
    I ? Modernizr.addTest("fontface", !1) : D('@font-face {font-family:"font";src:url("https://")}', function(e, n) {
        var r = t.getElementById("smodernizr"),
            a = r.sheet || r.styleSheet,
            o = a ? a.cssRules && a.cssRules[0] ? a.cssRules[0].cssText : a.cssText || "" : "",
            i = /src/i.test(o) && 0 === o.indexOf(n.split(" ")[0]);
        Modernizr.addTest("fontface", i)
    }), D('#modernizr{font:0/0 a}#modernizr:after{content:":)";visibility:hidden;font:7px/1 a}', function(e) {
        Modernizr.addTest("generatedcontent", e.offsetHeight >= 7)
    });
    var W = T._config.usePrefixes ? _.split(" ") : [];
    T._cssomPrefixes = W;
    var q = function(t) {
        var r, a = C.length,
            o = e.CSSRule;
        if ("undefined" == typeof o) return n;
        if (!t) return !1;
        if (t = t.replace(/^@/, ""), r = t.replace(/-/g, "_").toUpperCase() + "_RULE", r in o) return "@" + t;
        for (var i = 0; a > i; i++) {
            var s = C[i],
                c = s.toUpperCase() + "_" + r;
            if (c in o) return "@-" + s.toLowerCase() + "-" + t
        }
        return !1
    };
    T.atRule = q;
    var V = {
        elem: s("modernizr")
    };
    Modernizr._q.push(function() {
        delete V.elem
    });
    var H = {
        style: V.elem.style
    };
    Modernizr._q.unshift(function() {
        delete H.style
    });
    var U = T.testProp = function(e, t, r) {
        return g([e], n, t, r)
    };
    Modernizr.addTest("textshadow", U("textShadow", "1px 1px")), T.testAllProps = v;
    var G, J = T.prefixed = function(e, t, n) {
        return 0 === e.indexOf("@") ? q(e) : (-1 != e.indexOf("-") && (e = c(e)), t ? v(e, t, n) : v(e, "pfx"))
    };
    try {
        G = J("indexedDB", e)
    } catch (S) {}
    Modernizr.addTest("indexeddb", !!G), G && Modernizr.addTest("indexeddb.deletedatabase", "deleteDatabase" in G), T.testAllProps = y, Modernizr.addTest("cssanimations", y("animationName", "a", !0)), Modernizr.addTest("backgroundsize", y("backgroundSize", "100%", !0)), Modernizr.addTest("borderimage", y("borderImage", "url() 1", !0)), Modernizr.addTest("borderradius", y("borderRadius", "0px", !0)), Modernizr.addTest("boxshadow", y("boxShadow", "1px 1px", !0)),
        function() {
            Modernizr.addTest("csscolumns", function() {
                var e = !1,
                    t = y("columnCount");
                try {
                    (e = !!t) && (e = new Boolean(e))
                } catch (n) {}
                return e
            });
            for (var e, t, n = ["Width", "Span", "Fill", "Gap", "Rule", "RuleColor", "RuleStyle", "RuleWidth", "BreakBefore", "BreakAfter", "BreakInside"], r = 0; r < n.length; r++) e = n[r].toLowerCase(), t = y("column" + n[r]), ("breakbefore" === e || "breakafter" === e || "breakinside" == e) && (t = t || y(n[r])), Modernizr.addTest("csscolumns." + e, t)
        }(), Modernizr.addTest("flexbox", y("flexBasis", "1px", !0)), Modernizr.addTest("cssreflections", y("boxReflect", "above", !0)), Modernizr.addTest("csstransforms", function() {
            return -1 === navigator.userAgent.indexOf("Android 2.") && y("transform", "scale(1)", !0)
        }), Modernizr.addTest("csstransforms3d", function() {
            var e = !!y("perspective", "1px", !0),
                t = Modernizr._config.usePrefixes;
            if (e && (!t || "webkitPerspective" in E.style)) {
                var n, r = "#modernizr{width:0;height:0}";
                Modernizr.supports ? n = "@supports (perspective: 1px)" : (n = "@media (transform-3d)", t && (n += ",(-webkit-transform-3d)")), n += "{#modernizr{width:7px;height:18px;margin:0;padding:0;border:0}}", D(r + n, function(t) {
                    e = 7 === t.offsetWidth && 18 === t.offsetHeight
                })
            }
            return e
        }), Modernizr.addTest("csstransitions", y("transition", "all", !0)), a(), o(b), delete T.addTest, delete T.addAsyncTest;
    for (var Z = 0; Z < Modernizr._q.length; Z++) Modernizr._q[Z]();
    e.Modernizr = Modernizr
}(window, document);
/* --- ORGANIC TABS --- */

// --- MODIFIED
// https://github.com/CSS-Tricks/jQuery-Organic-Tabs
(function($) {
    "use strict";
    $.organicTabs = function(el, options) {
        var base = this;
        base.$el = $(el);
        base.$nav = base.$el.find(".tabs__nav");
        base.init = function() {
            base.options = $.extend({}, $.organicTabs.defaultOptions, options);
            var $allListWrap = base.$el.find(".tabs__content"),
                curList = base.$el.find("a.current").attr("href").substring(1);
            $allListWrap.height(base.$el.find("#" + curList).height());

            base.$nav.find("li > a").off('click');
            base.$nav.find("li > a").click(function(event) {

                var curList = base.$el.find("a.current").attr("href").substring(1),
                    $newList = $(this),
                    listID = $newList.attr("href").substring(1);
                if ((listID != curList) && (base.$el.find(":animated").length == 0)) {
                    base.$el.find("#" + curList).css({
                        opacity: 0,
                        "z-index": 10,
                        "pointer-events": "none"
                    }).removeClass("current");
                    var newHeight = base.$el.find("#" + listID).height();
                    $allListWrap.css({
                        height: newHeight
                    });
                    setTimeout(function() {
                        //base.$el.find("#" + curList);
                        base.$el.find("#" + listID).css({
                            opacity: 1,
                            "z-index": 100,
                            "pointer-events": "auto"
                        }).addClass("current");
                        base.$el.find(".tabs__nav li a").removeClass("current");
                        $newList.addClass("current");
                    }, 250);
                }
                setTimeout(function() {
                    $(window).trigger('organicTabsChange');
                }, 350);
                event.preventDefault();
            });
        };
        base.init();
    };
    $.organicTabs.defaultOptions = {
        speed: 300
    };
    $.fn.organicTabs = function(options) {
        return this.each(function() {
            (new $.organicTabs(this, options));
        });
    };

})(jQuery);
// /* ====== HELPER FUNCTIONS ====== */

//similar to PHP's empty function
function empty(data) {
    if (typeof(data) == 'number' || typeof(data) == 'boolean') {
        return false;
    }
    if (typeof(data) == 'undefined' || data === null) {
        return true;
    }
    if (typeof(data.length) != 'undefined') {
        return data.length === 0;
    }
    var count = 0;
    for (var i in data) {
        // if(data.hasOwnProperty(i))
        //
        // This doesn't work in ie8/ie9 due the fact that hasOwnProperty works only on native objects.
        // http://stackoverflow.com/questions/8157700/object-has-no-hasownproperty-method-i-e-its-undefined-ie8
        //
        // for hosts objects we do this
        if (Object.prototype.hasOwnProperty.call(data, i)) {
            count++;
        }
    }
    return count === 0;
}

/* --- Set Query Parameter--- */
function setQueryParameter(uri, key, value) {
    var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
    separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function tryParseJSON(jsonString) {
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object",
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    } catch (e) {
        if (globalDebug) {
            console.log(e);
        }
    }

    return false;
};




// Background videos player

var vimeoPlayersList = Array(),
    ytPlayersList = Array();

// this function must be unwrapped / public
// because it is called by YT API
function onYouTubeIframeAPIReady() {

    ytPlayersList.forEach(function(element, index, array) {
        // for each YouTube player, create a player object
        var ytPlayer = new YT.Player(array[index][0].id, {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': "onPlayerStateChange"
            },
            playerVars: {
                'controls': 0
            }
        });

        // replace the iframe in the list with the player object
        array[index] = ytPlayer;
    });
}

// this function must be unwrapped / public
// because it is called by YT API
function onPlayerReady(event) {
    // play and mute each YT video

    if (!Modernizr.touchevents) {
        event.target.playVideo();

        setTimeout(function() {
            $(event.target.a).addClass('is--playing');
        }, 200);
    }
    event.target.mute();
}

function onPlayerStateChange(event) {
    event.target.mute();

    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo();

        setTimeout(function() {
            $(event.target.a).addClass('is--playing');
        }, 200);
    }
}



// Vimeo business
function onVimeoMessageReceived(e) {
    $ = jQuery;
    var data = tryParseJSON(e.data);

    if (data !== false) {
        switch (data.event) {
            case 'ready':
                var data = {
                    method: 'setVolume',
                    value: '0'
                };

                // for each vimeo player, set volume to 0
                vimeoPlayersList.forEach(function(element, index, array) {
                    array[index].vimeoIframe[0].contentWindow.postMessage(JSON.stringify(data), array[index].vimeoURL);
                });

                if (!Modernizr.touchevents) {

                    data = {
                        method: 'play'
                    };

                    // for each vimeo player, let it play
                    vimeoPlayersList.forEach(function(element, index, array) {
                        array[index].vimeoIframe[0].contentWindow.postMessage(JSON.stringify(data), array[index].vimeoURL);

                        setTimeout(function() {
                            $(element.vimeoIframe[0]).addClass('is--playing');
                        }, 200);
                    });
                }

                break;
        }
    }
}

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[7].length == 11) {
        return match[7];
    } else {
        console.log("Incorrect Youtube Video URL");
    }
}

function vimeo_parser(url) {
    var regExp = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    var match = url.match(regExp);
    if (match) {
        return match[3];
    } else {
        console.log("Incorrect Vimeo Video URL");
    }
}

var VideoBackground = {
    init: function() {
        $ = jQuery;

        $('.video-iframe-holder').each(function() {

            // don't play the video if we're in a slider
            if (!!$(this).closest('.projects--slider').length) {
                return;
            }

            $(this).parent().appendTo($(this).closest('.hero'));

            // Get the video URL
            var videoURL = $(this).data('url');

            var initialHeight = null,
                initialWidth = null;

            if (videoURL.indexOf('youtube') >= 0) {
                // we have a YT video

                // Inject the Youtube API Script in page
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                // Get Youtube video ID
                var youtubeVideoID = youtube_parser(videoURL);

                // Compose iframe src
                // playlist=' + youtubeVideoID +' - this is needed for the video to repeat itself
                var youtubeVideoSrc = '//www.youtube.com/embed/' + youtubeVideoID + '?enablejsapi=1&amp;rel=0&amp;controls=0&amp;showinfo=0&amp;loop=1&amp;playlist=PL' + youtubeVideoID + '&amp;iv_load_policy=3';

                // Create YT iframe Object and push it to the players list
                ytPlayersList.push($('<iframe/>', {
                    'class': 'video-bg  video--youtube',
                    'id': 'video-bg-player-' + makeid(),
                    'src': youtubeVideoSrc,
                    'frameborder': 0,
                    'width': 853,
                    'height': 510
                }).appendTo($(this))); // and append it to .video-iframe-holder

            } else if (videoURL.indexOf('vimeo') >= 0) {
                // we have a Vimeo video

                // Get Vimeo video ID
                var vimeoVideoID = vimeo_parser(videoURL);

                // Compose iframe src
                var vimeoVideoSrc = 'https://player.vimeo.com/video/' + vimeoVideoID + '?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;color=383737&amp;loop=1&amp;api=1';

                // Create the object that will be pushed into the videos list
                var vimeoObject = {
                    vimeoIframe: null,
                    vimeoURL: null
                }

                // Create Vimeo iframe Object
                vimeoObject.vimeoIframe =
                    $('<iframe/>', {
                        'class': 'video-bg  video--vimeo',
                        'id': 'video-bg-player-' + makeid(),
                        'src': vimeoVideoSrc,
                        'frameborder': 0
                    }).appendTo($(this));

                vimeoObject.vimeoURL = vimeoVideoSrc.split('?')[0];

                // pushing the object into the Vimeo players list
                vimeoPlayersList.push(vimeoObject);

                initialWidth = 16;
                initialHeight = 9;
            }

            if (initialHeight == null && initialWidth == null) {
                initialHeight = $(this).find('iframe').height();
                initialWidth = $(this).find('iframe').width();
            }

            // setting and aspect ration on each iframe holder
            // based on the iframes
            $(this).attr('data-ar', initialWidth / initialHeight);

        });

        // adding event listeners for Vimeo videos
        if (window.addEventListener)
            window.addEventListener('message', onVimeoMessageReceived, false);
        else
            window.attachEvent('onmessage', onVimeoMessageReceived, false);

        // calling an initial fill() on videos
        this.fill();
    },

    fill: function() {
        $('.video-iframe-holder').each(function() {

            // don't play the video if we're in a slider
            if (!!$(this).closest('.projects--slider').length) {
                return;
            }

            // getting the parent of the iframe holder - the .hero
            var $parent = $(this).parent();

            // getting .hero's width and height
            var parentHeight = $parent.height(),
                parentWidth = $parent.width();

            var aspectRatio = $(this).attr('data-ar');

            // calc. .hero aspect ratio
            var parentRatio = parentWidth / parentHeight;

            if (parentRatio >= aspectRatio) {
                fillLandscape($(this), parentWidth, parentHeight, aspectRatio);
            } else if (parentRatio < aspectRatio) {
                fillPortrait($(this), parentWidth, parentHeight, aspectRatio);
            }

            $(this).addClass('filled');
        });

        function fillPortrait(element, width, height, ratio) {
            element.height(height);
            element.width(height * ratio + 400);
            element.css('left', (width - element.width()) / 2);
            element.css('top', 0);
        }

        function fillLandscape(element, width, height, ratio) {
            element.width(width);
            element.height(width / ratio + 400);
            element.css('top', (height - element.height()) / 2);
            element.css('left', 0);
        }
    }
};

(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());