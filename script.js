// Global file system for Home.
var fileSystem = {
  name: "Home",
  type: "folder",
  createdAt: Date.now(),
  children: []
};

// Global arrays for Starred and Bin.
var starredFolder = [];
var binFolder = [];

// currentPath tracks the folder hierarchy; starts with Home.
var currentPath = [fileSystem];
var folderContextMenu = $("#folderContextMenu");

// Helper: Set default grid positions for items that have no positions.
function resetPositions(folder) {
  var cellWidth = 120, cellHeight = 120;
  folder.children.forEach(function(item, i) {
    item.posX = (i % 4) * cellWidth;
    item.posY = Math.floor(i / 4) * cellHeight;
  });
}

// Sorting helpers.
function sortFilesAndFoldersByName(folder) {
  folder.children.sort((a, b) => a.name.localeCompare(b.name));
  resetPositions(folder);
}
function sortFilesAndFoldersByTime(folder) {
  folder.children.sort((a, b) => a.createdAt - b.createdAt);
  resetPositions(folder);
}

// Render the current folder view.
function renderCurrentFolder() {
  // Render breadcrumb.
  var breadcrumb = $(".breadcrumb");
  breadcrumb.empty();
  currentPath.forEach(function(folder, i) {
    var isLast = (i === currentPath.length - 1);
    var crumb = $('<span class="breadcrumb-item"></span>')
      .text(folder.name)
      .attr("data-index", i);
    if (!isLast) { crumb.addClass("clickable"); }
    else { crumb.addClass("current"); }
    breadcrumb.append(crumb);
    if (i < currentPath.length - 1) { breadcrumb.append(" / "); }
  });

  // Render items inside the current folder.
  var currentFolder = currentPath[currentPath.length - 1];
  var folderView = $('<div class="folder-view"></div>');
  currentFolder.children.forEach(function(item, i) {
    if (typeof item.posX === "undefined" || typeof item.posY === "undefined") {
      var cellWidth = 120, cellHeight = 120;
      item.posX = (i % 4) * cellWidth;
      item.posY = Math.floor(i / 4) * cellHeight;
    }
  });
  if (currentFolder.children && currentFolder.children.length > 0) {
    currentFolder.children.forEach(function(item) {
      var el;
      if (item.type === "folder") {
        el = $('<div class="folder"></div>');
        el.append('<span class="folder-icon">&#128193;</span>');
        el.append('<span class="folder-name">' + item.name + "</span>");
        el.data("folderObj", item);
        el.click(function() {
          currentPath.push(item);
          renderCurrentFolder();
        });
      } else if (item.type === "file") {
        el = $('<div class="file"></div>');
        el.append('<span class="file-icon">&#128196;</span>');
        el.append('<span class="file-name">' + item.name + "</span>");
        el.data("fileObj", item);
        el.on("dblclick", function() {
          openNotepad($(this).data("fileObj"));
        });
      } else if (item.type === "image") {
        el = $('<div class="file"></div>');
        el.append('<img src="' + item.content + '" class="image-thumb" alt="'+item.name+'"/>');
        el.append('<span class="file-name">' + item.name + "</span>");
        el.data("fileObj", item);
        el.on("dblclick", function() {
          openImageModal($(this).data("fileObj"));
        });
      }
      if (el) {
        el.css({ left: item.posX + "px", top: item.posY + "px" });
        el.draggable({
          containment: ".content-area",
          stop: function(event, ui) {
            item.posX = ui.position.left;
            item.posY = ui.position.top;
          }
        });
        folderView.append(el);
      }
    });
  } else {
    folderView.append("<div class='main_area'><h1 style='font-size:90px' class='font' >Lets Get Started..</h1><img height='450px' width='450px' src='./images/cloud-acceleration-svgrepo-com.png'/></div>");
  }
  $(".content-area").empty().append(folderView);
}

// Render the Starred view.
function renderStarred() {
  $(".breadcrumb").empty().append('<span class="breadcrumb-item current">Starred</span>');
  var folderView = $('<div class="folder-view"></div>');
  if (starredFolder.length > 0) {
    starredFolder.forEach(function(item, i) {
      var cellWidth = 120, cellHeight = 120;
      if (typeof item.posX === "undefined" || typeof item.posY === "undefined") {
        item.posX = (i % 4) * cellWidth;
        item.posY = Math.floor(i / 4) * cellHeight;
      }
      var el;
      if (item.type === "folder") {
        el = $('<div class="folder"></div>');
        el.append('<span class="folder-icon">&#128193;</span>');
        el.append('<span class="folder-name">' + item.name + "</span>");
        el.data("folderObj", item);
        el.click(function() { alert("Restoration not implemented."); });
      } else if (item.type === "file") {
        el = $('<div class="file"></div>');
        el.append('<span class="file-icon">&#128196;</span>');
        el.append('<span class="file-name">' + item.name + "</span>");
        el.data("fileObj", item);
        el.on("dblclick", function() {
          openNotepad($(this).data("fileObj"));
        });
      } else if (item.type === "image") {
        el = $('<div class="file"></div>');
        el.append('<img src="' + item.content + '" class="image-thumb" alt="'+item.name+'" />');
        el.append('<span class="file-name">' + item.name + "</span>");
        el.data("fileObj", item);
        el.on("dblclick", function() {
          openImageModal($(this).data("fileObj"));
        });
      }
      if (el) {
        el.css({ left: item.posX + "px", top: item.posY + "px" });
        el.draggable({
          containment: ".content-area",
          stop: function(event, ui) {
            item.posX = ui.position.left;
            item.posY = ui.position.top;
          }
        });
        folderView.append(el);
      }
    });
  } else {
    folderView.append("<p>Starred is empty.</p>");
  }
  var backBtn = $('<button class="backBtn">Back to Home</button>');
  backBtn.click(function() {
    currentPath = [fileSystem];
    renderCurrentFolder();
  });
  $(".content-area").empty().append(backBtn).append(folderView);
}

// Render the Bin view.
function renderBin() {
  $(".breadcrumb").empty().append('<span class="breadcrumb-item current">Bin</span>');
  var folderView = $('<div class="folder-view"></div>');
  if (binFolder.length > 0) {
    binFolder.forEach(function(item, i) {
      var cellWidth = 120, cellHeight = 120;
      if (typeof item.posX === "undefined" || typeof item.posY === "undefined") {
        item.posX = (i % 4) * cellWidth;
        item.posY = Math.floor(i / 4) * cellHeight;
      }
      var el;
      if (item.type === "folder") {
        el = $('<div class="folder"></div>');
        el.append('<span class="folder-icon">&#128193;</span>');
        el.append('<span class="folder-name">' + item.name + "</span>");
        el.data("folderObj", item);
        el.click(function() { alert("Restoration not implemented."); });
      } else if (item.type === "file") {
        el = $('<div class="file"></div>');
        el.append('<span class="file-icon">&#128196;</span>');
        el.append('<span class="file-name">' + item.name + "</span>");
        el.data("fileObj", item);
        el.on("dblclick", function() {
          openNotepad($(this).data("fileObj"));
        });
      } else if (item.type === "image") {
        el = $('<div class="file"></div>');
        el.append('<img src="' + item.content + '" class="image-thumb" alt="'+item.name+'" />');
        el.append('<span class="file-name">' + item.name + "</span>");
        el.data("fileObj", item);
        el.on("dblclick", function() {
          openImageModal($(this).data("fileObj"));
        });
      }
      if (el) {
        el.css({ left: item.posX + "px", top: item.posY + "px" });
        el.draggable({
          containment: ".content-area",
          stop: function(event, ui) {
            item.posX = ui.position.left;
            item.posY = ui.position.top;
          }
        });
        folderView.append(el);
      }
    });
  } else {
    folderView.append("<p>Bin is empty.</p>");
  }
  var backBtn = $('<button class="backBtn">Back to Home</button>');
  backBtn.click(function() {
    currentPath = [fileSystem];
    renderCurrentFolder();
  });
  $(".content-area").empty().append(backBtn).append(folderView);
}

// Open notepad.
function openNotepad(fileObj) {
  $("#notepadFileName").text(fileObj.name);
  $("#notepadContent").val(fileObj.content || "");
  $("#notepadModal").data("fileObj", fileObj).fadeIn(200);
}

// Open image modal.
function openImageModal(fileObj) {
  $("#imageFileName").text(fileObj.name);
  $("#imageContent").attr("src", fileObj.content);
  $("#imageModal").data("fileObj", fileObj).fadeIn(200);
}

// Handle folder upload.
function handleFolderUpload(files) {
  if (files.length === 0) return;
  var firstFile = files[0];
  var basePath = firstFile.webkitRelativePath.split("/")[0];
  var newFolder = {
    name: basePath,
    type: "folder",
    createdAt: Date.now(),
    children: []
  };
  var remaining = files.length;
  Array.from(files).forEach(function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var fileContent = e.target.result;
      var fileObj = {
        name: file.name,
        type: "file",
        createdAt: Date.now(),
        content: fileContent
      };
      newFolder.children.push(fileObj);
      remaining--;
      if (remaining === 0) {
        var currFolder = currentPath[currentPath.length - 1];
        currFolder.children.push(newFolder);
        renderCurrentFolder();
      }
    };
    reader.readAsText(file);
  });
}

$(document).ready(function() {
  renderCurrentFolder();

  // Navigation: Home.
  $("#home a.navLink").click(function(e) {
    e.preventDefault();
    currentPath = [fileSystem];
    renderCurrentFolder();
  });

  // Navigation: Starred.
  $("#starredLink").click(function(e) {
    e.preventDefault();
    renderStarred();
  });

  // Navigation: Bin.
  $("#binLink").click(function(e) {
    e.preventDefault();
    renderBin();
  });

  // Breadcrumb navigation.
  $(".breadcrumb").on("click", ".breadcrumb-item.clickable", function() {
    var idx = parseInt($(this).attr("data-index"), 10);
    currentPath = currentPath.slice(0, idx + 1);
    renderCurrentFolder();
  });

  // Sorting buttons.
  $("#sortByName").click(function() {
    var currentFolder = currentPath[currentPath.length - 1];
    sortFilesAndFoldersByName(currentFolder);
    renderCurrentFolder();
  });
  $("#sortByTime").click(function() {
    var currentFolder = currentPath[currentPath.length - 1];
    sortFilesAndFoldersByTime(currentFolder);
    renderCurrentFolder();
  });

  // New button.
  $("#newButton").click(function() {
    $("#newModal").fadeIn(200);
  });

  // Close modals.
  $(".close").click(function() {
    $(this).closest(".modal").fadeOut(200);
  });

  // New Modal actions.
  $("#folderCreate").click(function() {
    $("#newModal").fadeOut(200);
    $("#folderCreateModal").data("currentFolder", currentPath[currentPath.length - 1]).fadeIn(200);
  });
  $("#fileCreate").click(function() {
    $("#newModal").fadeOut(200);
    $("#fileCreateModal").data("currentFolder", currentPath[currentPath.length - 1]).fadeIn(200);
  });
  $("#fileUpload").click(function() {
    $("#newModal").fadeOut(200);
    $("#fileUploadInput").click();
  });
  $("#folderUpload").click(function() {
    $("#newModal").fadeOut(200);
    $("#folderUploadInput").click();
  });
  $("#imageUpload").click(function() {
    $("#newModal").fadeOut(200);
    $("#imageUploadInput").click();
  });

  // Handle file upload.
  $("#fileUploadInput").on("change", function(e) {
    var files = e.target.files;
    if (files.length > 0) {
      var file = files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        var content = e.target.result;
        var newFile = {
          name: file.name,
          type: "file",
          createdAt: Date.now(),
          content: content
        };
        var currFolder = currentPath[currentPath.length - 1];
        currFolder.children.push(newFile);
        renderCurrentFolder();
      };
      reader.readAsText(file);
    }
    $(this).val("");
  });

  // Handle folder upload.
  $("#folderUploadInput").on("change", function(e) {
    var files = e.target.files;
    if (files.length > 0) { handleFolderUpload(files); }
    $(this).val("");
  });

  // Handle image upload.
  $("#imageUploadInput").on("change", function(e) {
    var files = e.target.files;
    if (files.length > 0) {
      var file = files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        var dataUrl = e.target.result;
        var newImage = {
          name: file.name,
          type: "image",
          createdAt: Date.now(),
          content: dataUrl
        };
        var currFolder = currentPath[currentPath.length - 1];
        currFolder.children.push(newImage);
        renderCurrentFolder();
      };
      reader.readAsDataURL(file);
    }
    $(this).val("");
  });

  // Folder creation.
  $("#createFolder").click(function() {
    var folderName = $("#folderName").val().trim();
    if (!folderName) { alert("Please enter a folder name."); return; }
    var currFolder = $("#folderCreateModal").data("currentFolder");
    var exists = currFolder.children.some(function(child) {
      return child.name.toLowerCase() === folderName.toLowerCase();
    });
    if (exists) { alert("A file or folder with this name already exists. Please choose a different name."); return; }
    var newFolder = {
      name: folderName,
      type: "folder",
      createdAt: Date.now(),
      children: []
    };
    currFolder.children.push(newFolder);
    $("#folderName").val("");
    $("#folderCreateModal").fadeOut(200);
    renderCurrentFolder();
  });

  // File creation.
  $("#submitFileCreate").click(function() {
    var fileName = $("#fileNameInput").val().trim();
    if (!fileName) { alert("Please enter a valid file name."); return; }
    if (!fileName.toLowerCase().endsWith(".txt")) { fileName += ".txt"; }
    var currFolder = $("#fileCreateModal").data("currentFolder");
    var exists = currFolder.children.some(function(child) {
      return child.name.toLowerCase() === fileName.toLowerCase();
    });
    if (exists) { alert("A file or folder with this name already exists. Please choose a different name."); return; }
    var newFile = {
      name: fileName,
      type: "file",
      createdAt: Date.now(),
      content: ""
    };
    currFolder.children.push(newFile);
    $("#fileNameInput").val("");
    $("#fileCreateModal").fadeOut(200);
    renderCurrentFolder();
  });

  // Notepad save.
  $("#saveNotepad").click(function() {
    var fileObj = $("#notepadModal").data("fileObj");
    fileObj.content = $("#notepadContent").val();
    $("#notepadModal").fadeOut(200);
  });

  // Context menu handling.
  $(document).on("contextmenu", ".folder-view, .folder-view *", function(e) {
    e.preventDefault();
    var clickedItem = $(e.target).closest(".file, .folder");
    folderContextMenu.css({ top: e.pageY, left: e.pageX }).fadeIn(200);
    if (clickedItem.length > 0) {
      folderContextMenu.data("clickedItem", clickedItem);
      $("#contextDetails").show();
    } else {
      folderContextMenu.data("clickedItem", null);
      $("#contextDetails").hide();
    }
    folderContextMenu.data("currentFolder", currentPath[currentPath.length - 1]);
  });
  $(document).click(function(e) {
    if (!$(e.target).closest("#folderContextMenu").length) { folderContextMenu.fadeOut(200); }
  });
  
  // Context menu actions.
  $("#contextFileCreate").click(function() {
    folderContextMenu.fadeOut(200);
    $("#fileCreateModal").data("currentFolder", currentPath[currentPath.length - 1]).fadeIn(200);
  });
  $("#contextFolderCreate").click(function() {
    folderContextMenu.fadeOut(200);
    $("#folderCreateModal").data("currentFolder", currentPath[currentPath.length - 1]).fadeIn(200);
  });
  
  // New context menu option: Copy to Star (does not remove item).
  $("#contextMoveToStar").click(function() {
    folderContextMenu.fadeOut(200);
    var clickedItem = folderContextMenu.data("clickedItem");
    if (clickedItem && clickedItem.length > 0) {
      var item;
      if (clickedItem.hasClass("file")) { item = clickedItem.data("fileObj"); }
      else if (clickedItem.hasClass("folder")) { item = clickedItem.data("folderObj"); }
      if (item) {
        // Create a deep copy using $.extend(true, {}, item)
        var copiedItem = $.extend(true, {}, item);
        // Optionally, update the createdAt to now if desired.
        copiedItem.createdAt = Date.now();
        starredFolder.push(copiedItem);
        renderCurrentFolder();
        alert("A copy has been added to Starred.");
      }
    }
  });
  
  // Context menu option: Move to Bin.
  $("#contextMoveToBin").click(function() {
    folderContextMenu.fadeOut(200);
    var clickedItem = folderContextMenu.data("clickedItem");
    if (clickedItem && clickedItem.length > 0) {
      var item;
      if (clickedItem.hasClass("file")) { item = clickedItem.data("fileObj"); }
      else if (clickedItem.hasClass("folder")) { item = clickedItem.data("folderObj"); }
      if (item) {
        var currFolder = currentPath[currentPath.length - 1];
        var index = currFolder.children.findIndex(function(child) {
          return child.name === item.name &&
                 child.type === item.type &&
                 child.createdAt === item.createdAt;
        });
        if (index > -1) {
          currFolder.children.splice(index, 1);
          binFolder.push(item);
          renderCurrentFolder();
          alert("Item moved to Bin");
        }
      }
    }
  });
  
  // Context menu option: !Details.
  $("#contextDetails").click(function() {
    folderContextMenu.fadeOut(200);
    var clickedItem = folderContextMenu.data("clickedItem");
    if (clickedItem && clickedItem.length > 0) {
      var details;
      if (clickedItem.hasClass("file")) { details = clickedItem.data("fileObj"); }
      else if (clickedItem.hasClass("folder")) { details = clickedItem.data("folderObj"); }
      if (details) {
        var name = details.name;
        var size;
        if (details.type === "file") { size = (details.content ? details.content.length : 0) + " characters"; }
        else if (details.type === "image") { size = "Image file"; }
        else { size = details.children.length + " items"; }
        var createdAt = new Date(details.createdAt).toLocaleString();
        $("#detailsName").text(name);
        $("#detailsSize").text(size);
        $("#detailsCreatedAt").text(createdAt);
        $("#detailsModal").fadeIn(200);
      } else {
        alert("No details available.");
      }
    }
  });
});
