/**
 * Static Portfolio Fix
 * Pure frontend filtering and Load More for static WordPress export
 * Replaces AJAX-based filtering in app.min.js
 * 
 * Features:
 * - Category filtering with dynamic category detection
 * - Load More: 8 initial items, 8 more per click
 * - Disables button when all items loaded
 * - Preserves hover image preview logic
 * - Safe GSAP animations
 */

(function($) {
    'use strict';

    // Configuration
    const CONFIG = {
        initialLoad: 8,
        loadPerClick: 8,
        itemSelector: '.ms-p-list__item',
        containerSelector: '.portfolio_wrap',
        filterSelector: '.filter-nav__item',
        loadMoreSelector: '.btn-load-more',
        hiddenClass: 'portfolio-item-hidden',
        activeClass: 'active',
        disabledClass: 'btn--disabled'
    };

    // Safe GSAP wrapper - only animate if target exists and GSAP is loaded
    function safeGsapTo(target, vars) {
        if (typeof gsap === 'undefined' || !target || !target.length) {
            return;
        }
        try {
            return gsap.to(target, vars);
        } catch (e) {
            console.warn('GSAP animation failed:', e);
        }
    }

    function safeGsapFromTo(target, fromVars, toVars) {
        if (typeof gsap === 'undefined' || !target || !target.length) {
            return;
        }
        try {
            return gsap.fromTo(target, fromVars, toVars);
        } catch (e) {
            console.warn('GSAP animation failed:', e);
        }
    }

    // Portfolio Load More System
    function PortfolioLoadMore($container) {
        this.$container = $container;
        this.$loadMoreBtn = $container.find(CONFIG.loadMoreSelector).closest('.ajax-area--list');
        this.$itemsList = $container.find('.ms-p-list');
        this.$allItems = this.$itemsList.find(CONFIG.itemSelector);
        this.visibleCount = 0;
        this.filterValue = 'all';
        this.isFiltering = false;
        
        this.init();
    }

    PortfolioLoadMore.prototype.init = function() {
        // Get total items count
        this.totalItems = this.$allItems.length;
        
        // Read data-max from HTML (total available items)
        var maxAttr = this.$loadMoreBtn.attr('data-max');
        this.maxItems = maxAttr ? parseInt(maxAttr, 10) : this.totalItems;
        
        // Show initial items
        this.resetVisibility();
        
        // Bind load more click
        this.bindLoadMore();
        
        // Update button state
        this.updateButtonState();
    };

    PortfolioLoadMore.prototype.resetVisibility = function() {
        this.visibleCount = 0;
        var self = this;
        
        // First, hide all items
        this.$allItems.each(function() {
            var $item = $(this);
            $item.addClass(CONFIG.hiddenClass).hide();
            $item.attr('data-visible', 'false');
        });
        
        // Then show initial items based on current filter
        this.showItems(CONFIG.initialLoad);
    };

    PortfolioLoadMore.prototype.showItems = function(count) {
        var self = this;
        var shown = 0;
        var itemsToShow = [];
        
        this.$allItems.each(function() {
            var $item = $(this);
            
            // Check if item matches current filter
            if (self.matchesFilter($item)) {
                if (shown < count && $item.attr('data-visible') !== 'true') {
                    itemsToShow.push($item);
                    shown++;
                }
            }
        });
        
        // Show the collected items with animation
        itemsToShow.forEach(function($item) {
            $item.removeClass(CONFIG.hiddenClass);
            $item.attr('data-visible', 'true');
            
            // Use GSAP if available, otherwise simple show
            if (typeof gsap !== 'undefined') {
                $item.show();
                safeGsapFromTo($item, 
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                );
            } else {
                $item.fadeIn(300);
            }
        });
        
        this.visibleCount += shown;
        this.updateButtonState();
    };

    PortfolioLoadMore.prototype.matchesFilter = function($item) {
        if (this.filterValue === 'all' || !this.filterValue) {
            return true;
        }
        
        var itemCategory = $item.attr('data-category') || '';
        return itemCategory.toLowerCase() === this.filterValue.toLowerCase();
    };

    PortfolioLoadMore.prototype.bindLoadMore = function() {
        var self = this;
        
        // Remove any existing click handlers to prevent duplicates
        this.$loadMoreBtn.off('click.loadMore');
        
        this.$loadMoreBtn.on('click.loadMore', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove pointer-events limitation
            $(this).css('pointer-events', 'auto');
            
            // Load more items
            self.showItems(CONFIG.loadPerClick);
        });
        
        // Remove inline pointer-events limitation
        this.$loadMoreBtn.css('pointer-events', 'auto');
    };

    PortfolioLoadMore.prototype.updateButtonState = function() {
        // Count how many items match current filter
        var matchingItems = 0;
        var visibleMatching = 0;
        
        this.$allItems.each(function() {
            var $item = $(this);
            if ($item.attr('data-category') === this.filterValue || this.filterValue === 'all') {
                matchingItems++;
                if ($item.attr('data-visible') === 'true') {
                    visibleMatching++;
                }
            }
        }.bind(this));
        
        // Disable button if all matching items are visible
        if (visibleMatching >= matchingItems || this.visibleCount >= this.maxItems) {
            this.$loadMoreBtn.addClass(CONFIG.disabledClass);
            this.$loadMoreBtn.find('.text--main').hide();
            this.$loadMoreBtn.find('.text--no-items').show();
            this.$loadMoreBtn.off('click.loadMore');
        } else {
            this.$loadMoreBtn.removeClass(CONFIG.disabledClass);
            this.$loadMoreBtn.find('.text--main').show();
            this.$loadMoreBtn.find('.text--no-items').hide();
        }
    };

    PortfolioLoadMore.prototype.setFilter = function(filterValue) {
        this.filterValue = filterValue || 'all';
        
        // Reset and show initial items for this filter
        this.resetVisibility();
    };

    // Portfolio Filter System
    function initPortfolioFilter() {
        var $portfolioWraps = $(CONFIG.containerSelector);
        
        if (!$portfolioWraps.length) return;
        
        $portfolioWraps.each(function() {
            var $container = $(this);
            var loadMore = new PortfolioLoadMore($container);
            
            // Override filter clicks - prevent AJAX, use frontend filtering
            $container.off('click.staticFilter').on('click.staticFilter', '.filter-nav__item:not(.active)', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $this = $(this);
                var filterValue = $this.attr('data-filter') || 'all';
                
                // Update active state
                $container.find('.filter-nav__item').removeClass(CONFIG.activeClass);
                $this.addClass(CONFIG.activeClass);
                
                // Update ARIA
                $container.find('.filtr-btn li .subnav__link').attr('aria-current', 'none');
                $this.find('.subnav__link').attr('aria-current', 'page');
                
                // Remove pointer-events limitations
                $container.find('.filtr-btn li').css('pointer-events', 'auto');
                $container.find(CONFIG.itemSelector).css('pointer-events', 'auto');
                
                // Apply filter to Load More system
                loadMore.setFilter(filterValue);
                
                return false;
            });
            
            // Remove inline pointer-events limitations on items
            $container.find('.filtr-btn li').css('pointer-events', 'auto');
            $container.find(CONFIG.itemSelector).css('pointer-events', 'auto');
        });
    }

    // Detect available categories dynamically
    function detectCategories() {
        var categories = new Set();
        var $items = $(CONFIG.itemSelector);
        
        $items.each(function() {
            var category = $(this).attr('data-category');
            if (category) {
                categories.add(category);
            }
        });
        
        return Array.from(categories);
    }

    // Safe GSAP for existing animations
    function patchExistingAnimations() {
        if (typeof gsap === 'undefined') return;
        
        // Patch common GSAP calls to check targets first
        var originalTo = gsap.to;
        var originalFromTo = gsap.fromTo;
        
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

    // Override the original AJAX filter function
    function overrideAjaxFilter() {
        // Wait for app.min.js to load, then override
        if (typeof $ !== 'undefined') {
            $(document).ready(function() {
                // Wait a bit for app.min.js to initialize
                setTimeout(function() {
                    // Remove any existing click handlers from app.min.js
                    $('.portfolio_wrap').off('click', '.filter-nav__item:not(.active)');
                    
                    // Initialize our filter
                    initPortfolioFilter();
                    
                    // Patch GSAP
                    patchExistingAnimations();
                    
                    // Log detected categories for debugging
                    var categories = detectCategories();
                    console.log('[Static Fix] Detected categories:', categories);
                }, 100);
            });
        }
    }

    // Initialize when DOM is ready
    if (typeof $ !== 'undefined') {
        overrideAjaxFilter();
    } else {
        // Fallback if jQuery not loaded yet
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(overrideAjaxFilter, 200);
        });
    }

})(window.jQuery);
