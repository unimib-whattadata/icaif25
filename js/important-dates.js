(() => {
    const AOE_UTC_OFFSET_HOURS = 12;
    const UPDATE_INTERVAL_MS = 60 * 1000;

    const getEndOfAoE = (isoDate) => {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

        if (!match) {
            return Number.NaN;
        }

        const [, year, month, day] = match.map(Number);

        // 23:59:59 AoE (UTC-12) is 11:59:59 UTC on the following day.
        return Date.UTC(year, month - 1, day, 23 + AOE_UTC_OFFSET_HOURS, 59, 59, 999);
    };

    const updatePastDates = () => {
        const now = Date.now();

        document.querySelectorAll('time[data-auto-strike]').forEach((dateElement) => {
            const endDate = dateElement.dataset.endDate || dateElement.dateTime;
            const isPast = now > getEndOfAoE(endDate);

            dateElement.classList.toggle('past-date', isPast);

            if (isPast) {
                dateElement.setAttribute('aria-label', `${dateElement.textContent.trim()} (past)`);
            } else {
                dateElement.removeAttribute('aria-label');
            }
        });
    };

    updatePastDates();
    window.setInterval(updatePastDates, UPDATE_INTERVAL_MS);
})();
