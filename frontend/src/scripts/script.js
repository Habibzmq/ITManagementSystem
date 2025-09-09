// ==========================================
// IT Management System - Main JavaScript
// ==========================================

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  initializeTheme();
  initializeNavigation();
  initializeDropdowns();
  initializeSearch();
  initializeModals();
  initializeNotifications();
}

// Theme Management
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "default";
  applyTheme(savedTheme);

  // Theme selector modal
  const themeSelector = document.getElementById("themeSelector");
  const themeModal = document.getElementById("themeModal");
  const closeThemeModal = document.getElementById("closeThemeModal");

  if (themeSelector && themeModal) {
    themeSelector.addEventListener("click", (e) => {
      e.preventDefault();
      themeModal.classList.add("show");
    });
  }

  if (closeThemeModal && themeModal) {
    closeThemeModal.addEventListener("click", () => {
      themeModal.classList.remove("show");
    });
  }

  // Theme option selection
  const themeOptions = document.querySelectorAll(".theme-option");
  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const theme = option.dataset.theme;
      applyTheme(theme);
      localStorage.setItem("theme", theme);
      themeModal.classList.remove("show");
      showNotification("Theme changed successfully", "success");
    });
  });

  // Close modal when clicking outside
  if (themeModal) {
    themeModal.addEventListener("click", (e) => {
      if (e.target === themeModal) {
        themeModal.classList.remove("show");
      }
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// Navigation Management
function initializeNavigation() {
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");
  const mobileNavClose = document.getElementById("mobileNavClose");

  if (mobileMenuToggle && mobileNavOverlay) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileNavOverlay.classList.add("show");
    });
  }

  if (mobileNavClose && mobileNavOverlay) {
    mobileNavClose.addEventListener("click", () => {
      mobileNavOverlay.classList.remove("show");
    });
  }

  // Close mobile nav when clicking overlay
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener("click", (e) => {
      if (e.target === mobileNavOverlay) {
        mobileNavOverlay.classList.remove("show");
      }
    });
  }

  // Active navigation state
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

// Dropdown Management
function initializeDropdowns() {
  // Profile dropdown
  const userProfile = document.getElementById("userProfile");
  const profileDropdown = document.getElementById("profileDropdown");

  if (userProfile && profileDropdown) {
    userProfile.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
    });
  }

  // Sign out functionality
  const signOut = document.getElementById("signOut");
  if (signOut) {
    signOut.addEventListener("click", (e) => {
      e.preventDefault();
      handleSignOut();
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (profileDropdown && !userProfile?.contains(e.target)) {
      profileDropdown.classList.remove("show");
    }
  });
}

function handleSignOut() {
  // Clear any stored data
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");

  // Show confirmation
  if (confirm("Are you sure you want to sign out?")) {
    // Redirect to login page
    window.location.href = "login.html";
  }
}

// Search Functionality
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const applicationsGrid = document.getElementById("applicationsGrid");

  if (!searchInput) return;

  // Sample app data for search
  const apps = [
    {
      name: "Reports",
      description: "Generate and view reports",
      selector: '[data-app="reports"]',
    },
    {
      name: "Requests",
      description: "Manage service requests",
      selector: '[data-app="requests"]',
    },
    {
      name: "Assets",
      description: "Asset management",
      selector: '[data-app="assets"]',
    },
    {
      name: "Loans",
      description: "Equipment loans",
      selector: '[data-app="loans"]',
    },
    {
      name: "Purchase",
      description: "Purchase management",
      selector: '[data-app="purchase"]',
    },
    {
      name: "Solutions",
      description: "Solution catalog",
      selector: '[data-app="solutions"]',
    },
    {
      name: "Projects",
      description: "Project management",
      selector: '[data-app="projects"]',
    },
    {
      name: "Problems",
      description: "Problem tracking",
      selector: '[data-app="problems"]',
    },
    {
      name: "Contracts",
      description: "Contract management",
      selector: '[data-app="contracts"]',
    },
    {
      name: "Admin",
      description: "System administration",
      selector: '[data-app="admin"]',
    },
  ];

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length === 0) {
      showAllApps();
      hideSearchSuggestions();
      return;
    }

    if (query.length < 2) {
      hideSearchSuggestions();
      return;
    }

    // Filter applications in real-time
    filterApplications(query);

    const matches = apps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
    );

    showSearchSuggestions(matches, query);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.toLowerCase().trim();
      const match = apps.find((app) => app.name.toLowerCase().includes(query));

      if (match) {
        const appElement = document.querySelector(match.selector);
        if (appElement) {
          appElement.click();
        }
      }
    }
  });

  // Close suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !searchInput.contains(e.target) &&
      !searchSuggestions?.contains(e.target)
    ) {
      hideSearchSuggestions();
    }
  });

  function filterApplications(query) {
    const appItems = document.querySelectorAll(".app-item");
    appItems.forEach((item) => {
      const appName =
        item.querySelector(".app-name")?.textContent.toLowerCase() || "";
      const appDesc =
        item.querySelector(".app-description")?.textContent.toLowerCase() || "";

      if (appName.includes(query) || appDesc.includes(query)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }

  function showAllApps() {
    const appItems = document.querySelectorAll(".app-item");
    appItems.forEach((item) => {
      item.style.display = "flex";
    });
  }

  function showSearchSuggestions(matches, query) {
    if (!searchSuggestions || matches.length === 0) {
      hideSearchSuggestions();
      return;
    }

    const html = matches
      .slice(0, 5)
      .map(
        (app) => `
            <div class="search-suggestion-item" onclick="selectSearchSuggestion('${
              app.selector
            }')">
                <div class="suggestion-name">${highlightMatch(
                  app.name,
                  query
                )}</div>
                <div class="suggestion-description">${highlightMatch(
                  app.description,
                  query
                )}</div>
            </div>
        `
      )
      .join("");

    searchSuggestions.innerHTML = html;
    searchSuggestions.classList.add("show");
  }

  function hideSearchSuggestions() {
    if (searchSuggestions) {
      searchSuggestions.classList.remove("show");
    }
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }
}

function selectSearchSuggestion(selector) {
  const appElement = document.querySelector(selector);
  if (appElement) {
    appElement.click();
  }
  hideSearchSuggestions();
}

function hideSearchSuggestions() {
  const searchSuggestions = document.getElementById("searchSuggestions");
  if (searchSuggestions) {
    searchSuggestions.classList.remove("show");
  }
}

// Modal Management
function initializeModals() {
  // Generic modal close functionality
  const modals = document.querySelectorAll(".modal-overlay");
  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".close-btn, .close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
      });
    }

    // Close when clicking overlay
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  });

  // Escape key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modals.forEach((modal) => {
        modal.classList.remove("show");
      });
    }
  });
}

// Notifications Management
function initializeNotifications() {
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationDropdown = document.getElementById("notificationDropdown");
  const markAllRead = document.getElementById("markAllRead");

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle("show");
    });
  }

  if (markAllRead) {
    markAllRead.addEventListener("click", () => {
      const unreadItems = document.querySelectorAll(
        ".notification-item.unread"
      );
      unreadItems.forEach((item) => {
        item.classList.remove("unread");
      });
      updateNotificationBadge();
      showNotification("All notifications marked as read", "success");
    });
  }

  // Close notifications dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (notificationDropdown && !notificationBtn?.contains(e.target)) {
      notificationDropdown.classList.remove("show");
    }
  });

  // Update notification badge count
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  const unreadCount = document.querySelectorAll(
    ".notification-item.unread"
  ).length;

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = "block";
    } else {
      badge.style.display = "none";
    }
  }
}

// Application Navigation
function initializeApplications() {
  const appItems = document.querySelectorAll(".app-item");

  appItems.forEach((item) => {
    item.addEventListener("click", () => {
      const appType = item.dataset.app;
      const url = item.dataset.url;

      if (url) {
        window.location.href = url;
      } else {
        // Handle different app types
        switch (appType) {
          case "reports":
            window.location.href = "reports.html";
            break;
          case "requests":
            window.location.href = "requests.html";
            break;
          case "assets":
            window.location.href = "assets.html";
            break;
          case "loans":
            window.location.href = "loans.html";
            break;
          case "purchase":
            window.location.href = "purchase.html";
            break;
          case "solutions":
            window.location.href = "solutions.html";
            break;
          case "projects":
            window.location.href = "projects.html";
            break;
          case "problems":
            window.location.href = "problems.html";
            break;
          case "contracts":
            window.location.href = "contracts.html";
            break;
          case "admin":
            window.location.href = "admin.html";
            break;
          case "servicedesk":
            window.open("https://servicedesk.company.com", "_blank");
            break;
          case "desktopcentral":
            window.open("https://desktopcentral.company.com", "_blank");
            break;
          case "unifi":
            window.open("https://unifi.company.com", "_blank");
            break;
          case "eset":
            window.open("https://eset.company.com", "_blank");
            break;
          case "synology":
            window.open("https://synology.company.com", "_blank");
            break;
          default:
            showNotification("Application not yet implemented", "info");
        }
      }
    });

    // Add hover effects
    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateY(-4px)";
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateY(0)";
    });
  });
}

// Utility Functions
function showNotification(message, type = "info", duration = 5000) {
  // Create notification container if it doesn't exist
  let container = document.querySelector(".notifications-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "notifications-container";
    container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-left: 4px solid var(--${
          type === "success"
            ? "success"
            : type === "error"
            ? "error"
            : type === "warning"
            ? "warning"
            : "info"
        }-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        animation: slideInRight 0.3s ease-out;
    `;

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
            <i class="fas fa-${getNotificationIcon(
              type
            )}" style="color: var(--${
    type === "success"
      ? "success"
      : type === "error"
      ? "error"
      : type === "warning"
      ? "warning"
      : "info"
  }-color);"></i>
            <span style="color: var(--text-primary);">${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
            <i class="fas fa-times"></i>
        </button>
    `;

  container.appendChild(notification);

  // Auto-remove after duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOutRight 0.3s ease-in";
      setTimeout(() => notification.remove(), 300);
    }
  }, duration);
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-triangle",
    warning: "exclamation-circle",
    info: "info-circle",
  };
  return icons[type] || "info-circle";
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .search-suggestion-item {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }
    
    .search-suggestion-item:hover {
        background-color: var(--bg-tertiary);
    }
    
    .search-suggestion-item:last-child {
        border-bottom: none;
    }
    
    .suggestion-name {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 2px;
    }
    
    .suggestion-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);

// Initialize applications when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeApplications();
});
