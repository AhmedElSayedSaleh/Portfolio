(function ($) {

    'use strict';

    // Cached jQuery selectors for performance
    var $window = $(window);
    var $document = $(document);
    var $body = $('body');

    $.exists = function(selector) {
        return ($(selector).length > 0);
    }
    
    $('.text-component a > img').parent('a').addClass('has-img');
    $('.text-component__inner .twitter-tweet').parent('.media-wrapper').addClass('twitter-embed');

    ms_header_menu();
    if ($window.width() > 1024) {

        ms_page_transition();
    } else {
        $('#loaded').remove();
        
    }
    ms_stickyheader();
    ms_fs_menu();
    ms_not_found();
    ms_theme_mode();
    ms_menu_default_mobile();
    ms_excerpt_plyr();
    ms_excerpt_gallery();
    ms_video_background();

    function ms_excerpt_plyr() {
        var player = new Plyr('.ms-player'),
            v_player = new Plyr('.ms-video-player');

            $('.wp-block-video').each(function() {

                var videoPlayer = new Plyr($(this).find('video'), {
                    tooltips: {
                        controls: true,
                        seek: true
                    }
                });
          
            });
            $('.wp-block-audio').each(function() {

                var audioPlayer = new Plyr($(this).find('audio'), {
                    tooltips: {
                        controls: true,
                        seek: true
                    }
                });
          
            });
    }

    function ms_video_background() {

        if ($.exists('[data-vbg]')) {
            $('[data-vbg]').youtube_background();
        }

    }

    function ms_excerpt_gallery() {
        const swiper = new Swiper('.ms-post-media__gallery', {
            loop: true,
            speed: 600,
            navigation: {
                nextEl: '.ms-sp-btn__next',
                prevEl: '.ms-sp-btn__prev',
            },
        });
    }

    // Elementor Controllers
    $window.on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_posts.default', ms_isotope_card_grid );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_projects.default', ms_masonry_gallery );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_projects.default', ms_list_item );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_projects.default', ms_carousel_showcase );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_gallery.default', ms_masonry_gallery );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_slider_fs.default', ms_full_slider );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_gallery.default', ms_lightbox );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_projects.default', ms_load_more_btn );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_projects.default', ms_load_more_btn_list );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms-hero.default', ms_parallax_hero );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_google_map.default', ms_initMap );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_testimonial.default', ms_testimonial );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ms_video_button.default', ms_video_button ); 
    });
    
    // Header menu
    function ms_header_menu() {
        if ($.exists('.js-main-header__nav-trigger')) {
            var mainHeader = document.getElementsByClassName('js-main-header')[0];
            if( mainHeader ) {
                var trigger = mainHeader.getElementsByClassName('js-main-header__nav-trigger')[0],
                    nav = mainHeader.getElementsByClassName('js-main-header__nav')[0];
                    //detect click on nav trigger
                    trigger.addEventListener("click", function(event) {
                        event.preventDefault();
                        var ariaExpanded = !Util.hasClass(nav, 'main-header__nav--is-visible');
                        //show nav and update button aria value
                        Util.toggleClass(nav, 'main-header__nav--is-visible', ariaExpanded);
                        trigger.setAttribute('aria-expanded', ariaExpanded);
                        if(ariaExpanded) { //opening menu -> move focus to first element inside nav
                            nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
                        }
                    });
            }
        }
    }
    
    // Mobile Menu
    function ms_menu_default_mobile() {

        if ($window.width() < 1024) {
            $('.main-header__nav ').addClass('is_mobile');
        }

        var isAbove1024 = $window.width() > 1024;
        $window.on('resize', function(event){
            if( $window.width() < 1077 && isAbove1024){
                isAbove1024 = false;
                $('.sub-menu').css('display', 'none');
                $('.main-header__nav ').addClass('is_mobile');
            }else if($window.width() > 1077 && !isAbove1024){
                isAbove1024 = true;
                $('.sub-menu').css('display', 'block');
                $('.main-header__nav ').removeClass('is_mobile');
            }
        });

        $(document).on('click', '.is_mobile .navbar-nav > .menu-item-has-children > a', function(e) {
            e.preventDefault();
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).siblings('.sub-menu').slideUp(300);
            } else {
                $('.menu-item-has-children > a').removeClass('active');
                $(this).addClass('active');
                $('.sub-menu').slideUp(200);
                $(this).siblings('.sub-menu').slideDown(300);
            }
          });

          $(document).on('click', '.is_mobile .sub-menu > .menu-item-has-children > a', function(e) {
            e.preventDefault();
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).siblings('.sub-menu').slideUp(300);
            } else {
                $('.sub-menu > .menu-item-has-children > a').removeClass("active");
                $(this).addClass('active');
                $(this).siblings('.sub-menu').slideUp(200);
                $(this).siblings('.sub-menu').slideDown(300);
            }
          });
    }

    // Sticky Header
    function ms_stickyheader() {
    
        if ($.exists('body[data-menu="sticky"]')) {
      
          var mainHeader = $('.main-header__layout'),
              belowNavHeroContent = $('.sub-nav-hero'),
              scrolling = false,
              previousTop = 0,
              scrollDelta = 5,
              scrollOffset = 100;
      
          $window.on('scroll', function(){
          if( !scrolling ) {
            scrolling = true;
              (!window.requestAnimationFrame)
              ? setTimeout(autoHideHeader, 300)
              : requestAnimationFrame(autoHideHeader);
          }
          });
          function autoHideHeader() {
              var currentTop = $window.scrollTop();
              ( belowNavHeroContent.length > 0 )
              ? checkStickyNavigation(currentTop) : checkSimpleNavigation(currentTop);

              // Check for show-bg class
              if (currentTop > 50) {
                 $('.main-header').addClass('show-bg');
              } else {
                 $('.main-header').removeClass('show-bg');
              }

              previousTop = currentTop;
              scrolling = false;
          }
          function checkSimpleNavigation(currentTop) {
              if (previousTop - currentTop > scrollDelta) {
                  mainHeader.removeClass('is-hide');
              } else if( currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
                  mainHeader.addClass('is-hide');
              }
          }
      
        }
      
    }
    
    // Page Transition
    function ms_page_transition() {

        if ($.exists('#loaded')) {

        window.onbeforeunload = function(){
            $('#loaded').css('display', 'block');
            gsap.to("#loaded",{ opacity:1, ease: "power4.inOut", duration:.3 });
        };

        function ms_page_loaded() {
                $('#loaded').css('display', 'none');
                $body.attr('onunload','');
            }
            gsap.fromTo("#loaded",{opacity: 1}, {opacity: 0, ease: Power1.easeOut, onComplete:ms_page_loaded, duration: 1 });
            
        }

    }
    
    // Big Menu
    function ms_fs_menu() {
        if ($.exists('.ms-fs-wrapper')) {

            $('.current_page_item > a').on('click', function(event) {
                event.preventDefault();
            });

            // Hover Effect
            $('.ms-fs-container li.menu-item > a').on('mouseenter', function () {
                $('.ms-fs-container li.menu-item > a').not(this).css('color', 'var(--color-contrast-medium)');
                $(this).css('color', 'var(--color-white)');
            });
            $('.ms-fs-container .menu-item a').on('mouseleave', function () {
                $('.ms-fs-container li.menu-item > a').css('color', 'var(--color-white)');
            });

            function ms_mi_show() {
               $('.navbar-nav-button.active > li').addClass('loading');
               menu_btn_locked();
            }

            function menu_classes_toggle(item, block) {
                item.toggleClass('style-open');
                $('.ms-logo__default').toggleClass('menu_opened');
                $('.ms-fs-menu').toggleClass('visible');
                $('html').toggleClass('fsm-opened');
                $('.close-event').css('display', block);
                $('.action-menu .open-event').attr('disabled' , true);
                $('.action-menu .close-event').attr('disabled' , true);
                if($('.ms-fs-container ul').hasClass('active')){
                  } else {
                    $('.navbar-nav-button').toggleClass('active');
                  }
                 
            }
            function menu_btn_locked() {
                $('.action-menu .open-event').attr('disabled' , false);
                $('.action-menu .close-event').attr('disabled' , false);
            }

            // Open
            $('.ms-fs-wrapper .action-menu .open-event').on('click', function(event) {
                event.preventDefault();
                var item = $(this),
                    block = 'block';
                menu_classes_toggle(item, block);
                gsap.fromTo('.icon-burger line',{x:0}, {x:'100%', stagger: 0.1, ease: Power3.easeIn, duration:.6});
                gsap.fromTo(".icon-close line",{opacity: 0}, { opacity: 1, ease: Power3.easeOut, duration:.6});
                gsap.to(".icon-close line", { stagger: 0.2, ease: Power3.easeOut, duration:.6, delay: .8,  strokeDasharray: "20,999px", onComplete:menu_btn_locked });
            });

            // Close
            $('.ms-fs-wrapper .action-menu .close-event').on('click', function() {
                $('.navbar-nav-button.active > li').removeClass('loading');
                var item = $('.open-event'),
                    block = 'none';
                menu_classes_toggle(item, block);
                gsap.fromTo('.icon-burger line',{x:'100'}, {x:0, stagger: 0.1, delay: .3, ease: Power3.easeOut, duration:1, onComplete:menu_btn_locked });
                gsap.fromTo(".icon-close line",{opacity: 1}, { opacity: 0, ease: Power3.easeOut, duration:.6});
                gsap.fromTo(".icon-close line",{strokeDasharray: "20,999px"}, { stagger: 0.2, ease: Power3.easeOut, duration:.6, delay: .6,  strokeDasharray: "0,999px" });
            });

            // Sub-menu Header
            var has_children = $('.ms-fs--nav ul > li.menu-item-has-children > a');
                has_children.next("ul.sub-menu").prepend('<li class="menu-item--back"><a href="#">subtitle</a></li>');

            // Has Children
            $('.ms-fs--nav .menu-item-has-children > a').append('<span><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path class="heroicon-ui" d="M18.59 13H3a1 1 0 0 1 0-2h15.59l-5.3-5.3a1 1 0 1 1 1.42-1.4l7 7a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.42-1.4l5.3-5.3z"/></svg></span>')

            // Menu Slide Effect
            $('.menu-item-has-children > a').on('click', function(event) {
                event.preventDefault();
                var back_text = $(this).text();
                $(this).closest('ul').removeClass('active');
                $(this).next('ul.sub-menu').addClass('active').find('.menu-item--back a').text(back_text);
                gsap.to(".ms-fs-wrapper .navbar-nav-button",{x: "-=100%", ease: Power3.easeOut, duration: .6 });
            });

            $(document).on('click', '.menu-item--back',function(){
                $(this).closest('ul').removeClass('active');
                $(this).parent('ul').parent('li').closest('ul').addClass('active')
                gsap.to(".ms-fs-wrapper .navbar-nav-button",{x: "+=100%", ease: Power3.easeOut, duration: .6 });
            });
        }

    }
 
    function ms_list_item($scope) {

        var item = $scope.find('.ms-p-list'),
            el = item.find('.ms-p-list__item'),
            selector = $scope.find('.ms-p-list__aside');
        $(el).on('mouseenter', function () {
            var item_id = $(this).attr('id'),
                selector_id = selector.find("[data-id='" + item_id + "']"); 
                selector_id.addClass('active');
            $(this).css({'opacity' : '1'}).addClass('active');
            $('.ms-p-list__item').not(this).css({'opacity' : '0.6'});
        });
        $(el).on('mouseleave', function () {
            var item_id = $(this).attr('id'),
                selector_id = selector.find("[data-id='" + item_id + "']"); 
                selector_id.removeClass('active');
                $(this).removeClass('active');
                $('.ms-p-list__item').not(this).css({'opacity' : '1'});
        });
    }

    // Portfolio Buttons
    function ms_load_more_btn($scope) {

        var pageNum = parseInt(infinity_load.startPage) + 1,
            max = parseInt(infinity_load.maxPages),
            el = $scope.find('.portfolio_wrap'),
            id = el.attr('id'),
            container = el.find('.ms-masonry-gallery'),
            container_g = el.find('.portfolio-feed'),
            contgrid = el.find('.grid-content');
    
            // Filter
            el.on( 'click', '.filter-nav__item:not(.active)', function(e) {
                pageNum = parseInt(infinity_load.startPage) + 1;
                e.preventDefault();
    
                var $p_item = container.find('.grid-item-p'),
                    $pg_item = container_g.find('.grid-item-p'),
                    button = el.find('.ajax-area'),
                    filterValue = $(this).attr('data-filter'),
                    url = window.location.href + '?category=' + filterValue,
                    preloader = el.find('.load_filter').addClass('show');
    
                button.hide(300).delay(300).queue(function(){$(this).remove();});
                el.find('.filter-nav__item').removeClass('active');
                $(this).addClass('active');
                el.find('.filtr-btn li .subnav__link').attr('aria-current', 'none');
                $(this).find('.subnav__link').attr('aria-current', 'page');
                el.find('.filtr-btn li').css({'pointer-events' : 'none'});
                $p_item.css({'pointer-events' : 'none'});
                if ($.exists(contgrid)) {
                    gsap.to( $p_item ,{opacity:.3, ease: "power2.inOut", duration:.5 });
                } else {
                    gsap.to( $pg_item ,{opacity:.3, ease: "power2.inOut", duration:.5 });
                }
                $.ajax({
                    type: 'GET',
                    url: url,
                    dataType: 'html',
                    success: function(data) {
                        var max = parseInt(infinity_load.maxPages),
                            item = $(data),
                            items = item.find('#' + id +' .grid-item-p'),
                            button = item.find('#' + id +' .ajax-area');
    
                        setTimeout(function(){
                            container.imagesLoaded( function() {
                                $p_item.css({'pointer-events' : 'auto'});
                                preloader.removeClass('show');
                                // If Grid layout = masonry
                                if ($.exists(contgrid)) {
                                    container.imagesLoaded( function() {
                                        container.isotope({
                                            itemSelector: '.grid-item-p',
                                            percentPosition: true,
                                            masonry: {
                                                columnWidth: '.grid-sizer'
                                            }
                                        });
                                    });
                                    if(items.length > 0) {
                                        container.append(items).isotope( 'appended', items );
                                    }
                                    container.isotope('reloadItems').isotope('remove', $p_item);
                                // If Grid layout = simple grid
                                } else {
                                    container_g.imagesLoaded( function() {
                                        container_g.find('.grid-item-p').remove();
                                        container_g.append(items);
                                    });
                                }
                                el.append(button);
                                el.find('.filtr-btn span').removeClass('loaded');
                                el.find('.filtr-btn li').css({'pointer-events' : 'auto'});
                            });
                        }, 2000);
                    }
                });
    
            });
    
            // Load Button
            el.on('click', '.btn-load-more', function(event){

                var nextLink = infinity_load.nextLink;
                nextLink = nextLink.replace(/\/page\/[0-9]?/,'/page/'+ pageNum);
    
                event.preventDefault();
                var id = el.attr('id'),
                    posts_container = el.find('.ms-masonry-gallery'),
                    button = $(this),
                    filterValue =  el.find('.filtr-btn li.active').attr('data-filter');
                if (filterValue === undefined || filterValue === '') {
                    filterValue = '';
                }
                    $(this).toggleClass('btn--state-b');
                    $('.md-content-loader').addClass('active');
                var max = el.find('.ajax-area').attr('data-max');
    
                    button.css({'pointer-events' : 'none'});
                    
                    pageNum++;
                    $.ajax({
                        type: 'POST',
                        url: nextLink + '?category=' + filterValue,
                        dataType: 'html',
                        success: function(data) {
                            
                            var item = $(data),
                                val = item.find('#' + id +' .grid-item-p');
                                if ($.exists(contgrid)) {
                                    var $container = el.find('.ms-masonry-gallery').isotope();
                                } else {
                                    var $container = el.find('.portfolio-feed');
                                }
                                
                                nextLink = nextLink.replace(/\/page\/[0-9]?/,'/page/'+ pageNum);
    
                                if(val.length > 0) {
                                    
                                    setTimeout(function(){
                                        $('.md-content-loader').removeClass('active');
                                        button.find('.ajax-area');
                                        button.toggleClass('btn--state-b');
                                        button.css({'pointer-events' : 'auto'});
                                        $container.imagesLoaded( function() {
                                            if ($.exists(contgrid)) {
                                                $container.append(val).isotope( 'appended', val );
                                            } else {
                                                $container.append(val);
                                            }
                                        });
                                        
                                        if(pageNum <= max) {
                                            el.find('.btn__content-b').css({'display' : 'flex'});
                                        } else {                    
                                            el.find('.btn__content-b').css({'display' : 'none'});
                                            button.addClass('no-works');
                                            button.css({'pointer-events' : 'none'});
                                        }      
                                    }, 1500);
                                } 
    
                        }
                    });
            });

    }

    // Portfolio Buttons ( List )
    function ms_load_more_btn_list($scope) {

        function ms_list_counter() {
            var list = $scope.find('.ms-p-list').children('li');
            $(list).each(function(i) {
                var number = i + 1;
                $(this).find('.p-list-c').text('0' + number + '.');
                });
        }

        if ($.exists('.portfolio-feed.ms-p--l')) {
            var pageNum = parseInt(infinity_load.startPage) + 1,
            el = $scope.find('.portfolio-feed.ms-p--l'),
            parent_id = el.parent().attr('id'),
            el = $scope.find('#' + parent_id);            

            // Filter
            el.on( 'click', '.filter-nav__item:not(.active)', function(e) {
                pageNum = parseInt(infinity_load.startPage) + 1;
                e.preventDefault();

                var container = el.find('.grid-item-p__list'),
                    container_aside = el.find('.ms-p-list__aside-wrap'),
                    text_item = container.find('.ms-p-list__item'),
                    img_item = container_aside.find('.ms-p-list__img'),
                    button = el.find('.ajax-area--list'),
                    filterValue = $(this).attr('data-filter'),
                    preloader = el.find('.load_filter').addClass('show'),
                    url = window.location.href; 
                    if (url.indexOf("#") > 0) {
                        var clean_url = url.substring(0, url.indexOf("#"));
                        window.history.replaceState({}, document.title, clean_url);
                    }
                    var t_url = url + '?category=' + filterValue;
                    
                button.hide(300).delay(300).queue(function(){$(this).remove();});
                el.find('.filter-nav__item').removeClass('active');
                $(this).addClass('active');
                el.find('.filtr-btn li .subnav__link').attr('aria-current', 'none');
                $(this).find('.subnav__link').attr('aria-current', 'page');
                el.find('.filtr-btn li').css({'pointer-events' : 'none'});
                $(text_item).css({'pointer-events' : 'none'});

                $.ajax({
                    type: 'GET',
                    url: t_url,
                    dataType: 'html',
                    success: function(data) {
                        
                        var max = parseInt(infinity_load.maxPages),
                            item = $(data),
                            text_items = item.find('#' + parent_id +' .ms-p-list__item'),
                            img_items = item.find('#' + parent_id +' .ms-p-list__img'),
                            button = item.find('#' + parent_id +' .ajax-area--list');
                            el.find('.ms-p-list__img').remove();
                        setTimeout(function(){
                            container.imagesLoaded( function() {
                                el.find('.ms-p-list__item').remove();
                                $(text_item).css({'pointer-events' : 'auto'});
                                preloader.removeClass('show');
                                $(container).find('.ms-p-list').append(text_items);
                                $(container).find('.ms-p-list__aside-wrap').append(img_items);
                                el.append(button);
                                el.find('.filtr-btn span').removeClass('loaded');
                                el.find('.filtr-btn li').css({'pointer-events' : 'auto'});
                                ms_list_item(el);
                                ms_list_counter();
                            });
                        }, 2000);
                    }
                });
    
            });

            // Load Button
            el.on('click', '.btn-load-more', function(event){
                event.preventDefault();
                $(this).addClass('btn--state-b');
                $('.md-content-loader').addClass('active');
                var nextLink = infinity_load.nextLink;
                nextLink = nextLink.replace(/\/page\/[0-9]?/,'/page/'+ pageNum);

                var id = el.attr('id'),
                    button = $(this),
                    filterValue =  el.find('.filtr-btn li.active').attr('data-filter');
                if (filterValue === undefined || filterValue === '') {
                    filterValue = '';
                }

                var max = el.find('.ajax-area--list').attr('data-max');
    
                    button.css({'pointer-events' : 'none'});
                    
                    pageNum++;
                    $.ajax({
                        type: 'POST',
                        url: nextLink + '?category=' + filterValue,
                        dataType: 'html',
                        success: function(data) {
                            var item = $(data),
                                text_items = item.find('#' + id +' .ms-p-list__item'),
                                img_items = item.find('#' + parent_id +' .ms-p-list__img'),
                                container = el.find('.ms-p-list'),
                                container_img = el.find('.ms-p-list__aside-wrap');
                                nextLink = nextLink.replace(/\/page\/[0-9]?/,'/page/'+ pageNum);
                                
                                if(text_items.length > 0) {
                                    setTimeout(function(){
                                        $('.md-content-loader').removeClass('active');
                                        button.find('.ajax-area--list');
                                        button.toggleClass('btn--state-b');
                                        button.css({'pointer-events' : 'auto'});
                                        container.append(text_items);
                                        container_img.append(img_items);
                                        if(pageNum <= max) {
                                            el.find('.btn__content-b').css({'display' : 'flex'});
                                        } else {                    
                                            el.find('.btn__content-b').css({'display' : 'none'});
                                            button.addClass('no-works');
                                            button.css({'pointer-events' : 'none'});
                                        }
                                        ms_list_item(el);
                                        ms_list_counter();
                                    }, 1500);
                                } 
    
                        }
                    });
            });
        }

    }
    
    // Google Map
    function ms_initMap($scope) {
    
        var googleMap = $scope.find('.ms-gmap--wrapper'),
            map_lat = googleMap.data('map-lat'),
            map_lng = googleMap.data('map-lng'),
            map_zoom = googleMap.data('map-zoom'),
            map_gesture_handling = googleMap.data('map-gesture-handling'),
            map_zoom_control = googleMap.data('map-zoom-control') ? true : false,
            map_zoom_control_position = googleMap.data('map-zoom-control-position'),
            map_default_ui = googleMap.data('map-default-ui') ? false : true,
            map_type = googleMap.data('map-type'),
            map_type_control = googleMap.data('map-type-control') ? true : false,
            map_type_control_style = googleMap.data('map-type-control-style'),
            map_type_control_position = googleMap.data('map-type-control-position'),
            map_streetview_control = googleMap.data('map-streetview-control') ? true : false,
            map_streetview_position = googleMap.data('map-streetview-position'),
            map_info_window_width = googleMap.data('map-info-window-width'),
            map_locations = googleMap.data('map-locations'),
            map_styles = googleMap.data('map-style') || '',
            infowindow,
            map;
    
            function initMap() {
    
                var myLatLng = {
                    lat: parseFloat(map_lat),
                    lng: parseFloat(map_lng)
                };
    
                if (typeof google === 'undefined') {
                    return;
                }
    
                var map = new google.maps.Map(googleMap[0], {
                    center: myLatLng,
                    zoom: map_zoom,
                    disableDefaultUI: map_default_ui,
                    zoomControl: map_zoom_control,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition[map_zoom_control_position]
                    },
                    mapTypeId: map_type,
                    mapTypeControl: map_type_control,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle[map_type_control_style],
                        position: google.maps.ControlPosition[map_type_control_position]
                    },
                    streetViewControl: map_streetview_control,
                    streetViewControlOptions: {
                        position: google.maps.ControlPosition[map_streetview_position]
                    },
                    styles: map_styles,
                    gestureHandling: map_gesture_handling,
                });
    
                $.each(map_locations, function (index, googleMapement, content) {
    
                    var content = '\
                    <div class="ms-gm--wrap">\
                    <h6>' + googleMapement.title + '</h6>\
                    <div>' + googleMapement.text + '</div>\
                    </div>';
    
                    var icon = '';
    
                    if (googleMapement.pin_icon !== '') {
                        if (googleMapement.pin_icon_custom) {
                            icon = googleMapement.pin_icon_custom;
                        } else {
                            icon = '';
                        }
                    }
    
                    var marker = new google.maps.Marker({
                        map: map,
                        position: new google.maps.LatLng(parseFloat(googleMapement.lat), parseFloat(googleMapement.lng)),
                        animation: google.maps.Animation.DROP,
                        icon: icon,
                    });
    
                    if (googleMapement.title !== '' && googleMapement.text !== '') {
                        addInfoWindow(marker, content);
                    }
    
                    google.maps.event.addListener(marker, 'click', toggleBounce);
    
                    function toggleBounce() {
                        if (marker.getAnimation() != null) {
                            marker.setAnimation(null);
                        } else {
                            marker.setAnimation(google.maps.Animation.BOUNCE);
                        }
                    }
    
                });
            }
    
            function addInfoWindow(marker, content) {
                google.maps.event.addListener(marker, 'click', function () {
                    if (!infowindow) {
                        infowindow = new google.maps.InfoWindow({
                            maxWidth: map_info_window_width
                        });
                    }
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                });
            }
    
            initMap();
    }
    
    // Isotope
    function ms_isotope_card_grid($scope) { 
    
        var grid = $scope.find('.grid-content');
        // init Isotope
        grid.imagesLoaded(function () { grid.isotope(); });
    }
    
    // Masonry Gallery
    function ms_masonry_gallery($scope) {
     
        var grid = $scope.find('.ms-masonry-gallery');
    
        grid.imagesLoaded(function () { grid.isotope(); });
    
        var el_2 = $scope.find('.blockgallery.h_s2').find('.mfp-img img');
        $(el_2).on('mouseenter', function () {
            $(el_2).css('opacity', '0.5');
        });
        $(el_2).on('mouseleave', function () {
            $(el_2).css('opacity', '1');
        });
    
    }

    // Parallax Hero
    function ms_parallax_hero($scope) {
        var el = $scope.find('.ms-parallax'),
            video = el.find('.jarallax-img').attr('data-jarallax-video');
        el.jarallax({ videoSrc: video });
    }
    
    // Testimonials
    function ms_testimonial($scope) {
        var el = $scope.find('.ms-rb'),
            effect = el.attr('data-effect'),
            slides = ( '' === el.attr('data-slides') ) ? 1 : el.attr('data-slides'),
            gap = ( '' === el.attr('data-slides') ) ? 30 : el.attr('data-gap'),
            loop = ( 'on' === el.attr('data-loop') ) ? true : false,
            autoplay = ( 'on' === el.attr('data-autoplay') ) ? true : false,
            swiper_container = '.' + el.attr('class').split(" ")[0],
            swiper = new Swiper(swiper_container, {
                slidesPerView: parseFloat(slides) || 1,
                loop: loop,
                autoplay: autoplay,
                spaceBetween: parseInt(gap, 10) || 30,
                effect: effect,
                speed: 1000,
                freeMode: false,
                grabCursor: false,
                mousewheel: false,
                navigation: {
                    nextEl: '.ms-rb-btn-next',
                    prevEl: '.ms-rb-btn-prev',
                },
                pagination: {
                    el: '.ms-rb-db',
                    dynamicBullets: true,
                    clickable: true,
                },
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                    },
                    500: {
                      slidesPerView: 1,
                    },
                    1024: {
                      slidesPerView: parseFloat(slides) || 1,
                    }
                }
        });
    }

    // Swiper Slider Options
    function ms_full_slider($scope) {

        var el = $scope.find('.ms-slider'),
            effect = el.attr('data-effect'),
            direction = el.attr('data-direction'),
            slides = el.attr('data-spv'),
            slides_t = el.attr('data-spv-t'),
            slides_m = el.attr('data-spv-m'),
            speed = el.attr('data-speed'),
            space = el.attr('data-space'),
            space_t = el.attr('data-space-t'),
            space_m = el.attr('data-space-m'),
            loop = ( 'on' === el.attr('data-loop') ) ? true : false,
            autoplay = ( 'on' === el.attr('data-autoplay') ) ? true : false,
            centered = ( 'on' === el.attr('data-centered') ) ? true : false,
            wheel = ( 'on' === el.attr('data-mousewheel') ) ? true : false,
            st = ( 'on' === el.attr('data-simulatetouch') ) ? true : false,
            gc = ( 'on' === el.attr('data-grabcursor') ) ? true : false;

            var swiper = new Swiper(el.get(0), {
            slidesPerView: parseFloat(slides) || 1,
            parallax: true,
            spaceBetween: parseInt(space, 10) || 0,
            loop: loop,
            loopFillGroupWithBlank: true,
            autoplay: autoplay,
            centeredSlides: centered,
            effect: effect,
            direction: direction,
            speed: parseInt(speed, 10) || 300,
            mousewheel: wheel,
            grabCursor: gc,
            simulateTouch: st,
            navigation: {
                nextEl: '.ms-nav--next',
                prevEl: '.ms-nav--prev',
            },
            pagination: {
                el: '.ms-slider--pagination',
                type: 'progressbar',
            },
            breakpoints: {
                320: {
                  slidesPerView: parseFloat(slides_m) || 1,
                  spaceBetween: parseInt(space_m, 10) || 0
                },
                500: {
                  slidesPerView: parseFloat(slides_t) || 1,
                  spaceBetween: parseInt(space_t, 10) || 0
                },
                1024: {
                  slidesPerView: parseFloat(slides) || 1,
                  spaceBetween: parseInt(space, 10) || 0
                }
            },

        });

        var counter = $('.ms-slider--count'),
            totalSlides = $('.swiper-slide:not(.swiper-slide-duplicate)').length,
            currentCount = $('<span class="count">1</span><span class="total"> / ' + totalSlides + '</span>');
        counter.append( currentCount );

        swiper.on('slideChangeTransitionEnd', function () {
            swiper.slideToLoop(swiper.realIndex, 0, false);
        });

        swiper.on('transitionStart', function () {
            var index = this.realIndex + 1,
                $current = $(".swiper-slide").eq(index);
                // $current.addClass('.swiper-slide-duplicate-active');
            currentCount = $('<span class="count">' + index + '</span><span class="total"> / ' + totalSlides + '</span>');
            counter.html(currentCount);
        });
        
    }
    
    // Carousel Showcase
    function ms_carousel_showcase($scope) {

        function ms_carousel_bg() {
            var active_bg = el.find('.swiper-slide-active .ms-p-img > img').attr('src');
            $('.ms-carousel--bg').css('background-image', 'url(' + active_bg + ')');
        }

        var el = $scope.find('.ms-carousel-showcase'),
        swiper_container = '.' + el.attr('class'),
        swiper = new Swiper(swiper_container, {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: '10%',
            initialSlide: 0,
            autoHeight: false,
            centeredSlidesBounds: true,
            loop: true,
            speed: 1000,
            mousewheel: true,
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },
            breakpoints: {
                320: {
                  slidesPerView: 1,
                  spaceBetween: '10%'
                },
                1024: {
                  slidesPerView: 'auto',
                  spaceBetween: '10%'
                }
            },
        });

    }

    // Video Button
    function ms_video_button($scope) {
    
        var el = $scope.find('.ms-vb').find('.ms-vb--src'),
            autoplay = el.attr('data-autoplay'),
            type = el.attr('data-video'),
            loop = el.attr('data-loop'),
            controls = el.attr('data-controls'),
            muted = el.attr('data-muted');
        if ( type === 'youtube' ) {
            var start = el.attr('data-start'),
                end = el.attr('data-end');
        }
    
        el.magnificPopup({
            type: 'iframe',
            iframe: {
                patterns: {
                    youtube: {
                        index: 'youtube.com/', 
                        id: function(url) {        
                            var m = url.match(/[\\?\\&]v=([^\\?\\&]+)/);
                            if ( !m || !m[1] ) return null;
                            return m[1];
                        },
                        src: '//www.youtube.com/embed/%id%?autoplay=' + autoplay + '&controls=' + controls + '&mute=' + muted + '&start=' + start + '&end=' + end
                    },
                    vimeo: {
                        index: 'vimeo.com/', 
                        id: function(url) {        
                            var m = url.match(/(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/);
                            if ( !m || !m[5] ) return null;
                            return m[5];
                        },
                        src: '//player.vimeo.com/video/%id%?autoplay=' + autoplay + '&loop=' + loop + '&controls=' + controls + '&muted=' +  muted
                    }
                },
                markup: '<div class="mfp-iframe-scaler">'+
                    '<div class="mfp-close"></div>'+
                    '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                    '<div class="mfp-title">Some caption</div>'+
                    '</div>'
            },
            callbacks: {
                markupParse: function(template, values, item) {
                    values.title = item.el.attr('data-caption');
                }
            },
        });
    
    }
    
    // Justified Gallery
    function ms_lightbox($scope) {
    
        var el = $scope.find('.blockgallery'),
            justified = $scope.find('.justified-gallery'),
            m = justified.data('margins'),
            h = justified.data('row-height');
    
            justified.justifiedGallery({
                rowHeight : h,
                margins : m,
                captions : false,
                border: 0,
                lastRow : 'nojustify',
            });

            el.magnificPopup({
                delegate: '.mfp-img',
                mainClass: 'mfp-fade',
                tClose: 'Fechar (Esc)',
                tLoading: '',
                type: 'image',
                image: {
                   titleSrc: function(item) {
                      return item.el.attr("title");;
                   }
                },
                gallery: {
                    enabled:true,
                    preload: [0,2],
                },
    
                mainClass: 'mfp-zoom-in',
                removalDelay: 300, //delay removal by X to allow out-animation
                callbacks: {
                    beforeOpen: function() {
                        $('#portfolio a').each(function(){
                            $(this).attr('alt', $(this).find('img').attr('alt'));
                        }); 
                    },
                    open: function() {
                        //overwrite default prev + next function. Add timeout for css3 crossfade animation
                        $.magnificPopup.instance.next = function() {
                            var self = this;
                            self.wrap.removeClass('mfp-image-loaded');
                            setTimeout(function() { $.magnificPopup.proto.next.call(self); }, 120);
                        }
                        $.magnificPopup.instance.prev = function() {
                            var self = this;
                            self.wrap.removeClass('mfp-image-loaded');
                            setTimeout(function() { $.magnificPopup.proto.prev.call(self); }, 120);
                        }
                    },
                    imageLoadComplete: function() { 
                        var self = this;
                        setTimeout(function() { self.wrap.addClass('mfp-image-loaded'); }, 16);
                    }
                }
    
            });
    }
    
    // Run on initial load.
    msResponsiveEmbeds();

    // Run on resize.
    window.onresize = msResponsiveEmbeds;

    // Responsive Embeds
    function msResponsiveEmbeds() {
        var proportion, parentWidth;
    
        // Loop iframe elements.
        document.querySelectorAll( 'iframe' ).forEach( function( iframe ) {
            // Only continue if the iframe has a width & height defined.
            if ( iframe.width && iframe.height ) {
                // Calculate the proportion/ratio based on the width & height.
                proportion = parseFloat( iframe.width ) / parseFloat( iframe.height );
                // Get the parent element's width.
                parentWidth = parseFloat( window.getComputedStyle( iframe.parentElement, null ).width.replace( 'px', '' ) );
                // Set the max-width & height.
                iframe.style.maxWidth = '100%';
                iframe.style.maxHeight = Math.round( parentWidth / proportion ).toString() + 'px';
            }
        } );
    }
    
    // Page 404
    function ms_not_found() {
        if ($.exists('.ms-404-page')) {
            gsap.to("#headStripe", {
                y: 0.5,
                rotation: 1,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                duration: 1
            });
            gsap.to("#spaceman", {
                y: 0.5,
                rotation: 1,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                duration: 1
            });
            gsap.to("#craterSmall", {
                x: -3,
                yoyo: true,
                repeat: -1,
                duration: 1,
                ease: "sine.inOut"
            });
            gsap.to("#craterBig", {
                x: 3,
                yoyo: true,
                repeat: -1,
                duration: 1,
                ease: "sine.inOut"
            });
            gsap.to("#planet", {
                rotation: -2,
                yoyo: true,
                repeat: -1,
                duration: 1,
                ease: "sine.inOut",
                transformOrigin: "50% 50%"
            });
    
            gsap.to("#starsBig g", {
                rotation: "random(-30,30)",
                transformOrigin: "50% 50%",
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
            gsap.fromTo(
                "#starsSmall g",
                { scale: 0, transformOrigin: "50% 50%" },
                { scale: 1, transformOrigin: "50% 50%", yoyo: true, repeat: -1, stagger: 0.1 }
            );
            gsap.to("#circlesSmall circle", {
                y: -4,
                yoyo: true,
                duration: 1,
                ease: "sine.inOut",
                repeat: -1
            });
            gsap.to("#circlesBig circle", {
                y: -2,
                yoyo: true,
                duration: 1,
                ease: "sine.inOut",
                repeat: -1
            });
    
            gsap.set("#glassShine", { x: -68 });
    
            gsap.to("#glassShine", {
                x: 80,
                duration: 2,
                rotation: -30,
                ease: "expo.inOut",
                transformOrigin: "50% 50%",
                repeat: -1,
                repeatDelay: 8,
                delay: .1
            });
        } 
    }

    // Theme Mode
    function ms_theme_mode() {
        if ($.exists('.ms_theme_mode')) {
            var td = $("#theme-dark"),
                tl = $("#theme-light"),
                s = $("#switcher");
            $(td).on("click", function(){
                $(tl).removeClass("toggler--is-active");
                $(s).prop('checked', false);
                $(this).addClass('toggler--is-active');
                $body.attr('data-theme', 'dark');
                var theme = $body.attr('data-theme');
                setCookie('theme-mode', theme, {expires : 30});
                });
            $(tl).on("click", function(){
                $(td).removeClass("toggler--is-active");
                $(s).prop('checked', true);
                $(this).addClass('toggler--is-active');
                $body.attr('data-theme', 'light');
                var theme = $body.attr('data-theme');
                setCookie('theme-mode', theme, {expires : 30});
            });
            $(s).on("click", function(){
                $(td).toggleClass("toggler--is-active");
                $(tl).toggleClass("toggler--is-active");
                $body.attr('data-theme', $body.attr('data-theme') == 'light' ? 'dark' : 'light');
                var theme = $body.attr('data-theme');
                setCookie('theme-mode', theme, {expires : 30});
            });
            function setCookie(cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            }
        }
    }

})(jQuery);

// Utill
( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define === 'function' && define.amd ) {
      // AMD
      define( [
          'isotope-layout/js/layout-mode'
        ],
        factory );
    } else if ( typeof exports === 'object' ) {
      // CommonJS
      module.exports = factory(
        require('isotope-layout/js/layout-mode')
      );
    } else {
      // browser global
      factory(
        window.Isotope.LayoutMode
      );
    }
  
    }( window, function factory( LayoutMode ) {
    'use strict';
  
    var CellsByRow = LayoutMode.create( 'cellsByRow' );
    var proto = CellsByRow.prototype;
  
    proto._resetLayout = function() {
      // reset properties
      this.itemIndex = 0;
      // measurements
      this.getColumnWidth();
      this.getRowHeight();
      // set cols
      this.cols = Math.floor( this.isotope.size.innerWidth / this.columnWidth );
      this.cols = Math.max( this.cols, 1 );
    };
  
    proto._getItemLayoutPosition = function( item ) {
      item.getSize();
      var col = this.itemIndex % this.cols;
      var row = Math.floor( this.itemIndex / this.cols );
      // center item within cell
      var x = ( col + 0.5 ) * this.columnWidth - item.size.outerWidth / 2;
      var y = ( row + 0.5 ) * this.rowHeight - item.size.outerHeight / 2;
      this.itemIndex++;
      return { x: x, y: y };
    };
  
    proto._getContainerSize = function() {
      return {
        height: Math.ceil( this.itemIndex / this.cols ) * this.rowHeight
      };
    };
  
    return CellsByRow;
  
    }));
  
    // Utility function
    function Util () {};

// class manipulation functions
Util.hasClass = function(el, className) {
    if (el.classList) return el.classList.contains(className);
    else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
    var classList = className.split(' ');
    if (el.classList) el.classList.add(classList[0]);
    else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
    if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
    var classList = className.split(' ');
    if (el.classList) el.classList.remove(classList[0]);  
    else if(Util.hasClass(el, classList[0])) {
        var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
        el.className=el.className.replace(reg, ' ');
    }
    if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
    };

Util.toggleClass = function(el, className, bool) {
    if(bool) Util.addClass(el, className);
    else Util.removeClass(el, className);
    };

Util.setAttributes = function(el, attrs) {
    for(var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
};

    /* 
    DOM manipulation
    */
Util.getChildrenByClassName = function(el, className) {
    var children = el.children,
        childrenByClass = [];
    for (var i = 0; i < el.children.length; i++) {
        if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
    }
    return childrenByClass;
};

    Util.is = function(elem, selector) {
    if(selector.nodeType){
        return elem === selector;
    }

    var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
        length = qa.length,
        returnArr = [];

    while(length--){
        if(qa[length] === elem){
        return true;
        }
    }

    return false;
    };

    /* 
    Animate height of an element
    */
    Util.setHeight = function(start, to, element, duration, cb) {
    var change = to - start,
        currentTime = null;

    var animateHeight = function(timestamp){  
        if (!currentTime) currentTime = timestamp;         
        var progress = timestamp - currentTime;
        var val = parseInt((progress/duration)*change + start);
        element.style.height = val+"px";
        if(progress < duration) {
            window.requestAnimationFrame(animateHeight);
        } else {
        cb();
        }
    };

    //set the height of the element before starting animation -> fix bug on Safari
    element.style.height = start+"px";
    window.requestAnimationFrame(animateHeight);
    };

// Portfolio filter-navigation
(function() {
    var FilterNav = function(element) {
        this.element = element;
        this.wrapper = this.element.getElementsByClassName('js-filter-nav__wrapper')[0];
        this.nav = this.element.getElementsByClassName('js-filter-nav__nav')[0];
        this.list = this.nav.getElementsByClassName('js-filter-nav__list')[0];
        this.control = this.element.getElementsByClassName('js-filter-nav__control')[0];
        this.modalClose = this.element.getElementsByClassName('js-filter-nav__close-btn')[0];
        this.placeholder = this.element.getElementsByClassName('js-filter-nav__placeholder')[0];
        this.marker = this.element.getElementsByClassName('js-filter-nav__marker');
        this.layout = 'expanded';
        initFilterNav(this);
    };

    function initFilterNav(element) {
        checkLayout(element); // init layout
        if(element.layout == 'expanded') placeMarker(element);
        element.element.addEventListener('update-layout', function(event){ // on resize - modify layout
        checkLayout(element);
        });

        // update selected item
        element.wrapper.addEventListener('click', function(event){
        var newItem = event.target.closest('.js-filter-nav__btn');
        if(newItem) {
            updateCurrentItem(element, newItem);
            return;
        }
        // close modal list - mobile version only
        if(Util.hasClass(event.target, 'js-filter-nav__wrapper') || event.target.closest('.js-filter-nav__close-btn')) toggleModalList(element, false);
        });

        // open modal list - mobile version only
        element.control.addEventListener('click', function(event){
        toggleModalList(element, true);
        });
        
        // listen for key events
        window.addEventListener('keyup', function(event){
        // listen for esc key
        if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
            // close navigation on mobile if open
            if(element.control.getAttribute('aria-expanded') == 'true' && isVisible(element.control)) {
            toggleModalList(element, false);
            }
        }
        // listen for tab key
        if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
            // close navigation on mobile if open when nav loses focus
            if(element.control.getAttribute('aria-expanded') == 'true' && isVisible(element.control) && !document.activeElement.closest('.js-filter-nav__wrapper')) toggleModalList(element, false);
        }
        });
    };

    function updateCurrentItem(element, btn) {
        if(btn.getAttribute('aria-current') == 'true') {
        toggleModalList(element, false);
        return;
        }
        var activeBtn = element.wrapper.querySelector('[aria-current]');
        if(activeBtn) activeBtn.removeAttribute('aria-current');
        btn.setAttribute('aria-current', 'true');
        // update trigger label on selection (visible on mobile only)
        element.placeholder.textContent = btn.textContent;
        toggleModalList(element, false);
        if(element.layout == 'expanded') placeMarker(element);
    };

    function toggleModalList(element, bool) {
        element.control.setAttribute('aria-expanded', bool);
        Util.toggleClass(element.wrapper, 'filter-nav__wrapper--is-visible', bool);
        if(bool) {
        element.nav.querySelectorAll('[href], button:not([disabled])')[0].focus();
        } else if(isVisible(element.control)) {
        element.control.focus();
        }
    };

    function isVisible(element) {
        return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    };

    function checkLayout(element) {
        if(element.layout == 'expanded' && switchToCollapsed(element)) { // check if there's enough space 
        element.layout = 'collapsed';
        Util.removeClass(element.element, 'filter-nav--expanded');
        Util.addClass(element.element, 'filter-nav--collapsed');
        Util.removeClass(element.modalClose, 'is-hidden');
        Util.removeClass(element.control, 'is-hidden');
        } else if(element.layout == 'collapsed' && switchToExpanded(element)) {
        element.layout = 'expanded';
        Util.addClass(element.element, 'filter-nav--expanded');
        Util.removeClass(element.element, 'filter-nav--collapsed');
        Util.addClass(element.modalClose, 'is-hidden');
        Util.addClass(element.control, 'is-hidden');
        }
        // place background element
        if(element.layout == 'expanded') placeMarker(element);
    };

    function switchToCollapsed(element) {
        return element.nav.scrollWidth > element.nav.offsetWidth;
    };

    function switchToExpanded(element) {
        element.element.style.visibility = 'hidden';
        Util.addClass(element.element, 'filter-nav--expanded');
        Util.removeClass(element.element, 'filter-nav--collapsed');
        var switchLayout = element.nav.scrollWidth <= element.nav.offsetWidth;
        Util.removeClass(element.element, 'filter-nav--expanded');
        Util.addClass(element.element, 'filter-nav--collapsed');
        element.element.style.visibility = 'visible';
        return switchLayout;
    };

    function placeMarker(element) {
        var activeElement = element.wrapper.querySelector('.js-filter-nav__btn[aria-current="true"]');
        if(element.marker.length == 0 || !activeElement ) return;
        element.marker[0].style.width = activeElement.offsetWidth+'px';
        element.marker[0].style.transform = 'translateX('+(activeElement.getBoundingClientRect().left - element.list.getBoundingClientRect().left)+'px)';
    };

    var filterNav = document.getElementsByClassName('js-filter-nav');
    if(filterNav.length > 0) {
        var filterNavArray = [];
        for(var i = 0; i < filterNav.length; i++) {
        filterNavArray.push(new FilterNav(filterNav[i]));
        }

        var resizingId = false,
        customEvent = new CustomEvent('update-layout');

        window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 100);
        });

        // wait for font to be loaded
        document.fonts.onloadingdone = function (fontFaceSetEvent) {
        doneResizing();
        };

        function doneResizing() {
        for( var i = 0; i < filterNavArray.length; i++) {
            (function(i){filterNavArray[i].element.dispatchEvent(customEvent)})(i);
        };
        };
    }

}());

/* 
    Smooth Scroll
*/
//Animation curves
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};
Util.scrollTo = function(final, duration, cb) {
  var start = window.scrollY || document.documentElement.scrollTop,
      currentTime = null;
      
  var animateScroll = function(timestamp){
    if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    window.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

// Back to Top
(function() {
    var backTop = document.getElementsByClassName('js-back-to-top')[0];
    var theme_mode_btn = document.getElementsByClassName('ms_theme_mode')[0];
    if( backTop ) {
      var dataElement = backTop.getAttribute('data-element');
      var scrollElement = dataElement ? document.querySelector(dataElement) : window;
      var scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
        scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0, 
        scrollOffset = 0,
        scrollOffsetOut = 0,
        scrolling = false;
  
      // check if target-in/target-out have been set
      var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
        targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;
  
      updateOffsets();
      
      //detect click on back-to-top link
      backTop.addEventListener('click', function(event) {
        event.preventDefault();
        if(!window.requestAnimationFrame) {
          scrollElement.scrollTo(0, 0);
        } else {
          dataElement ? scrollElement.scrollTo({top: 0, behavior: 'smooth'}) : window.scrollTo({top: 0, behavior: 'smooth'});
        } 
        //move the focus to the #top-element - don't break keyboard navigation
        // moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
      });
      
      //listen to the window scroll and update back-to-top visibility
      checkBackToTop();
      if (scrollOffset > 0 || scrollOffsetOut > 0) {
        scrollElement.addEventListener("scroll", function(event) {
          if( !scrolling ) {
            scrolling = true;
            (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
          }
        });
      }
  
      function checkBackToTop() {
        updateOffsets();
        var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
        if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        var condition =  windowTop >= scrollOffset;
        if(scrollOffsetOut > 0) {
          condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
        }
        backTop.classList.toggle('back-to-top--is-visible', condition);
        theme_mode_btn.classList.toggle('back-to-top--is-visible', condition);
        scrolling = false;
      }
  
      function updateOffsets() {
        scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
        scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
      }
  
      function getOffset(target, startOffset, bool) {
        var offset = 0;
        if(target) {
          var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
          if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
          var boundingClientRect = target.getBoundingClientRect();
          offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
          offset = offset + windowTop;
        }
        if(startOffset && startOffset) {
          offset = offset + parseInt(startOffset);
        }
        return offset;
      }
  
      function moveFocus(element) {
        if( !element ) element = document.getElementsByTagName("body")[0];
        element.focus();
        if (document.activeElement !== element) {
          element.setAttribute('tabindex','-1');
          element.focus();
        }
      };
    }

}());