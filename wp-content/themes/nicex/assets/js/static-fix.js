/**
 * Portfolio Static Fix - Clean Vanilla JS Implementation
 * 
 * Logic:
 * 1. On init: Clone ALL portfolio items to a master array (detached from DOM)
 * 2. Current state: Track active filter + pagination offset
 * 3. On filter change: Filter master array, reset pagination, render first batch
 * 4. On load more: Render next batch from filtered results
 * 5. Button state: Compare rendered count vs filtered count (not data-max)
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        ITEMS_PER_BATCH: 8,
        CONTAINER_SELECTOR: '.portfolio-feed.ms-p--l',
        LIST_SELECTOR: '.ms-p-list',
        ITEM_SELECTOR: '.ms-p-list__item',
        FILTER_BTN_SELECTOR: '.filter-nav__item',
        LOAD_MORE_SELECTOR: '.ajax-area--list',
        ACTIVE_CLASS: 'active',
        DISABLED_CLASS: 'btn--disabled',
        TEXT_MAIN_SELECTOR: '.text--main',
        TEXT_NO_ITEMS_SELECTOR: '.text--no-items'
    };

    // State
    let masterItems = [];      // All items cloned from DOM on init
    let filteredItems = [];    // Current filtered subset
    let currentFilter = 'all'; // Current active filter
    let renderedCount = 0;     // How many items currently shown
    let isInitialized = false;

    /**
     * Initialize the portfolio system
     */
    function init() {
        if (isInitialized) return;
        
        const container = document.querySelector(CONFIG.CONTAINER_SELECTOR);
        if (!container) {
            console.log('[Portfolio Fix] No portfolio container found');
            return;
        }

        const list = container.querySelector(CONFIG.LIST_SELECTOR);
        if (!list) {
            console.log('[Portfolio Fix] No portfolio list found');
            return;
        }

        // Build master array from ALL items in DOM
        const items = list.querySelectorAll(CONFIG.ITEM_SELECTOR);
        masterItems = Array.from(items).map(item => {
            const clone = item.cloneNode(true);
            return {
                element: clone,
                id: item.id,
                category: item.getAttribute('data-category') || 'uncategorized'
            };
        });

        console.log('[Portfolio Fix] Master array built:', masterItems.length, 'items');

        // Clear the list - we'll control rendering
        list.innerHTML = '';

        // Set up filter buttons
        setupFilters(container);

        // Set up load more button
        setupLoadMore(container);

        // Remove pointer-events restrictions
        removePointerEventBlocks(container);

        // Initial render (show first batch of all items)
        applyFilter('all');

        // Remove any conflicting handlers from theme
        removeConflictingHandlers(container);

        isInitialized = true;
    }

    /**
     * Set up filter button click handlers
     */
    function setupFilters(container) {
        const filterButtons = container.querySelectorAll(CONFIG.FILTER_BTN_SELECTOR);
        
        filterButtons.forEach(btn => {
            // Remove any existing click handlers by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add our handler
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const filterValue = this.getAttribute('data-filter') || 'all';
                
                // Update active states
                container.querySelectorAll(CONFIG.FILTER_BTN_SELECTOR).forEach(b => {
                    b.classList.remove(CONFIG.ACTIVE_CLASS);
                });
                this.classList.add(CONFIG.ACTIVE_CLASS);
                
                // Apply filter
                applyFilter(filterValue);
            });
        });
    }

    /**
     * Apply a filter and reset pagination
     */
    function applyFilter(filterValue) {
        currentFilter = filterValue.toLowerCase();
        
        // Filter from master array
        if (currentFilter === 'all' || !currentFilter) {
            filteredItems = [...masterItems];
        } else {
            filteredItems = masterItems.filter(item => {
                return item.category.toLowerCase() === currentFilter;
            });
        }
        
        console.log('[Portfolio Fix] Filter applied:', currentFilter, '-', filteredItems.length, 'items');
        
        // Reset pagination
        renderedCount = 0;
        
        // Clear the list
        const container = document.querySelector(CONFIG.CONTAINER_SELECTOR);
        const list = container.querySelector(CONFIG.LIST_SELECTOR);
        list.innerHTML = '';
        
        // Render first batch
        renderNextBatch();
    }

    /**
     * Render next batch of items
     */
    function renderNextBatch() {
        const container = document.querySelector(CONFIG.CONTAINER_SELECTOR);
        const list = container.querySelector(CONFIG.LIST_SELECTOR);
        const loadMoreBtn = container.querySelector(CONFIG.LOAD_MORE_SELECTOR);
        
        // Calculate items to render
        const startIndex = renderedCount;
        const endIndex = Math.min(startIndex + CONFIG.ITEMS_PER_BATCH, filteredItems.length);
        const itemsToRender = filteredItems.slice(startIndex, endIndex);
        
        console.log('[Portfolio Fix] Rendering batch:', startIndex, 'to', endIndex, '-', itemsToRender.length, 'items');
        
        // Append items to DOM
        itemsToRender.forEach(item => {
            // Clone again for DOM insertion (preserves our master copy)
            const domItem = item.element.cloneNode(true);
            domItem.style.display = 'list-item';
            domItem.style.opacity = '0';
            list.appendChild(domItem);
            
            // Simple fade-in animation (no GSAP dependency)
            requestAnimationFrame(() => {
                domItem.style.transition = 'opacity 0.3s ease';
                domItem.style.opacity = '1';
            });
        });
        
        // Update rendered count
        renderedCount = endIndex;
        
        // Update load more button state
        updateLoadMoreButton(loadMoreBtn);
        
        // Sync hover images
        syncHoverImages(container);
    }

    /**
     * Update load more button visibility and state
     */
    function updateLoadMoreButton(btn) {
        if (!btn) return;
        
        const hasMore = renderedCount < filteredItems.length;
        
        console.log('[Portfolio Fix] Load more state:', renderedCount, 'of', filteredItems.length, '- hasMore:', hasMore);
        
        const textMain = btn.querySelector(CONFIG.TEXT_MAIN_SELECTOR);
        const textNoItems = btn.querySelector(CONFIG.TEXT_NO_ITEMS_SELECTOR);
        
        if (hasMore) {
            // More items available
            btn.classList.remove(CONFIG.DISABLED_CLASS);
            if (textMain) textMain.style.display = '';
            if (textNoItems) textNoItems.style.display = 'none';
        } else {
            // No more items
            btn.classList.add(CONFIG.DISABLED_CLASS);
            if (textMain) textMain.style.display = 'none';
            if (textNoItems) textNoItems.style.display = '';
        }
    }

    /**
     * Set up load more button handler
     */
    function setupLoadMore(container) {
        const loadMoreBtn = container.querySelector(CONFIG.LOAD_MORE_SELECTOR);
        if (!loadMoreBtn) return;
        
        // Remove any existing handlers by cloning
        const newBtn = loadMoreBtn.cloneNode(true);
        loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);
        
        // Add our handler
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Only load if we have more items
            if (renderedCount < filteredItems.length) {
                renderNextBatch();
            }
        });
        
        // Remove inline pointer-events restriction
        newBtn.style.pointerEvents = 'auto';
    }

    /**
     * Sync hover preview images with visible items
     */
    function syncHoverImages(container) {
        const aside = container.querySelector('.ms-p-list__aside-wrap');
        if (!aside) return;
        
        // Get IDs of currently visible items
        const list = container.querySelector(CONFIG.LIST_SELECTOR);
        const visibleItems = list.querySelectorAll(CONFIG.ITEM_SELECTOR);
        const visibleIds = Array.from(visibleItems).map(item => item.id);
        
        // Show/hide corresponding images
        const images = aside.querySelectorAll('figure.ms-p-list__img');
        images.forEach(img => {
            const imgId = img.getAttribute('data-id');
            if (visibleIds.includes(imgId)) {
                img.style.display = '';
            } else {
                img.style.display = 'none';
            }
        });
    }

    /**
     * Remove pointer-events CSS blocks
     */
    function removePointerEventBlocks(container) {
        // Remove from filter buttons
        container.querySelectorAll('.filtr-btn li').forEach(el => {
            el.style.pointerEvents = 'auto';
        });
        
        // Remove from items
        container.querySelectorAll(CONFIG.ITEM_SELECTOR).forEach(el => {
            el.style.pointerEvents = 'auto';
        });
    }

    /**
     * Remove conflicting handlers from theme JS
     */
    function removeConflictingHandlers(container) {
        // Stop any ongoing AJAX by hiding loader
        const loader = container.querySelector('.load_filter');
        if (loader) {
            loader.style.display = 'none';
        }
        
        // Override any global functions that might interfere
        if (typeof window.jQuery !== 'undefined') {
            // Remove jQuery handlers from our elements
            const $ = window.jQuery;
            $(CONFIG.CONTAINER_SELECTOR).off('click', '.filter-nav__item');
            $(CONFIG.CONTAINER_SELECTOR).off('click', '.ajax-area--list');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded, but wait for other scripts
        setTimeout(init, 100);
    }

    // Also try on window load as backup
    window.addEventListener('load', function() {
        if (!isInitialized) {
            init();
        }
    });

})();
