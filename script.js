// ========================================
// API URL
// ========================================

const API_URL = "http://localhost:3000/tasks";
// ========================================
// DOM ELEMENTS
// ========================================
const todoTasks =
    document.getElementById("todoTasks");
const progressTasks =
    document.getElementById("progressTasks");
const completedTasks =
    document.getElementById("completedTasks");
const todoCount =
    document.getElementById("todoCount");
const progressCount =
    document.getElementById("progressCount");
const completedCount =
    document.getElementById("completedCount");
const addTaskBtn =
    document.getElementById("addTaskBtn");
const taskModal =
    document.getElementById("taskModal");
const closeModal =
    document.getElementById("closeModal");
const taskForm =
    document.getElementById("taskForm");
const searchInput =
    document.getElementById("searchInput");
const priorityFilter =
    document.getElementById("priorityFilter");
const userFilter =
    document.getElementById("userFilter");
// ========================================
// FORM ELEMENTS
// ========================================
const taskTitle =
    document.getElementById("taskTitle");
const taskDescription =
    document.getElementById("taskDescription");

const taskUser =
    document.getElementById("taskUser");

const taskPriority =
    document.getElementById("taskPriority");

const taskStatus =
    document.getElementById("taskStatus");

const modalTitle =
    document.getElementById("modalTitle");


// ========================================
// VARIABLES
// ========================================

let tasks = [];

let editingTaskId = null;

let draggedTaskId = null;


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Unable to connect to JSON Server"
            );

        }


        tasks =
            await response.json();


        loadUsers();

        filterTasks();

    }

    catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        alert(
            "Cannot connect to JSON Server. Make sure JSON Server is running on port 3000."
        );

    }

}


// ========================================
// DISPLAY TASKS
// ========================================

function displayTasks(taskArray) {

    todoTasks.innerHTML = "";

    progressTasks.innerHTML = "";

    completedTasks.innerHTML = "";


    taskArray.forEach(task => {

        const card =
            createTaskCard(task);


        if (task.status === "todo") {

            todoTasks.appendChild(card);

        }

        else if (
            task.status === "in-progress"
        ) {

            progressTasks.appendChild(card);

        }

        else if (
            task.status === "completed"
        ) {

            completedTasks.appendChild(card);

        }

    });


    updateCounts();

}


// ========================================
// CREATE TASK CARD
// ========================================

function createTaskCard(task) {

    const card =
        document.createElement("div");


    card.classList.add("task-card");


    card.draggable = true;


    card.dataset.id = task.id;


    // Priority class

    let priorityClass = "";


    if (task.priority === "High") {

        priorityClass =
            "priority-high";

    }

    else if (task.priority === "Medium") {

        priorityClass =
            "priority-medium";

    }

    else {

        priorityClass =
            "priority-low";

    }


    // IMPORTANT:
    // ID is passed as a STRING

    card.innerHTML = `

        <h3>
            ${task.title}
        </h3>

        <p>
            ${task.description}
        </p>

        <span class="priority ${priorityClass}">
            ${task.priority} Priority
        </span>

        <div class="task-user">

            Assigned to:

            <strong>
                ${task.user}
            </strong>

        </div>

        <div class="task-actions">

            <button
                class="edit-btn"
                onclick="editTask('${task.id}')">

                Edit

            </button>


            <button
                class="delete-btn"
                onclick="deleteTask('${task.id}')">

                Delete

            </button>

        </div>

    `;


    // ========================================
    // DRAG START
    // ========================================

    card.addEventListener(
        "dragstart",
        () => {

            draggedTaskId =
                task.id;

            card.classList.add(
                "dragging"
            );

        }
    );


    // ========================================
    // DRAG END
    // ========================================

    card.addEventListener(
        "dragend",
        () => {

            card.classList.remove(
                "dragging"
            );

        }
    );


    return card;

}


// ========================================
// OPEN CREATE TASK MODAL
// ========================================

addTaskBtn.addEventListener(
    "click",
    () => {

        editingTaskId = null;


        taskForm.reset();


        modalTitle.textContent =
            "Create Task";


        taskModal.style.display =
            "flex";

    }
);


// ========================================
// CLOSE MODAL
// ========================================

closeModal.addEventListener(
    "click",
    () => {

        taskModal.style.display =
            "none";

        editingTaskId = null;

    }
);


// ========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ========================================

window.addEventListener(
    "click",
    event => {

        if (event.target === taskModal) {

            taskModal.style.display =
                "none";

            editingTaskId = null;

        }

    }
);


// ========================================
// CREATE / EDIT TASK
// ========================================

taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const taskData = {

            title:
                taskTitle.value.trim(),

            description:
                taskDescription.value.trim(),

            user:
                taskUser.value.trim(),

            priority:
                taskPriority.value,

            status:
                taskStatus.value

        };


        try {


            // ========================================
            // CREATE
            // ========================================

            if (editingTaskId === null) {

                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    taskData
                                )

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to create task"
                    );

                }

            }


            // ========================================
            // EDIT
            // ========================================

            else {

                const response =
                    await fetch(
                        `${API_URL}/${encodeURIComponent(editingTaskId)}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    id:
                                        editingTaskId,

                                    ...taskData

                                })

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to update task"
                    );

                }

            }


            // Close modal

            taskModal.style.display =
                "none";


            // Clear form

            taskForm.reset();


            // Exit edit mode

            editingTaskId = null;


            // Reload data

            await loadTasks();

        }


        catch (error) {

            console.error(
                "Error saving task:",
                error
            );

            alert(
                "Unable to save task. Check JSON Server."
            );

        }

    }
);


// ========================================
// EDIT TASK
// ========================================

function editTask(id) {


    // Convert both values to strings
    // so string IDs work correctly

    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    if (!task) {

        console.error(
            "Task not found:",
            id
        );

        alert(
            "Task could not be found."
        );

        return;

    }


    // Store ID

    editingTaskId =
        task.id;


    // Fill form

    taskTitle.value =
        task.title || "";


    taskDescription.value =
        task.description || "";


    taskUser.value =
        task.user || "";


    taskPriority.value =
        task.priority || "Medium";


    taskStatus.value =
        task.status || "todo";


    // Change modal title

    modalTitle.textContent =
        "Edit Task";


    // Open modal

    taskModal.style.display =
        "flex";

}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(id) {


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {

        return;

    }


    try {


        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(id)}`,
                {

                    method: "DELETE"

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete task"
            );

        }


        await loadTasks();

    }


    catch (error) {

        console.error(
            "Error deleting task:",
            error
        );

        alert(
            "Unable to delete task."
        );

    }

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    filterTasks
);


// ========================================
// PRIORITY FILTER
// ========================================

priorityFilter.addEventListener(
    "change",
    filterTasks
);


// ========================================
// USER FILTER
// ========================================

userFilter.addEventListener(
    "change",
    filterTasks
);


// ========================================
// FILTER TASKS
// ========================================

function filterTasks() {


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedPriority =
        priorityFilter.value;


    const selectedUser =
        userFilter.value;


    const filteredTasks =
        tasks.filter(task => {


            const title =
                String(
                    task.title || ""
                )
                .toLowerCase();


            const description =
                String(
                    task.description || ""
                )
                .toLowerCase();


            const user =
                String(
                    task.user || ""
                );


            const matchesSearch =

                title.includes(
                    searchText
                )

                ||

                description.includes(
                    searchText
                );


            const matchesPriority =

                selectedPriority === "all"

                ||

                task.priority ===
                    selectedPriority;


            const matchesUser =

                selectedUser === "all"

                ||

                user === selectedUser;


            return (

                matchesSearch &&

                matchesPriority &&

                matchesUser

            );

        });


    displayTasks(filteredTasks);

}


// ========================================
// LOAD USERS DYNAMICALLY
// ========================================

function loadUsers() {


    userFilter.innerHTML = `

        <option value="all">
            All Users
        </option>

    `;


    const users = [

        ...new Set(

            tasks

                .map(
                    task =>
                        task.user
                )

                .filter(
                    user =>
                        user &&
                        user.trim() !== ""
                )

        )

    ];


    users.forEach(user => {


        const option =
            document.createElement(
                "option"
            );


        option.value =
            user;


        option.textContent =
            user;


        userFilter.appendChild(
            option
        );

    });

}


// ========================================
// UPDATE COUNTS
// ========================================

function updateCounts() {


    const todo =
        tasks.filter(
            task =>
                task.status ===
                "todo"
        ).length;


    const progress =
        tasks.filter(
            task =>
                task.status ===
                "in-progress"
        ).length;


    const completed =
        tasks.filter(
            task =>
                task.status ===
                "completed"
        ).length;


    todoCount.textContent =
        todo;


    progressCount.textContent =
        progress;


    completedCount.textContent =
        completed;

}


// ========================================
// DRAG AND DROP
// ========================================

const columns = [

    todoTasks,

    progressTasks,

    completedTasks

];


columns.forEach(column => {


    // Allow drop

    column.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

        }
    );


    // Drop

    column.addEventListener(
        "drop",
        async event => {

            event.preventDefault();


            if (
                draggedTaskId === null
            ) {

                return;

            }


            const newStatus =
                column.dataset.status;


            await changeTaskStatus(
                draggedTaskId,
                newStatus
            );


            draggedTaskId = null;

        }
    );

});


// ========================================
// CHANGE TASK STATUS
// ========================================

async function changeTaskStatus(
    id,
    newStatus
) {


    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    if (!task) {

        console.error(
            "Task not found:",
            id
        );

        return;

    }


    const updatedTask = {

        ...task,

        status:
            newStatus

    };


    try {


        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(id)}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedTask
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to change status"
            );

        }


        await loadTasks();

    }


    catch (error) {

        console.error(
            "Error changing task status:",
            error
        );

        alert(
            "Unable to change task status."
        );

    }

}


// ========================================
// START APPLICATION
// ========================================

loadTasks();