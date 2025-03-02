let currentDialog = null;

function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}

function closeDialog() {
    if (currentDialog) {
        currentDialog.remove();
        currentDialog = null;
        clearSelection();
    }
}

function showDialog(selectedText) {
    // Remove any existing dialog
    if (currentDialog) {
        closeDialog();
    }

    // Create dialog overlay
    const overlay = document.createElement('div');
    overlay.className = 'ai-dialog-overlay';
    
    // Close dialog when clicking outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDialog();
        }
    });
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'ai-dialog';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'ai-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'ai-dialog-title';
    title.textContent = 'AI Explanation';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'ai-close-button';
    closeButton.innerHTML = '×';
    closeButton.onclick = closeDialog;
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create selected text section
    const selectedTextDiv = document.createElement('div');
    selectedTextDiv.className = 'ai-selected-text';
    selectedTextDiv.textContent = `"${selectedText}"`;
    
    // Create explanation section
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'ai-explanation';
    explanationDiv.innerHTML = '<div class="ai-loading">Getting explanation...</div>';
    
    // Assemble dialog
    dialog.appendChild(header);
    dialog.appendChild(selectedTextDiv);
    dialog.appendChild(explanationDiv);
    overlay.appendChild(dialog);
    
    // Add to page
    document.body.appendChild(overlay);
    currentDialog = overlay;
    
    // Get explanation from API
    fetch('http://localhost:8080/api/explain', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            selectedText: selectedText,
            topic: document.title,
            pre: '',
            post: ''
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        explanationDiv.innerHTML = data.explanation;
    })
    .catch(error => {
        explanationDiv.innerHTML = `
            <div class="ai-error">
                Sorry, there was an error getting the explanation. 
                Please try again later.
            </div>`;
        console.error('Error:', error);
    });
}

// Handle text selection
document.addEventListener('mouseup', (event) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.length > 0) {
        showDialog(selectedText);
    }
});

// Handle double click
document.addEventListener('dblclick', (event) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.length > 0) {
        showDialog(selectedText);
    }
});

// Handle escape key to close dialog
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && currentDialog) {
        closeDialog();
    }
});
