// Add tasks to a list so that I can keep track of them
const taskList = document.querySelector("#todo-list");
const completedList = document.querySelector("#done-list");
const form = document.getElementById("task-form");
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
let nextId = 1;

//saves any new task to local storage
const saveTasksToLocalStorage = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//loads data from local storage each time the page is reloaded
const loadTasksFromLocalStorage = () => {
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    if (task.completed) {
      completedList.appendChild(taskElement);
    } else {
      taskList.appendChild(taskElement);
    }
  });

  completedTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    completedList.appendChild(taskElement);
  });

  if (taskList.childElementCount > 0) {
    const tasksTitle = document.createElement("h3");
    tasksTitle.textContent = "To Do";
    taskList.prepend(tasksTitle);
  }

  if (completedList.childElementCount > 0) {
    addCompletedHeader(completedList);
  }
};

//filters tasks which have checked checkboxes, hiding complete tasks
//after this, will display an option to show all tasks, irrespective of their completion status
const filterCheckedTasks = () => {
  const taskItems = document.querySelectorAll("#todo-list .task");
  const completedTaskItems = document.querySelectorAll("#done-list .task");

  if (filterIncompleteBtn.textContent === "Show Incomplete Tasks") {
    taskItems.forEach((taskItem) => {
      const checkbox = taskItem.querySelector(".todo-item");
      if (checkbox.checked) {
        taskItem.style.display = "none";
      }
    });

    completedTaskItems.forEach((taskItem) => {
      taskItem.style.display = "none";
    });

    filterIncompleteBtn.textContent = "Show All Tasks";
  } else {
    taskItems.forEach((taskItem) => {
      taskItem.style.display = "list-item";
    });

    completedTaskItems.forEach((taskItem) => {
      taskItem.style.display = "list-item";
    });

    filterIncompleteBtn.textContent = "Show Incomplete Tasks";
  }
};

//event listener for the filter button
const filterIncompleteBtn = document.getElementById("filter-incomplete-btn");
filterIncompleteBtn.addEventListener("click", filterCheckedTasks);

//create an array of objects
const addTask = (array, item) => {
  let task = array.find((task) => task.name === item);
  if (!task) {
    task = { id: nextId++, name: item, completed: false };
    array.push(task); 
    saveTasksToLocalStorage();
  }
  return task;
};

//create element from html template
const createTaskElement = (task) => {
  const newTaskTemplate = document.querySelector("#newTaskTemplate");
  const newTask = newTaskTemplate.content.cloneNode(true);
  newTask.querySelector("label").textContent = task.name;
  const taskItem = newTask.querySelector(".task");
  const checkbox = newTask.querySelector(".todo-item");
  checkbox.addEventListener("change", taskDone);
  taskList.addEventListener("click", deleteItem);
  completedList.addEventListener("click", deleteItem);
  return newTask;
};

//with each task created, add it to the list
const addTasksToList = (tasks, isCompleted = false) => {
  const taskList = isCompleted ? document.getElementById("completed-tasks") : document.getElementById("tasks");

  for (let task of tasks) {
    const taskItem = document.createElement("li");
    taskItem.innerText = task.title;

    if (isCompleted) {
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.addEventListener("click", () => {
        moveTask(task.id, true);
      });
      taskItem.appendChild(deleteBtn);
    } else {
      const completeBtn = document.createElement("button");
      completeBtn.innerText = "Complete";
      completeBtn.addEventListener("click", () => {
        completedTasks(task.id);
      });
      taskItem.appendChild(completeBtn);
    }

    taskList.appendChild(taskItem);
  }
};

//on submission, get the values from the input and execute the functions above
const submitTask = (event) => {
  event.preventDefault();
  const taskInput = document.querySelector("#input-task");
  const taskName = taskInput.value.trim();
  const task = addTask(tasks, taskName);
  if (taskName !== "") {
    const taskElement = createTaskElement(task);
    if (task.completed) {
      completedList.appendChild(taskElement);
      if (!completedList.querySelector("h3")) {
        addCompletedHeader(completedList);
      }
    } else {
      taskList.appendChild(taskElement);
      if (!taskList.querySelector("h3")) {
        const tasksTitle = document.createElement("h3");
        tasksTitle.textContent = "To Do";
        taskList.prepend(tasksTitle);
      }
    }
    taskInput.value = "";
  }
  document.forms[0].reset();
};

form.addEventListener("submit", submitTask);

//moves tasks from one list to the other based on if the task is complete - probably best if we move 
// locate storage function to it's independent function
const moveTask = (taskItem, todoList, doneList) => {
  todoList.removeChild(taskItem);
  doneList.appendChild(taskItem);
};

//create header for completed tasks if there isn't one
const addCompletedHeader = (completedList) => {
  const completedTitle = document.createElement("h3");
  completedTitle.textContent = "Completed";
  completedList.prepend(completedTitle);
};

//move the tasks back and forth
const moveTask2 = (taskItem, todoList, completedList) => {
  todoList.removeChild(taskItem);
  if (!completedList.querySelector("h3")) {
    addCompletedHeader(completedList);
  }
  completedList.appendChild(taskItem);
  const taskName = taskItem.querySelector("label").textContent;
  const taskIndex = tasks.findIndex((task) => task.name === taskName);
  if (taskIndex !== -1) {
    const completedTask = tasks.splice(taskIndex, 1)[0];
    completedTask.completed = true;
    completedTasks.push(completedTask);
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
};

//if it's checked move these tasks around with the functions above
const taskDone = (e) => {
  const taskItem = e.target.parentNode.parentNode;
  if (e.target.checked) {
    moveTask2(taskItem, taskList, completedList);
  } else {
    moveTask(taskItem, completedList, taskList);
    const taskName = taskItem.querySelector("label").textContent;
    const task = tasks.find((task) => task.name === taskName);
    task.completed = false;
    const completedIndex = completedTasks.findIndex(
      (completedTask) => completedTask.name === taskName
    );
    completedTasks.splice(completedIndex, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }
};


//   Delete things from the list if I don’t need to do them anymore
const deleteItem = (event) => {
  if (event.target.matches("#delete-button")) {
    const taskItem = event.target.closest(".task");
    const taskName = taskItem.querySelector("label").textContent;
    const task = tasks.find((task) => task.name === taskName);
    const completedTask = completedTasks.find((task) => task.name === taskName);
    
    if (task) {
      const taskIndex = tasks.indexOf(task);
      tasks.splice(taskIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      taskList.removeChild(taskItem);
    } else if (completedTask) {
      const completedIndex = completedTasks.indexOf(completedTask);
      completedTasks.splice(completedIndex, 1);
      localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
      completedList.removeChild(taskItem);
    }    
  }
}

loadTasksFromLocalStorage();