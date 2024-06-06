document.addEventListener('DOMContentLoaded', function () {
  loadContent();

  function loadContent() {
      fetch('content2.txt')
          .then(response => response.text())
          .then(text => {
              const container = document.getElementById('text-container');
              const wordsContainer = document.getElementById('words');
              let modifiedText = encodeHtml(text); 
              let matchIndex = 1;
              let wordCounts = {};
              let draggables = [];

              // First pass to count occurrences
              modifiedText = modifiedText.replace(/\*([^*]+)\*/g, function(match, p1) {
                  const word = p1.trim();
                  if(wordCounts[word]) {
                      wordCounts[word]++;
                  } else {
                      wordCounts[word] = 1;
                  }
                  return `<input type="text" id="input-${matchIndex++}" data-answer="${word}">`;
              });

              // Create draggable elements with counts
              Object.entries(wordCounts).forEach(([word, count]) => {
                  let draggableWrapper = document.createElement('div');
                  draggableWrapper.classList.add('draggable-wrapper');

                  let draggable = document.createElement('div');
                  draggable.setAttribute('draggable', true);
                  draggable.classList.add('draggable');
                  draggable.textContent = `${word} (${count})`;
                  draggable.dataset.word = word; // Store actual word as data attribute

                  let checkbox = document.createElement('input');
                  checkbox.type = 'checkbox';
                  checkbox.classList.add('confirm-checkbox');
                  checkbox.onchange = function() {
                      if (checkbox.checked) {
                          draggable.style.backgroundColor = 'lightgrey';
                          checkbox.style.backgroundColor = '#cd1316';  // Dark red background when checked
                      } else {
                          draggable.style.backgroundColor = 'white';
                          checkbox.style.backgroundColor = '';  // Reset to default
                      }
                  };

                  draggableWrapper.appendChild(draggable);
                  draggableWrapper.appendChild(checkbox);
                  draggableWrapper.style.display = 'flex'; 
                  draggableWrapper.style.alignItems = 'center';
                  draggableWrapper.style.justifyContent = 'space-between';
                  draggableWrapper.style.width = '100%';

                  draggables.push(draggableWrapper); 
              });

              shuffle(draggables); 
              draggables.forEach(draggableWrapper => wordsContainer.appendChild(draggableWrapper)); 

              container.innerHTML = modifiedText.replace(/\n/g, '<br>').replace(/ {5}/g, '&nbsp;&nbsp;');
              applyDraggableListeners();
              applyDroppableListeners();
          })
          .catch(error => console.error('Error loading the text file:', error));
  }

  function applyDraggableListeners() {
      document.querySelectorAll('.draggable').forEach(item => {
          item.addEventListener('dragstart', event => {
              event.dataTransfer.setData('text', item.dataset.word); // Use the actual word for dragging
          });
      });
  }

  function applyDroppableListeners() {
      document.querySelectorAll('input[type="text"]').forEach(input => {
          input.addEventListener('dragover', event => event.preventDefault());
          input.addEventListener('drop', event => {
              event.preventDefault();
              input.value = event.dataTransfer.getData('text');
          });
      });
  }
});



function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function encodeHtml(html) {
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
            //  .replace(/"/g, '&quot;')
            //  .replace(/'/g, '&#039;');

  // Comment highlighting
  html = html.replace(/&lt;!--(.*?)--&gt;/g, '<span class="comment">&lt;!--$1--&gt;</span>');
  
  // Tag and attribute highlighting
  html = html.replace(/(&lt;)(\/?)([a-zA-Z0-9-]+)(.*?)(&gt;)/g, function(match, p1, p2, p3, p4, p5) {
      return '<span class="angle-brackets">' + p1 + '</span>' + 
             '<span class="tag">' + p2 + p3 + '</span>' + 
             p4.replace(/([a-zA-Z-]+)(=)("[^"]*"|'[^']*')/g, '<span class="attribute-name">$1</span>$2<span class="attribute-value">$3</span>') + 
             '<span class="angle-brackets">' + p5 + '</span>';
  });
  

  return html;
}




document.querySelectorAll('.draggable').forEach(item => {
    item.addEventListener('dragstart', event => {
      event.dataTransfer.setData('text', event.target.innerText);
    });
  });
  
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('dragover', event => {
      event.preventDefault();  // Allow the drop
    });
  
    input.addEventListener('drop', event => {
      event.preventDefault();
      const correctWord = event.dataTransfer.getData('text');
      event.target.value = correctWord;
    });
  });
  
  function checkAnswers() {
    let score = 0;
    const inputs = document.querySelectorAll('input[type="text"]');
    const total = inputs.length;
    inputs.forEach(input => {
      const correctAnswer = input.dataset.answer;
      if (input.value.trim() === correctAnswer) {
        input.className = 'correct';
        score++;  // Increment score for each correct answer
      } else {
        input.className = 'incorrect';
      }
    });
    const scorePercent = Math.round((score / total) * 100);
    document.getElementById('score').textContent = `${scorePercent}% (${score} / ${total})`;
  }
  
  
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // ES6 array destructuring swap
    }
  }
  