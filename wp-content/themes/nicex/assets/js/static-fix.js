/**
 * Portfolio Static Fix - Aggressive Override
 * 
 * Strategy:
 * 1. Intercept clicks at document level (capturing phase) to block theme AJAX
 * 2. Clone and replace all interactive elements to remove jQuery handlers
 * 3. Maintain master list, filter, paginate
 * 4. Disable any global AJAX functions for portfolio
 */

(function() {
    'use strict';

    const CONFIG = {
        ITEMS_PER_BATCH: 8,
        CONTAINER_SELECTOR: '.portfolio-feed.ms-p--l',
        LIST_SELECTOR: '.ms-p-list',
        ITEM_SELECTOR: '.ms-p-list__item',
        FILTER_BTN_SELECTOR: '.filter-nav__item',
        LOAD_MORE_SELECTOR: '.ajax-area--list',
        ACTIVE_CLASS: 'active',
        DISABLED_CLASS: 'btn--disabled'
    };

    let masterItems = [];
    let filteredItems = [];
    let renderedCount = 0;
    let isInitialized = false;

    /**
     * Block all theme AJAX before it happens
     */
    function blockThemeAjax() {
        // Override jQuery AJAX for portfolio URLs
        if (typeof window.jQuery !== 'undefined') {
            const $ = window.jQuery;
            const originalAjax = $.ajax;
            
            $.ajax = function(options) {
                const url = options.url || '';
                // Block AJAX to portfolio pagination URLs
                if (url.includes('/portfolio/page/') || url.includes('simply_static_page')) {
                    console.log('[Portfolio Fix] Blocked AJAX:', url);
                    // Return resolved promise to prevent errors
                    return $.Deferred().resolve().promise();
                }
                return originalAjax.apply(this, arguments);
            };
            
            // Also block any handlers on the container
            $(CONFIG.CONTAINER_SELECTOR).off();
            $(document).off('click', '.filter-nav__item');
            $(document).off('click', '.ajax-area--list');
            $(document).off('click', '.btn-load-more');
            
            // Remove all click handlers from portfolio elements
            $('.filter-nav__item').off('click');
            $('.ajax-area--list').off('click');
            $('.btn-load-more').off('click');
        }
        
        // Add capturing event listener to intercept clicks before bubbling
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // Check if click is on filter button or load more
            if (target.closest('.filter-nav__item') || target.closest('.ajax-area--list')) {
                // Check if we're in portfolio area
                if (target.closest(CONFIG.CONTAINER_SELECTOR)) {
                    e.stopImmediatePropagation();
                    // Let our handler deal with it
                }
            }
        }, true); // Capturing phase
    }

    /**
     * Clean clone - removes all event handlers
     */
    function cleanClone(element) {
        const clone = element.cloneNode(true);
        // Remove any jQuery data attributes that might hold handlers
        clone.removeAttribute('data-events');
        return clone;
    }

    function init() {
        if (isInitialized) {
            console.log('[Portfolio Fix] Already initialized');
            return;
        }
        
        const container = document.querySelector(CONFIG.CONTAINER_SELECTOR);
        if (!container) {
            console.log('[Portfolio Fix] No portfolio container');
            return;
        }

        const list = container.querySelector(CONFIG.LIST_SELECTOR);
        if (!list) {
            console.log('[Portfolio Fix] No portfolio list');
            return;
        }

        // Block AJAX immediately
        blockThemeAjax();

        // Get all items from DOM
        const items = Array.from(list.querySelectorAll(CONFIG.ITEM_SELECTOR));
        console.log('[Portfolio Fix] Found', items.length, 'items in DOM');

        // Build master array
        masterItems = items.map(item => {
            return {
                element: cleanClone(item),
                id: item.id,
                category: (item.getAttribute('data-category') || 'uncategorized').toLowerCase()
            };
        });

        console.log('[Portfolio Fix] Master array:', masterItems.length, 'items');
        console.log('[Portfolio Fix] Categories:', masterItems.map(i => i.category));

        // Clear list completely
        list.innerHTML = '';

        // Replace filter buttons with clean clones
        const filterNav = container.querySelector('.filtr-btn');
        if (filterNav) {
            const buttons = filterNav.querySelectorAll(CONFIG.FILTER_BTN_SELECTOR);
            buttons.forEach(btn => {
                const cleanBtn = cleanClone(btn);
                btn.parentNode.replaceChild(cleanBtn, btn);
            });
        }

        // Replace load more with clean clone
        const loadMoreOriginal = container.querySelector(CONFIG.LOAD_MORE_SELECTOR);
        if (loadMoreOriginal) {
            const cleanLoadMore = cleanClone(loadMoreOriginal);
            loadMoreOriginal.parentNode.replaceChild(cleanLoadMore, loadMoreOriginal);
        }

        // Set up handlers
        setupFilterHandlers(container);
        setupLoadMoreHandler(container);

        // Show initial items
        applyFilter('all');

        // Hide loader
        const loader = container.querySelector('.load_filter');
        if (loader) loader.style.display = 'none';

        isInitialized = true;
        console.log('[Portfolio Fix] Initialized successfully');
    }

    function setupFilterHandlers(container) {
        const buttons = container.querySelectorAll(CONFIG.FILTER_BTN_SELECTOR);
        
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const filterValue = this.getAttribute('data-filter') || 'all';
                console.log('[Portfolio Fix] Filter clicked:', filterValue);
                
                // Update active class
                buttons.forEach(b => b.classList.remove(CONFIG.ACTIVE_CLASS));
                this.classList.add(CONFIG.ACTIVE_CLASS);
                
                applyFilter(filterValue);
            });
        });
    }

    function applyFilter(filterValue) {
        const filter = filterValue.toLowerCase();
        
        if (filter === 'all' || !filter) {
            filteredItems = [...masterItems];
        } else {
            filteredItems = masterItems.filter(item => item.category === filter);
        }
        
        console.log('[Portfolio Fix] Filter:', filter, '| Items:', filteredItems.length);
        
        // Reset
        renderedCount = 0;
        
        // Clear and render
        const container = document.querySelector(CONFIG.CONTAINER_SELECTOR);
        const list = container.querySelector(CONFIG.LIST_SELECTOR);
        list.innerHTML = '';
        
        renderBatch(container, list);
    }

    function renderBatch(container, list) {
        const start = renderedCount;
        const end = Math.min(start + CONFIG.ITEMS_PER_BATCH, filteredItems.length);
        const toRender = filteredItems.slice(start, end);
        
        console.log('[Portfolio Fix] Rendering', toRender.length, 'items (', start, 'to', end, ')');
        
        toRender.forEach(item => {
            const el = item.element.cloneNode(true);
            el.style.display = 'list-item';
            el.style.opacity = '0';
            list.appendChild(el);
            
            // Fade in
            requestAnimationFrame(() => {
                el.style.transition = 'opacity 0.3s';
                el.style.opacity = '1';
            });
        });
        
        renderedCount = end;
        updateButtonState(container);
        syncHoverImages(container);
    }

    function setupLoadMoreHandler(container) {
        const btn = container.querySelector(CONFIG.LOAD_MORE_SELECTOR);
        if (!btn) return;
        
        // Aggressively remove any existing listeners by replacing element
        const parent = btn.parentNode;
        const newBtn = cleanClone(btn);
        parent.replaceChild(newBtn, btn);
        
        // Add our handler with capture to ensure it runs first
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            
            console.log('[Portfolio Fix] Load More clicked, rendered:', renderedCount, 'of', filteredItems.length);
            
            if (renderedCount < filteredItems.length) {
                const list = container.querySelector(CONFIG.LIST_SELECTOR);
                renderBatch(container, list);
            } else {
                console.log('[Portfolio Fix] No more items to load');
            }
            
            return false;
        }, true); // Use capture phase
        
        newBtn.style.pointerEvents = 'auto';
        newBtn.style.cursor = 'pointer';
    }

    function updateButtonState(container) {
        const btn = container.querySelector(CONFIG.LOAD_MORE_SELECTOR);
        if (!btn) return;
        
        const hasMore = renderedCount < filteredItems.length;
        const textMain = btn.querySelector('.text--main');
        const textNo = btn.querySelector('.text--no-items');
        
        console.log('[Portfolio Fix] Button state:', renderedCount, '/', filteredItems.length, hasMore ? 'more' : 'done');
        
        if (hasMore) {
            btn.classList.remove(CONFIG.DISABLED_CLASS);
            if (textMain) textMain.style.display = '';
            if (textNo) textNo.style.display = 'none';
        } else {
            btn.classList.add(CONFIG.DISABLED_CLASS);
            if (textMain) textMain.style.display = 'none';
            if (textNo) textNo.style.display = '';
        }
    }

    function syncHoverImages(container) {
        const aside = container.querySelector('.ms-p-list__aside-wrap');
        if (!aside) return;
        
        const list = container.querySelector(CONFIG.LIST_SELECTOR);
        const visibleIds = Array.from(list.querySelectorAll(CONFIG.ITEM_SELECTOR))
            .map(el => el.id);
        
        aside.querySelectorAll('figure.ms-p-list__img').forEach(img => {
            const id = img.getAttribute('data-id');
            img.style.display = visibleIds.includes(id) ? '' : 'none';
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
    } else {
        setTimeout(init, 500);
    }
    
    window.addEventListener('load', () => {
        if (!isInitialized) setTimeout(init, 200);
    });

})();
