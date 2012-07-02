(function($) {

	var ns = Namespace("org.aksw.ssb.widgets");
	
	
	ns.ListModelSimple = function() {
		
	};
	
	
	ns.ListItem = $$({
		setId: function(id) {
			this.model.set({id:id});
		},
		
	
		getId: function() {
			return this.model.get(id);
		}
	});
	
	
	ns.agilityJsIndexChildren = function(parent) {
		var result = {};
		
		parent.each(function(index, child) {
			
			var id = child.model.get("id");
			console.log("Child id is", id);
			
			result[id] = child;
		});
		
		return result;		
	};
	
	ns.itemLabel = $$({label: ""}, '<li><span data-bind="label" /></li>');
	
	ns.RendererString = function(fnId) {
		this.fnId = fnId;
	};
	
	
	ns.RendererString.prototype.create = function(parent, data) {
		return $$(ns.itemLabel, {parent: parent, label: data, fnId: this.fnId});
	};
	
	
	/**
	 * A simple list widget.
	 * 
	 * TODO I think we should distinguish between a pure view-only list widget,
	 * and a view+model list widget.
	 * 
	 */
	ns.ListWidget = $$({
		//view: { format: '<ul class="nav nav-list"></ul>', },
		view: { format: '<ul></ul>', },
		model: {itemRenderer: new ns.RendererString(), collection: []},
		/*
		controller: {
			'change': function() {
				
				var fnId = this.getFnId();
				
				var keyToData = {};
				
				_.each(this.getCollection(), function(data) {
					var id = fnId(data);
					keyToData[id] = data;
				});
				
				//console.log("Synch", keyToData);
				this.syncView(keyToData);
			}			
		},*/
		/*
		getContainerElement: function() {
			return this.view.$();
		},
		*/
		clear: function() {
			this.each(function(i, child) {
				child.destroy();
			});
		},
		getItems: function() {
			var result = [];
			this.each(function(i, item) {
				result.push(item);
			});
			return result;
		},
		trimToSize: function(size) {
			var items = this.getItems();
			
			for(var i = size; i < items.length; ++i) {
				items[i].destroy();
			}
		},
		/*
		setCollection: function(collection) {
			this.model.set({collection: collection});
		},
		getCollection: function() {
			return this.model.get("collection");
		},
		*/
		addItem: function(item) {
			console.log("Item is", item);
			this.append(item);//, this.getContainerElement());
		},
		removeItem: function(item) {
			this.remove(item);
		},
		setModel: function(listModel) {
			this.model.set({listModel: listModel});
		},
		getModel: function() {
			return this.model.get("listModel");
		},
		setItemRenderer: function(itemRenderer) {
			this.model.set({itemRenderer: itemRenderer});
		},
		getItemRenderer: function() {
			return this.model.get("itemRenderer");
		},		
		getFnId: function() {
			return this.model.get("fnId");
		},
		setFnId: function(fnId) {
			this.model.set({fnId: fnId});
		},
		syncView2: function(collection) {
			this.clear();
			
			var self = this;
			//var collection = this.getCollection();
			_.each(collection, function(item) {
				var renderer = self.getItemRenderer();				
				itemView = renderer.create(self, item);
				self.append(itemView);
			});
			
			//this.trimToSize(collection.size());
		},
		
		syncView: function(keyToData) {
			
			this.syncView2(keyToData);
			return;
			
			var idToItem = ns.agilityJsIndexChildren(this);

			// Destroy all children for which there is no key
			var oldKeys = _.keys(idToItem);
			var newKeys = _.keys(keyToData);
			
			var toRemove = _.difference(oldKeys, newKeys);
			_.each(toRemove, function(id) {
				var item = idToItem[id];
				if(item) {
					item.destroy();
				}
			});
			
			
			var self = this;
			_.each(newKeys, function(key) {
				var item = idToItem[key];
				var data = keyToData[key];
				
				if(item) {
					console.log("Update", item, "with", data);
					item.model.set(data);
					//item.setData(data);
					item.view.sync();
				} else {
					item = self.getItemRenderer().create(self, data);
					
					console.log("Append", item);
					self.append(item);//, self.getContainerElement());
				}
			});
			
			
		},
		
		refresh: function() {
			var listModel = this.getModel();
			
			console.log("listModel", listModel);
			if(!listModel || !listModel.fetchData) {
				return;
			}

			var self = this;
						
			var task = listModel.fetchData();
			$.when(task).then(function(collection) {
				
				self.syncView(collection);
				
			});
		}
		
	});
	
	/*
	ns.createListWidget2 = function(itemRenderer, fnId) {
		var result = $$(ns.ListWidget);
		//console.log("ListWidget", result);
		
		if(itemRenderer) {
			result.setItemRenderer(itemRenderer);
		}
		
		if(fnId) {
			result.setFnId(fnId);
		}
		
		return result;
		//result.setListModel(model);
		
	};
	*/
	
	ns.createListWidget = function(model, itemRenderer) {
		var result = $$(ns.ListWidget);
		
		if(itemRenderer) {
			result.setItemRenderer(itemRenderer);
		}
		result.setModel(model);
		
		
		
		result.refresh();
			
		return result;
	};
	
	
})(jQuery);
