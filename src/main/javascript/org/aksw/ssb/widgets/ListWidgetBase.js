(function($) {

	var ns = Namespace("org.aksw.ssb.widgets");
	
	
	ns.ListModelSimple = function() {
		
	};
	
	
	ns.listItem = $$({
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
	
	ns.ItemFactoryString = function(parent, data, fnId) {
		return $$(ns.itemLabel, {parent: parent, label: data, fnId: fnId});
	};
	
	ns.listWidget = $$({
		view: { format: '<ul class="nav nav-list"></ul>', },
		model: {itemFactory: ns.ItemFactoryString, collection: []},
		controller: {
			'change': function() {
				
				var fnId = this.getFnId();
				
				var keyToData = {};
				
				_.each(this.getCollection(), function(data) {
					var id = fnId(data);
					keyToData[id] = data;
				});
				
				console.log("Synch", keyToData);
				this.syncView(keyToData);
			}			
		},
		
		clear: function() {
			this.each(function(child) {
				child.destroy();
			});
		},
		setCollection: function(collection) {
			this.model.set({collection: collection});
		},
		getCollection: function() {
			return this.model.get("collection");
		},
		addItem: function(item) {
			console.log("Item is", item);
			this.append(item);
		},
		removeItem: function(item) {
			this.remove(item);
		},
		setListModel: function(listModel) {
			this.model.set({listModel: listModel});
		},
		getListModel: function() {
			return this.model.get("listModel");
		},
		setItemFactory: function(fn) {
			this.model.set({itemFactory: fn});
		},
		getItemFactory: function() {
			return this.model.get("itemFactory");
		},		
		getFnId: function() {
			return this.model.get("fnId");
		},
		setFnId: function(fnId) {
			this.model.set({fnId: fnId});
		},
		syncView: function(keyToData) {
			
			
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
					item = self.getItemFactory()(self, data);
					
					console.log("Append", item);
					self.append(item);
				}
			});
			
			
		},
		
		refresh: function() {
			var self = this;
			var task = this.getListModel().fetchData();
			
			$.when(task).then(function(keyToData) {
				
				self.syncView(keyToData);				
				
			});
		}
		
	});
	
	
	ns.createListWidget2 = function(itemFactory, fnId) {
		var result = $$(ns.listWidget);
		//console.log("ListWidget", result);
		
		if(itemFactory) {
			result.setItemFactory(itemFactory);
		}
		
		if(fnId) {
			result.setFnId(fnId);
		}
		
		return result;
		//result.setListModel(model);
		
	};
	
	ns.createListWidget = function(model, itemFactory) {
		var result = $$(ns.listWidget);
		
		if(itemFactory) {
			result.setItemFactory(itemFactory);
		}
		result.setListModel(model);
		
		
		
		result.refresh();
			
		return result;
	};
	
	
})(jQuery);
