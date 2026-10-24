        // Focus Timer (Pomodoro) Logic
        let focusTimerInterval;
        let focusTimeRemaining = 25 * 60; // default 25 mins
        let isTimerRunning = false;
        let currentTimerDuration = 25 * 60;

        function openFocusTimer() {
            document.getElementById('focusTimerModal').classList.remove('hidden');
            updateTimerDisplay();
        }

        function closeFocusTimer() {
            document.getElementById('focusTimerModal').classList.add('hidden');
        }

        function setTimerDuration(mins) {
            pauseFocusTimer();
            currentTimerDuration = mins * 60;
            focusTimeRemaining = currentTimerDuration;
            updateTimerDisplay();
        }

        function startFocusTimer() {
            if (isTimerRunning) return;
            isTimerRunning = true;
            document.getElementById('btnStartTimer').classList.add('hidden');
            document.getElementById('btnPauseTimer').classList.remove('hidden');
            
            focusTimerInterval = setInterval(() => {
                if (focusTimeRemaining > 0) {
                    focusTimeRemaining--;
                    updateTimerDisplay();
                } else {
                    pauseFocusTimer();
                    alert('Time is up! Great focus session.');
                    focusTimeRemaining = currentTimerDuration;
                    updateTimerDisplay();
                }
            }, 1000);
        }

        function pauseFocusTimer() {
            isTimerRunning = false;
            clearInterval(focusTimerInterval);
            document.getElementById('btnStartTimer').classList.remove('hidden');
            document.getElementById('btnPauseTimer').classList.add('hidden');
        }

        function resetFocusTimer() {
            pauseFocusTimer();
            focusTimeRemaining = currentTimerDuration;
            updateTimerDisplay();
        }

        function updateTimerDisplay() {
            const mins = Math.floor(focusTimeRemaining / 60);
            const secs = focusTimeRemaining % 60;
            const display = document.getElementById('timerDisplay');
            if(display) {
                display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }
        
        window.openFocusTimer = openFocusTimer;
        window.closeFocusTimer = closeFocusTimer;
        window.setTimerDuration = setTimerDuration;
        window.startFocusTimer = startFocusTimer;
        window.pauseFocusTimer = pauseFocusTimer;
        window.resetFocusTimer = resetFocusTimer;
