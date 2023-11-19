// Handle input changes
$(document).on('input', '#searchInput', function() {
    const query = $(this).val();
    // Make an AJAX request to get autocomplete results
    $.ajax({
      url: '/product/autocomplete', // Update this with your server endpoint for autocomplete
      method: 'GET',
      data: { q: query },
      success: function(results) {
        // Update the autocomplete results div
        $('#autocompleteResults').html(results).show(); // Show the results
      },
      error: function(error) {
        console.error('Autocomplete request failed:', error);
      }
    });
});
// Hide autocomplete results when clicking outside the input and results
$(document).on('click', function(e) {
    if (!$(e.target).closest('.autocomplete-results, #searchInput').length) {
      $('#autocompleteResults').hide();
    }
});




/*
// Inside your public/js/search.js file
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResultsContainer');

    // Function to perform the search
    const performSearch = async (searchTerm) => {
        try {
            const response = await fetch(`/product/search?q=${searchTerm}`);
            const data = await response.json();

            // Display search results dynamically
            if (data.products && data.products.length > 0) {
                const resultsHtml = data.products.map(product => `<a class="dropdown-item" href="/product/${product._id}">${product.title}</a>`).join('');
                searchResultsContainer.innerHTML = resultsHtml;
                searchResultsContainer.style.display = 'block';
            } else {
                searchResultsContainer.innerHTML = '<p class="dropdown-item">No results found.</p>';
                searchResultsContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during search:', error);
        }
    };

    // Event listener for the search input (typing)
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length > 0) {
            performSearch(searchTerm);
        } else {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
        }
    });
});
*/