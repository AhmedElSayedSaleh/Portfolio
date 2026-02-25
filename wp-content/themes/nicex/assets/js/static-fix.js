/**
 * Portfolio Static Fix - Immediate Override
 * 
 * Strategy:
 * 1. Run interceptor IMMEDIATELY on script load (before jQuery ready)
 * 2. Override global infinity_load to disable theme pagination
 * 3. Block jQuery AJAX for portfolio URLs
 * 4. Maintain master list, filter, paginate
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
    let pendingFilter = null;
    let pendingLoadMore = false;

    // IMMEDIATE: Disable theme's infinity_load global
    if (typeof window.infinity_load !== 'undefined') {
        window.infinity_load.maxPages = 1;
        window.infinity_load.nextLink = '';
        console.log('[Portfolio Fix] Disabled infinity_load');
    }
    
    // IMMEDIATE: Override jQuery AJAX before DOM ready
    if (typeof window.jQuery !== 'undefined') {
        const $ = window.jQuery;
        const originalAjax = $.ajax;
        
        $.ajax = function(options) {
            const url = options.url || '';
            if (url.includes('/portfolio/page/') || url.includes('simply_static_page')) {
                console.log('[Portfolio Fix] Blocked AJAX:', url);
                return $.Deferred().resolve().promise();
            }
            return originalAjax.apply(this, arguments);
        };
    };

    // IMMEDIATE: Remove jQuery delegated handlers if they exist
    if (typeof window.jQuery !== 'undefined') {
        const $ = window.jQuery;
        $(document).off('click', '.filter-nav__item');
        $(document).off('click', '.ajax-area--list');
        $(document).off('click', '.btn-load-more');
        $(CONFIG.CONTAINER_SELECTOR).off();
    }

    // IMMEDIATE: Global click interceptor - attach to window to catch events before document
document.addEventListener('click', function(e) {
    const target = e.target;
    
    // Check if click is on filter button or load more within portfolio
    const filterBtn = target.closest('.filter-nav__item');
    const loadMore = target.closest('.ajax-area--list');
    const inPortfolio = target.closest(CONFIG.CONTAINER_SELECTOR);
    
    if (inPortfolio && (filterBtn || loadMore)) {
        console.log('[Portfolio Fix] INTERCEPTED click on', filterBtn ? 'FILTER' : 'LOAD MORE');
        
        // ABSOLUTELY STOP the event
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        
        // Prevent jQuery from handling it
        if (typeof window.jQuery !== 'undefined') {
            window.jQuery(e.target).off('click');
        }
        
        if (!isInitialized) {
            // Queue action for after init
            if (filterBtn) pendingFilter = filterBtn.getAttribute('data-filter') || 'all';
            if (loadMore) pendingLoadMore = true;
            console.log('[Portfolio Fix] Action queued (not initialized yet)');
            return false;
        }
        
        // Handle it ourselves
        if (filterBtn && !filterBtn.classList.contains(CONFIG.ACTIVE_CLASS)) {
            const filterValue = filterBtn.getAttribute('data-filter') || 'all';
            
            // Update active states
            inPortfolio.querySelectorAll(CONFIG.FILTER_BTN_SELECTOR).forEach(b => {
                b.classList.remove(CONFIG.ACTIVE_CLASS);
            });
            filterBtn.classList.add(CONFIG.ACTIVE_CLASS);
            
            applyFilter(filterValue);
        } else if (loadMore && renderedCount < filteredItems.length) {
            const list = inPortfolio.querySelector(CONFIG.LIST_SELECTOR);
            renderBatch(inPortfolio, list);
            updateButtonState(inPortfolio);
        }
        
        return false;
    }
}, true); // Capture phase - runs before bubbling

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

        // Block AJAX and setup interceptor immediately on load
        // (already done at top of file)

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

        // Set up handlers (these are now secondary to global interceptor)
        setupFilterHandlers(container);
        setupLoadMoreButton(container);

        // Show initial items
        applyFilter('all');

        // Hide loader
        const loader = container.querySelector('.load_filter');
        if (loader) loader.style.display = 'none';

        // Process any pending actions from before init
        if (pendingFilter) {
            console.log('[Portfolio Fix] Processing pending filter:', pendingFilter);
            applyFilter(pendingFilter);
            pendingFilter = null;
        }
        if (pendingLoadMore) {
            console.log('[Portfolio Fix] Processing pending load more');
            const list = container.querySelector(CONFIG.LIST_SELECTOR);
            renderBatch(container, list);
            pendingLoadMore = false;
        }

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

    /**
     * Setup Load More button - now mainly for visual/aria updates
     */
    function setupLoadMoreButton(container) {
        const btn = container.querySelector(CONFIG.LOAD_MORE_SELECTOR);
        if (!btn) return;
        
        // Just ensure visual state
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
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
