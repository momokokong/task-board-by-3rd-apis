// script.js is the only js as the main to initialize/handle localstorage data, add a task via a modal, delete a task, 
// sort tasks across swimlanes, changing task status accordingly, prepping the html task cards and rendering the cards.
// Past due tasks are red, tasks on the current day are yellow and tasks in the future are white.
// Any tasks in the done swimland are also white while follow the above rules if in the other two swimlanes.

// Global variables:
// taskList - an array containing all the task.  Stored in localstorage.
// nextId - the next available task ID which should be assigned to a new task.  Stored in localstorage.
// todo, inProgress, done - const strings that indicate the status/swimlane of a task. Manipulated as html id attributes.  

let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = localStorage.getItem("nextId");

const todo = "todo";
const inProgress = "in-progress";
const done = "done";

// Increase taskId and store in localstorage
// function: generateTaskId()
// parameter: none
// return: none
// Used when the currently available ID is taken.  Increase nextId by one then store in localstorage.
function generateTaskId() {
  nextId++;
  localStorage.setItem("nextId", nextId);
}

// Create and append html elements of the task cards
// Function: createTaskCard()
// parameter: task - individual task object
// return: none
// First by locating the kanban swimlane based on task.swimlane and determine the card color theme by 
// task.dueDate.  Then prep the html elements accordingly and append to the kanban swimlane.
function createTaskCard(task) {
  // locating the swimlane html id.
  const kanbanEl = $("#"+task.swimlane+"-kanban");

  // determine color theme based on due date and current date and swimlanes. 
  const dayLeft = dayjs(task.dueDate).diff(dayjs(),"day");
  let bgColor = "bg-white";
  if (task.swimlane !== done){
    if (dayLeft < 0){
      bgColor = "bg-danger";
    } else if (task.dueDate === dayjs().format("MM/DD/YYYY")) {
      bgColor = "bg-warning";
    } 
  }

  // Starting here is to prep the html elements to show the task as a card in the swimlanes.
  // Note that task.ID is embedded in the li and button for uses in handleDeleteTask() and handleDrop()
  const liEl = $("<li>");
  liEl.attr("id", "id-"+task.ID);

  const cardEl = $("<div>");
  cardEl.attr("class", bgColor + " rounded m-3 border ui-widget-content");

  const h3El = $("<h3>");
  h3El.attr("class", "card-header");
  h3El.text(task.title);

  const cardBodyEl = $("<div>");
  cardBodyEl.attr("class", "card-body");

  const descEl = $("<p>");
  descEl.attr("class", "card-text");
  descEl.text(task.desc);

  const dueDateEl = $("<p>");
  dueDateEl.attr("class", "card-text");
  dueDateEl.text(dayjs(task.dueDate).format("MM/DD/YYYY"));

  const buttonEl = $("<button>");
  buttonEl.attr({"class": "btn btn-danger btn-block my-1 border delete", "id":"delete-id-"+task.ID});
  buttonEl.text("Delete");

  cardBodyEl.append(descEl, dueDateEl, buttonEl);
  cardEl.append(h3El, cardBodyEl);
  liEl.append(cardEl);
  kanbanEl.append(liEl);
}

// Render tha tasks onto the page
// Function: renderTaskList()
// parameter: none
// return: none
// First clear all task cards and modal input fields.  Then add each task card to the page.  
// Make the swimlanes sortable and connected and add a click listener to all available Delete buttons
function renderTaskList() {
  // clear all task cards and modal input fields
  $("#task-title").val("");
  $("#task-due-date").val("");
  $("#task-description").val("");
  $("#form-reminder, #todo-kanban, #in-progress-kanban, #done-kanban").text("");
  
  // add each task card to the page.  If a task object is null that means it's been removed.
  taskList.forEach(task => {
    if (task !== null) createTaskCard(task);
  });

  // Make the swimlanes sortable and connected.  Set up a "receive" event listender to trigger handleDrop()
  // Also make the Delete button not responding to dragging
  $("#todo-kanban, #in-progress-kanban, #done-kanban").sortable({
    connectWith: ".kanban",
    cursor: "move", 
    helper: "clone", 
    receive: handleDrop, 
    cancel: ".delete"
  });

  // add a click listener to all available Delete buttons
  $("li").on("click", ".delete", handleDeleteTask);
}

// Retrieve the user inputs and save in taskList
// Function: handleAddTask(event)
// parameter: event: the click event.  Not used.
// return: none
// Check whether all input fields have valid input.  If so, create/save the task object, generate the next taskId,
// and hide the modal. (Also trigger the "hidden.bs.modal" listner that renders the page)  If not, show a reminder.
function handleAddTask(event){
  const taskTitle = $("#task-title").val().trim();
  const taskDueDate = $("#task-due-date").val().trim();
  const taskDescription = $("#task-description").val().trim();

  // Check whether all input fields have valid input.
  if (taskTitle.length > 0 && taskDueDate.length > 0 && taskDescription.length > 0) {
    // the task object structure and save it to taskList
    const task = {
      title: taskTitle,
      dueDate: taskDueDate,
      desc: taskDescription,
      swimlane: todo,
      ID: nextId,
    };
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    // generate the next taskId give the current one is occupied
    generateTaskId();  
    $("#formModal").modal('hide'); // hide the modal and trigger "hidden.bs.modal" to render the page
  } else {
    // invalid input reminder.
    $("#form-reminder").text("*You must have something, right?  Make sure each field has something.")
  }
}

// Delete a task and update taskList/localstorage accordinly.
// Function: handleDeleteTask(event)
// parameter: event: the click event.
// return: none
// Get the task ID from the event.target's (= button) id attribute.  Then remove the whole li element which has the
// task ID as html id attribute.  Save the task as a null object in the taskList array and update localstorage.   
function handleDeleteTask(event){
  // Getting the task ID from the button to locate the correct li element for removal
  const buttonID = $(event.target).attr("id");
  const liID = buttonID.slice(buttonID.indexOf("delete-") + 7);
  const taskID = liID.slice(liID.indexOf("-") + 1);
  $("li").remove("#"+liID);

  // Save the task as a null object in the taskList array and update localstorage
  taskList[taskID] = null;
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

// Update the task status whenever a swimnlane receives a task
// Function: handleDrop(event, ui)
// parameter: event: event.target is the receiving swimlane.  ui: ui.item is the dropping task.
// return: none
// Get the task ID from ui.item.  The update the specific task object in taskList with the updated swimlane.
// Update localstorage then render the cards again.
function handleDrop(event, ui) {
  const taskID = $(ui.item).attr("id").slice(3);
  taskList[taskID].swimlane = $(event.target).attr("id").slice(0, -7);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// This section is to initiate the page or localstorage data accordingly when the page is loaded.
$(document).ready(function () {
  // if taskList contains nothing, assign an empty array and 0 to taskList and nextId respectively.
  if (!taskList){
    localStorage.setItem("tasks",JSON.stringify([]));
    localStorage.setItem("nextId", 0);
    taskList = JSON.parse(localStorage.getItem("tasks"));
    nextId = localStorage.getItem("nextId");
  }

  // Render the taskList
  renderTaskList();

  // set the date input field in the modal as jquery UI datepicker.
  $("#task-due-date").datepicker({
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
  });

  // Listener to trigger handleAddTask when the Add task button is clicked within the modal.
  $("#task-form").on("click", "#task-submit", handleAddTask);
  

  // Render the list once the modal form is closed.
  $("#formModal").on("hidden.bs.modal", function() {
    renderTaskList();
  });
});
