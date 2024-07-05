// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = localStorage.getItem("nextId");

const todo = "todo";
const inProgress = "in-progress";
const done = "done";

// Todo: create a function to generate a unique task id
function generateTaskId() {
  nextId++;
  localStorage.setItem("nextId", nextId);
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const kanbanEl = $("#"+task.swimlane+"-kanban");
  const dayLeft = dayjs(task.dueDate).diff(dayjs(),"day");
  let bgColor = "bg-white";
  if (task.swimlane !== done){
    if (dayLeft < 0){
      bgColor = "bg-danger";
    } else if (task.dueDate === dayjs().format("MM/DD/YYYY")) {
      bgColor = "bg-warning";
    } 
  }

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

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  $("#task-title").val("");
  $("#task-due-date").val("");
  $("#task-description").val("");
  $("#form-reminder, #todo-kanban, #in-progress-kanban, #done-kanban").text("");
  
  taskList.forEach(task => {
    if (task !== null) createTaskCard(task);
  });
  $("#todo-kanban, #in-progress-kanban, #done-kanban").sortable({
    connectWith: ".kanban",
    cursor: "move", 
    helper: "clone", 
    receive: handleDrop, 
    cancel: ".delete"
  });
  //Makes sure everytime add delete listener whenever tasks are rendered
  $("li").on("click", ".delete", handleDeleteTask);
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
  const taskTitle = $("#task-title").val().trim();
  const taskDueDate = $("#task-due-date").val().trim();
  const taskDescription = $("#task-description").val().trim();
  if (taskTitle.length > 0 && taskDueDate.length > 0 && taskDescription.length > 0) {
    const task = {
      title: taskTitle,
      dueDate: taskDueDate,
      desc: taskDescription,
      swimlane: todo,
      ID: nextId,
    };
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    generateTaskId();
    $("#formModal").modal('hide');
  } else {
    $("#form-reminder").text("*You must have something, right?  Make sure each field has something.")
  }
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
  const buttonID = $(event.target).attr("id");
  const liID = buttonID.slice(buttonID.indexOf("delete-") + 7);
  const taskID = liID.slice(liID.indexOf("-") + 1);
  $("li").remove("#"+liID);
  taskList[taskID] = null;
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  console.log(event);
  console.log(ui);
  const taskID = $(ui.item).attr("id").slice(3);
  console.log($(event.target).attr("id").slice(0, -7));
  taskList[taskID].swimlane = $(event.target).attr("id").slice(0, -7);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  // 1. getID
  // 2. update the task.swimlane in tasksList[ID] = target swimlan (xxxx-kanban) 
  // 3. save taskList
  // 4. render
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  if (!taskList){
    localStorage.setItem("tasks",JSON.stringify([]));
    localStorage.setItem("nextId", 0);
    taskList = JSON.parse(localStorage.getItem("tasks"));
    nextId = localStorage.getItem("nextId");
  }
  renderTaskList();


  $("#task-due-date").datepicker({
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
  });


  $("#task-form").on("click", "#task-submit", handleAddTask);
  

  // Clear everything and render the list once the modal form is closed. Add listener to delete.
  $("#formModal").on("hidden.bs.modal", function() {

    renderTaskList();

  });
});
