document.addEventListener('DOMContentLoaded', function () {
    const stickyBoard = document.getElementById('sticky-board');

    // Load existing notes from local storage
    const savedNotes = JSON.parse(localStorage.getItem('sticky-notes')) || [];
    savedNotes.forEach(note => createStickyNote(note.x, note.y, note.content));

    stickyBoard.addEventListener('dblclick', function (event) {
        if (event.target === stickyBoard) {
            createStickyNote(event.clientX, event.clientY);
        }
    });

    function createStickyNote(x, y, content = '') {
        const note = document.createElement('div');
        note.classList.add('sticky-note');
        note.style.left = `${x}px`;
        note.style.top = `${y}px`;
        note.style.backgroundColor = getRandomPastelColor();

        const quillContainer = document.createElement('div');
        quillContainer.classList.add('quill');
        note.appendChild(quillContainer);

        // Add a close button to the sticky note
        const closeButton = document.createElement('button');
        closeButton.textContent = 'x';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', function() {
            removeStickyNote(note);
        });
        note.appendChild(closeButton);

        stickyBoard.appendChild(note);

        // Initialize Quill editor
        const quill = new Quill(quillContainer, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'link', 'image', 'code-block']
                ]
            }
        });
        if (content) {
            quill.setContents(JSON.parse(content));
        }

        // Make the note draggable
        makeDraggable(note);

        // Prevent overlapping with existing notes
        preventOverlapping(note);

        // Save the note to local storage
        quill.on('text-change', function() {
            const noteData = {
                x: parseInt(note.style.left),
                y: parseInt(note.style.top),
                content: JSON.stringify(quill.getContents())
            };
            saveNote(noteData);
        });
    }

    function getRandomPastelColor() {
        const colors = ['#ffcccc', '#ffcc99', '#ccffcc', '#ccff99', '#99ffcc', '#99ff99', '#ccccff', '#ccccff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function makeDraggable(element) {
        var x, y, target = null;

        element.addEventListener('mousedown', function(e) {
            x = e.clientX - element.offsetLeft;
            y = e.clientY - element.offsetTop;
            target = element;
            target.classList.add('dragging');
        });

        document.addEventListener('mouseup', function() {
            if (target !== null) {
                target.classList.remove('dragging');
                target = null;
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (target !== null) {
                target.style.left = e.clientX - x + 'px';
                target.style.top = e.clientY - y + 'px';
                var pRect = target.parentElement.getBoundingClientRect();
                var tgtRect = target.getBoundingClientRect();
                if (tgtRect.left < pRect.left) target.style.left =  0;
                if (tgtRect.top < pRect.top) target.style.top =  0;
                if (tgtRect.right > pRect.right) target.style.left = pRect.width - tgtRect.width + 'px';
                if (tgtRect.bottom > pRect.bottom) target.style.top = pRect.height - tgtRect.height + 'px';
            }
        });
    }

    function preventOverlapping(newNote) {
        // Check for overlaps with existing notes and adjust position if necessary
        // ...
    }

    function removeStickyNote(note) {
        note.remove();
        // Remove the note from local storage
        const notes = JSON.parse(localStorage.getItem('sticky-notes')) || [];
        const noteIndex = notes.findIndex(n => n.x === parseInt(note.style.left) && n.y === parseInt(note.style.top));
        if (noteIndex > -1) {
            notes.splice(noteIndex,   1);
            localStorage.setItem('sticky-notes', JSON.stringify(notes));
        }
    }

    function saveNote(noteData) {
        const notes = JSON.parse(localStorage.getItem('sticky-notes')) || [];
        const noteIndex = notes.findIndex(n => n.x === noteData.x && n.y === noteData.y);
        if (noteIndex > -1) {
            notes[noteIndex] = noteData;
        } else {
            notes.push(noteData);
        }
        localStorage.setItem('sticky-notes', JSON.stringify(notes));
    }
});
