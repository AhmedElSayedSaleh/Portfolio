/**
 * Static Portfolio Fix
 * Pure frontend filtering for static WordPress export
 * Overrides AJAX-based filtering in app.min.js
 */

(function($) {
    'use strict';

    // Safe GSAP wrapper - only animate if target exists and GSAP is loaded
    function safeGsapTo(target, vars) {
        if (typeof gsap === 'undefined' || !target || !target.length) {
            return;
        }
        try {
            gsap.to(target, vars);
        } catch (e) {
            console.warn('GSAP animation failed:', e);
        }
    }

    function safeGsapFromTo(target, fromVars, toVars) {
        if (typeof gsap === 'undefined' || !target || !target.length) {
            return;
        }
        try {
            gsap.fromTo(target, fromVars, toVars);
        } catch (e) {
            console.warn('GSAP animation failed:', e);
        }
    }

    // Portfolio Filter Functionality
    function initPortfolioFilter() {
        const $portfolioWrap = $('.portfolio_wrap');
        if (!$portfolioWrap.length) return;

        // Override filter clicks - prevent AJAX, use frontend filtering
        $portfolioWrap.off('click.filterStatic').on('click.filterStatic', '.filter-nav__item:not(.active)', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const $this = $(this);
            const filterValue = $this.attr('data-filter') || 'all';
            const $container = $this.closest('.portfolio_wrap');
            const $items = $container.find('.ms-p-list__item, .grid-item-p');
            
            // Update active state
            $container.find('.filter-nav__item').removeClass('active');
            $this.addClass('active');
            
            // Update ARIA
            $container.find('.filtr-btn li .subnav__link').attr('aria-current', 'none');
            $this.find('.subnav__link').attr('aria-current', 'page');

            // Filter items
            if (filterValue === 'all' || !filterValue) {
                // Show all
                $items.each(function() {
                    const $item = $(this);
                    $item.show();
                    safeGsapFromTo($item, 
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                    );
                });
            } else {
                // Filter by category
                $items.each(function() {
                    const $item = $(this);
                    // Check if item has category data or check links
                    let itemCategories = $item.attr('data-categories') || '';
                    
                    // If no data-categories, try to extract from link or child elements
                    if (!itemCategories) {
                        const $link = $item.find('a[href*="/portfolios/"], a[href*="/category/"]');
                        if ($link.length) {
                            const href = $link.attr('href') || '';
                            itemCategories = href.split('/').filter(Boolean).pop() || '';
                        }
                    }
                    
                    // Normalize for comparison
                    const itemCatLower = itemCategories.toLowerCase();
                    const filterLower = filterValue.toLowerCase();
                    
                    if (itemCatLower.includes(filterLower) || filterLower === 'all') {
                        $item.show();
                        safeGsapFromTo($item,
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                        );
                    } else {
                        safeGsapTo($item, {
                            opacity: 0,
                            y: -20,
                            duration: 0.3,
                            ease: 'power2.in',
                            onComplete: function() {
                                $item.hide();
                            }
                        });
                    }
                });
            }

            return false;
        });
    }

    // Override the original AJAX filter function
    function overrideAjaxFilter() {
        // Wait for app.min.js to load, then override
        if (typeof $ !== 'undefined') {
            $(document).ready(function() {
                // Remove any existing click handlers from app.min.js
                $('.portfolio_wrap').off('click', '.filter-nav__item:not(.active)');
                
                // Initialize our filter
                initPortfolioFilter();
            });
        }
    }

    // Safe GSAP for existing animations
    function patchExistingAnimations() {
        // Patch common GSAP calls to check targets first
        const originalTo = gsap && gsap.to;
        const originalFromTo = gsap && gsap.fromTo;
        
        if (originalTo) {
            gsap.to = function(target, vars) {
                if (!target || (typeof target === 'object' && !target.length && !(target instanceof Element))) {
                    return Promise.resolve();
                }
                return originalTo.apply(this, arguments);
            };
        }
        
        if (originalFromTo) {
            gsap.fromTo = function(target, fromVars, toVars) {
                if (!target || (typeof target === 'object' && !target.length && !(target instanceof Element))) {
                    return Promise.resolve();
                }
                return originalFromTo.apply(this, arguments);
            };
        }
    }

    // Initialize when DOM is ready
    if (typeof $ !== 'undefined') {
        $(document).ready(function() {
            // Wait a bit for app.min.js to initialize
            setTimeout(function() {
                overrideAjaxFilter();
                patchExistingAnimations();
            }, 100);
        });
    } else {
        // Fallback if jQuery not loaded yet
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(overrideAjaxFilter, 200);
        });
    }

})(window.jQuery);
