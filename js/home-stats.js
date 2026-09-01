(() => {
  "use strict";

  const AOE_UTC_OFFSET_HOURS = 12;
  const UPDATE_INTERVAL_MS = 60 * 1000;
  const PAPER_SUBMISSION_DEADLINE = "2026-08-09";
  const CONFERENCE_END_DATE = "2026-11-17";

  const milestones = [
    { date: "2026-07-19", label: "Workshop proposal submission" },
    { date: "2026-08-09", label: "Extended paper submission deadline" },
    { date: "2026-08-22", label: "Tutorial proposal submission" },
    { date: "2026-09-05", label: "Tutorial proposal notification" },
    { date: "2026-09-27", label: "Paper notification" },
    { date: "2026-10-01", label: "Workshop paper submission" },
    { date: "2026-10-15", label: "Workshop paper notification" },
    { date: "2026-10-24", label: "Early Bird registration deadline" },
    { date: "2026-11-14", label: "Tutorials and workshops" },
    { date: "2026-11-16", label: "Main conference" },
    { date: "2026-11-17", label: "Conference concludes" },
  ];

  const parseIsoDate = (isoDate) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!match) return null;

    const [, year, month, day] = match.map(Number);
    return { year, month, day };
  };

  const getEndOfAoE = (isoDate) => {
    const date = parseIsoDate(isoDate);
    if (!date) return Number.NaN;

    return Date.UTC(
      date.year,
      date.month - 1,
      date.day,
      23 + AOE_UTC_OFFSET_HOURS,
      59,
      59,
      999,
    );
  };

  const formatDate = (isoDate, options) => {
    const date = parseIsoDate(isoDate);
    if (!date) return "";

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      ...options,
    }).format(new Date(Date.UTC(date.year, date.month - 1, date.day)));
  };

  const getNextMilestone = (now = Date.now()) =>
    milestones.find((milestone) => now <= getEndOfAoE(milestone.date)) || null;

  const updateHomeMilestone = (now = Date.now()) => {
    const summary = document.querySelector("[data-next-milestone-summary]");
    const stat = document.querySelector("[data-next-milestone-stat]");
    const statTitle = stat?.querySelector(".stat-title");
    const statDate = stat?.querySelector("[data-next-milestone-date]");
    const statLabel = stat?.querySelector("[data-next-milestone-label]");
    const paperStatus = document.querySelector("[data-paper-submission-status]");

    if (paperStatus) {
      paperStatus.textContent =
        now <= getEndOfAoE(PAPER_SUBMISSION_DEADLINE)
          ? "Main paper submissions open"
          : "Main paper submissions closed";
    }

    if (!summary && !stat) return;

    const milestone = getNextMilestone(now);
    if (!milestone) {
      const shortDate = formatDate(CONFERENCE_END_DATE, {
        month: "short",
        day: "numeric",
      });
      const longDate = formatDate(CONFERENCE_END_DATE, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      if (summary) summary.textContent = `Conference concluded · ${longDate}`;
      if (statTitle) statTitle.textContent = "Conference status";
      if (statDate) {
        statDate.textContent = shortDate;
        statDate.dateTime = CONFERENCE_END_DATE;
      }
      if (statLabel) statLabel.textContent = "Conference concluded";
      return;
    }

    const shortDate = formatDate(milestone.date, {
      month: "short",
      day: "numeric",
    });
    const longDate = formatDate(milestone.date, {
      month: "long",
      day: "numeric",
    });

    if (summary) {
      summary.textContent = `Next milestone: ${milestone.label.toLowerCase()} · ${longDate}`;
    }
    if (statTitle) statTitle.textContent = "Next milestone";
    if (statDate) {
      statDate.textContent = shortDate;
      statDate.dateTime = milestone.date;
    }
    if (statLabel) statLabel.textContent = milestone.label;
  };

  window.ICAIFMilestones = Object.freeze({ getNextMilestone });

  updateHomeMilestone();
  window.setInterval(updateHomeMilestone, UPDATE_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateHomeMilestone();
  });
})();
