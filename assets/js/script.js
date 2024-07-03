// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

const todo = "todo";
const inProgress = "in-progress";
const done = "done";

// Todo: create a function to generate a unique task id
function generateTaskId() {

}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const swimlaneEl = $("#"+task.swimlane+"-cards");
  const dayLeft = dayjs(task.dueDate).diff(dayjs(),"day");
  let bgColor = "bg-white";
  if (dayLeft < 0){
    bgColor = "bg-danger";
  } else if (task.dueDate === dayjs().format("MM/DD/YYYY")) {
    bgColor = "bg-warning";
  } 

  const cardEl = $("<div>");
  cardEl.attr({"class": bgColor + " rounded m-3 border ui-widget-content", "id":"task-card"});

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
  buttonEl.attr("class", "btn btn-danger btn-block my-1 border");
  buttonEl.text("Delete");

  cardBodyEl.append(descEl, dueDateEl, buttonEl);
  cardEl.append(h3El, cardBodyEl);
  console.log(cardEl);
  swimlaneEl.append(cardEl);
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  taskList.forEach(task => {
    createTaskCard(task);
  });
  $("#task-card").draggable({ zIndex: 100,  snap: "#todo-cards, #in-progress-cards, #done-cards", snapMode: "inner", cancel: "#task-card.button"});
  // containment: "#todo-cards, #in-progress-cards, #done-cards",
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
  const taskTitle = $("#task-title").val().trim();
  const taskDueDate = $("#task-due-date").val().trim();
  const taskDescription = $("#task-description").val().trim();
  console.log("Title:"+taskTitle+" Date:" +taskDueDate+" Desc.:"+taskDescription);
  if (taskTitle.length > 0 && taskDueDate.length > 0 && taskDescription.length > 0) {
    const task = {
      title: taskTitle,
      dueDate: taskDueDate,
      desc: taskDescription,
      swimlane: todo,
    };
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    $("#formModal").modal('hide');
  } else {
    $("#form-reminder").text("*You must have something, right?  Make sure each field has something.")
  }
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  if (!taskList){
    localStorage.setItem("tasks",JSON.stringify([]));
    localStorage.setItem("nextId",JSON.stringify([]));
    taskList = JSON.parse(localStorage.getItem("tasks"));
    nextId = JSON.parse(localStorage.getItem("nextId"));
  }
  renderTaskList();

  $( function() {
    $("#task-due-date").datepicker({
      showButtonPanel: true
    });
  });

  $("#task-form").on("click", "#task-submit", handleAddTask);

  // Clear everything and render the list once the modal form is closed.
  $("#formModal").on("hidden.bs.modal", function() {
    $("#task-title").val("");
    $("#task-due-date").val("");
    $("#task-description").val("");
    $("#form-reminder").text("");
    renderTaskList();
  });
});
