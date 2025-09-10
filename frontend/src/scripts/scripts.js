/**
 * IT Management System - Complete JavaScript Application
 * Handles all functionality for the IT Management System
 */

// Global Application Object
const ITManagementSystem = {
  apiBase: "/api",
  currentUser: null,
  authToken: null,
  currentTheme: "default",

  // Initialize the application
  async init() {
    this.authToken = localStorage.getItem("authToken");
    this.currentTheme = localStorage.getItem("userTheme") || "default";

    // Apply theme immediately
    this.applyTheme();

    // Determine current page and initialize accordingly
    const currentPage = this.getCurrentPage();

    try {
      switch (currentPage) {
        case "login":
          this.Auth.init();
          break;
        case "dashboard":
          await this.Dashboard.init();
          break;
        case "index":
        case "":
          // Index page initialization
          this.setupIndexPage();
          break;
        case "site_selection":
          await this.SiteSelection.init();
          break;
        case "counter_selection":
          await this.CounterSelection.init();
          break;
        case "counter_verification":
          await this.CounterVerification.init();
          break;
        case "counter_report":
          await this.CounterReport.init();
          break;
        case "tasks":
          await this.TaskManager.init();
          break;
        case "profile":
          await this.Profile.init();
          break;
        case "admin":
          await this.Admin.init();
          break;
        default:
          // Check authentication for protected pages
          if (this.authToken) {
            await this.loadCurrentUser();
          }
          this.setupGlobalEvents();
      }
    } catch (error) {
      console.error("Initialization error:", error);
      this.showGlobalError(
        "Application failed to initialize. Please refresh the page."
      );
    }
  },

  // Setup index page functionality
  setupIndexPage() {
    this.setupGlobalEvents();
    this.setupApplicationSearch();
    this.setupApplicationClicks();
  },

  // Setup search functionality for applications
  setupApplicationSearch() {
    const searchInput = document.getElementById("searchInput");
    const applicationsGrid = document.getElementById("applicationsGrid");

    if (!searchInput || !applicationsGrid) return;

    // Get all application items
    const appItems = applicationsGrid.querySelectorAll(".app-item");

    // Add search functionality
    searchInput.addEventListener("input", (e) => {
      const searchQuery = e.target.value.toLowerCase().trim();

      appItems.forEach((appItem) => {
        const appName =
          appItem.querySelector(".app-name")?.textContent.toLowerCase() || "";
        const appDescription =
          appItem
            .querySelector(".app-description")
            ?.textContent.toLowerCase() || "";

        // Check if search query matches app name or description
        const matches =
          appName.includes(searchQuery) || appDescription.includes(searchQuery);

        if (matches || searchQuery === "") {
          appItem.style.display = "flex";
          appItem.style.opacity = "1";
        } else {
          appItem.style.display = "none";
          appItem.style.opacity = "0";
        }
      });

      // Show "no results" message if no apps are visible
      this.updateSearchResults(appItems, searchQuery);
    });
  },

  // Update search results and show no results message if needed
  updateSearchResults(appItems, searchQuery) {
    const applicationsGrid = document.getElementById("applicationsGrid");
    if (!applicationsGrid) return;

    const visibleItems = Array.from(appItems).filter(
      (item) => item.style.display !== "none"
    );

    // Remove existing no results message
    const existingNoResults =
      applicationsGrid.querySelector(".no-search-results");
    if (existingNoResults) {
      existingNoResults.remove();
    }

    // Show no results message if search query exists but no items are visible
    if (searchQuery && visibleItems.length === 0) {
      const noResultsDiv = document.createElement("div");
      noResultsDiv.className = "no-search-results";
      noResultsDiv.innerHTML = `
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>No applications found</h3>
          <p>No applications match "${searchQuery}". Try a different search term.</p>
        </div>
      `;
      applicationsGrid.appendChild(noResultsDiv);
    }
  },

  // Setup click handlers for application items
  setupApplicationClicks() {
    const appItems = document.querySelectorAll(".app-item");

    appItems.forEach((appItem) => {
      appItem.addEventListener("click", () => {
        const appName =
          appItem.dataset.app ||
          appItem.querySelector(".app-name")?.textContent;
        const appUrl = appItem.dataset.url;

        if (appUrl) {
          // If it has a URL, navigate to it
          if (appUrl.startsWith("http")) {
            window.open(appUrl, "_blank");
          } else {
            window.location.href = appUrl;
          }
        } else if (appName) {
          // Default behavior - redirect to app page
          const appPage = `${appName.toLowerCase()}.html`;
          window.location.href = appPage;
        }
      });
    });
  },

  // Get current page from URL
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop().replace(".html", "") || "index";
    return page;
  },

  // Load current user profile
  async loadCurrentUser() {
    try {
      const response = await fetch(`${this.apiBase}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load user profile");
      }

      this.currentUser = await response.json();
      return this.currentUser;
    } catch (error) {
      console.error("Error loading user profile:", error);
      this.Auth.logout();
      throw error;
    }
  },

  // Apply theme
  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
  },

  // Setup global event listeners
  setupGlobalEvents() {
    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.Auth.logout());
    }

    // Theme selector
    const themeSelector = document.getElementById("themeSelector");
    if (themeSelector) {
      themeSelector.addEventListener("change", (e) => {
        this.changeTheme(e.target.value);
      });
    }

    // Global search
    const globalSearch = document.getElementById("globalSearch");
    if (globalSearch) {
      globalSearch.addEventListener("input", (e) => {
        this.handleGlobalSearch(e.target.value);
      });
    }

    // Navigation menu
    this.setupNavigation();
  },

  // Setup navigation
  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const href = item.getAttribute("href");
        if (href) {
          window.location.href = href;
        }
      });
    });
  },

  // Change theme
  changeTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem("userTheme", theme);
    this.applyTheme();
  },

  // Global search handler
  handleGlobalSearch(query) {
    // Implement global search functionality
    console.log("Global search:", query);
  },

  // Show global error
  showGlobalError(message) {
    this.Utils.showNotification(message, "error");
  },

  // Show global success
  showGlobalSuccess(message) {
    this.Utils.showNotification(message, "success");
  },
};

// Authentication Module
ITManagementSystem.Auth = {
  async init() {
    this.setupLoginForm();
    this.checkRedirectFromProtectedPage();
  },

  setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    const rememberCheckbox = document.getElementById("rememberMe");
    if (rememberCheckbox) {
      rememberCheckbox.checked = localStorage.getItem("rememberMe") === "true";
    }
  },

  checkRedirectFromProtectedPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");
    if (redirect) {
      localStorage.setItem("loginRedirect", redirect);
    }
  },

  async handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
      rememberMe: formData.get("rememberMe") === "on",
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Signing In...';

      const response = await fetch(`${ITManagementSystem.apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Store authentication data
      localStorage.setItem("authToken", result.data.token);
      localStorage.setItem("rememberMe", credentials.rememberMe);
      ITManagementSystem.authToken = result.data.token;

      // Redirect to intended page or dashboard
      const redirectUrl =
        localStorage.getItem("loginRedirect") || "/dashboard.html";
      localStorage.removeItem("loginRedirect");
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Login error:", error);
      ITManagementSystem.Utils.showNotification(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  logout() {
    // Clear stored data
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    ITManagementSystem.authToken = null;
    ITManagementSystem.currentUser = null;

    // Redirect to login
    window.location.href = "/login.html";
  },

  checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token && ITManagementSystem.getCurrentPage() !== "login") {
      const currentUrl = window.location.pathname + window.location.search;
      window.location.href = `/login.html?redirect=${encodeURIComponent(
        currentUrl
      )}`;
      return false;
    }
    return true;
  },
};

// Dashboard Module
ITManagementSystem.Dashboard = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    await ITManagementSystem.loadCurrentUser();
    await this.loadDashboardData();
    this.setupDashboardEvents();
    this.renderApplications();
    this.renderTasks();
    this.renderNotes();
  },

  async loadDashboardData() {
    try {
      const [applicationsRes, tasksRes, notesRes] = await Promise.all([
        fetch(`${ITManagementSystem.apiBase}/applications`, {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }),
        fetch(`${ITManagementSystem.apiBase}/tasks/assigned`, {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }),
        fetch(`${ITManagementSystem.apiBase}/notes`, {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }),
      ]);

      this.applications = (await applicationsRes.json()).data || [];
      this.tasks = (await tasksRes.json()).data || [];
      this.notes = (await notesRes.json()).data || [];
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      ITManagementSystem.showGlobalError("Failed to load dashboard data.");
    }
  },

  setupDashboardEvents() {
    // Add new note button
    const addNoteBtn = document.getElementById("addNoteBtn");
    if (addNoteBtn) {
      addNoteBtn.addEventListener("click", () => this.showAddNoteModal());
    }

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.filterApplications(e.target.value)
      );
    }
  },

  renderApplications() {
    const container = document.querySelector(".applications-grid");
    if (!container) return;

    container.innerHTML = "";

    this.applications.forEach((app) => {
      const appElement = document.createElement("div");
      appElement.className = "application-card";
      appElement.innerHTML = `
                <div class="app-icon">
                    ${
                      app.IconType === "CSS"
                        ? `<i class="${app.CSSClass}"></i>`
                        : app.IconType === "Image"
                        ? `<img src="${app.IconData}" alt="${app.ApplicationName}">`
                        : '<i class="fas fa-cube"></i>'
                    }
                </div>
                <div class="app-name">${app.ApplicationName}</div>
                <div class="app-description">${app.Description || ""}</div>
            `;

      appElement.addEventListener("click", () => {
        if (app.URL) {
          if (app.URL.startsWith("http")) {
            window.open(app.URL, "_blank");
          } else {
            window.location.href = app.URL;
          }
        }
      });

      container.appendChild(appElement);
    });
  },

  renderTasks() {
    const container = document.querySelector(".tasks-list");
    if (!container) return;

    container.innerHTML = "";

    const recentTasks = this.tasks.slice(0, 5);
    recentTasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = `task-item priority-${task.Priority.toLowerCase()}`;
      taskElement.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${task.Title}</div>
                    <div class="task-meta">
                        <span class="task-priority">${task.Priority}</span>
                        <span class="task-due">${ITManagementSystem.Utils.formatDate(
                          task.DueDate
                        )}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-small" onclick="ITManagementSystem.Dashboard.completeTask(${
                      task.TaskID
                    })">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;
      container.appendChild(taskElement);
    });

    if (recentTasks.length === 0) {
      container.innerHTML = '<div class="no-data">No pending tasks</div>';
    }
  },

  renderNotes() {
    const container = document.querySelector(".notes-list");
    if (!container) return;

    container.innerHTML = "";

    this.notes.forEach((note) => {
      const noteElement = document.createElement("div");
      noteElement.className = "note-item";
      noteElement.style.backgroundColor = note.Color;
      noteElement.innerHTML = `
                <div class="note-content">
                    <div class="note-title">${note.Title || "Untitled"}</div>
                    <div class="note-text">${note.Content || ""}</div>
                </div>
                <div class="note-actions">
                    <button onclick="ITManagementSystem.Dashboard.editNote(${
                      note.NoteID
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="ITManagementSystem.Dashboard.deleteNote(${
                      note.NoteID
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
      container.appendChild(noteElement);
    });
  },

  filterApplications(query) {
    const filteredApps = this.applications.filter(
      (app) =>
        app.ApplicationName.toLowerCase().includes(query.toLowerCase()) ||
        (app.Description &&
          app.Description.toLowerCase().includes(query.toLowerCase()))
    );

    // Re-render with filtered applications
    const container = document.querySelector(".applications-grid");
    if (container) {
      container.innerHTML = "";
      filteredApps.forEach((app) => {
        // Same rendering logic as renderApplications
      });
    }
  },

  async completeTask(taskId) {
    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Status: "Completed",
            CompletedDate: new Date(),
          }),
        }
      );

      if (response.ok) {
        ITManagementSystem.showGlobalSuccess("Task completed successfully");
        await this.loadDashboardData();
        this.renderTasks();
      }
    } catch (error) {
      console.error("Error completing task:", error);
      ITManagementSystem.showGlobalError("Failed to complete task");
    }
  },

  showAddNoteModal() {
    ITManagementSystem.Utils.showModal(
      "Add Note",
      `
            <form id="addNoteForm">
                <div class="form-group">
                    <label for="noteTitle">Title</label>
                    <input type="text" id="noteTitle" name="title" class="form-control">
                </div>
                <div class="form-group">
                    <label for="noteContent">Content</label>
                    <textarea id="noteContent" name="content" class="form-control" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="noteColor">Color</label>
                    <select id="noteColor" name="color" class="form-control">
                        <option value="#FFFF99">Yellow</option>
                        <option value="#FFB6C1">Pink</option>
                        <option value="#98FB98">Green</option>
                        <option value="#87CEEB">Blue</option>
                        <option value="#DDA0DD">Purple</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="ITManagementSystem.Utils.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Note</button>
                </div>
            </form>
        `
    );

    document
      .getElementById("addNoteForm")
      .addEventListener("submit", (e) => this.handleAddNote(e));
  },

  async handleAddNote(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(`${ITManagementSystem.apiBase}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ITManagementSystem.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Title: formData.get("title"),
          Content: formData.get("content"),
          Color: formData.get("color"),
        }),
      });

      if (response.ok) {
        ITManagementSystem.Utils.closeModal();
        ITManagementSystem.showGlobalSuccess("Note added successfully");
        await this.loadDashboardData();
        this.renderNotes();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      ITManagementSystem.showGlobalError("Failed to add note");
    }
  },
};

// Site Selection Module
ITManagementSystem.SiteSelection = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    await ITManagementSystem.loadCurrentUser();
    await this.loadUserSites();
    this.setupEvents();
  },

  async loadUserSites() {
    try {
      const response = await fetch(`${ITManagementSystem.apiBase}/sites`, {
        headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
      });

      if (!response.ok) throw new Error("Failed to load sites");

      const result = await response.json();
      this.populateSiteDropdown(result.data);
    } catch (error) {
      console.error("Error loading sites:", error);
      ITManagementSystem.showGlobalError("Failed to load available sites.");
    }
  },

  populateSiteDropdown(sites) {
    const siteSelect = document.getElementById("siteSelect");
    const loadingIndicator = document.querySelector(".loading-indicator");

    siteSelect.innerHTML = '<option value="">Select a site...</option>';

    if (!sites || sites.length === 0) {
      siteSelect.innerHTML = '<option value="">No sites available</option>';
      siteSelect.disabled = true;
      if (loadingIndicator) loadingIndicator.style.display = "none";
      return;
    }

    sites.forEach((site) => {
      const option = document.createElement("option");
      option.value = site.SiteID;
      option.textContent = `${site.SiteCode} - ${site.SiteName}`;
      option.dataset.siteCode = site.SiteCode;
      option.dataset.siteName = site.SiteName;
      option.dataset.companyName = site.CompanyName;
      siteSelect.appendChild(option);
    });

    siteSelect.disabled = false;
    if (loadingIndicator) loadingIndicator.style.display = "none";

    if (sites.length === 1) {
      siteSelect.value = sites[0].SiteID;
      this.onSiteChange();
    }
  },

  setupEvents() {
    const siteSelect = document.getElementById("siteSelect");
    const continueBtn = document.getElementById("continueBtn");
    const backBtn = document.getElementById("backBtn");

    if (siteSelect)
      siteSelect.addEventListener("change", () => this.onSiteChange());
    if (continueBtn)
      continueBtn.addEventListener("click", () => this.onContinue());
    if (backBtn) backBtn.addEventListener("click", () => this.onBack());
  },

  onSiteChange() {
    const siteSelect = document.getElementById("siteSelect");
    const continueBtn = document.getElementById("continueBtn");
    const siteInfo = document.querySelector(".site-info");

    if (siteSelect.value) {
      const selectedOption = siteSelect.options[siteSelect.selectedIndex];
      this.selectedSite = {
        siteId: siteSelect.value,
        siteCode: selectedOption.dataset.siteCode,
        siteName: selectedOption.dataset.siteName,
        companyName: selectedOption.dataset.companyName,
      };

      this.displaySiteInfo(this.selectedSite);
      if (continueBtn) continueBtn.disabled = false;
      if (siteInfo) siteInfo.style.display = "block";
    } else {
      this.selectedSite = null;
      if (continueBtn) continueBtn.disabled = true;
      if (siteInfo) siteInfo.style.display = "none";
    }
  },

  displaySiteInfo(site) {
    const siteInfo = document.querySelector(".site-info");
    if (siteInfo) {
      siteInfo.innerHTML = `
                <div class="info-card">
                    <h3><i class="fas fa-building"></i> Site Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Site Code:</label>
                            <span>${site.siteCode}</span>
                        </div>
                        <div class="info-item">
                            <label>Site Name:</label>
                            <span>${site.siteName}</span>
                        </div>
                        <div class="info-item">
                            <label>Company:</label>
                            <span>${site.companyName}</span>
                        </div>
                    </div>
                </div>
            `;
    }
  },

  async onContinue() {
    if (!this.selectedSite) {
      ITManagementSystem.showGlobalError(
        "Please select a site before continuing."
      );
      return;
    }

    sessionStorage.setItem("selectedSite", JSON.stringify(this.selectedSite));

    const continueBtn = document.getElementById("continueBtn");
    const originalText = continueBtn.textContent;

    try {
      continueBtn.disabled = true;
      continueBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Loading...';

      const response = await fetch(
        `${ITManagementSystem.apiBase}/sites/${this.selectedSite.siteId}/counters`,
        {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }
      );

      if (!response.ok)
        throw new Error("Failed to load counters for selected site");

      const counters = await response.json();

      if (!counters.data || counters.data.length === 0) {
        ITManagementSystem.showGlobalError(
          "No counters found at the selected site. Please contact your administrator."
        );
        return;
      }

      window.location.href = "/counter_selection.html";
    } catch (error) {
      console.error("Error validating site:", error);
      ITManagementSystem.showGlobalError(
        "Failed to validate site. Please try again."
      );
    } finally {
      continueBtn.disabled = false;
      continueBtn.textContent = originalText;
    }
  },

  onBack() {
    window.location.href = "/dashboard.html";
  },
};

// Counter Selection Module
ITManagementSystem.CounterSelection = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    this.selectedSite = JSON.parse(sessionStorage.getItem("selectedSite"));
    if (!this.selectedSite) {
      window.location.href = "/site_selection.html";
      return;
    }

    await this.loadCounters();
    this.setupEvents();
    this.displaySiteInfo();
  },

  async loadCounters() {
    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/sites/${this.selectedSite.siteId}/counters`,
        {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load counters");

      const result = await response.json();
      this.populateCounterDropdown(result.data);
    } catch (error) {
      console.error("Error loading counters:", error);
      ITManagementSystem.showGlobalError("Failed to load counters.");
    }
  },

  populateCounterDropdown(counters) {
    const counterSelect = document.getElementById("counterSelect");
    const loadingIndicator = document.querySelector(".loading-indicator");

    counterSelect.innerHTML = '<option value="">Select a counter...</option>';

    if (!counters || counters.length === 0) {
      counterSelect.innerHTML =
        '<option value="">No counters available</option>';
      counterSelect.disabled = true;
      if (loadingIndicator) loadingIndicator.style.display = "none";
      return;
    }

    counters.forEach((counter) => {
      const option = document.createElement("option");
      option.value = counter.CounterID;
      option.textContent = `${counter.CounterNumber} - ${counter.CounterName}`;
      option.dataset.counterNumber = counter.CounterNumber;
      option.dataset.counterName = counter.CounterName;
      option.dataset.locationDetails = counter.LocationDetails || "";
      counterSelect.appendChild(option);
    });

    counterSelect.disabled = false;
    if (loadingIndicator) loadingIndicator.style.display = "none";
  },

  setupEvents() {
    const counterSelect = document.getElementById("counterSelect");
    const continueBtn = document.getElementById("continueBtn");
    const backBtn = document.getElementById("backBtn");

    if (counterSelect)
      counterSelect.addEventListener("change", () => this.onCounterChange());
    if (continueBtn)
      continueBtn.addEventListener("click", () => this.onContinue());
    if (backBtn) backBtn.addEventListener("click", () => this.onBack());
  },

  displaySiteInfo() {
    const siteInfo = document.querySelector(".site-info");
    if (siteInfo && this.selectedSite) {
      siteInfo.innerHTML = `
                <div class="info-item">
                    <label>Selected Site:</label>
                    <span>${this.selectedSite.siteCode} - ${this.selectedSite.siteName}</span>
                </div>
            `;
    }
  },

  onCounterChange() {
    const counterSelect = document.getElementById("counterSelect");
    const continueBtn = document.getElementById("continueBtn");
    const counterInfo = document.querySelector(".counter-info");

    if (counterSelect.value) {
      const selectedOption = counterSelect.options[counterSelect.selectedIndex];
      this.selectedCounter = {
        counterId: counterSelect.value,
        counterNumber: selectedOption.dataset.counterNumber,
        counterName: selectedOption.dataset.counterName,
        locationDetails: selectedOption.dataset.locationDetails,
      };

      this.displayCounterInfo(this.selectedCounter);
      if (continueBtn) continueBtn.disabled = false;
      if (counterInfo) counterInfo.style.display = "block";
    } else {
      this.selectedCounter = null;
      if (continueBtn) continueBtn.disabled = true;
      if (counterInfo) counterInfo.style.display = "none";
    }
  },

  displayCounterInfo(counter) {
    const counterInfo = document.querySelector(".counter-info");
    if (counterInfo) {
      counterInfo.innerHTML = `
                <div class="info-card">
                    <h3><i class="fas fa-cash-register"></i> Counter Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Counter Number:</label>
                            <span>${counter.counterNumber}</span>
                        </div>
                        <div class="info-item">
                            <label>Counter Name:</label>
                            <span>${counter.counterName}</span>
                        </div>
                        ${
                          counter.locationDetails
                            ? `
                        <div class="info-item">
                            <label>Location:</label>
                            <span>${counter.locationDetails}</span>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;
    }
  },

  onContinue() {
    if (!this.selectedCounter) {
      ITManagementSystem.showGlobalError(
        "Please select a counter before continuing."
      );
      return;
    }

    sessionStorage.setItem(
      "selectedCounter",
      JSON.stringify(this.selectedCounter)
    );
    window.location.href = "/counter_verification.html";
  },

  onBack() {
    window.location.href = "/site_selection.html";
  },
};

// Counter Verification Module
ITManagementSystem.CounterVerification = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    this.selectedSite = JSON.parse(sessionStorage.getItem("selectedSite"));
    this.selectedCounter = JSON.parse(
      sessionStorage.getItem("selectedCounter")
    );

    if (!this.selectedSite || !this.selectedCounter) {
      window.location.href = "/site_selection.html";
      return;
    }

    await this.loadCounterDetails();
    this.setupEvents();
    this.displayCounterInfo();
  },

  async loadCounterDetails() {
    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/counters/${this.selectedCounter.counterId}/info`,
        {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load counter details");

      this.counterDetails = await response.json();
      this.displayConnectedDevices();
    } catch (error) {
      console.error("Error loading counter details:", error);
      ITManagementSystem.showGlobalError("Failed to load counter details.");
    }
  },

  setupEvents() {
    const verifyBtn = document.getElementById("verifyCorrectBtn");
    const requestChangesBtn = document.getElementById("requestChangesBtn");
    const continueBtn = document.getElementById("continueToChecksBtn");
    const backBtn = document.getElementById("backBtn");

    if (verifyBtn)
      verifyBtn.addEventListener("click", () => this.onVerifyCorrect());
    if (requestChangesBtn)
      requestChangesBtn.addEventListener("click", () =>
        this.onRequestChanges()
      );
    if (continueBtn)
      continueBtn.addEventListener("click", () => this.onContinueToChecks());
    if (backBtn) backBtn.addEventListener("click", () => this.onBack());
  },

  displayCounterInfo() {
    const counterInfo = document.querySelector(".counter-header");
    if (counterInfo) {
      counterInfo.innerHTML = `
                <h2>Counter Information Verification</h2>
                <p>Counter: ${this.selectedCounter.counterNumber}, Site: ${this.selectedSite.siteCode}</p>
            `;
    }
  },

  displayConnectedDevices() {
    const devicesContainer = document.querySelector(".connected-devices");
    if (!devicesContainer || !this.counterDetails.devices) return;

    devicesContainer.innerHTML = `
            <h3>Connected Devices:</h3>
            <div class="devices-list">
                ${this.counterDetails.devices
                  .map(
                    (device) => `
                    <div class="device-item">
                        <i class="fas fa-check-circle"></i>
                        <span class="device-info">
                            ${device.DeviceType}: ${device.DeviceName} 
                            ${
                              device.SerialNumber
                                ? `(Serial: ${device.SerialNumber})`
                                : ""
                            }
                        </span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  },

  onVerifyCorrect() {
    const continueBtn = document.getElementById("continueToChecksBtn");
    if (continueBtn) {
      continueBtn.style.display = "inline-block";
      continueBtn.disabled = false;
    }
    ITManagementSystem.showGlobalSuccess(
      "Counter information verified as correct."
    );
  },

  onRequestChanges() {
    ITManagementSystem.Utils.showModal(
      "Request Changes",
      `
            <form id="requestChangesForm">
                <div class="form-group">
                    <label for="changeDescription">Describe the required changes:</label>
                    <textarea id="changeDescription" name="description" class="form-control" rows="4" required></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="ITManagementSystem.Utils.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Request</button>
                </div>
            </form>
        `
    );

    document
      .getElementById("requestChangesForm")
      .addEventListener("submit", (e) => this.handleRequestChanges(e));
  },

  async handleRequestChanges(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/admin/counter-changes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CounterId: this.selectedCounter.counterId,
            ChangeDescription: formData.get("description"),
            RequestedBy: ITManagementSystem.currentUser.UserID,
          }),
        }
      );

      if (response.ok) {
        ITManagementSystem.Utils.closeModal();
        ITManagementSystem.showGlobalSuccess(
          "Change request submitted successfully. You can continue with the report while the changes are being processed."
        );

        const continueBtn = document.getElementById("continueToChecksBtn");
        if (continueBtn) {
          continueBtn.style.display = "inline-block";
          continueBtn.disabled = false;
        }
      }
    } catch (error) {
      console.error("Error submitting change request:", error);
      ITManagementSystem.showGlobalError("Failed to submit change request");
    }
  },

  onContinueToChecks() {
    window.location.href = "/counter_report.html";
  },

  onBack() {
    window.location.href = "/counter_selection.html";
  },
};

// Counter Report Module
ITManagementSystem.CounterReport = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    this.selectedSite = JSON.parse(sessionStorage.getItem("selectedSite"));
    this.selectedCounter = JSON.parse(
      sessionStorage.getItem("selectedCounter")
    );

    if (!this.selectedSite || !this.selectedCounter) {
      window.location.href = "/site_selection.html";
      return;
    }

    this.reportData = {};
    this.mediaFiles = {};
    this.autoSaveInterval = null;

    await this.startReport();
    await this.loadExistingDraft();
    this.setupEvents();
    this.setupAutoSave();
    this.displayReportHeader();
  },

  async startReport() {
    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/reports/counter`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            SiteID: this.selectedSite.siteId,
            CounterID: this.selectedCounter.counterId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to start report");

      const result = await response.json();
      this.reportId = result.data.ReportID;
      this.existingDraftId = result.data.ExistingDraftID;
    } catch (error) {
      console.error("Error starting report:", error);
      ITManagementSystem.showGlobalError("Failed to start report.");
    }
  },

  async loadExistingDraft() {
    if (!this.existingDraftId) return;

    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/reports/counter/draft/${this.existingDraftId}`,
        {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }
      );

      if (response.ok) {
        const draft = await response.json();
        this.populateFormFromDraft(draft.data);
        ITManagementSystem.showGlobalSuccess(
          "Previous draft loaded successfully."
        );
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  },

  setupEvents() {
    // Form change listeners for auto-save
    const form = document.getElementById("counterReportForm");
    if (form) {
      form.addEventListener("change", () => this.onFormChange());
      form.addEventListener("input", () => this.onFormChange());
    }

    // Media upload handlers
    document.querySelectorAll(".media-upload").forEach((upload) => {
      upload.addEventListener("change", (e) => this.handleMediaUpload(e));
    });

    // Form submission
    const submitBtn = document.getElementById("submitReportBtn");
    const saveDraftBtn = document.getElementById("saveDraftBtn");

    if (submitBtn)
      submitBtn.addEventListener("click", () => this.onSubmitReport());
    if (saveDraftBtn)
      saveDraftBtn.addEventListener("click", () => this.onSaveDraft());

    // Dynamic field requirements
    this.setupDynamicValidation();
  },

  setupDynamicValidation() {
    const isOnField = document.getElementById("isOn");
    if (isOnField) {
      isOnField.addEventListener("change", () =>
        this.updateFieldRequirements()
      );
    }

    // Setup note requirements for failed checks
    document
      .querySelectorAll('input[type="radio"][value="false"]')
      .forEach((radio) => {
        radio.addEventListener("change", (e) => {
          const checkName = e.target.name;
          const noteField = document.getElementById(`${checkName}Note`);
          if (noteField) {
            noteField.required = true;
            noteField.parentElement.classList.add("required");
          }
        });
      });

    document
      .querySelectorAll('input[type="radio"][value="true"]')
      .forEach((radio) => {
        radio.addEventListener("change", (e) => {
          const checkName = e.target.name;
          const noteField = document.getElementById(`${checkName}Note`);
          if (noteField) {
            noteField.required = false;
            noteField.parentElement.classList.remove("required");
          }
        });
      });
  },

  updateFieldRequirements() {
    const isOn =
      document.querySelector('input[name="isOn"]:checked')?.value === "true";
    const formSections = document.querySelectorAll(
      ".form-section:not(.general-status)"
    );

    formSections.forEach((section) => {
      if (isOn) {
        section.style.opacity = "1";
        section.querySelectorAll("input, select").forEach((field) => {
          field.disabled = false;
        });
      } else {
        section.style.opacity = "0.5";
        section.querySelectorAll("input, select").forEach((field) => {
          field.disabled = true;
        });
      }
    });
  },

  setupAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.autoSaveDraft();
    }, 30000); // Auto-save every 30 seconds
  },

  displayReportHeader() {
    const header = document.querySelector(".report-header");
    if (header) {
      header.innerHTML = `
                <h2>Counter Report Checklist</h2>
                <p>Counter: ${this.selectedCounter.counterNumber}, Site: ${this.selectedSite.siteCode}</p>
                <div class="progress-indicator">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
            `;
    }
  },

  onFormChange() {
    this.updateProgress();
    this.updateSubmitButtonState();
  },

  updateProgress() {
    const form = document.getElementById("counterReportForm");
    if (!form) return;

    const requiredFields = form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    const completedFields = Array.from(requiredFields).filter((field) => {
      if (field.type === "radio") {
        return form.querySelector(`input[name="${field.name}"]:checked`);
      }
      return field.value.trim() !== "";
    });

    const progress =
      requiredFields.length > 0
        ? (completedFields.length / requiredFields.length) * 100
        : 0;
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  },

  updateSubmitButtonState() {
    const submitBtn = document.getElementById("submitReportBtn");
    if (!submitBtn) return;

    const form = document.getElementById("counterReportForm");
    const isValid = form.checkValidity();

    submitBtn.disabled = !isValid;
    submitBtn.textContent = isValid
      ? "Submit Report"
      : "Complete Required Fields";
  },

  async handleMediaUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const checkType = e.target.dataset.checkType;
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      ITManagementSystem.showGlobalError("File size must be less than 50MB");
      e.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      ITManagementSystem.showGlobalError(
        "Only JPEG, PNG images and MP4, WebM videos are allowed"
      );
      e.target.value = "";
      return;
    }

    try {
      await this.uploadMedia(file, checkType);
      ITManagementSystem.showGlobalSuccess(
        `${
          file.type.startsWith("image") ? "Image" : "Video"
        } uploaded successfully`
      );
    } catch (error) {
      console.error("Error uploading media:", error);
      ITManagementSystem.showGlobalError("Failed to upload media file");
    }
  },

  async uploadMedia(file, checkType) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("reportId", this.reportId);
    formData.append("counterId", this.selectedCounter.counterId);
    formData.append("checkType", checkType);

    const response = await fetch(
      `${ITManagementSystem.apiBase}/reports/counter/${this.reportId}/media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ITManagementSystem.authToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Upload failed");

    const result = await response.json();
    this.mediaFiles[checkType] = result.data.MediaID;

    return result.data;
  },

  async autoSaveDraft() {
    if (this.isSaving) return;

    try {
      this.isSaving = true;
      await this.saveDraft(true);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      this.isSaving = false;
    }
  },

  async onSaveDraft() {
    try {
      await this.saveDraft(false);
      ITManagementSystem.showGlobalSuccess("Draft saved successfully");
    } catch (error) {
      console.error("Error saving draft:", error);
      ITManagementSystem.showGlobalError("Failed to save draft");
    }
  },

  async saveDraft(isAutoSave = false) {
    const formData = this.collectFormData();

    const response = await fetch(
      `${ITManagementSystem.apiBase}/reports/counter/draft`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ITManagementSystem.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ReportID: this.reportId,
          CounterID: this.selectedCounter.counterId,
          SiteID: this.selectedSite.siteId,
          FormData: formData,
          MediaFiles: this.mediaFiles,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to save draft");

    const result = await response.json();

    if (!isAutoSave) {
      // Show visual feedback for manual saves
      const saveBtn = document.getElementById("saveDraftBtn");
      if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
        setTimeout(() => {
          saveBtn.textContent = originalText;
        }, 2000);
      }
    }

    return result;
  },

  collectFormData() {
    const form = document.getElementById("counterReportForm");
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  },

  async onSubmitReport() {
    const form = document.getElementById("counterReportForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = document.getElementById("submitReportBtn");
    const originalText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      // Save final data
      await this.saveDraft();

      // Submit report
      const response = await fetch(
        `${ITManagementSystem.apiBase}/reports/counter/${this.reportId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CounterReportData: this.collectFormData(),
            MediaFiles: this.mediaFiles,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit report");

      // Clear auto-save
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }

      // Clear session data
      sessionStorage.removeItem("selectedSite");
      sessionStorage.removeItem("selectedCounter");

      ITManagementSystem.showGlobalSuccess("Report submitted successfully");

      // Redirect to dashboard after a moment
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      ITManagementSystem.showGlobalError(
        "Failed to submit report. Please try again."
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  populateFormFromDraft(draftData) {
    if (!draftData || !draftData.FormData) return;

    const form = document.getElementById("counterReportForm");
    if (!form) return;

    Object.entries(draftData.FormData).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === "radio") {
          const radioField = form.querySelector(
            `[name="${key}"][value="${value}"]`
          );
          if (radioField) radioField.checked = true;
        } else {
          field.value = value;
        }
      }
    });

    if (draftData.MediaFiles) {
      this.mediaFiles = draftData.MediaFiles;
    }

    this.updateFieldRequirements();
    this.updateProgress();
  },
};

// Task Manager Module
ITManagementSystem.TaskManager = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    await ITManagementSystem.loadCurrentUser();
    await this.loadTasks();
    this.setupEvents();
    this.renderTasks();
    this.updateTaskStats();
  },

  async loadTasks() {
    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/tasks/assigned`,
        {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load tasks");

      const result = await response.json();
      this.tasks = result.data || [];
      this.filteredTasks = [...this.tasks];
    } catch (error) {
      console.error("Error loading tasks:", error);
      ITManagementSystem.showGlobalError("Failed to load tasks.");
    }
  },

  setupEvents() {
    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Sort dropdown
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) =>
        this.setSortOrder(e.target.value)
      );
    }

    // Search input
    const searchInput = document.getElementById("taskSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.filterTasks(e.target.value)
      );
    }

    // Add task button
    const addTaskBtn = document.getElementById("addTaskBtn");
    if (addTaskBtn) {
      addTaskBtn.addEventListener("click", () => this.showAddTaskModal());
    }
  },

  setFilter(filter) {
    this.currentFilter = filter;

    // Update filter button states
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    this.applyFilters();
  },

  setSortOrder(sortOrder) {
    this.currentSort = sortOrder;
    this.applyFilters();
  },

  filterTasks(searchQuery) {
    this.searchQuery = searchQuery.toLowerCase();
    this.applyFilters();
  },

  applyFilters() {
    let filtered = [...this.tasks];

    // Apply status filter
    if (this.currentFilter !== "all") {
      filtered = filtered.filter((task) => {
        switch (this.currentFilter) {
          case "pending":
            return task.Status === "Pending" || task.Status === "In Progress";
          case "completed":
            return task.Status === "Completed";
          case "overdue":
            return (
              new Date(task.DueDate) < new Date() && task.Status !== "Completed"
            );
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.Title.toLowerCase().includes(this.searchQuery) ||
          (task.Description &&
            task.Description.toLowerCase().includes(this.searchQuery))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case "dueDate":
          return new Date(a.DueDate) - new Date(b.DueDate);
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.Priority] - priorityOrder[a.Priority];
        case "title":
          return a.Title.localeCompare(b.Title);
        case "status":
          return a.Status.localeCompare(b.Status);
        default:
          return 0;
      }
    });

    this.filteredTasks = filtered;
    this.renderTasks();
  },

  renderTasks() {
    const container = document.querySelector(".tasks-list");
    if (!container) return;

    container.innerHTML = "";

    if (this.filteredTasks.length === 0) {
      container.innerHTML = '<div class="no-data">No tasks found</div>';
      return;
    }

    this.filteredTasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = `task-item priority-${task.Priority.toLowerCase()} status-${task.Status.toLowerCase().replace(
        " ",
        "-"
      )}`;

      const isOverdue =
        new Date(task.DueDate) < new Date() && task.Status !== "Completed";
      if (isOverdue) taskElement.classList.add("overdue");

      taskElement.innerHTML = `
                <div class="task-content">
                    <div class="task-header">
                        <h4 class="task-title">${task.Title}</h4>
                        <div class="task-meta">
                            <span class="task-priority priority-${task.Priority.toLowerCase()}">${
        task.Priority
      }</span>
                            <span class="task-status status-${task.Status.toLowerCase().replace(
                              " ",
                              "-"
                            )}">${task.Status}</span>
                        </div>
                    </div>
                    ${
                      task.Description
                        ? `<p class="task-description">${task.Description}</p>`
                        : ""
                    }
                    <div class="task-footer">
                        <div class="task-dates">
                            <span class="task-due">Due: ${ITManagementSystem.Utils.formatDate(
                              task.DueDate
                            )}</span>
                            ${
                              task.CompletedDate
                                ? `<span class="task-completed">Completed: ${ITManagementSystem.Utils.formatDate(
                                    task.CompletedDate
                                  )}</span>`
                                : ""
                            }
                        </div>
                        <div class="task-actions">
                            ${
                              task.Status !== "Completed"
                                ? `
                                <button class="btn btn-sm btn-success" onclick="ITManagementSystem.TaskManager.completeTask(${task.TaskID})">
                                    <i class="fas fa-check"></i> Complete
                                </button>
                            `
                                : ""
                            }
                            <button class="btn btn-sm btn-secondary" onclick="ITManagementSystem.TaskManager.editTask(${
                              task.TaskID
                            })">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                    </div>
                </div>
            `;

      container.appendChild(taskElement);
    });
  },

  updateTaskStats() {
    const stats = {
      total: this.tasks.length,
      pending: this.tasks.filter(
        (t) => t.Status === "Pending" || t.Status === "In Progress"
      ).length,
      completed: this.tasks.filter((t) => t.Status === "Completed").length,
      overdue: this.tasks.filter(
        (t) => new Date(t.DueDate) < new Date() && t.Status !== "Completed"
      ).length,
    };

    Object.entries(stats).forEach(([key, value]) => {
      const element = document.getElementById(`${key}TasksCount`);
      if (element) element.textContent = value;
    });
  },

  async completeTask(taskId) {
    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Status: "Completed",
            CompletedDate: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        ITManagementSystem.showGlobalSuccess("Task completed successfully");
        await this.loadTasks();
        this.applyFilters();
        this.updateTaskStats();
      }
    } catch (error) {
      console.error("Error completing task:", error);
      ITManagementSystem.showGlobalError("Failed to complete task");
    }
  },

  showAddTaskModal() {
    ITManagementSystem.Utils.showModal(
      "Add New Task",
      `
            <form id="addTaskForm">
                <div class="form-group">
                    <label for="taskTitle">Title *</label>
                    <input type="text" id="taskTitle" name="title" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="taskDescription">Description</label>
                    <textarea id="taskDescription" name="description" class="form-control" rows="3"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="taskPriority">Priority</label>
                        <select id="taskPriority" name="priority" class="form-control">
                            <option value="Low">Low</option>
                            <option value="Medium" selected>Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taskDueDate">Due Date</label>
                        <input type="date" id="taskDueDate" name="dueDate" class="form-control">
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="ITManagementSystem.Utils.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Task</button>
                </div>
            </form>
        `
    );

    document
      .getElementById("addTaskForm")
      .addEventListener("submit", (e) => this.handleAddTask(e));
  },

  async handleAddTask(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(`${ITManagementSystem.apiBase}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ITManagementSystem.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Title: formData.get("title"),
          Description: formData.get("description"),
          Priority: formData.get("priority"),
          DueDate: formData.get("dueDate"),
          AssignedToUserID: ITManagementSystem.currentUser.UserID,
        }),
      });

      if (response.ok) {
        ITManagementSystem.Utils.closeModal();
        ITManagementSystem.showGlobalSuccess("Task added successfully");
        await this.loadTasks();
        this.applyFilters();
        this.updateTaskStats();
      }
    } catch (error) {
      console.error("Error adding task:", error);
      ITManagementSystem.showGlobalError("Failed to add task");
    }
  },
};

// Profile Module
ITManagementSystem.Profile = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    await ITManagementSystem.loadCurrentUser();
    this.setupEvents();
    this.populateProfile();
    this.setupThemeSelector();
  },

  setupEvents() {
    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");

    if (profileForm) {
      profileForm.addEventListener("submit", (e) =>
        this.handleProfileUpdate(e)
      );
    }

    if (passwordForm) {
      passwordForm.addEventListener("submit", (e) =>
        this.handlePasswordChange(e)
      );
    }
  },

  populateProfile() {
    const user = ITManagementSystem.currentUser;
    if (!user) return;

    const fields = {
      englishName: user.EnglishName,
      arabicName: user.ArabicName,
      email: user.Email,
      mobile: user.Mobile,
      jobTitle: user.JobTitle,
      empId: user.EmpID,
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (field && value) field.value = value;
    });
  },

  setupThemeSelector() {
    const themeSelector = document.getElementById("themeSelect");
    if (themeSelector) {
      themeSelector.value = ITManagementSystem.currentTheme;
      themeSelector.addEventListener("change", (e) => {
        ITManagementSystem.changeTheme(e.target.value);
      });
    }
  },

  async handleProfileUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Updating...';

      const response = await fetch(
        `${ITManagementSystem.apiBase}/auth/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            EnglishName: formData.get("englishName"),
            ArabicName: formData.get("arabicName"),
            Mobile: formData.get("mobile"),
            JobTitle: formData.get("jobTitle"),
          }),
        }
      );

      if (response.ok) {
        ITManagementSystem.showGlobalSuccess("Profile updated successfully");
        await ITManagementSystem.loadCurrentUser();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      ITManagementSystem.showGlobalError("Failed to update profile");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  async handlePasswordChange(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      ITManagementSystem.showGlobalError(
        "New password and confirm password do not match"
      );
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Changing...';

      const response = await fetch(
        `${ITManagementSystem.apiBase}/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CurrentPassword: formData.get("currentPassword"),
            NewPassword: newPassword,
          }),
        }
      );

      if (response.ok) {
        ITManagementSystem.showGlobalSuccess("Password changed successfully");
        e.target.reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      ITManagementSystem.showGlobalError(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },
};

// Admin Module
ITManagementSystem.Admin = {
  async init() {
    if (!ITManagementSystem.Auth.checkAuth()) return;

    await ITManagementSystem.loadCurrentUser();

    // Check admin permissions
    if (!this.hasAdminPermissions()) {
      window.location.href = "/dashboard.html";
      return;
    }

    await this.loadAdminData();
    this.setupEvents();
    this.renderPendingApprovals();
  },

  hasAdminPermissions() {
    // Check if current user has admin role
    return (
      ITManagementSystem.currentUser &&
      (ITManagementSystem.currentUser.CanManageSystem ||
        ITManagementSystem.currentUser.CanApproveChanges)
    );
  },

  async loadAdminData() {
    try {
      const response = await fetch(
        `${ITManagementSystem.apiBase}/admin/pending-approvals`,
        {
          headers: { Authorization: `Bearer ${ITManagementSystem.authToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load admin data");

      const result = await response.json();
      this.pendingApprovals = result.data || [];
    } catch (error) {
      console.error("Error loading admin data:", error);
      ITManagementSystem.showGlobalError("Failed to load admin data.");
    }
  },

  setupEvents() {
    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refresh());
    }
  },

  renderPendingApprovals() {
    const container = document.querySelector(".pending-approvals");
    if (!container) return;

    container.innerHTML = "";

    if (this.pendingApprovals.length === 0) {
      container.innerHTML = '<div class="no-data">No pending approvals</div>';
      return;
    }

    this.pendingApprovals.forEach((approval) => {
      const approvalElement = document.createElement("div");
      approvalElement.className = `approval-item ${approval.Priority.toLowerCase()}`;

      approvalElement.innerHTML = `
                <div class="approval-content">
                    <div class="approval-header">
                        <h4>${approval.ApprovalType}: ${
        approval.ItemDescription
      }</h4>
                        <span class="approval-priority priority-${approval.Priority.toLowerCase()}">${
        approval.Priority
      }</span>
                    </div>
                    <div class="approval-details">
                        <p><strong>Requested by:</strong> ${
                          approval.RequestedByName
                        }</p>
                        <p><strong>Site:</strong> ${approval.SiteName}</p>
                        <p><strong>Counter:</strong> ${
                          approval.CounterNumber
                        }</p>
                        <p><strong>Requested on:</strong> ${ITManagementSystem.Utils.formatDateTime(
                          approval.RequestedOn
                        )}</p>
                        <p><strong>Pending for:</strong> ${
                          approval.HoursPending
                        } hours</p>
                        ${
                          approval.ChangeDetails
                            ? `<p><strong>Changes:</strong> ${approval.ChangeDetails}</p>`
                            : ""
                        }
                    </div>
                    <div class="approval-actions">
                        <button class="btn btn-success" onclick="ITManagementSystem.Admin.approveItem('${
                          approval.ApprovalType
                        }', ${approval.ItemID})">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-danger" onclick="ITManagementSystem.Admin.rejectItem('${
                          approval.ApprovalType
                        }', ${approval.ItemID})">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <button class="btn btn-secondary" onclick="ITManagementSystem.Admin.viewDetails('${
                          approval.ApprovalType
                        }', ${approval.ItemID})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `;

      container.appendChild(approvalElement);
    });
  },

  async approveItem(type, itemId) {
    const comments = await this.promptForComments("Approval");
    if (comments === null) return; // User cancelled

    try {
      const endpoint =
        type === "Report"
          ? `reports/${itemId}/approve`
          : `counter-changes/${itemId}/approve`;

      const response = await fetch(
        `${ITManagementSystem.apiBase}/admin/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Comments: comments }),
        }
      );

      if (response.ok) {
        ITManagementSystem.showGlobalSuccess(`${type} approved successfully`);
        await this.refresh();
      } else {
        throw new Error(`Failed to approve ${type.toLowerCase()}`);
      }
    } catch (error) {
      console.error("Error approving item:", error);
      ITManagementSystem.showGlobalError(
        `Failed to approve ${type.toLowerCase()}`
      );
    }
  },

  async rejectItem(type, itemId) {
    const comments = await this.promptForComments("Rejection", true);
    if (comments === null) return; // User cancelled

    try {
      const endpoint =
        type === "Report"
          ? `reports/${itemId}/reject`
          : `counter-changes/${itemId}/reject`;

      const response = await fetch(
        `${ITManagementSystem.apiBase}/admin/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ITManagementSystem.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Comments: comments }),
        }
      );

      if (response.ok) {
        ITManagementSystem.showGlobalSuccess(`${type} rejected successfully`);
        await this.refresh();
      } else {
        throw new Error(`Failed to reject ${type.toLowerCase()}`);
      }
    } catch (error) {
      console.error("Error rejecting item:", error);
      ITManagementSystem.showGlobalError(
        `Failed to reject ${type.toLowerCase()}`
      );
    }
  },

  promptForComments(action, required = false) {
    return new Promise((resolve) => {
      ITManagementSystem.Utils.showModal(
        `${action} Comments`,
        `
                <form id="commentsForm">
                    <div class="form-group">
                        <label for="comments">Comments ${
                          required ? "*" : "(Optional)"
                        }</label>
                        <textarea id="comments" name="comments" class="form-control" rows="4" ${
                          required ? "required" : ""
                        }></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="ITManagementSystem.Utils.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </form>
            `
      );

      document
        .getElementById("commentsForm")
        .addEventListener("submit", (e) => {
          e.preventDefault();
          const comments = e.target.comments.value;
          ITManagementSystem.Utils.closeModal();
          resolve(comments);
        });

      // Handle modal close without submission
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            resolve(null);
          }
        });
      }
    });
  },

  async refresh() {
    await this.loadAdminData();
    this.renderPendingApprovals();
    ITManagementSystem.showGlobalSuccess("Data refreshed");
  },
};

// Utility Functions
ITManagementSystem.Utils = {
  formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  formatDateTime(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  showNotification(message, type = "info", duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

    // Add to container or create one
    let container = document.querySelector(".notifications-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "notifications-container";
      document.body.appendChild(container);
    }

    container.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  },

  getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-triangle",
      warning: "exclamation-circle",
      info: "info-circle",
    };
    return icons[type] || "info-circle";
  },

  showModal(title, content, size = "medium") {
    // Remove existing modal
    this.closeModal();

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-dialog modal-${size}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="ITManagementSystem.Utils.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    document.body.classList.add("modal-open");

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", this.handleModalEscape);

    return modal;
  },

  closeModal() {
    const modal = document.querySelector(".modal");
    if (modal) {
      modal.remove();
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", this.handleModalEscape);
    }
  },

  handleModalEscape(e) {
    if (e.key === "Escape") {
      ITManagementSystem.Utils.closeModal();
    }
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  },
};

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  ITManagementSystem.init();
});

// Handle page visibility changes for session management
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && ITManagementSystem.authToken) {
    // Page became visible, check if token is still valid
    ITManagementSystem.loadCurrentUser().catch(() => {
      // Token invalid, redirect to login
      ITManagementSystem.Auth.logout();
    });
  }
});

// Global error handler
window.addEventListener("error", (e) => {
  console.error("Global error:", e.error);
  if (e.error && e.error.message && e.error.message.includes("fetch")) {
    ITManagementSystem.Utils.showNotification(
      "Network error. Please check your connection.",
      "error"
    );
  }
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
  if (e.reason && e.reason.message && e.reason.message.includes("fetch")) {
    ITManagementSystem.Utils.showNotification(
      "Network error. Please check your connection.",
      "error"
    );
  }
});

// Export for global access
window.ITManagementSystem = ITManagementSystem;
