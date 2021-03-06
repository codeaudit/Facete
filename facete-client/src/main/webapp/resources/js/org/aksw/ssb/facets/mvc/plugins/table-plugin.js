(function() {
 
	var ns = Namespace("org.aksw.ssb.widgets");



	/*
	var ViewItemAddToTable = ns.ViewItemLink.extend({
		/*
		initialize: function() {
			ns.ViewItemLink.prototype.initialize.apply(this);
			
			_.bindAll(this);
		},
		* /
		events: {
			'click': function() {
				this.model.get('collectionColumns').addPath(self.path);
				ev.preventDefault();
			}
		}
	});
	
	
	var ViewItemRemoveFromTable = ns.ViewItemLink.extend({
		events: {
			'click': function() {
				self.collectionColumns.removePath(self.path);
				ev.preventDefault();
			}
		}					
	});
	*/

	
	
	/**
	 * I guess we can assume that the facet tree itself is fine the way it is.
	 * 
	 * The facet tree needs to define 3 extension points:
	 * - a perma area
	 * - a hover area
	 * - a collapse area 
	 * 
	 * The question is how we can attach plugins to the facet tree.
	 * 
	 * Probably the easiest way is to do something like:
	 * 
	 * var facetTreeWidget = new WidgetFacetTree(...);
	 * 
	 * var tablePlugin = new TablePlugin(facetTreeWidget);
	 * 
	 * the table plugin then registers itself as a listener for events, such as:
	 * - nodeCreated
	 * - nodeDestroyed
	 * 
	 * and performs according actions
	 * 
	 * In a later step, nodes and plugins expose their events, so
	 * that we can validate the set up and detect e.g. missing plugins
	 * 
	 */
	ns.PluginFacetTree = Backbone.View.extend({
	
		initialize: function() {
			////console.log("[Base Plugin] initialize", this);

			_.bindAll(this);
			
			var options = this.options;
			
			////console.log("[PluginFacetTree] Options: ", options);
			
			
			
			this.facetWidget = options.facetWidget;
			this.collectionColumns = options.collectionColumns;
			
			//this.fnInstall = options.fnInstall;
			
			this.bind();
			
			//this.rootNode = rootNode;
		},
		
	
		bind: function() {
			////console.log("binding facet tree");
			
			var facetWidget = this.facetWidget;
			
			//var node = this.rootNode;
		
			// Register to the item add event
			// Note: We do not need to bind to item removed explicetly, as
			// we simply bind the live of plugin-additions to the life of the
			// added model
			facetWidget.on('itemAdded', this.onItemAdded);
			
			//node.on('nodeCreated', onNodeCreated);
			//node.on('nodeDestroyed', onNodeDestroyed);
			
			var viewModels = facetWidget.getViewModels();
			//console.log('viewItems: ', viewModels);
			
			this.initRecCollection(viewModels);
		},
	
		onItemAdded: function(ev) {
			//console.log("yeah", ev);
			
			var viewItem = ev.viewModel.get('view');
			//this.fnInstall(viewItem);
			this.install(viewItem);
		},
		
		initRecItem: function(viewItem) {
			//this.fnInstall(viewItem);
			this.install(viewItem);
			
			var childView = node.getChildView();
			
			if(childView) {
				var viewItems = childView.getViewItems();
				this.initRecCollection(viewItems);
			}
		},
		
		initRecCollection: function(viewModels) {
			var self = this;
			viewModels.each(function(viewModel) {
				var viewItem = viewModel.get('view');
				self.initRecItem(viewItem);
			});
		},
		
		install: function(viewItem) {
			var options = this.options;

			if(options) {
				if(options.onInstall) {
					options.onInstall.apply(this, arguments);
				}
			}			

			//console.log("[Base Plugin] install");
			//throw "This method should not be called";
			
			//this.onInstall(arguments);
		}
	});
	
	
	
	
	ns.FacetTreeHighlightPlugin = ns.PluginFacetTree.extend({
		
		initialize: function() {
			//console.log("[Toggle Plugin] initialize", this);
			ns.PluginFacetTree.prototype.initialize.apply(this, arguments);
			
			var options = this.options;
			if(!options.property) {
				throw 'Property \'property\' must be set';
			}
			
			this.property = options.property;
		},

		install: function(viewItem) {
			ns.FacetTreeTogglePlugin.prototype.install.apply(this, arguments);
			
			var viewItemModel = viewItem.model;
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();

			var self = this;
			var controllerModelSync = new ns.ControllerModelSync(
					path,
					viewItemModel,
					this.property,
					this.collection,
					(function() {
						return self.collection.containsPath(path);
					})
			);
		}
		
	});
	
	
	

	ns.FacetTreeTogglePlugin = ns.PluginFacetTree.extend({

		initialize: function() {
			//console.log("[Toggle Plugin] initialize", this);
			ns.PluginFacetTree.prototype.initialize.apply(this, arguments);
		},
		
		install: function(viewItem) {
			//console.log("[Toggle Plugin] install");

			
			// The property whose state to toggle 
			var property = this.property;
			//console.log("[Toggle Plugin] Property: ", property, this);
			
			
			var self = this;

			
			var viewItemModel = viewItem.model;
			
			//console.log("Installing table plugin on: ", viewItem);


			// get the node's hover and perma areas
			var $elPerma = viewItem.getPermaArea();
			var $elHover = viewItem.getHoverArea();

			
			// NOTE By setting the view's model to that of viewItemModel,
			// we bind the life time of the plugin's additions to that of the original model
			var viewItemEnable = new widgets.ViewItemLink({
				model: viewItemModel,
				subView: new ns.ViewItemIcon({
					model: viewItemModel,
					attributes: {
						'class': self.enabledClass
					},
					fnState: function(model) {
						return '' + model.get(property);
					},
					stateToAttrs: {
						'false': { style: 'display: inline'},
						'true': { style: 'display: none'}
					}
				}),
				events: {
					'click': function(ev) {						
						//collectionColumns.addPath(path);
						self.enable(viewItem);
						ev.preventDefault();
					}
				}
			});


			var viewItemDisable = new widgets.ViewItemLink({
				model: viewItemModel,
				subView: new ns.ViewItemIcon({
					model: viewItemModel,
					attributes: {
						'class': self.disabledClass
					},
					fnState: function(model) {
						return '' + model.get(property);
					},
					stateToAttrs: {
						'false': { style: 'display: none'},
						'true': { style: 'display: inline'}
					},
					events: {
						'click': function(ev) {
							//collectionColumns.removePath(path);
							self.disable(viewItem);
							ev.preventDefault();
						}
					}
				})
			});
			
			var $elAddToTable = viewItemEnable.render().$el;
			$elHover.append($elAddToTable);

			
			var $elRemoveFromTable = viewItemDisable.render().$el;
			$elPerma.append($elRemoveFromTable);
			
			
			ns.PluginFacetTree.prototype.install.apply(this, arguments);

			/*
			var options = this.options;
			
			if(options) {
				if(options.onInstall) {
					options.onInstall.apply(this, arguments);
				}
			}
			*/
		}
	});

	
	/**
	 * 
	 */
	ns.FacetTreeTablePlugin = ns.FacetTreeTogglePlugin.extend({
		// These attributes must be set upon initialization
		collection: null,
		facetWidget: null,
		
		property: 'isAddedToTable',
		enabledClass: 'facete-icon icon-circle-arrow-right',
		disabledClass: 'facete-icon icon-circle-arrow-right', //icon-remove-circle',
		
		initialize: function() {
			//console.log("[Table Plugin] initialize", this);
			_.bindAll(this);
			
			ns.FacetTreeTogglePlugin.prototype.initialize.apply(this, arguments);
		},
		
		getPath: function(viewItem) {
			var viewItemModel = viewItem.model;
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();

			return path;
		},
		enable: function(viewItem) {
			var path = this.getPath(viewItem);
			this.collection.addPath(path);
		},
		disable: function(viewItem) {
			var path = this.getPath(viewItem);
			this.collection.removePath(path);			
		},
//		fnInstall: function(viewItem) {
//			this.install(viewItem);
//		},
		install: function(viewItem) {
			//console.log("[Table Plugin] install");

			// Invoke parent install
			ns.FacetTreeTogglePlugin.prototype.install.apply(this, arguments);
			
			var viewItemModel = viewItem.model;
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();
			
			var self = this;
			var controllerModelSync = new ns.ControllerModelSync(
					path,
					viewItemModel,
					this.property,
					this.collection,
					(function() {
						return self.collection.containsPath(path);
					})
			);
			
		}
	});

	
	
	
	ns.FacetTreeMapPlugin = ns.FacetTreeTogglePlugin.extend({
		// These attributes must be set upon initialization
		collection: null,
		facetWidget: null,
		
		property: 'isAddedToMap',
		enabledClass: 'facete-icon icon-globe',
		disabledClass: 'facete-icon icon-globe',
		
		initialize: function() {
			_.bindAll(this);
			
			ns.FacetTreeTogglePlugin.prototype.initialize.apply(this, arguments);
		},
		
		getPath: function(viewItem) {
			var viewItemModel = viewItem.model;
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();

			return path;
		},
		enable: function(viewItem) {
			var path = this.getPath(viewItem);
			this.collection.addPath(path);
		},
		disable: function(viewItem) {
			var path = this.getPath(viewItem);
			this.collection.removePath(path);			
		},
		install: function(viewItem) {
			// Invoke parent install
			ns.FacetTreeTogglePlugin.prototype.install.apply(this, arguments);
			
			var viewItemModel = viewItem.model;
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();
			
			var self = this;
			var controllerModelSync = new ns.ControllerModelSync(
					path,
					viewItemModel,
					this.property,
					this.collection,
					(function() {
						return self.collection.containsPath(path);
					})
			);
			
		}
	});
	
	
	ns.FacetTreeCherryPickPlugin = ns.FacetTreeTogglePlugin.extend({
		// These attributes must be set upon initialization
		collection: null,
		facetWidget: null,
		
		property: 'isAddedToExcerpt',
		enabledClass: 'facete-icon icon-star',
		disabledClass: 'facete-icon icon-star',
		
		initialize: function() {
			_.bindAll(this);
			
			ns.FacetTreeTogglePlugin.prototype.initialize.apply(this, arguments);
		},
		
		getPath: function(viewItem) {
			var viewItemModel = viewItem.model;
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();

			return path;
		},
		enable: function(viewItem) {
			var path = this.getPath(viewItem);
			this.collection.addPath(path);
		},
		disable: function(viewItem) {
			var path = this.getPath(viewItem);
			this.collection.removePath(path);			
		},
		install: function(viewItem) {
			// Invoke parent install
			ns.FacetTreeTogglePlugin.prototype.install.apply(this, arguments);
			
			var viewItemModel = viewItem.model;
			var facetNode = viewItemModel.get('facetNode');
			var path = facetNode.getPath();
			
			var self = this;
			var controllerModelSync = new ns.ControllerModelSync(
					path,
					viewItemModel,
					this.property,
					this.collection,
					(function() {
						return self.collection.containsPath(path);
					})
			);
			
		}
	});

	
	
//	
//		fnInstall: function(viewItem) {
//		
//			this.fnInstall.call(this, viewItem);
//			
//			var viewItemModel = viewItem.model;
//			
//			//console.log("Installing table plugin on: ", viewItem);
//
//
//			// get the node's hover and perma areas
//			var $elPerma = viewItem.getPermaArea();
//			var $elHover = viewItem.getHoverArea();
//
//			
//			var facetNode = viewItemModel.get('facetNode');
//			var path = facetNode.getPath();
//
//			var collectionColumns = this.collectionColumns;
//
//
//			/////var facetFacadeNode = model.get('facetFacadeNode');
//			/////this.path = facetFacadeNode.getPath();
//			
//			// children.bind('add', this.add)
//			var controllerColumnSync = new ns.ControllerColumnSync(
//					path,
//					viewItemModel,
//					this.collectionColumns
//			);
//
//
//			var $elAddToTable = viewItemAddToTable.render().$el;
//			$elHover.append($elAddToTable);
//
//			
//			var $elRemoveFromTable = viewItemRemoveFromTable.render().$el;
//			$elPerma.append($elRemoveFromTable);
//		}
//
//		
//	}); 
//	
	
})();
