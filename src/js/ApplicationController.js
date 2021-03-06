/**
 * Creates a new Application Controller.
 *
 * @constructor
 */
mindmaps.ApplicationController = function(modules = [], modulesConfig = []) {
  var eventBus = new mindmaps.EventBus();
  eventBus.setMaxListeners(20);

  var shortcutController = new mindmaps.ShortcutController();
  var commandRegistry = new mindmaps.CommandRegistry(shortcutController);
  var undoController = new mindmaps.UndoController(eventBus, commandRegistry);
  var mindmapModel = new mindmaps.MindMapModel(eventBus, commandRegistry, undoController, modulesConfig.MindMapModel? modulesConfig.MindMapModel : {rootText: 'Central Idea'});
  var clipboardController = new mindmaps.ClipboardController(eventBus,
      commandRegistry, mindmapModel);
  var printController = new mindmaps.PrintController(eventBus,
      commandRegistry, mindmapModel);
  var autosaveController = new mindmaps.AutoSaveController(eventBus, mindmapModel);
  var filePicker = new mindmaps.FilePicker(eventBus, mindmapModel);

  /**
   * Handles the new document command.
   */
  function doNewDocument() {
    // close old document first
    var doc = mindmapModel.getDocument();
    doCloseDocument();

    var presenter = new mindmaps.NewDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.NewDocumentView());
    presenter.go();
  }

  /**
   * Handles the save document command.
   */
  function doSaveDocument() {
    var presenter = new mindmaps.SaveDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.SaveDocumentView(), autosaveController, filePicker);
    presenter.go();
  }

  /**
   * Handles the close document command.
   */
  function doCloseDocument() {
    var doc = mindmapModel.getDocument();
    if (doc) {
      // TODO for now simply publish events, should be intercepted by
      // someone
      mindmapModel.setDocument(null);
    }
  }

  /**
   * Handles the open document command.
   */
  function doOpenDocument() {
    var presenter = new mindmaps.OpenDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.OpenDocumentView(), filePicker);
    presenter.go();
  }

  function doExportDocument() {
    var presenter = new mindmaps.ExportMapPresenter(eventBus,
        mindmapModel, new mindmaps.ExportMapView());
    presenter.go();
  }

  this.openDocument = function(result) {
    try {
      console.log(result);
      var doc = mindmaps.Document.fromObject(result);
      mindmapModel.setDocument(doc);
    } catch (e) {
      console.log(e);
      eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR, "Could not read the file.");
      console.warn("Could not open the mind map via drag and drop.");
    }
  }

  /**
   * Initializes the controller, registers for all commands and subscribes to
   * event bus.
   */
  this.init = function() {
    var newDocumentCommand = commandRegistry
        .get(mindmaps.NewDocumentCommand);
    newDocumentCommand.setHandler(doNewDocument);
    newDocumentCommand.setEnabled(true);

    var openDocumentCommand = commandRegistry
        .get(mindmaps.OpenDocumentCommand);
    openDocumentCommand.setHandler(doOpenDocument);
    openDocumentCommand.setEnabled(true);

    var saveDocumentCommand = commandRegistry
        .get(mindmaps.SaveDocumentCommand);
    saveDocumentCommand.setHandler(doSaveDocument);

    var closeDocumentCommand = commandRegistry
        .get(mindmaps.CloseDocumentCommand);
    closeDocumentCommand.setHandler(doCloseDocument);

    var exportCommand = commandRegistry.get(mindmaps.ExportCommand);
    exportCommand.setHandler(doExportDocument);

    eventBus.subscribe(mindmaps.Event.DOCUMENT_CLOSED, function() {
      saveDocumentCommand.setEnabled(false);
      closeDocumentCommand.setEnabled(false);
      exportCommand.setEnabled(false);
    });

    eventBus.subscribe(mindmaps.Event.DOCUMENT_OPENED, function() {
      saveDocumentCommand.setEnabled(true);
      closeDocumentCommand.setEnabled(true);
      exportCommand.setEnabled(true);
    });
  };

  /**
   * Launches the main view controller.
   */
  this.go = function(extraConfig) {
    var viewController = new mindmaps.MainViewController(eventBus,
        mindmapModel, commandRegistry);
    viewController.go();
    doNewDocument();

    for (let moduleName in modules) {
      if (modulesConfig[moduleName]) {
        new modules[moduleName](eventBus, mindmapModel, modulesConfig[moduleName]);
      } else {
        new modules[moduleName](eventBus, mindmapModel);
      }
    }
  };

  this.init();
};
