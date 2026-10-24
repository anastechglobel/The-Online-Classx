        // Daily Quote Logic
        const quotes = [
            { q: "The expert in anything was once a beginner.", a: "Helen Hayes" },
            { q: "It always seems impossible until it is done.", a: "Nelson Mandela" },
            { q: "Success is the sum of small efforts, repeated day in and day out.", a: "Robert Collier" },
            { q: "Don't let what you cannot do interfere with what you can do.", a: "John Wooden" },
            { q: "Education is the most powerful weapon which you can use to change the world.", a: "Nelson Mandela" }
        ];
        
        function openQuoteModal() {
            const today = new Date().getDay();
            const quote = quotes[today % quotes.length];
            document.getElementById('dailyQuoteText').innerText = '"' + quote.q + '"';
            document.getElementById('dailyQuoteAuthor').innerText = "- " + quote.a;
            document.getElementById('quoteModal').classList.remove('hidden');
        }
        
        function closeQuoteModal() {
            document.getElementById('quoteModal').classList.add('hidden');
        }
        
        window.openQuoteModal = openQuoteModal;
        window.closeQuoteModal = closeQuoteModal;
