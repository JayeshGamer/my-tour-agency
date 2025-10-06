// Prevent hydration mismatches caused by browser extensions
(function() {
  'use strict';

  // Handle DarkReader extension conflicts
  if (typeof window !== 'undefined') {
    // Create a MutationObserver to handle dynamic attribute changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' &&
            (mutation.attributeName?.includes('darkreader') ||
             mutation.attributeName?.includes('data-darkreader'))) {
          // Let React know about the change by dispatching an event
          mutation.target.dispatchEvent(new CustomEvent('darkreader-change', {
            bubbles: false,
            detail: { attribute: mutation.attributeName }
          }));
        }
      });
    });

    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        observer.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ['data-darkreader-inline-stroke', 'data-darkreader-inline-fill', 'style']
        });
      });
    } else {
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-darkreader-inline-stroke', 'data-darkreader-inline-fill', 'style']
      });
    }

    // Cleanup function
    window.addEventListener('beforeunload', function() {
      observer.disconnect();
    });
  }
})();
