// app.js
// Handles UI interactions, speech recognition, sending messages to /api/chat,
// appending messages to the chat box, and speaking replies with a customizable voice.

(function () {
  // DOM elements
  const sendBtn = document.getElementById('send-button');
  const msgInput = document.getElementById('message-input');
  const chatBox = document.getElementById('chat-box');
  const micButton = document.getElementById('mic-button');
  const headerTitle = document.getElementById('header-title');

  // Basic voice / speech setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // adjust if you want another locale
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('result', (ev) => {
      // Build the transcript from result list
      const transcript = Array.from(ev.results)
        .map(r => r[0])
        .map(a => a.transcript)
        .join('');
      // show interim result inside input
      msgInput.value = transcript;
    });

    recognition.addEventListener('end', () => {
      // When recognizer ends, reflect state in UI
      toggleListening(false);
    });

    recognition.addEventListener('start', () => {
      toggleListening(true);
    });
  } else {
    // No SpeechRecognition support
    micButton.style.display = 'none';
  }

  // Helper: append messages
  function appendMessage(text, who = 'bot') {
    const div = document.createElement('div');
    div.className = `message ${who}`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Toggle mic UI
  function toggleListening(on) {
    isListening = !!on;
    micButton.setAttribute('aria-pressed', String(isListening));
    if (isListening) {
      micButton.classList.add('listening');
      micButton.title = 'Stop voice input';
      headerTitle.textContent = 'Listening...';
    } else {
      micButton.classList.remove('listening');
      micButton.title = 'Start voice input';
      headerTitle.textContent = 'Hello';
    }
  }

  // Start recognition
  function startListening() {
    if (!recognition) return;
    try {
      recognition.start();
    } catch (err) {
      // ignore "start called while already started" exceptions
    }
  }

  // Stop recognition
  function stopListening() {
    if (!recognition) return;
    recognition.stop();
  }

  // Mic button action
  micButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (!recognition) return;
    if (!isListening) {
      startListening();
    } else {
      stopListening();
      // After stop, 'end' event sets UI to idle. We also trigger a send if there's text.
      setTimeout(() => {
        const t = msgInput.value.trim();
        if (t) sendMessageInternal(t);
      }, 300);
    }
  });

  // Send via button or Enter
  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text) return;
    sendMessageInternal(text);
  });

  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = msgInput.value.trim();
      if (text) sendMessageInternal(text);
    }
  });

  // Core: send message to backend (or echo fallback)
  async function sendMessageInternal(text) {
    appendMessage(text, 'user');
    msgInput.value = '';
    // show a temporary indicator
    const thinking = document.createElement('div');
    thinking.className = 'message bot';
    thinking.textContent = '...';
    chatBox.appendChild(thinking);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      // POST to your backend route. Replace URL if different.
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
      });

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }

      // if your API returns JSON { reply: '...' } or { choices: [...] } adapt this
      const data = await resp.json();

      // determine reply text (adapt to your output schema)
      let replyText = '';
      if (data.reply) replyText = data.reply;
      else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        replyText = data.choices[0].message.content;
      } else if (typeof data === 'string') {
        replyText = data;
      } else {
        replyText = JSON.stringify(data);
      }

      // remove temp indicator and append actual reply
      thinking.remove();
      appendMessage(replyText, 'bot');

      // speak the reply
      speakText(replyText);

    } catch (err) {
      // on failure, show error
      thinking.remove();
      appendMessage('Sorry, something went wrong. ' + (err.message || ''), 'bot');
      console.error('sendMessageInternal error:', err);
    }
  }

  // Text-to-speech using speechSynthesis
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // stop previous speech
      const utter = new SpeechSynthesisUtterance(text);
      // pick a voice that roughly matches locale (optional)
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        // try to pick a voice with 'en' in lang or default
        const candidate = voices.find(v => v.lang && v.lang.startsWith('en')) || voices[0];
        if (candidate) utter.voice = candidate;
      }
      utter.rate = 1;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS failed:', e);
    }
  }

  // Optional: seed welcome message
  appendMessage('Hi — I can listen or chat. Tap the microphone to speak or type below.', 'bot');

})();
