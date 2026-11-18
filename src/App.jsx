
import { useState, useEffect } from 'react'
import './App.css'

const initialTasks = [
  {
    id: 1,
    title: 'Complete Data Mining Assignment',
    description: 'Finish the research and prepare the report.',
    priority: 'High',
    category: 'Study',
    status: 'Completed',
    dueDate: '',
  },
  {
    id: 2,
    title: 'Prepare for JavaScript Exam',
    description: 'Revise functions, arrays and React basics.',
    priority: 'Medium',
    category: 'Study',
    status: 'Pending',
    dueDate: '',
  },
  {
    id: 3,
    title: 'Build React Project',
    description: 'Complete the TaskFlow dashboard.',
    priority: 'High',
    category: 'Work',
    status: 'Pending',
    dueDate: '',
  },
]

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCalendarDays(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const startingDay = (firstDay.getDay() + 6) % 7
  const calendarStart = new Date(year, month, 1 - startingDay)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarStart)
    day.setDate(calendarStart.getDate() + index)
    return day
  })
}

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  const [activePage, setActivePage] = useState('Dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortOption, setSortOption] = useState('newest')
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Display name saved in Local Storage
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('taskflow-profile-name') || 'My Profile'
  })

  const [nameInput, setNameInput] = useState(profileName)

  // Dark mode saved in Local Storage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('taskflow-theme') === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('taskflow-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem('taskflow-profile-name', profileName)
  }, [profileName])

  // Tasks saved in Local Storage
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('taskflow-tasks')

      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)

        // Add a default category to older saved tasks
        return parsedTasks.map(task => ({
          ...task,
          category: task.category || 'Other',
        }))
      }

      return initialTasks
    } catch (error) {
      console.error('Could not load tasks:', error)
      return initialTasks
    }
  })

  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Task form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [category, setCategory] = useState('Study')
  const [dueDate, setDueDate] = useState('')

  const selectedTask = tasks.find(task => task.id === selectedTaskId)

  // Save profile name
  function handleSaveName(e) {
    e.preventDefault()

    if (!nameInput.trim()) {
      alert('Please enter a display name.')
      return
    }

    setProfileName(nameInput.trim())
    alert('Your display name has been updated successfully.')
  }

  // Clear all tasks
  function handleClearTasks() {
    if (tasks.length === 0) {
      alert('There are no tasks to clear.')
      return
    }

    const confirmClear = window.confirm(
      'Are you sure you want to delete ALL tasks? This action cannot be undone.'
    )

    if (confirmClear) {
      setTasks([])
      setSelectedTaskId(null)
      resetForm()
      alert('All tasks have been cleared.')
    }
  }

  // Export tasks to CSV
  function exportTasks() {
    if (tasks.length === 0) {
      alert('There are no tasks to export.')
      return
    }

    const headers = [
      'Title',
      'Description',
      'Priority',
      'Category',
      'Status',
      'Due Date',
    ]

    const csvRows = tasks.map(task => [
      task.title,
      task.description,
      task.priority,
      task.category || 'Other',
      task.status,
      task.dueDate || 'No due date',
    ])

    const csvContent = [headers, ...csvRows]
      .map(row =>
        row
          .map(value => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'TaskFlow-Tasks.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Reset task form
  function resetForm() {
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setCategory('Study')
    setDueDate('')
    setEditingTaskId(null)
    setIsFormOpen(false)
  }

  // Change sidebar page
  function handlePageChange(page) {
    setActivePage(page)
    setSearchTerm('')
    setPriorityFilter('All')
    setStatusFilter('All')
    setCategoryFilter('All')
    setSortOption('newest')
    setSelectedTaskId(null)
    resetForm()

    if (page === 'Settings') {
      setNameInput(profileName)
    }
  }

  // Change calendar month
  function changeCalendarMonth(amount) {
    setCalendarDate(currentDate =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + amount,
        1
      )
    )
  }

  // Add new task
  function handleAddTask(e) {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please enter a task title.')
      return
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      status: 'Pending',
      dueDate,
    }

    setTasks(currentTasks => [...currentTasks, newTask])
    resetForm()
  }

  // Edit task
  function handleEditTask(task) {
    setSelectedTaskId(null)
    setEditingTaskId(task.id)
    setTitle(task.title)
    setDescription(task.description)
    setPriority(task.priority)
    setCategory(task.category || 'Other')
    setDueDate(task.dueDate || '')
    setIsFormOpen(true)
  }

  // Update task
  function handleUpdateTask(e) {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please enter a task title.')
      return
    }

    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === editingTaskId
          ? {
              ...task,
              title: title.trim(),
              description: description.trim(),
              priority,
              category,
              dueDate,
            }
          : task
      )
    )

    resetForm()
  }

  // Delete task
  function handleDeleteTask(id) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (confirmDelete) {
      setTasks(currentTasks =>
        currentTasks.filter(task => task.id !== id)
      )

      setSelectedTaskId(null)

      if (editingTaskId === id) {
        resetForm()
      }
    }
  }

  // Change task status
  function handleToggleStatus(id) {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === id
          ? {
              ...task,
              status:
                task.status === 'Pending' ? 'Completed' : 'Pending',
            }
          : task
      )
    )
  }

  // Task statistics
  const totalTasks = tasks.length

  const completedTasks = tasks.filter(
    task => task.status === 'Completed'
  ).length

  const pendingTasks = tasks.filter(
    task => task.status === 'Pending'
  ).length

  const overdueTasks = tasks.filter(
    task =>
      task.status === 'Pending' &&
      task.dueDate &&
      task.dueDate < formatDateKey(new Date())
  ).length

  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100)

  // Priority analytics
  const highPriorityTasks = tasks.filter(
    task => task.priority === 'High'
  ).length

  const mediumPriorityTasks = tasks.filter(
    task => task.priority === 'Medium'
  ).length

  const lowPriorityTasks = tasks.filter(
    task => task.priority === 'Low'
  ).length

  // Filter tasks
  const filteredTasks = tasks
    .filter(task => {
      if (activePage === 'Completed') {
        return task.status === 'Completed'
      }

      if (activePage === 'Calendar') {
        return task.dueDate !== ''
      }

      return true
    })
    .filter(task => {
      const search = searchTerm.toLowerCase()

      return (
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
      )
    })
    .filter(task => {
      if (priorityFilter === 'All') return true
      return task.priority === priorityFilter
    })
    .filter(task => {
      if (statusFilter === 'All') return true
      return task.status === statusFilter
    })
    .filter(task => {
      if (categoryFilter === 'All') return true
      return (task.category || 'Other') === categoryFilter
    })

  // Sort tasks
  const sortedTasks = [...filteredTasks]

  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1,
  }

  if (sortOption === 'newest') {
    sortedTasks.reverse()
  } else if (sortOption === 'priority-high') {
    sortedTasks.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    )
  } else if (sortOption === 'priority-low') {
    sortedTasks.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )
  } else if (sortOption === 'due-date') {
    sortedTasks.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  }

  // Calendar data
  const calendarDays = getCalendarDays(calendarDate)
  const todayKey = formatDateKey(new Date())
  const calendarTasks = filteredTasks.filter(task => task.dueDate)

  const monthName = calendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  const tasksInCurrentMonth = calendarTasks.filter(task => {
    const taskDate = new Date(`${task.dueDate}T12:00:00`)

    return (
      taskDate.getMonth() === calendarDate.getMonth() &&
      taskDate.getFullYear() === calendarDate.getFullYear()
    )
  })

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">
          TaskFlow<span>.</span>
        </h2>

        <nav className="sidebar-nav">
          {['Dashboard', 'My Tasks', 'Calendar', 'Completed'].map(page => (
            <a
              href="#"
              key={page}
              className={`nav-link ${activePage === page ? 'active' : ''}`}
              onClick={e => {
                e.preventDefault()
                handlePageChange(page)
              }}
            >
              {page}
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <a
            href="#"
            className={`nav-link ${activePage === 'Settings' ? 'active' : ''}`}
            onClick={e => {
              e.preventDefault()
              handlePageChange('Settings')
            }}
          >
            Settings
          </a>

          <a
            href="#"
            className="nav-link"
            onClick={e => {
              e.preventDefault()
              alert(
                'Logout is not available because this project does not use user accounts.'
              )
            }}
          >
            Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>
              {activePage === 'Dashboard'
                ? "Welcome back! Here's your productivity overview."
                : activePage === 'Calendar'
                  ? 'View your tasks according to their due dates.'
                  : activePage === 'Completed'
                    ? 'Here are all your completed tasks.'
                    : activePage === 'Settings'
                      ? 'Manage your TaskFlow preferences.'
                      : 'Manage and organize all your tasks.'}
            </p>
          </div>

          <div className="profile">
            <button
              type="button"
              className="dark-mode-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            <div className="profile-avatar">
              {profileName.charAt(0).toUpperCase()}
            </div>

            <span>{profileName}</span>
          </div>
        </header>

        {/* Dashboard */}
        {activePage === 'Dashboard' && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Tasks</p>
                <h2>{totalTasks}</h2>
                <span>All your tasks</span>
              </div>

              <div className="stat-card">
                <p>Completed</p>
                <h2>{completedTasks}</h2>
                <span>Successfully finished</span>
              </div>

              <div className="stat-card">
                <p>Pending</p>
                <h2>{pendingTasks}</h2>
                <span>Waiting to be done</span>
              </div>

              <div className="stat-card">
                <p>Overdue</p>
                <h2>{overdueTasks}</h2>
                <span>Past deadline</span>
              </div>
            </section>

            {/* Task Progress */}
            <section className="progress-section">
              <div className="progress-header">
                <div>
                  <h2>Task Progress</h2>
                  <p>Your overall task completion</p>
                </div>

                <h2>{progressPercentage}%</h2>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <p className="progress-description">
                {completedTasks} out of {totalTasks} tasks completed
              </p>
            </section>

            {/* Dashboard Analytics */}
            <section className="analytics-section">
              <div className="analytics-card">
                <h2>Task Completion</h2>

                <p className="analytics-subtitle">
                  Overview of completed and pending tasks
                </p>

                <div className="chart-row">
                  <span>Completed</span>

                  <div className="chart-track">
                    <div
                      className="chart-fill completed-fill"
                      style={{
                        width: `${
                          totalTasks === 0
                            ? 0
                            : (completedTasks / totalTasks) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <strong>{completedTasks}</strong>
                </div>

                <div className="chart-row">
                  <span>Pending</span>

                  <div className="chart-track">
                    <div
                      className="chart-fill pending-fill"
                      style={{
                        width: `${
                          totalTasks === 0
                            ? 0
                            : (pendingTasks / totalTasks) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <strong>{pendingTasks}</strong>
                </div>
              </div>

              <div className="analytics-card">
                <h2>Priority Distribution</h2>

                <p className="analytics-subtitle">
                  Tasks according to their priority
                </p>

                <div className="chart-row">
                  <span>High</span>

                  <div className="chart-track">
                    <div
                      className="chart-fill high-fill"
                      style={{
                        width: `${
                          totalTasks === 0
                            ? 0
                            : (highPriorityTasks / totalTasks) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <strong>{highPriorityTasks}</strong>
                </div>

                <div className="chart-row">
                  <span>Medium</span>

                  <div className="chart-track">
                    <div
                      className="chart-fill medium-fill"
                      style={{
                        width: `${
                          totalTasks === 0
                            ? 0
                            : (mediumPriorityTasks / totalTasks) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <strong>{mediumPriorityTasks}</strong>
                </div>

                <div className="chart-row">
                  <span>Low</span>

                  <div className="chart-track">
                    <div
                      className="chart-fill low-fill"
                      style={{
                        width: `${
                          totalTasks === 0
                            ? 0
                            : (lowPriorityTasks / totalTasks) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <strong>{lowPriorityTasks}</strong>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Settings Page */}
        {activePage === 'Settings' && (
          <section className="settings-section">
            <div className="settings-card">
              <h2>Profile Settings</h2>

              <p className="settings-description">
                Change the name displayed in your TaskFlow profile.
              </p>

              <form className="settings-form" onSubmit={handleSaveName}>
                <label htmlFor="profile-name">Display Name</label>

                <input
                  id="profile-name"
                  className="settings-input"
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={40}
                />

                <button type="submit" className="add-task-btn">
                  Save Name
                </button>
              </form>
            </div>

            <div className="settings-card">
              <h2>Appearance</h2>

              <p className="settings-description">
                Choose how you want TaskFlow to look.
              </p>

              <div className="settings-theme-row">
                <span>
                  Current Theme:{' '}
                  <strong>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </strong>
                </span>

                <button
                  type="button"
                  className="dark-mode-toggle"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode
                    ? '☀️ Switch to Light'
                    : '🌙 Switch to Dark'}
                </button>
              </div>
            </div>

            <div className="settings-card danger-settings-card">
              <h2>Data Management</h2>

              <p className="settings-description">
                You currently have {totalTasks} task(s) saved in TaskFlow.
                Clearing tasks permanently removes them from this browser.
              </p>

              <button
                type="button"
                className="danger-btn"
                onClick={handleClearTasks}
              >
                Clear All Tasks
              </button>
            </div>
          </section>
        )}

        {/* Tasks Section */}
        {activePage !== 'Settings' && (
          <section className="tasks-section">
            <div className="section-header">
              <div>
                <h2>
                  {activePage === 'Dashboard'
                    ? 'My Tasks'
                    : activePage === 'Calendar'
                      ? 'Monthly Calendar'
                      : activePage === 'Completed'
                        ? 'Completed Tasks'
                        : 'All Tasks'}
                </h2>

                <p>Keep track of your daily activities.</p>
              </div>

              <div className="task-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />

                <select
                  className="filter-select"
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <select
                  className="filter-select"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Study">Study</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Tasks</option>
                  <option value="Pending">Pending Tasks</option>
                  <option value="Completed">Completed Tasks</option>
                </select>

                <select
                  className="filter-select"
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority-high">
                    High to Low Priority
                  </option>
                  <option value="priority-low">
                    Low to High Priority
                  </option>
                  <option value="due-date">
                    Due Date (Earliest First)
                  </option>
                </select>

                <button
                  type="button"
                  className="export-btn"
                  onClick={exportTasks}
                >
                  ↓ Export CSV
                </button>

                {activePage !== 'Completed' &&
                  activePage !== 'Calendar' && (
                    <button
                      type="button"
                      className="add-task-btn"
                      onClick={() => {
                        if (isFormOpen) {
                          resetForm()
                        } else {
                          resetForm()
                          setIsFormOpen(true)
                        }
                      }}
                    >
                      {isFormOpen ? 'Close Form' : '+ Add New Task'}
                    </button>
                  )}
              </div>
            </div>

            {/* Calendar View */}
            {activePage === 'Calendar' && (
              <div className="calendar-container">
                <div className="calendar-header">
                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={() => changeCalendarMonth(-1)}
                  >
                    ← Previous
                  </button>

                  <h2>{monthName}</h2>

                  <button
                    type="button"
                    className="calendar-nav-btn"
                    onClick={() => changeCalendarMonth(1)}
                  >
                    Next →
                  </button>
                </div>

                <div className="calendar-grid">
                  {weekdays.map(day => (
                    <div className="calendar-weekday" key={day}>
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    const dateKey = formatDateKey(day)

                    const dayTasks = calendarTasks.filter(
                      task => task.dueDate === dateKey
                    )

                    const isCurrentMonth =
                      day.getMonth() === calendarDate.getMonth()

                    const isToday = dateKey === todayKey

                    return (
                      <div
                        className={`calendar-day ${
                          !isCurrentMonth ? 'other-month' : ''
                        } ${isToday ? 'today' : ''}`}
                        key={index}
                      >
                        <span className="calendar-date">
                          {day.getDate()}
                        </span>

                        <div className="calendar-events">
                          {dayTasks.map(task => (
                            <div
                              key={task.id}
                              className={`calendar-event ${
                                task.status.toLowerCase()
                              } ${task.priority.toLowerCase()}`}
                              title={`${task.title} - ${task.category || 'Other'} - ${task.status} - ${task.priority} Priority`}
                            >
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="calendar-legend">
                  <span>
                    <i className="legend-dot pending-dot"></i>
                    Pending
                  </span>

                  <span>
                    <i className="legend-dot completed-dot"></i>
                    Completed
                  </span>
                </div>

                {tasksInCurrentMonth.length === 0 && (
                  <p className="calendar-empty">
                    No tasks found for this month. Add due dates to your
                    tasks or change your filters.
                  </p>
                )}

                <p className="calendar-summary">
                  {tasksInCurrentMonth.length} task(s) scheduled in{' '}
                  {monthName}
                </p>
              </div>
            )}

            {/* Add/Edit Task Form */}
            {isFormOpen && (
              <form
                className="task-form"
                onSubmit={
                  editingTaskId !== null
                    ? handleUpdateTask
                    : handleAddTask
                }
              >
                <h3>
                  {editingTaskId !== null ? 'Edit Task' : 'Add New Task'}
                </h3>

                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />

                <textarea
                  placeholder="Enter task description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />

                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>

                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Study">Study</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />

                <div className="form-buttons">
                  <button type="submit" className="add-task-btn">
                    {editingTaskId !== null ? 'Update Task' : 'Save Task'}
                  </button>

                  <button type="button" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Task List */}
            {activePage !== 'Calendar' && (
              <div className="task-list">
                {sortedTasks.map(task => (
                  <div className="task-item" key={task.id}>
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>

                      <span className="task-category">
                        {task.category || 'Other'}
                      </span>

                      {task.dueDate && <p>Due: {task.dueDate}</p>}

                      <button
                        type="button"
                        className="view-details-btn"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        View Details
                      </button>
                    </div>

                    <span
                      className={`priority ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`task-status ${task.status.toLowerCase()}`}
                    >
                      {task.status}
                    </span>

                    <button
                      type="button"
                      className="complete-task-btn"
                      onClick={() => handleToggleStatus(task.id)}
                    >
                      {task.status === 'Pending'
                        ? 'Mark Completed'
                        : 'Mark Pending'}
                    </button>

                    <button
                      type="button"
                      className="edit-task-btn"
                      onClick={() => handleEditTask(task)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-task-btn"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {sortedTasks.length === 0 && (
                  <p>
                    {searchTerm ||
                    priorityFilter !== 'All' ||
                    statusFilter !== 'All' ||
                    categoryFilter !== 'All'
                      ? 'No matching tasks found. Try changing your search or filters.'
                      : activePage === 'Completed'
                        ? 'No completed tasks yet.'
                        : 'No tasks available. Add a new task!'}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Task Details Popup */}
        {selectedTask && (
          <div
            className="details-overlay"
            onClick={() => setSelectedTaskId(null)}
          >
            <div
              className="details-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="details-header">
                <h2>Task Details</h2>

                <button
                  type="button"
                  className="details-close-btn"
                  onClick={() => setSelectedTaskId(null)}
                >
                  ×
                </button>
              </div>

              <div className="details-content">
                <h3>{selectedTask.title}</h3>

                <div className="details-field">
                  <strong>Description</strong>
                  <p>
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                <div className="details-field">
                  <strong>Category</strong>
                  <p>{selectedTask.category || 'Other'}</p>
                </div>

                <div className="details-field">
                  <strong>Priority</strong>
                  <p>{selectedTask.priority}</p>
                </div>

                <div className="details-field">
                  <strong>Status</strong>
                  <p>{selectedTask.status}</p>
                </div>

                <div className="details-field">
                  <strong>Due Date</strong>
                  <p>{selectedTask.dueDate || 'No due date set.'}</p>
                </div>
              </div>

              <div className="details-actions">
                <button
                  type="button"
                  className="edit-task-btn"
                  onClick={() => handleEditTask(selectedTask)}
                >
                  Edit Task
                </button>

                <button
                  type="button"
                  className="delete-task-btn"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                >
                  Delete Task
                </button>

                <button
                  type="button"
                  className="details-close-action"
                  onClick={() => setSelectedTaskId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
