// ==========================================
// IT Management System - Dashboard JavaScript
// ==========================================

// Dashboard Management
document.addEventListener("DOMContentLoaded", function () {
  initializeDashboard();
});

function initializeDashboard() {
  initializeTasks();
  initializeNotes();
  updateDashboardStats();
  setupRefreshHandlers();
}

// Tasks Management
function initializeTasks() {
  const refreshTasks = document.getElementById("refreshTasks");
  const taskItems = document.querySelectorAll(".task-item");
  const viewAllTasks = document.querySelector(".view-all-tasks");

  if (refreshTasks) {
    refreshTasks.addEventListener("click", () => {
      // Add loading animation
      refreshTasks.style.animation = "spin 1s linear";

      // Simulate API call
      setTimeout(() => {
        refreshTasks.style.animation = "";
        showNotification("Tasks refreshed successfully", "success");
        updateTaskPriorities();
      }, 1000);
    });
  }

  // Task item interactions
  taskItems.forEach((item) => {
    const actionBtn = item.querySelector(".task-action-btn");
    const taskId = item.dataset.id;

    if (actionBtn) {
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showTaskDetails(taskId);
      });
    }

    // Click to view task
    item.addEventListener("click", () => {
      showTaskDetails(taskId);
    });

    // Add hover effects
    item.addEventListener("mouseenter", () => {
      item.style.backgroundColor = "var(--bg-tertiary)";
    });

    item.addEventListener("mouseleave", () => {
      item.style.backgroundColor = "";
    });
  });

  if (viewAllTasks) {
    viewAllTasks.addEventListener("click", () => {
      window.location.href = "tasks.html";
    });
  }
}

function showTaskDetails(taskId) {
  // Mock task data
  const taskData = {
    "task-1": {
      title: "Server Maintenance - Building A",
      description:
        "Perform routine maintenance on the main server in Building A. This includes system updates, security patches, and performance optimization.",
      priority: "High",
      dueDate: "Today, 5:00 PM",
      assignedBy: "IT Manager",
      status: "Pending",
      estimatedTime: "2-3 hours",
    },
    "task-2": {
      title: "Network Setup - Floor 3",
      description:
        "Set up network infrastructure for the new office space on Floor 3. Install switches, access points, and configure network settings.",
      priority: "Medium",
      dueDate: "Tomorrow, 2:00 PM",
      assignedBy: "Network Admin",
      status: "Pending",
      estimatedTime: "4-5 hours",
    },
    "task-3": {
      title: "Software Update Review",
      description:
        "Review and approve pending software updates across all company devices. Ensure compatibility and security compliance.",
      priority: "Low",
      dueDate: "Friday, 10:00 AM",
      assignedBy: "System Admin",
      status: "Pending",
      estimatedTime: "1-2 hours",
    },
    "task-4": {
      title: "Counter Report - Site 001",
      description:
        "Conduct comprehensive counter inspection and submit detailed report for Site 001. Include all POS devices and peripherals.",
      priority: "Medium",
      dueDate: "This Week",
      assignedBy: "Site Manager",
      status: "Pending",
      estimatedTime: "3-4 hours",
    },
  };

  const task = taskData[taskId];
  if (!task) {
    showNotification("Task details not found", "error");
    return;
  }

  const modalContent = `
        <div class="task-details">
            <div class="task-header">
                <h3>${task.title}</h3>
                <span class="task-priority priority-${task.priority.toLowerCase()}">${
    task.priority
  } Priority</span>
            </div>
            <div class="task-info">
                <div class="info-grid">
                    <div class="info-item">
                        <label>Status:</label>
                        <span class="task-status">${task.status}</span>
                    </div>
                    <div class="info-item">
                        <label>Due Date:</label>
                        <span>${task.dueDate}</span>
                    </div>
                    <div class="info-item">
                        <label>Assigned By:</label>
                        <span>${task.assignedBy}</span>
                    </div>
                    <div class="info-item">
                        <label>Estimated Time:</label>
                        <span>${task.estimatedTime}</span>
                    </div>
                </div>
                <div class="task-description">
                    <label>Description:</label>
                    <p>${task.description}</p>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-success" onclick="markTaskComplete('${taskId}')">
                    <i class="fas fa-check"></i> Mark Complete
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;

  showModal("Task Details", modalContent);
}

function markTaskComplete(taskId) {
  const taskElement = document.querySelector(`[data-id="${taskId}"]`);
  if (taskElement) {
    taskElement.style.opacity = "0.6";
    taskElement.style.textDecoration = "line-through";

    // Add completed indicator
    const completedBadge = document.createElement("span");
    completedBadge.className = "task-completed-badge";
    completedBadge.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
    completedBadge.style.cssText =
      "color: var(--success-color); font-weight: 600; font-size: 0.75rem;";

    const taskContent = taskElement.querySelector(".task-content");
    if (taskContent) {
      taskContent.appendChild(completedBadge);
    }
  }

  closeModal();
  showNotification("Task marked as complete", "success");
  updateDashboardStats();
}

function updateTaskPriorities() {
  // Simulate task priority updates
  const taskItems = document.querySelectorAll(".task-item");
  taskItems.forEach((item) => {
    const priorityElement = item.querySelector(".task-priority");
    if (priorityElement) {
      priorityElement.style.animation = "pulse 0.5s ease-in-out";
      setTimeout(() => {
        priorityElement.style.animation = "";
      }, 500);
    }
  });
}

// Notes Management
function initializeNotes() {
  const addNoteBtn = document.getElementById("addNoteBtn");
  const notesContainer = document.getElementById("notesContainer");

  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", () => {
      showAddNoteModal();
    });
  }

  // Initialize existing notes
  if (notesContainer) {
    const noteItems = notesContainer.querySelectorAll(".note-item");
    noteItems.forEach((note) => {
      initializeNoteItem(note);
    });
  }
}

function initializeNoteItem(noteElement) {
  const editBtn = noteElement.querySelector(".edit-note");
  const deleteBtn = noteElement.querySelector(".delete-note");
  const noteTitle = noteElement.querySelector(".note-title");
  const noteContent = noteElement.querySelector(".note-content");
  const colorPicker = noteElement.querySelector(".note-color-picker");

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      toggleNoteEdit(noteElement);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      deleteNote(noteElement);
    });
  }

  // Color picker functionality
  if (colorPicker) {
    const colorOptions = colorPicker.querySelectorAll(".color-option");
    colorOptions.forEach((option) => {
      option.addEventListener("click", () => {
        changeNoteColor(noteElement, option.dataset.color);
      });
    });
  }

  // Show color picker on long press/right click
  noteElement.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    toggleColorPicker(noteElement);
  });
}

function toggleNoteEdit(noteElement) {
  const noteTitle = noteElement.querySelector(".note-title");
  const noteContent = noteElement.querySelector(".note-content");
  const editBtn = noteElement.querySelector(".edit-note");

  if (noteTitle.readOnly) {
    // Enter edit mode
    noteTitle.readOnly = false;
    noteContent.readOnly = false;
    noteTitle.focus();
    editBtn.innerHTML = "💾";
    editBtn.title = "Save note";
    noteElement.classList.add("editing");
  } else {
    // Save changes
    noteTitle.readOnly = true;
    noteContent.readOnly = true;
    editBtn.innerHTML = "✏️";
    editBtn.title = "Edit note";
    noteElement.classList.remove("editing");

    showNotification("Note saved successfully", "success");
    updateNoteDate(noteElement);
  }
}

function updateNoteDate(noteElement) {
  const noteDate = noteElement.querySelector(".note-date");
  if (noteDate) {
    const now = new Date();
    noteDate.textContent = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

function deleteNote(noteElement) {
  if (confirm("Are you sure you want to delete this note?")) {
    noteElement.style.animation = "fadeOut 0.3s ease-out";
    setTimeout(() => {
      noteElement.remove();
      showNotification("Note deleted successfully", "success");
    }, 300);
  }
}

function changeNoteColor(noteElement, color) {
  noteElement.dataset.color = color;

  // Update background color based on color name
  const colorMap = {
    yellow: "#fef68a",
    blue: "#93c5fd",
    green: "#86efac",
    pink: "#f9a8d4",
    purple: "#c4b5fd",
    orange: "#fdba74",
  };

  if (colorMap[color]) {
    noteElement.style.backgroundColor = colorMap[color];
  }

  toggleColorPicker(noteElement);
  showNotification("Note color changed", "success");
}

function toggleColorPicker(noteElement) {
  const colorPicker = noteElement.querySelector(".note-color-picker");
  if (colorPicker) {
    colorPicker.style.display =
      colorPicker.style.display === "flex" ? "none" : "flex";
  }
}

function showAddNoteModal() {
  const modalContent = `
        <form id="addNoteForm" class="add-note-form">
            <div class="form-group">
                <label for="noteTitle">Title</label>
                <input type="text" id="noteTitle" name="title" class="form-control" placeholder="Enter note title..." required>
            </div>
            <div class="form-group">
                <label for="noteContent">Content</label>
                <textarea id="noteContent" name="content" class="form-control" rows="4" placeholder="Write your note here..." required></textarea>
            </div>
            <div class="form-group">
                <label for="noteColor">Color</label>
                <div class="color-selection">
                    <div class="color-option" data-color="yellow" style="background: #fef68a;" title="Yellow"></div>
                    <div class="color-option" data-color="blue" style="background: #93c5fd;" title="Blue"></div>
                    <div class="color-option" data-color="green" style="background: #86efac;" title="Green"></div>
                    <div class="color-option" data-color="pink" style="background: #f9a8d4;" title="Pink"></div>
                    <div class="color-option" data-color="purple" style="background: #c4b5fd;" title="Purple"></div>
                    <div class="color-option" data-color="orange" style="background: #fdba74;" title="Orange"></div>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Note</button>
            </div>
        </form>
    `;

  showModal("Add New Note", modalContent);

  // Handle color selection
  let selectedColor = "yellow";
  const colorOptions = document.querySelectorAll(
    ".color-selection .color-option"
  );
  colorOptions.forEach((option) => {
    option.addEventListener("click", () => {
      colorOptions.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      selectedColor = option.dataset.color;
    });
  });

  // Set default selection
  colorOptions[0].classList.add("selected");

  // Handle form submission
  document.getElementById("addNoteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addNewNote(formData.get("title"), formData.get("content"), selectedColor);
  });
}

function addNewNote(title, content, color) {
  const notesContainer = document.getElementById("notesContainer");
  if (!notesContainer) return;

  const noteId = `note-${Date.now()}`;
  const colorMap = {
    yellow: "#fef68a",
    blue: "#93c5fd",
    green: "#86efac",
    pink: "#f9a8d4",
    purple: "#c4b5fd",
    orange: "#fdba74",
  };

  const noteElement = document.createElement("div");
  noteElement.className = "note-item";
  noteElement.dataset.color = color;
  noteElement.dataset.id = noteId;
  noteElement.style.backgroundColor = colorMap[color];

  noteElement.innerHTML = `
        <div class="note-header">
            <input type="text" class="note-title" value="${title}" readonly>
            <div class="note-actions">
                <button class="edit-note" aria-label="Edit note">✏️</button>
                <button class="delete-note" aria-label="Delete note">🗑️</button>
            </div>
        </div>
        <textarea class="note-content" readonly>${content}</textarea>
        <div class="note-footer">
            <span class="note-date">${new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}</span>
        </div>
        <div class="note-color-picker" style="display: none">
            <div class="color-option" data-color="yellow" style="background: #fef68a"></div>
            <div class="color-option" data-color="blue" style="background: #93c5fd"></div>
            <div class="color-option" data-color="green" style="background: #86efac"></div>
            <div class="color-option" data-color="pink" style="background: #f9a8d4"></div>
            <div class="color-option" data-color="purple" style="background: #c4b5fd"></div>
            <div class="color-option" data-color="orange" style="background: #fdba74"></div>
        </div>
    `;

  notesContainer.insertBefore(noteElement, notesContainer.firstChild);
  initializeNoteItem(noteElement);

  closeModal();
  showNotification("Note added successfully", "success");

  // Animate in
  noteElement.style.animation = "fadeInUp 0.3s ease-out";
}

// Dashboard Stats Update
function updateDashboardStats() {
  // Simulate real-time stats updates
  const statCards = document.querySelectorAll(".stat-card");

  statCards.forEach((card) => {
    const statNumber = card.querySelector(".stat-number");
    if (statNumber) {
      const currentValue = parseInt(statNumber.textContent);
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const newValue = Math.max(0, currentValue + variation);

      if (newValue !== currentValue) {
        statNumber.style.animation = "pulse 0.5s ease-in-out";
        setTimeout(() => {
          statNumber.textContent = newValue;
          statNumber.style.animation = "";
        }, 250);
      }
    }
  });
}

// Refresh Handlers
function setupRefreshHandlers() {
  // Auto-refresh dashboard stats every 30 seconds
  setInterval(updateDashboardStats, 30000);

  // Manual refresh on focus
  window.addEventListener("focus", () => {
    updateDashboardStats();
    showNotification("Dashboard refreshed", "info", 2000);
  });
}

// Modal Functions
function showModal(title, content) {
  closeModal(); // Close any existing modal

  const modal = document.createElement("div");
  modal.className = "modal-overlay show";
  modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal()" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) {
    modal.remove();
  }
}

// Add required CSS for animations
const dashboardStyle = document.createElement("style");
dashboardStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .note-item.editing {
        border: 2px solid var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .color-selection {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }
    
    .color-selection .color-option {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid transparent;
        transition: all var(--transition-fast);
    }
    
    .color-selection .color-option:hover,
    .color-selection .color-option.selected {
        border-color: var(--text-primary);
        transform: scale(1.1);
    }
    
    .task-details .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
    }
    
    .task-details .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }
    
    .task-details .info-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }
    
    .task-details .info-item label {
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    .task-details .task-description {
        margin-bottom: var(--spacing-lg);
    }
    
    .task-details .task-description label {
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-sm);
        display: block;
    }
    
    .task-details .task-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        margin-top: var(--spacing-lg);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-color);
    }
    
    .task-priority.priority-high {
        background-color: var(--error-color);
        color: white;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .task-priority.priority-medium {
        background-color: var(--warning-color);
        color: white;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .task-priority.priority-low {
        background-color: var(--success-color);
        color: white;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        border-radius: var(--radius-md);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);
        text-decoration: none;
    }
    
    .btn-primary {
        background-color: var(--primary-color);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--primary-dark);
    }
    
    .btn-secondary {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }
    
    .btn-secondary:hover {
        background-color: var(--border-color);
    }
    
    .btn-success {
        background-color: var(--success-color);
        color: white;
    }
    
    .btn-success:hover {
        background-color: #059669;
    }
    
    .form-control {
        width: 100%;
        padding: var(--spacing-sm);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: 1rem;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        transition: border-color var(--transition-fast);
    }
    
    .form-control:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .form-group {
        margin-bottom: var(--spacing-md);
    }
    
    .form-group label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .modal-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        margin-top: var(--spacing-lg);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-color);
    }
`;
document.head.appendChild(dashboardStyle);
